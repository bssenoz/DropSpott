'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const isAuthPage = pathname?.startsWith('/auth');

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Üst Menü */}
      <nav className="shadow-sm py-4 mb-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 text-sm">
          <div className="flex items-center gap-6">
            <a
              href="/"
              className="hover:text-blue-600 font-medium transition-colors"
            >
              Ana Sayfa
            </a>
            {user?.role === 'ADMIN' && (
              <a
                href="/admin"
                className="hover:text-blue-600 font-medium transition-colors"
              >
                Admin Panel
              </a>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{user.email}</div>
                    <div className="text-xs font-medium text-gray-700">
                      {user.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </>
            ) : (
              <>
                <a
                  href="/auth/login"
                  className="hover:text-blue-600 font-medium transition-colors"
                >
                  Giriş Yap
                </a>
                <a
                  href="/auth/register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Kayıt Ol
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Ana İçerik Alanı */}
      <main className="max-w-5xl mx-auto bg-white rounded-xl shadow p-8">
        {children}
      </main>
    </>
  );
}