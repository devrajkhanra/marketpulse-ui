'use client'

import { useState, useEffect } from 'react';
import { getTopGainersLosers, getStockVolumeDifferences } from '@/lib/api';
import { AlertCircle, Plus, XCircle, TrendingUp } from 'lucide-react';
import styles from './page.module.css';

interface StockData {
    [key: string]: string | number;
}

interface StockVolume {
    symbol: string;
    volumeDifference: number;
}

const formatToApiDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
};

const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export default function StocksClient() {
    const [date, setDate] = useState(new Date());
    const [stockPerformance, setStockPerformance] = useState<{ topGainers: StockData[], topLosers: StockData[] } | null>(null);
    const [loadingPerformance, setLoadingPerformance] = useState(true);
    const [errorPerformance, setErrorPerformance] = useState<string | null>(null);

    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [tempDate, setTempDate] = useState<Date>(new Date());
    const [stockVolume, setStockVolume] = useState<StockVolume[] | null>(null);
    const [loadingVolume, setLoadingVolume] = useState(false);
    const [errorVolume, setErrorVolume] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingPerformance(true);
            setErrorPerformance(null);
            try {
                const apiDate = formatToApiDate(date);
                const data = await getTopGainersLosers(apiDate);
                setStockPerformance(data);
            } catch (err) {
                const typedErr = err as { response?: { status: number } };
                const message = typedErr.response?.status === 404
                    ? `No data available for ${formatToApiDate(date)}`
                    : 'Failed to fetch stock performance data.';
                setErrorPerformance(message);
                console.error('API Error:', err);
            } finally {
                setLoadingPerformance(false);
            }
        };
        fetchData();
    }, [date]);

    const handleAddDate = () => {
        if (tempDate && !selectedDates.some(d => formatToApiDate(d) === formatToApiDate(tempDate))) {
            setSelectedDates([...selectedDates, tempDate]);
            setErrorVolume(null);
        }
    };

    const handleRemoveDate = (dateToRemove: Date) => {
        setSelectedDates(selectedDates.filter(d => formatToApiDate(d) !== formatToApiDate(dateToRemove)));
    };

    const handleVolumeFetch = async () => {
        if (selectedDates.length < 2) {
            setErrorVolume("Please select at least two dates.");
            return;
        }
        setLoadingVolume(true);
        setErrorVolume(null);
        try {
            const apiDates = selectedDates.map(formatToApiDate);
            const data = await getStockVolumeDifferences(apiDates);
            setStockVolume(data);
        } catch (err) {
            setErrorVolume('Failed to fetch stock volume data.');
            console.error(err);
        } finally {
            setLoadingVolume(false);
        }
    };

    const renderStockTable = (stocks: StockData[], type: 'gainer' | 'loser') => {
        if (!stocks || stocks.length === 0) return <p className={styles.noData}>No data available.</p>;

        const cols = Object.keys(stocks[0]);
        const formatHeader = (h: string) => h.replace(/([A-Z])/g, ' $1').replace(/[_\-]/g, ' ').trim();
        const formatValue = (key: string, val: string | number) => {
            if (val == null) return '-';
            if (/%?chng|%chng|percent|%/i.test(key)) {
                const n = Number(String(val).replace('%', ''));
                return Number.isNaN(n) ? String(val) : `${n.toFixed(2)}%`;
            }
            return String(val);
        };

        return (
            <div className={styles.tableWrapper}>
                <table className={styles.modernTable}>
                    <thead>
                        <tr>
                            {cols.map((c) => <th key={c}>{formatHeader(c)}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map((stock, i) => (
                            <tr key={i} className={i % 2 === 0 ? styles.rowEven : undefined}>
                                {cols.map((c) => (
                                    <td
                                        key={c}
                                        className={
                                            c === 'percentage'
                                                ? type === 'gainer'
                                                    ? styles.gainerCell
                                                    : styles.loserCell
                                                : undefined
                                        }
                                    >
                                        {formatValue(c, stock[c])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderVolumeTable = (volumes: StockVolume[]) => (
        <div className={styles.tableWrapper}>
            <table className={styles.modernTable}>
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Volume Difference</th>
                    </tr>
                </thead>
                <tbody>
                    {volumes.map((volume, index) => (
                        <tr key={index} className={index % 2 === 0 ? styles.rowEven : undefined}>
                            <td>{volume.symbol}</td>
                            <td>{volume.volumeDifference.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Stocks Analysis</h1>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>
                            <TrendingUp size={18} />
                            Stock Performance
                        </h2>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.datePickerContainer}>
                            <label htmlFor="date-picker">Select Date:</label>
                            <input
                                type="date"
                                id="date-picker"
                                className={styles.datePickerInput}
                                value={date.toISOString().split('T')[0]}
                                onChange={(e) => setDate(new Date(e.target.value))}
                            />
                        </div>
                        {loadingPerformance && <p className={styles.loading}>Loading...</p>}
                        {errorPerformance && (
                            <div className={styles.errorMessage}>
                                <AlertCircle size={16} />
                                {errorPerformance}
                            </div>
                        )}
                        {!loadingPerformance && !errorPerformance && (
                            <>
                                <h3>Top 5 Gainers</h3>
                                {stockPerformance?.topGainers ? (
                                    renderStockTable(stockPerformance.topGainers, 'gainer')
                                ) : (
                                    <p className={styles.noData}>Data not available.</p>
                                )}
                                <h3>Top 5 Losers</h3>
                                {stockPerformance?.topLosers ? (
                                    renderStockTable(stockPerformance.topLosers, 'loser')
                                ) : (
                                    <p className={styles.noData}>Data not available.</p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>
                            <TrendingUp size={18} />
                            Stock Volume Analysis
                        </h2>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.datePickerContainer}>
                            <label htmlFor="date-picker-multi">Add Date:</label>
                            <input
                                type="date"
                                id="date-picker-multi"
                                className={styles.datePickerInput}
                                value={tempDate.toISOString().split('T')[0]}
                                onChange={(e) => setTempDate(new Date(e.target.value))}
                            />
                            <button
                                onClick={handleAddDate}
                                className={`${styles.button} ${styles.primary}`}
                            >
                                <Plus size={16} /> Add Date
                            </button>
                        </div>

                        {selectedDates.length > 0 && (
                            <div className={styles.selectedDatesContainer}>
                                {selectedDates.map((d, idx) => (
                                    <div key={idx} className={styles.badge}>
                                        <span>{formatDisplayDate(d)}</span>
                                        <button
                                            onClick={() => handleRemoveDate(d)}
                                            className={styles.removeBadge}
                                            aria-label={`Remove ${formatDisplayDate(d)}`}
                                        >
                                            <XCircle size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleVolumeFetch}
                            disabled={loadingVolume || selectedDates.length < 2}
                            className={`${styles.button} ${styles.primary}`}
                            style={{ marginTop: '1rem' }}
                        >
                            {loadingVolume ? 'Loading...' : 'Fetch Volume Data'}
                        </button>

                        {errorVolume && (
                            <div className={styles.errorMessage}>
                                <AlertCircle size={16} />
                                {errorVolume}
                            </div>
                        )}

                        {stockVolume && stockVolume.length > 0 ? (
                            <>
                                <h3>Volume Differences</h3>
                                {renderVolumeTable(stockVolume)}
                            </>
                        ) : !loadingVolume && !errorVolume && selectedDates.length >= 2 ? (
                            <p className={styles.noData}>Click &quot;Fetch Volume Data&quot; to see results.</p>
                        ) : !errorVolume && selectedDates.length < 2 ? (
                            <p className={styles.noData}>Select at least two dates to analyze volume.</p>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
