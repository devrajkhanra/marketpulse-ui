'use client'

import { useState, useEffect } from 'react';
import { getSectorPerformance, getSectorVolumeRatio } from '@/lib/api';
import { AlertCircle, Plus, XCircle, PieChart } from 'lucide-react';
import styles from './page.module.css';
import barChartStyles from './BarChart.module.css';


interface Sector {
    sector: string;
    percentageChange: number;
}

interface SectorVolume {
    sector: string;
    volumeRatio: number;
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

export default function SectorsClient() {
    const [date, setDate] = useState(new Date());
    const [sectorPerformance, setSectorPerformance] = useState<{
        topGainers: Sector[],
        topLosers: Sector[]
    } | null>(null);
    const [loadingPerformance, setLoadingPerformance] = useState(true);
    const [errorPerformance, setErrorPerformance] = useState<string | null>(null);

    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [tempDate, setTempDate] = useState<Date>(new Date());
    const [sectorVolume, setSectorVolume] = useState<{ topSectors: SectorVolume[], bottomSectors: SectorVolume[] } | null>(null);
    const [loadingVolume, setLoadingVolume] = useState(false);
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
                const typedErr = err as { response?: { status: number } };
                const message = typedErr.response?.status === 404
                    ? `No data available for ${formatToApiDate(date)}`
                    : 'Failed to fetch sector performance data.';
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
            const apiDates = selectedDates.sort((a, b) => a.getTime() - b.getTime()).map(formatToApiDate);
            const data = await getSectorVolumeRatio(apiDates[0], apiDates[apiDates.length - 1]);
            setSectorVolume(data);
        } catch (err) {
            setErrorVolume('Failed to fetch sector volume data.');
            console.error(err);
        } finally {
            setLoadingVolume(false);
        }
    };

    const renderSectorTable = (sectors: Sector[], type: 'gainer' | 'loser') => (
        <div className={styles.tableWrapper}>
            <table className={styles.modernTable}>
                <thead>
                    <tr>
                        <th>Sector</th>
                        <th>% Change</th>
                    </tr>
                </thead>
                <tbody>
                    {sectors.map((sector, index) => (
                        <tr key={index} className={index % 2 === 0 ? styles.rowEven : undefined}>
                            <td>{sector.sector}</td>
                            <td className={type === 'gainer' ? styles.gainerCell : styles.loserCell}>
                                {sector.percentageChange > 0 ? '+' : ''}
                                {sector.percentageChange.toFixed(2)}%
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
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
                        <h2 className={styles.cardTitle}>
                            <PieChart size={18} />
                            Sector Performance
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
                                {sectorPerformance?.topGainers ? (
                                    renderSectorTable(sectorPerformance.topGainers, 'gainer')
                                ) : (
                                    <p className={styles.noData}>Data not available.</p>
                                )}
                                <h3>Top 5 Losers</h3>
                                {sectorPerformance?.topLosers ? (
                                    renderSectorTable(sectorPerformance.topLosers, 'loser')
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
                            <PieChart size={18} />
                            Sector Volume Analysis
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

                        {sectorVolume ? (
                            <>
                                <h3>Top 5 Sectors by Volume Ratio</h3>
                                {sectorVolume?.topSectors ? (
                                    renderVolumeChart(sectorVolume.topSectors)
                                ) : (
                                    <p className={styles.noData}>Data not available.</p>
                                )}
                                <h3>Bottom 5 Sectors by Volume Ratio</h3>
                                {sectorVolume?.bottomSectors ? (
                                    renderVolumeChart(sectorVolume.bottomSectors)
                                ) : (
                                    <p className={styles.noData}>Data not available.</p>
                                )}
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
