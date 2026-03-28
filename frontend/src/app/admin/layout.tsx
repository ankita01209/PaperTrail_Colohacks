import { AuthenticatedNavbar } from '@/components/layout/AuthenticatedNavbar';
import AuthGuard from '@/components/auth/AuthGuard';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard requireAdmin={true}>
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
        <AuthenticatedNavbar isAdmin={true} />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
