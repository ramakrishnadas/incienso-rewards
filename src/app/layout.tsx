import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Incienso Rewards",
  description: "Programa de recompensas de Incienso Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen p-4">
          <nav className="mb-4 space-x-4">
            <a href="/clientes" className="text-blue-500">Clientes</a>
            <a href="/movimientos" className="text-blue-500">Movimientos</a>
          </nav>
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
