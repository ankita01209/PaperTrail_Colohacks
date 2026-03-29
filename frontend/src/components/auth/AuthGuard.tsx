"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/forgot-password'];

export default function AuthGuard({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, logout } = useAppStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // ── Fast-path: persisted Zustand state survives refreshes ──
    // If Zustand already has a user and role (restored from localStorage),
    // trust it immediately instead of waiting for Firebase.
    const isMock = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "mock-key";

    if (user && role) {
      // Already authenticated via Zustand persistence
      if (requireAdmin && role !== 'admin') {
        router.replace('/upload');
      } else if (pathname === '/login' || pathname === '/signup') {
        router.replace(role === 'admin' ? '/admin' : '/upload');
      } else {
        setIsAllowed(true);
      }
      setIsInitializing(false);
      return;
    }

    // ── Dev/mock mode: skip Firebase listener entirely ──
    if (isMock) {
      if (!PUBLIC_PATHS.includes(pathname)) {
        // Not logged in (no Zustand state) and not on a public page → redirect
        logout();
        router.replace('/login');
      } else {
        setIsAllowed(true);
      }
      setIsInitializing(false);
      return;
    }

    // ── Production: use Firebase auth state ──
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        if (!PUBLIC_PATHS.includes(pathname)) {
          logout();
          router.replace('/login');
        } else {
          setIsAllowed(true);
        }
      } else {
        if (user && role) {
          if (requireAdmin && role !== 'admin') {
            router.replace('/upload');
          } else if (pathname === '/login' || pathname === '/signup') {
            router.replace(role === 'admin' ? '/admin' : '/upload');
          } else {
            setIsAllowed(true);
          }
        } else {
          // Firebase knows we're logged in but Zustand lost state
          setIsAllowed(true);
        }
      }
      setIsInitializing(false);
    });

    // Add a safety timeout — never block rendering for more than 2 seconds
    const timeout = setTimeout(() => {
      setIsInitializing(false);
      if (!isAllowed) {
        setIsAllowed(true); // Unblock and let the page render
      }
    }, 2000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role, pathname]);

  if (isInitializing || !isAllowed) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-bg)]">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
      </div>
    );
  }

  return <>{children}</>;
}
