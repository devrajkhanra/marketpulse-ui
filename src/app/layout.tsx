import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/Toaster";
import { DownloadProvider } from "@/context/DownloadContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MarketPulse",
  description: "NSE Data Fetcher and Analyzer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex`}>
        <DownloadProvider>
          <Sidebar />
          <main className="flex-1 p-6 bg-gray-100">
            {children}
          </main>
          <Toaster />
        </DownloadProvider>
      </body>
    </html>
  );
}
