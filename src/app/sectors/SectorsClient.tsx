'use client'

import { useState, useEffect } from 'react';
import { getSectorPerformance, getSectorVolumeRatio } from '@/lib/api';
import styles from './page.module.css';
import barChartStyles from './BarChart.module.css';

interface Sector {
    name: string;
    percentChange: number;
}

interface SectorVolume {
    sector: string;
    volumeRatio: number;
}

// Helper to format a Date object to ddmmyyyy string
const formatToApiDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
};

export default function SectorsClient() {
    const [date, setDate] = useState(new Date());
    const [sectorPerformance, setSectorPerformance] = useState<{ topGainers: Sector[], topLosers: Sector[] } | null>(null);
    const [loadingPerformance, setLoadingPerformance] = useState(true);
    const [errorPerformance, setErrorPerformance] = useState<string | null>(null);

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [sectorVolume, setSectorVolume] = useState<{ topSectors: SectorVolume[], bottomSectors: SectorVolume[] } | null>(null);
    const [loadingVolume, setLoadingVolume] = useState(true);
    const [errorVolume, setErrorVolume] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingPerformance(true);
            setErrorPerformance(null);
            try {
                const apiDate = formatToApiDate(date);
                const data = await getSectorPerformance(apiDate);
                setSectorPerformance(data);
            } catch (err) {
                setErrorPerformance('Failed to fetch sector performance data.');
                console.error(err);
            }
            setLoadingPerformance(false);
        };
        fetchData();
    }, [date]);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingVolume(true);
            setErrorVolume(null);
            try {
                const start = formatToApiDate(startDate);
                const end = formatToApiDate(endDate);
                const data = await getSectorVolumeRatio(start, end);
                setSectorVolume(data);
            } catch (err) {
                setErrorVolume('Failed to fetch sector volume data.');
                console.error(err);
            }
            setLoadingVolume(false);
        };
        fetchData();
    }, [startDate, endDate]);

    const renderSectorTable = (sectors: Sector[], type: 'gainer' | 'loser') => (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Sector</th>
                    <th>Change</th>
                </tr>
            </thead>
            <tbody>
                {sectors.map((sector, index) => (
                    <tr key={index}>
                        <td>{sector.name}</td>
                        <td className={type === 'gainer' ? styles.gainer : styles.loser}>
                            {sector.percentChange.toFixed(2)}%
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderVolumeChart = (sectors: SectorVolume[]) => {
        const maxRatio = Math.max(...sectors.map(s => s.volumeRatio), 0);
        return (
            <div className={barChartStyles.barChart}>
                {sectors.map((sector, index) => (
                    <div key={index} className={barChartStyles.barChartRow}>
                        <div className={barChartStyles.barLabel}>{sector.sector}</div>
                        <div 
                            className={barChartStyles.bar}
                            style={{ width: `${(sector.volumeRatio / maxRatio) * 100}%` }}
                        ></div>
                        <div className={barChartStyles.barValue}>{sector.volumeRatio.toFixed(2)}</div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Sectors Analysis</h1>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Sector Performance</h2>
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
                                {sectorPerformance?.topGainers ? (
                                    renderSectorTable(sectorPerformance.topGainers, 'gainer')
                                ) : (
                                    <p>Data not available.</p>
                                )}
                            </div>
                            <div>
                                <h3>Top 5 Losers</h3>
                                {sectorPerformance?.topLosers ? (
                                    renderSectorTable(sectorPerformance.topLosers, 'loser')
                                ) : (
                                    <p>Data not available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Sector Volume Analysis</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.datePickerContainer}>
                            <label htmlFor="start-date">Start Date:</label>
                            <input
                                type="date"
                                id="start-date"
                                className={styles.datePickerInput}
                                value={startDate.toISOString().split('T')[0]}
                                onChange={(e) => setStartDate(new Date(e.target.value))}
                            />
                             <label htmlFor="end-date">End Date:</label>
                            <input
                                type="date"
                                id="end-date"
                                className={styles.datePickerInput}
                                value={endDate.toISOString().split('T')[0]}
                                onChange={(e) => setEndDate(new Date(e.target.value))}
                            />
                        </div>
                        {loadingVolume && <p>Loading...</p>}
                        {errorVolume && <p>{errorVolume}</p>}
                        <div>
                            <h3>Top 5 Sectors by Volume Ratio</h3>
                            {sectorVolume?.topSectors ? (
                                renderVolumeChart(sectorVolume.topSectors)
                            ) : (
                                <p>Data not available.</p>
                            )}
                        </div>
                        <div>
                            <h3>Bottom 5 Sectors by Volume Ratio</h3>
                            {sectorVolume?.bottomSectors ? (
                                renderVolumeChart(sectorVolume.bottomSectors)
                            ) : (
                                <p>Data not available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
