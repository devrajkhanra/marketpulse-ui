'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { getSectorPerformance, getSectorVolumeRatio } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Helper to format a Date object to ddmmyyyy string
const formatToApiDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
};

export default function SectorsClient() {
    const [performanceDate, setPerformanceDate] = useState<Date | undefined>(new Date());
    const [volumeRange, setVolumeRange] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined });
    const [sectorPerformance, setSectorPerformance] = useState<any>(null);
    const [sectorVolume, setSectorVolume] = useState<any>(null);
    const [loadingPerformance, setLoadingPerformance] = useState(false);
    const [loadingVolume, setLoadingVolume] = useState(false);
    const [errorPerformance, setErrorPerformance] = useState<string | null>(null);
    const [errorVolume, setErrorVolume] = useState<string | null>(null);

    const handleFetchPerformance = async () => {
        if (performanceDate) {
            setLoadingPerformance(true);
            setErrorPerformance(null);
            try {
                const data = await getSectorPerformance(formatToApiDate(performanceDate));
                setSectorPerformance(data);
            } catch (err) {
                setErrorPerformance('Failed to fetch sector performance. Please try again.');
                console.error(err);
            }
            setLoadingPerformance(false);
        }
    };

    const handleFetchVolume = async () => {
        if (volumeRange.from && volumeRange.to) {
            setLoadingVolume(true);
            setErrorVolume(null);
            try {
                const data = await getSectorVolumeRatio(formatToApiDate(volumeRange.to), formatToApiDate(volumeRange.from));
                setSectorVolume(data);
            } catch (err) {
                setErrorVolume('Failed to fetch sector volume ratios. Please try again.');
                console.error(err);
            }
            setLoadingVolume(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Sector Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <Calendar mode="single" selected={performanceDate} onSelect={setPerformanceDate} />
                        <Button onClick={handleFetchPerformance} disabled={loadingPerformance}>
                            {loadingPerformance ? 'Loading...' : 'Get Performance'}
                        </Button>
                    </div>
                    {errorPerformance && <p className="text-red-500">{errorPerformance}</p>}
                    {sectorPerformance && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2">Top 5 Gainers</h3>
                                <ul className="space-y-2">
                                    {sectorPerformance.topGainers.map((sector: any) => (
                                        <li key={sector.name} className="flex justify-between">
                                            <span>{sector.name}</span>
                                            <span className="text-green-500">{sector.percentChange.toFixed(2)}%</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Top 5 Losers</h3>
                                <ul className="space-y-2">
                                    {sectorPerformance.topLosers.map((sector: any) => (
                                        <li key={sector.name} className="flex justify-between">
                                            <span>{sector.name}</span>
                                            <span className="text-red-500">{sector.percentChange.toFixed(2)}%</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Sector Volume Ratio Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <Calendar mode="range" selected={volumeRange} onSelect={setVolumeRange} />
                        <Button onClick={handleFetchVolume} disabled={loadingVolume}>
                            {loadingVolume ? 'Loading...' : 'Analyze Volume'}
                        </Button>
                    </div>
                    {errorVolume && <p className="text-red-500">{errorVolume}</p>}
                    {sectorVolume && (
                        <div>
                            <h3 className="font-semibold mb-4 text-center">Volume Ratio Comparison</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={[...sectorVolume.highest, ...sectorVolume.lowest]}>
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="ratio" fill="#8884d8" name="Volume Ratio" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
