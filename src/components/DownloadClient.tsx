'use client'
import { useState, useEffect } from 'react';
import { getLastDate } from '@/lib/api';
import { useDownload } from '@/context/DownloadContext';
import './DownloadClient.css';

// Helper to format a Date object to ddmmyyyy string
const formatToApiDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
};

// Helper to parse ddmmyyyy string to a Date object
const parseApiDate = (dateInput: string | Date | number | null | undefined): Date => {
    if (!dateInput) return new Date(NaN);

    if (dateInput instanceof Date) return dateInput;

    // If a number, treat it as ddmmyyyy when it has 8 digits, otherwise as timestamp
    if (typeof dateInput === 'number') {
        const numStr = String(dateInput);
        if (/^\d{8}$/.test(numStr)) {
            const day = Number(numStr.slice(0, 2));
            const month = Number(numStr.slice(2, 4)) - 1;
            const year = Number(numStr.slice(4, 8));
            return new Date(year, month, day);
        }
        return new Date(dateInput); // treat as timestamp (ms)
    }

    const dateStr = String(dateInput).trim();

    // Expect ddmmyyyy (e.g. 01012025)
    if (/^\d{8}$/.test(dateStr)) {
        const day = Number(dateStr.slice(0, 2));
        const month = Number(dateStr.slice(2, 4)) - 1; // 0-indexed
        const year = Number(dateStr.slice(4, 8));
        return new Date(year, month, day);
    }

    // Fallback: let Date try to parse the string (ISO or other common formats)
    return new Date(dateStr);
}

// Helper to format to "24th Oct, 2025"
const formatDisplayDate = (dateInput: string | Date | number | null | undefined): string => {
    const dt = parseApiDate(dateInput);
    if (Number.isNaN(dt.getTime())) return 'Invalid date';

    const day = dt.getDate();
    const year = dt.getFullYear();
    const monthShort = dt.toLocaleString('en-GB', { month: 'short' }); // e.g. "Oct"

    const getOrdinal = (n: number) => {
        const s = n % 100;
        if (s >= 11 && s <= 13) return 'th';
        switch (n % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    return `${day}${getOrdinal(day)} ${monthShort}, ${year}`;
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
                const lastDate = await getLastDate();
                console.log(lastDate)
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
            const currentDate = new Date(dateRange.from);
            while (currentDate <= dateRange.to) {
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
                return <span className="status-icon success">✓</span>;
            case 'error':
                return <span className="status-icon error">✗</span>;
            default:
                return <span className="status-icon pending">↓</span>;
        }
    }

    return (
        <div className="download-client">
            <div className="main-content">
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Select Dates for Download</h2>
                    </div>
                    <div className="card-content">
                        <div className="picker-controls">
                            <button onClick={() => setPickerMode('single')} className={`button ${pickerMode === 'single' ? 'button-secondary' : 'button-ghost'}`}>Single Date</button>
                            <button onClick={() => setPickerMode('range')} className={`button ${pickerMode === 'range' ? 'button-secondary' : 'button-ghost'}`}>Date Range</button>
                        </div>

                        <div className="picker-container">
                            {pickerMode === 'single' && (
                                <div className="date-picker">
                                    {/* Replace with a simple date input for now */}
                                    <input type="date" onChange={(e) => setDate(new Date(e.target.value))} className="calendar" />
                                    <button onClick={handleAddDate} className="button w-full">Add Date</button>
                                </div>
                            )}

                            {pickerMode === 'range' && (
                                <div className="date-picker">
                                    {/* Replace with a simple date input for now */}
                                    <input type="date" onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })} className="calendar" />
                                    <input type="date" onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })} className="calendar" />
                                    <button onClick={handleAddRange} className="button w-full">Add Date Range</button>
                                </div>
                            )}
                            <div className="selected-dates">
                                {error && <p className="error-message">{error}</p>}
                                {selectedDates.size > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold">Selected Dates</h3>
                                        <div className="badge-container">
                                            {Array.from(selectedDates).sort().map(d => (
                                                <div key={d} className="badge badge-secondary">
                                                    <span>{formatDisplayDate(d)}</span>
                                                    <button onClick={() => handleRemoveDate(d)} className="remove-badge">
                                                        ✗
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={handleDownload} disabled={selectedDates.size === 0 || isDownloading} className="button button-lg w-full">
                    {isDownloading ? 'Downloading...' : `Download ${selectedDates.size} Report(s)`}
                </button>
            </div>

            <div className="sidebar">
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">
                            <span>🗓️</span>
                            <span>Download Status</span>
                        </h2>
                    </div>
                    <div className="card-content">
                        {loading ? <p>Loading...</p> :
                            <div className="status-info">
                                <span className="font-semibold">Last Report:</span>
                                <span className="muted-text">{lastDownloaded ? formatDisplayDate(lastDownloaded) : 'N/A'}</span>
                            </div>}
                    </div>
                </div>

                {downloads.length > 0 && (
                    <div className="card">
                        <div className="card-header space-between">
                            <h2 className="card-title">Download Progress</h2>
                            <button className="button button-sm" onClick={clearCompleted}>Clear Completed</button>
                        </div>
                        <div className="card-content">
                            {downloads.map(d => (
                                <div key={d.date} className="download-item">
                                    <div className="status-icon-container">{getStatusIcon(d.status)}</div>
                                    <div className="download-info">
                                        <p className="font-semibold">{formatDisplayDate(d.date)}</p>
                                        <div className="progress">
                                            <div className="progress-bar" style={{ width: `${d.progress}%` }}></div>
                                        </div>
                                        {d.status === 'error' && <p className="error-message-xs">Failed</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
