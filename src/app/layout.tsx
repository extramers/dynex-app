import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dynex Performance",
  description: "Verkstadssystem för orderhantering och offerter",
  appleWebApp: {
    capable: true,
    title: "Dynex",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sv"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-white">
        <main className="flex-1 w-full flex flex-col">
          <header className="border-b border-zinc-800 py-6 print:hidden">
            <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
              <Link href="/" className="text-3xl font-black uppercase hover:opacity-80 transition-opacity text-center sm:text-left">
                <span className="text-orange-dynex">Dynex Performance</span> <span className="text-zinc-500 font-medium">Umeå</span>
              </Link>
              <nav className="flex gap-6">
                <Link href="/ny-offert" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">Ny Offert</Link>
                <Link href="/jobbordrar" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">Jobbordrar</Link>
              </nav>
            </div>
          </header>
          <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-12">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}