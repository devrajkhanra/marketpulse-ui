'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { getTopGainersLosers, getStockVolumeDifferences } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

// Helper to format a Date object to ddmmyyyy string
const formatToApiDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
};

interface Stock {
    Symbol: string;
    "%Chng": number;
}

interface StockPerformance {
    topGainers: Stock[];
    topLosers: Stock[];
}

interface StockVolume {
    symbol: string;
    volumeDifference: number;
}

export default function StocksClient() {
    const [performanceDate, setPerformanceDate] = useState<Date | undefined>(new Date());
    const [volumeDates, setVolumeDates] = useState<string[]>([]);
    const [stockPerformance, setStockPerformance] = useState<StockPerformance | null>(null);
    const [stockVolume, setStockVolume] = useState<StockVolume[]>([]);
    const [loadingPerformance, setLoadingPerformance] = useState(false);
    const [loadingVolume, setLoadingVolume] = useState(false);
    const [errorPerformance, setErrorPerformance] = useState<string | null>(null);
    const [errorVolume, setErrorVolume] = useState<string | null>(null);

    const handleFetchPerformance = async () => {
        if (performanceDate) {
            setLoadingPerformance(true);
            setErrorPerformance(null);
            try {
                const data = await getTopGainersLosers(formatToApiDate(performanceDate));
                setStockPerformance(data);
            } catch (err) {
                setErrorPerformance('Failed to fetch stock performance. Please try again.');
                console.error(err);
            }
            setLoadingPerformance(false);
        }
    };

    const handleFetchVolume = async () => {
        if (volumeDates.length === 2) {
            setLoadingVolume(true);
            setErrorVolume(null);
            try {
                const data = await getStockVolumeDifferences(volumeDates);
                setStockVolume(data);
            } catch (err) {
                setErrorVolume('Failed to fetch stock volume differences. Please try again.');
                console.error(err);
            }
            setLoadingVolume(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Nifty 50 Top Gainers & Losers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <Calendar mode="single" selected={performanceDate} onSelect={setPerformanceDate} />
                        <Button onClick={handleFetchPerformance} disabled={loadingPerformance}>
                            {loadingPerformance ? 'Loading...' : 'Get Performance'}
                        </Button>
                    </div>
                    {errorPerformance && <p className="text-red-500">{errorPerformance}</p>}
                    {stockPerformance && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2">Top 5 Gainers</h3>
                                <ul className="space-y-2">
                                    {stockPerformance.topGainers.map((stock) => (
                                        <li key={stock.Symbol} className="flex justify-between">
                                            <span>{stock.Symbol}</span>
                                            <span className="text-green-500">{stock["%Chng"]}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Top 5 Losers</h3>
                                <ul className="space-y-2">
                                    {stockPerformance.topLosers.map((stock) => (
                                        <li key={stock.Symbol} className="flex justify-between">
                                            <span>{stock.Symbol}</span>
                                            <span className="text-red-500">{stock["%Chng"]}</span>
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
                    <CardTitle>Nifty 50 Stock Volume Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-2">Select two dates to compare volume. The first date will be the &apos;previous&apos; and the second the &apos;current&apos;.</p>
                    <div className="flex items-center gap-4 mb-4">
                        <Calendar
                            mode="multiple"
                            min={2}
                            selected={volumeDates.map(d => new Date(d.slice(4, 8), parseInt(d.slice(2, 4)) - 1, parseInt(d.slice(0, 2))))}
                            onSelect={(dates) => setVolumeDates(dates?.map(d => formatToApiDate(d)) || [])}
                        />
                        <Button onClick={handleFetchVolume} disabled={loadingVolume || volumeDates.length !== 2}>
                            {loadingVolume ? 'Analyzing...' : 'Analyze Volume'}
                        </Button>
                    </div>
                    {errorVolume && <p className="text-red-500">{errorVolume}</p>}
                    {stockVolume.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Symbol</TableHead>
                                    <TableHead>Volume Difference</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stockVolume.map((stock) => (
                                    <TableRow key={stock.symbol}>
                                        <TableCell>{stock.symbol}</TableCell>
                                        <TableCell>{stock.volumeDifference.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
