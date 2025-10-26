'use client'

import { useState, useEffect } from 'react';
import { getTopGainersLosers, getStockVolumeDifferences } from '@/lib/api';
import styles from './page.module.css';

interface Stock {
    Symbol: string;
    "%Chng": number;
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
    const [stockPerformance, setStockPerformance] = useState<{ topGainers: Stock[], topLosers: Stock[] } | null>(null);
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
                setErrorPerformance('Failed to fetch stock performance data.');
                console.error(err);
            }
            setLoadingPerformance(false);
        };
        fetchData();
    }, [date]);

    const handleVolumeFetch = async () => {
        if(dates.length < 2) {
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

    const renderStockTable = (stocks: Stock[], type: 'gainer' | 'loser') => (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Symbol</th>
                    <th>% Change</th>
                </tr>
            </thead>
            <tbody>
                {stocks.map((stock, index) => (
                    <tr key={index}>
                        <td>{stock.Symbol}</td>
                        <td className={type === 'gainer' ? styles.gainer : styles.loser}>
                            {stock["%Chng"]}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderVolumeTable = (volumes: StockVolume[]) => (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Symbol</th>
                    <th>Volume Difference</th>
                </tr>
            </thead>
            <tbody>
                {volumes.map((volume, index) => (
                    <tr key={index}>
                        <td>{volume.symbol}</td>
                        <td>{volume.volumeDifference}</td>
                    </tr>
                ))}
            </tbody>
        </table>
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
