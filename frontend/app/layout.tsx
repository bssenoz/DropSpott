import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="font-sans bg-gray-100 text-gray-900 min-h-screen">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}