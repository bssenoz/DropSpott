import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="font-sans bg-gray-100 text-gray-900 min-h-screen">
        {/* Üst Menü */}
        <nav className="shadow-sm py-4 mb-8">
          <div className="max-w-5xl mx-auto flex items-center justify-center gap-6 text-sm">
            <a
              href="/"
              className="hover:text-blue-600 font-medium transition-colors"
            >
              Ana Sayfa
            </a>
            <a
              href="/auth/login"
              className="hover:text-blue-600 font-medium transition-colors"
            >
              Giriş Yap
            </a>
            <a
              href="/auth/register"
              className="hover:text-blue-600 font-medium transition-colors"
            >
              Kayıt Ol
            </a>
          </div>
        </nav>

        {/* Ana İçerik Alanı */}
        <main className="max-w-5xl mx-auto bg-white rounded-xl shadow p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
