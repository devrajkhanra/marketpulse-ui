import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Aside from "@/components/layout/Aside";
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
      <body className={`${inter.className}`}>
        <DownloadProvider>
          <div className="grid grid-cols-[250px_1fr_250px] min-h-screen">
            <Sidebar />
            <main className="p-6 bg-gray-100">
              {children}
            </main>
            <Aside />
          </div>
          <Toaster />
        </DownloadProvider>
      </body>
    </html>
  );
}
