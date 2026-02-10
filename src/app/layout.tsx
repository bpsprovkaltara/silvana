import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans-family",
  display: "swap",
});

const displayFont = Outfit({
  subsets: ["latin"],
  variable: "--font-display-family",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Silvana - Pelayanan Statistik Terpadu BPS Kaltara",
  description: "Sistem Manajemen Antrian Layanan Statistik Terpadu BPS Provinsi Kalimantan Utara",
  keywords: ["BPS", "Kalimantan Utara", "Statistik", "Antrian", "Pelayanan Terpadu"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${sansFont.variable} ${displayFont.variable}`}>
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
