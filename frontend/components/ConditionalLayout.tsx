'use client';

import { useState, useEffect } from 'react';
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
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
    setMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Hydration hatasını önlemek için client-side mounting'i bekle
  if (!mounted) {
    return (
      <>
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm py-4 mb-8 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <a
                href="/"
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                DropSpot
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/auth/login"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Giriş Yap
              </a>
              <a
                href="/auth/register"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                Kayıt Ol
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {children}
        </main>
      </>
    );
  }

  return (
    <>
      {/* Üst Menü */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm py-4 mb-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <a
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              DropSpot
            </a>
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-6">
                <a
                  href="/"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Ana Sayfa
                </a>
                <a
                  href="/drops"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Drop'lar
                </a>
                {user?.role === 'ADMIN' && (
                  <a
                    href="/admin"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Admin Paneli
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{user.email}</div>
                    <div className="text-xs font-medium text-gray-700">
                      {user.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden sm:block px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
                >
                  Çıkış Yap
                </button>
                {/* Hamburger Menü Butonu */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Menü"
                >
                  {mobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <>
                <a
                  href="/auth/login"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Giriş Yap
                </a>
                <a
                  href="/auth/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  Kayıt Ol
                </a>
              </>
            )}
          </div>
        </div>

        {/* Mobil Menü */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 mt-4 pt-4 px-4">
            <div className="flex flex-col gap-4">
              <a
                href="/"
                onClick={handleLinkClick}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
              >
                Ana Sayfa
              </a>
              <a
                href="/drops"
                onClick={handleLinkClick}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
              >
                Drop'lar
              </a>
              {user?.role === 'ADMIN' && (
                <a
                  href="/admin"
                  onClick={handleLinkClick}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
                >
                  Admin Paneli
                </a>
              )}
              <div className="border-t border-gray-200/50 pt-4 mt-2">
                <div className="mb-3">
                  <div className="text-xs text-gray-500">{user?.email}</div>
                  <div className="text-xs font-medium text-gray-700">
                    {user?.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md text-sm"
                >
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Ana İçerik Alanı */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {children}
      </main>
    </>
  );
}