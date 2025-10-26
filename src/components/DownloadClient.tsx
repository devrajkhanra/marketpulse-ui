'use client'
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { Progress } from '@/components/ui/Progress';
import { getDate } from '@/lib/api';
import { useDownload } from '@/context/DownloadContext';
import { CheckCircle, DownloadCloud, XCircle } from 'lucide-react';

// Helper to format a Date object to ddmmyyyy string
const formatToApiDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
};

// Helper to parse ddmmyyyy string to a Date object
const parseApiDate = (dateStr: string): Date => {
    const day = parseInt(dateStr.substring(0, 2), 10);
    const month = parseInt(dateStr.substring(2, 4), 10) - 1; // Month is 0-indexed
    const year = parseInt(dateStr.substring(4, 8), 10);
    return new Date(year, month, day);
}

export default function DownloadClient() {
  const [lastDownloaded, setLastDownloaded] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [pickerMode, setPickerMode] = useState<'single' | 'range'>('single');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { downloads, isDownloading, startDownload, clearCompleted } = useDownload();

  useEffect(() => {
    const fetchLastDate = async () => {
      try {
        setLoading(true);
        const lastDate = await getDate();
        setLastDownloaded(lastDate);
      } catch (err) {
        setError('Failed to fetch the last downloaded date.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLastDate();
  }, [downloads]);

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const handleAddDate = () => {
    if (date && !isWeekend(date)) {
      const newDates = new Set(selectedDates);
      newDates.add(formatToApiDate(date));
      setSelectedDates(newDates);
      setError(null);
    } else {
        setError('Cannot select weekends.');
    }
  };

  const handleAddRange = () => {
    if (dateRange.from && dateRange.to) {
        const newDates = new Set(selectedDates);
        let currentDate = new Date(dateRange.from);
        while(currentDate <= dateRange.to) {
            if (!isWeekend(currentDate)) {
                newDates.add(formatToApiDate(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        setSelectedDates(newDates);
        setError(null);
    } else {
        setError('Please select a valid date range.');
    }
  }

  const handleRemoveDate = (dateToRemove: string) => {
    const newDates = new Set(selectedDates);
    newDates.delete(dateToRemove);
    setSelectedDates(newDates);
  };

  const handleDownload = async () => {
    const datesToDownload = Array.from(selectedDates);
    if (datesToDownload.length > 0) {
        await startDownload(datesToDownload);
        setSelectedDates(new Set());
    }
  };

  const getStatusIcon = (status: 'pending' | 'downloading' | 'success' | 'error') => {
    switch (status) {
        case 'success':
            return <CheckCircle className="text-green-500" />;
        case 'error':
            return <XCircle className="text-red-500" />;
        default:
            return <DownloadCloud className="text-gray-400" />;
    }
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Download Status</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? <p>Loading...</p> : <p><strong>Last Downloaded Report:</strong> {lastDownloaded ? new Date(parseApiDate(lastDownloaded)).toDateString() : 'N/A'}</p>}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Select Dates for Download</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 mb-4">
                    <Button onClick={() => setPickerMode('single')} variant={pickerMode === 'single' ? 'default' : 'outline'}>Single Date</Button>
                    <Button onClick={() => setPickerMode('range')} variant={pickerMode === 'range' ? 'default' : 'outline'}>Date Range</Button>
                </div>

                {pickerMode === 'single' && (
                    <div className="flex items-center gap-4">
                        <Calendar mode="single" selected={date} onSelect={setDate} disabled={isWeekend} />
                        <Button onClick={handleAddDate}>Add Date</Button>
                    </div>
                )}

                {pickerMode === 'range' && (
                    <div className="flex items-center gap-4">
                        <Calendar mode="range" selected={dateRange} onSelect={setDateRange} disabled={isWeekend} />
                         <Button onClick={handleAddRange}>Add Date Range</Button>
                    </div>
                )}
                 {error && <p className="text-red-500 mt-2">{error}</p>}
            </CardContent>
        </Card>

        {selectedDates.size > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle>Selected Dates</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {Array.from(selectedDates).sort().map(d => (
                        <div key={d} className="flex items-center gap-2 bg-gray-200 rounded-full px-3 py-1 text-sm">
                           <span>{new Date(parseApiDate(d)).toDateString()}</span>
                           <button onClick={() => handleRemoveDate(d)} className="text-red-500 hover:text-red-700">X</button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}

        <Button onClick={handleDownload} disabled={selectedDates.size === 0 || isDownloading} size="lg" className="w-full">
            {isDownloading ? 'Downloading...' : `Download ${selectedDates.size} Report(s)`}
        </Button>

        {downloads.length > 0 && (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Download Progress</CardTitle>
                    <Button variant="outline" size="sm" onClick={clearCompleted}>Clear Completed</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {downloads.map(d => (
                        <div key={d.date} className="flex items-center gap-4">
                            <div className="flex-shrink-0">{getStatusIcon(d.status)}</div>
                            <div className="flex-grow">
                                <p className="font-semibold">{new Date(parseApiDate(d.date)).toDateString()}</p>
                                <Progress value={d.progress} className="w-full"/>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}
    </div>
  )
}
