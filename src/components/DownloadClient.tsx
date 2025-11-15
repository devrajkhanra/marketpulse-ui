'use client';

import { useState, useEffect } from 'react';
import { getLastDate } from '@/lib/api';
import { useDownload } from '@/context/DownloadContext';
import styles from './DownloadClient.module.css';
import { AlertCircle, CheckCircle, XCircle, Download, Trash2, Plus, Calendar as CalendarIcon } from 'lucide-react';

const formatToApiDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
};

const parseApiDate = (dateInput: string | Date | number | null | undefined): Date => {
    if (!dateInput) return new Date(NaN);
    if (dateInput instanceof Date) return dateInput;
    if (typeof dateInput === 'number') {
        const numStr = String(dateInput);
        if (/^\d{8}$/.test(numStr)) {
            const day = Number(numStr.slice(0, 2));
            const month = Number(numStr.slice(2, 4)) - 1;
            const year = Number(numStr.slice(4, 8));
            return new Date(year, month, day);
        }
        return new Date(dateInput);
    }
    const dateStr = String(dateInput).trim();
    if (/^\d{8}$/.test(dateStr)) {
        const day = Number(dateStr.slice(0, 2));
        const month = Number(dateStr.slice(2, 4)) - 1;
        const year = Number(dateStr.slice(4, 8));
        return new Date(year, month, day);
    }
    return new Date(dateStr);
}

const formatDisplayDate = (dateInput: string | Date | number | null | undefined): string => {
    const dt = parseApiDate(dateInput);
    if (Number.isNaN(dt.getTime())) return 'Invalid date';
    const day = dt.getDate();
    const year = dt.getFullYear();
    const monthShort = dt.toLocaleString('en-GB', { month: 'short' });
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
        return day === 0 || day === 6;
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
            case 'success': return <><CheckCircle aria-hidden="true" className={`${styles.statusIcon} ${styles.success}`} /><span className="sr-only">Success</span></>;
            case 'error': return <><XCircle aria-hidden="true" className={`${styles.statusIcon} ${styles.error}`} /><span className="sr-only">Error</span></>;
            default: return <><Download aria-hidden="true" className={`${styles.statusIcon} ${styles.pending}`} /><span className="sr-only">Pending</span></>;
        }
    }

    return (
        <div className={styles.grid}>
            <div className={styles.mainContent}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Select Dates for Download</h2>
                        <div className={styles.pickerControls}>
                            <button onClick={() => setPickerMode('single')} className={`${styles.pickerButton} ${pickerMode === 'single' ? styles.active : ''}`} aria-pressed={pickerMode === 'single'}>Single Date</button>
                            <button onClick={() => setPickerMode('range')} className={`${styles.pickerButton} ${pickerMode === 'range' ? styles.active : ''}`} aria-pressed={pickerMode === 'range'}>Date Range</button>
                        </div>
                    </div>
                    <div className={styles.cardContent}>
                        {pickerMode === 'single' && (
                            <div className={styles.datePicker}>
                                <label htmlFor="single-date-picker" className="sr-only">Select a single date</label>
                                <input id="single-date-picker" type="date" onChange={(e) => setDate(new Date(e.target.value))} className={styles.dateInput} />
                                <button onClick={handleAddDate} className={`${styles.button} ${styles.primary}`}><Plus size={16} /> Add Date</button>
                            </div>
                        )}
                        {pickerMode === 'range' && (
                            <div className={styles.datePicker}>
                                <label htmlFor="range-start-picker" className="sr-only">Select a start date</label>
                                <input id="range-start-picker" type="date" onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })} className={styles.dateInput} placeholder="From" />
                                <label htmlFor="range-end-picker" className="sr-only">Select an end date</label>
                                <input id="range-end-picker" type="date" onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })} className={styles.dateInput} placeholder="To" />
                                <button onClick={handleAddRange} className={`${styles.button} ${styles.primary}`}><Plus size={16} /> Add Range</button>
                            </div>
                        )}
                    </div>
                </div>

                {error && <p className={styles.errorMessage} role="alert" aria-live="assertive"><AlertCircle size={16} /> {error}</p>}

                {selectedDates.size > 0 && (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Selected Dates ({selectedDates.size})</h2>
                        </div>
                        <div className={`${styles.cardContent} ${styles.selectedDatesContainer}`}>
                            {Array.from(selectedDates).sort().map(d => (
                                <div key={d} className={styles.badge}>
                                    <span>{formatDisplayDate(d)}</span>
                                    <button onClick={() => handleRemoveDate(d)} className={styles.removeBadge} aria-label={`Remove ${formatDisplayDate(d)}`}><XCircle size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button onClick={handleDownload} disabled={selectedDates.size === 0 || isDownloading} className={`${styles.button} ${styles.primary} ${styles.downloadButton}`}>
                    {isDownloading ? 'Downloading...' : <><Download size={18} /> Download {selectedDates.size} Report(s)</>}
                </button>
            </div>

            <div className={styles.sidebar}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}><CalendarIcon size={18} /> Download Status</h2>
                    </div>
                    <div className={styles.cardContent}>
                        {loading ? <p>Loading...</p> : (
                            <div className={styles.statusInfo}>
                                <span>Last Report:</span>
                                <span className={styles.mutedText}>{lastDownloaded ? formatDisplayDate(lastDownloaded) : 'N/A'}</span>
                            </div>
                        )}
                    </div>
                </div>

                {downloads.length > 0 && (
                    <div className={styles.card}>
                        <div className={`${styles.cardHeader} ${styles.spaceBetween}`}>
                            <h2 className={styles.cardTitle}>Download Progress</h2>
                            <button className={`${styles.button} ${styles.ghost}`} onClick={clearCompleted}><Trash2 size={14} /> Clear Completed</button>
                        </div>
                        <div className={styles.cardContent}>
                            {downloads.map(d => (
                                <div key={d.date} className={styles.downloadItem}>
                                    {getStatusIcon(d.status)}
                                    <div className={styles.downloadInfo}>
                                        <p>{formatDisplayDate(d.date)}</p>
                                        <div className={styles.progress} role="progressbar" aria-valuenow={d.progress} aria-valuemin={0} aria-valuemax={100}>
                                            <div className={styles.progressBar} style={{ width: `${d.progress}%` }}></div>
                                            <span className="sr-only">{d.progress}% complete</span>
                                        </div>
                                        {d.status === 'error' && <p className={styles.errorMessageXs}>Failed</p>}
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
