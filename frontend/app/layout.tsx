import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const mainFont = Inter({ subsets: ["latin"], variable: "--font-main" });

export const metadata: Metadata = {
  title: "Corporate LMS",
  description: "Portal Pembelajaran Karyawan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${mainFont.className} antialiased bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}