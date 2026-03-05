import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Black Sand · Mission Control",
  description: "We build AI agents that run your operations while you run your vision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Sidebar />
        <main className="min-h-screen pl-0 md:pl-56 lg:pl-64">
          <div className="mx-auto max-w-7xl px-4 py-6 pt-16 md:px-8 md:pt-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
