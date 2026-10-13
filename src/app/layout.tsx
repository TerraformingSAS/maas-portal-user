import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Terra - Portal de Clientes",
  description:
    "Portal de Gestión Inmobiliaria. Consulta tus compras, estado de cuenta y proceso inmobiliario.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="preload"
          href="/vendor/itc-frontend-base.css"
          as="style"
        />
        <link rel="stylesheet" href="/vendor/itc-frontend-base.css" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
