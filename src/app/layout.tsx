import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import { DownloadProvider } from "@/context/DownloadContext";
import styles from "./Home.module.css";

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
      <body className={`${inter.className} bg-background text-foreground`}>
        <DownloadProvider>
          <div className={styles.grid}>
            <Sidebar />
            <main className={styles.main}>
              {children}
            </main>
          </div>
        </DownloadProvider>
      </body>
    </html>
  );
}
