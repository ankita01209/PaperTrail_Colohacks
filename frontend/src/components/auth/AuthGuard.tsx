"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, logout } = useAppStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        // Not logged in
        if (pathname !== '/login' && pathname !== '/signup' && pathname !== '/forgot-password' && pathname !== '/') {
          logout();
          router.replace('/login');
        } else {
          setIsAllowed(true);
        }
      } else {
        // Logged in
        if (user && role) {
          if (requireAdmin && role !== 'admin') {
            router.replace('/upload'); // Clerk trying to access admin
          } else if (pathname === '/login' || pathname === '/signup') {
             router.replace(role === 'admin' ? '/admin' : '/upload');
          } else {
            setIsAllowed(true);
          }
        } else {
          // Firebase knows we're logged in but Zustand lost state (refresh)
          // Ideally fetch /auth/me here to restore, but for now we sign out or wait
          // We will fetch from /auth/me in layout if user is null
          setIsAllowed(true);
        }
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, [user, role, pathname, router, requireAdmin, logout]);

  if (isInitializing || !isAllowed) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-bg)]">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
      </div>
    );
  }

  return <>{children}</>;
}
