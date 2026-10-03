import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Korat Movie Festival 2026 - Vendor Registration",
  description: "เปิดรับสมัครร้านค้าเข้าร่วมงานเทศกาลหนังเมืองโคราช 2026",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
