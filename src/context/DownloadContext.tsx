'use client'

import { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { downloadNseReports } from '@/lib/api';

// Helper to parse ddmmyyyy string to a Date object
const parseApiDate = (dateStr: string): Date => {
    const day = parseInt(dateStr.substring(0, 2), 10);
    const month = parseInt(dateStr.substring(2, 4), 10) - 1; // Month is 0-indexed
    const year = parseInt(dateStr.substring(4, 8), 10);
    return new Date(year, month, day);
}

type DownloadStatus = 'pending' | 'downloading' | 'success' | 'error';

interface DownloadItem {
  date: string;
  status: DownloadStatus;
  progress: number;
}

interface DownloadContextType {
  downloads: DownloadItem[];
  isDownloading: boolean;
  startDownload: (dates: string[]) => Promise<void>;
  clearCompleted: () => void;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export const useDownload = () => {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownload must be used within a DownloadProvider');
  }
  return context;
};

export const DownloadProvider = ({ children }: { children: ReactNode }) => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const { toast } = useToast();

  const startDownload = async (dates: string[]) => {
    setDownloads(dates.map(date => ({ date, status: 'pending', progress: 0 })));

    try {
        await downloadNseReports(dates);

        for (const date of dates) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
            setDownloads(prev => prev.map(d => d.date === date ? { ...d, status: 'downloading', progress: 50 } : d));
            await new Promise(resolve => setTimeout(resolve, 500));
            setDownloads(prev => prev.map(d => d.date === date ? { ...d, status: 'success', progress: 100 } : d));
            toast({
                title: "Download Complete",
                description: `Report for ${new Date(parseApiDate(date)).toDateString()} downloaded successfully.`,
            });
        }
    } catch (err) {
        console.error(err);
        setDownloads(prev => prev.map(d => ({...d, status: 'error'})))
    }
  };

  const clearCompleted = () => {
    setDownloads(prev => prev.filter(d => d.status !== 'success' && d.status !== 'error'));
  };

  return (
    <DownloadContext.Provider value={{ downloads, isDownloading: downloads.some(d => d.status === 'downloading'), startDownload, clearCompleted }}>
      {children}
    </DownloadContext.Provider>
  );
};
