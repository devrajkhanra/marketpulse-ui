'use client'

import { useState, useEffect } from 'react';
import { getTopGainersLosers, getStockVolumeDifferences } from '@/lib/api';
import styles from './page.module.css';

interface StockData {
    [key: string]: string | number;
}

interface StockVolume {
    symbol: string;
    volumeDifference: number;
}

// Helper to format a Date object to ddmmyyyy string
const formatToApiDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
};

export default function StocksClient() {
    const [date, setDate] = useState(new Date());
    // flexible shape: API returns { topGainers: Array, topLosers: Array }
    const [stockPerformance, setStockPerformance] = useState<{ topGainers: StockData[], topLosers: StockData[] } | null>(null);
    const [loadingPerformance, setLoadingPerformance] = useState(true);
    const [errorPerformance, setErrorPerformance] = useState<string | null>(null);

    const [dates, setDates] = useState<Date[]>([]);
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

    const handleVolumeFetch = async () => {
        if (dates.length < 2) {
            setErrorVolume("Please select at least two dates.");
            return;
        }
        setLoadingVolume(true);
        setErrorVolume(null);
        try {
            const apiDates = dates.map(formatToApiDate);
            const data = await getStockVolumeDifferences(apiDates);
            setStockVolume(data);
        } catch (err) {
            setErrorVolume('Failed to fetch stock volume data.');
            console.error(err);
        }
        setLoadingVolume(false);
    };

    // Generic renderer: take first item keys as columns and render rows accordingly.
    const renderStockTable = (stocks: StockData[], type: 'gainer' | 'loser') => {
        if (!stocks || stocks.length === 0) return <p>No data.</p>;

        const cols = Object.keys(stocks[0]);
        const formatHeader = (h: string) => h.replace(/([A-Z])/g, ' $1').replace(/[_\-]/g, ' ').trim();
        const formatValue = (key: string, val: string | number) => {
            if (val == null) return '-';
            if (/%?chng|%chng|percent|%/i.test(key)) {
                const n = Number(String(val).replace('%', ''));
                return Number.isNaN(n) ? String(val) : `${n}%`;
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
                                            c.toLowerCase().includes('chng')
                                                ? (type === 'gainer' ? styles.gainerCell : styles.loserCell)
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
                            <td>{volume.volumeDifference}</td>
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
                        <h2 className={styles.cardTitle}>Stock Performance</h2>
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
                        {loadingPerformance && <p>Loading...</p>}
                        {errorPerformance && <p>{errorPerformance}</p>}
                        <div className={styles.grid}>
                            <div>
                                <h3>Top 5 Gainers</h3>
                                {stockPerformance?.topGainers ? (
                                    renderStockTable(stockPerformance.topGainers, 'gainer')
                                ) : (
                                    <p>Data not available.</p>
                                )}
                            </div>
                            <div>
                                <h3>Top 5 Losers</h3>
                                {stockPerformance?.topLosers ? (
                                    renderStockTable(stockPerformance.topLosers, 'loser')
                                ) : (
                                    <p>Data not available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Stock Volume Analysis</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.datePickerContainer}>
                            <label htmlFor="date-picker-multi">Select Dates:</label>
                            <input
                                type="date"
                                id="date-picker-multi"
                                className={styles.datePickerInput}
                                multiple
                                onChange={(e) => setDates(Array.from(e.target.files || []).map((file: File) => new Date(file.lastModified)))}
                            />
                            <button onClick={handleVolumeFetch} disabled={loadingVolume}>
                                {loadingVolume ? 'Loading...' : 'Fetch Volume'}
                            </button>
                        </div>
                        {errorVolume && <p>{errorVolume}</p>}
                        {stockVolume ? (
                            renderVolumeTable(stockVolume)
                        ) : (
                            <p>Select at least two dates and click &quot;Fetch Volume&quot;.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
