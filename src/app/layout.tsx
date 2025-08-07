import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from '@/components/Providers'
import Navigation from '@/components/Navigation'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Club Connect - BRAC University",
  description: "Centralized club management system for BRAC University",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        <Providers>
          <Navigation />
          <main className="pb-4">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
