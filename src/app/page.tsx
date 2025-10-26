import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getTopGainersLosers, getSectorPerformance } from '@/lib/api';
import { ArrowDown, ArrowUp } from 'lucide-react';

// Helper to format a Date object to ddmmyyyy string
const formatToApiDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
};

async function getLatestData() {
    const today = new Date();
    const apiDate = formatToApiDate(today);

    try {
        const [stockPerformance, sectorPerformance] = await Promise.all([
            getTopGainersLosers(apiDate),
            getSectorPerformance(apiDate),
        ]);
        return { stockPerformance, sectorPerformance };
    } catch (error) {
        console.error("Failed to fetch latest data, attempting with yesterday's date");
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayApiDate = formatToApiDate(yesterday);

        try {
            const [stockPerformance, sectorPerformance] = await Promise.all([
                getTopGainersLosers(yesterdayApiDate),
                getSectorPerformance(yesterdayApiDate),
            ]);
            return { stockPerformance, sectorPerformance };
        } catch (finalError) {
            console.error("Failed to fetch data for both today and yesterday:", finalError);
            return { stockPerformance: null, sectorPerformance: null };
        }
    }
}

export default async function Home() {
    const { stockPerformance, sectorPerformance } = await getLatestData();

    const renderStockList = (stocks: any[], type: 'gainer' | 'loser') => (
        <ul className="space-y-2">
            {stocks.map((stock, index) => (
                <li key={index} className="flex justify-between items-center">
                    <span>{stock.Symbol}</span>
                    <span className={`flex items-center font-semibold ${type === 'gainer' ? 'text-green-500' : 'text-red-500'}`}>
                        {type === 'gainer' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        {stock["%Chng"]}
                    </span>
                </li>
            ))}
        </ul>
    );

    const renderSectorList = (sectors: any[], type: 'gainer' | 'loser') => (
        <ul className="space-y-2">
            {sectors.map((sector, index) => (
                <li key={index} className="flex justify-between items-center">
                    <span>{sector.name}</span>
                    <span className={`flex items-center font-semibold ${type === 'gainer' ? 'text-green-500' : 'text-red-500'}`}>
                        {type === 'gainer' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        {sector.percentChange.toFixed(2)}%
                    </span>
                </li>
            ))}
        </ul>
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Market Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                
                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Nifty 50 Gainers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stockPerformance?.topGainers ? (
                            renderStockList(stockPerformance.topGainers, 'gainer')
                        ) : (
                            <p>Data not available.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Nifty 50 Losers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stockPerformance?.topLosers ? (
                            renderStockList(stockPerformance.topLosers, 'loser')
                        ) : (
                            <p>Data not available.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Gaining Sectors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sectorPerformance?.topGainers ? (
                            renderSectorList(sectorPerformance.topGainers, 'gainer')
                        ) : (
                            <p>Data not available.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Losing Sectors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sectorPerformance?.topLosers ? (
                            renderSectorList(sectorPerformance.topLosers, 'loser')
                        ) : (
                            <p>Data not available.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
