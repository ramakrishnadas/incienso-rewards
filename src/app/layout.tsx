
import type { Metadata } from "next";
import { Geist, Geist_Mono, Amaranth } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import NavBar from "./components/NavBar";
import { getServerSession } from "next-auth";
import { authOptions } from "./lib/authOptions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amaranth = Amaranth({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-amaranth",
});

export const metadata: Metadata = {
  title: "Incienso Rewards",
  description: "Programa de recompensas de Incienso Store",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${amaranth.variable} antialiased`}
      >
        <div className="min-h-full">
          <NavBar session={!!session}/>      
          <Providers>
            {children}
          </Providers>
        </div>
        
      </body>
    </html>
  );
}
