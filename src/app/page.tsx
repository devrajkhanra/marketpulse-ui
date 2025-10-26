import { getTopGainersLosers, getSectorPerformance } from '@/lib/api';
import styles from './page.module.css';

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

interface Sector {
    name: string;
    percentChange: number;
}

async function getLatestData() {
    const today = new Date();
    const apiDate = formatToApiDate(today);

    try {
        const [stockPerformance, sectorPerformance] = await Promise.all([
            getTopGainersLosers(apiDate),
            getSectorPerformance(apiDate),
        ]);
        return { stockPerformance, sectorPerformance };
    } catch {
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

    const renderStockList = (stocks: Stock[], type: 'gainer' | 'loser') => (
        <ul className={styles.list}>
            {stocks.map((stock, index) => (
                <li key={index} className={styles.listItem}>
                    <span>{stock.Symbol}</span>
                    <span className={type === 'gainer' ? styles.gainer : styles.loser}>
                        {type === 'gainer' ? '▲' : '▼'}
                        {stock["%Chng"]}
                    </span>
                </li>
            ))}
        </ul>
    );

    const renderSectorList = (sectors: Sector[], type: 'gainer' | 'loser') => (
        <ul className={styles.list}>
            {sectors.map((sector, index) => (
                <li key={index} className={styles.listItem}>
                    <span>{sector.name}</span>
                    <span className={type === 'gainer' ? styles.gainer : styles.loser}>
                        {type === 'gainer' ? '▲' : '▼'}
                        {sector.percentChange.toFixed(2)}%
                    </span>
                </li>
            ))}
        </ul>
    );

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Market Overview</h1>
            <div className={styles.grid}>
                
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Top 5 Nifty 50 Gainers</h2>
                    </div>
                    <div className={styles.cardContent}>
                        {stockPerformance?.topGainers ? (
                            renderStockList(stockPerformance.topGainers, 'gainer')
                        ) : (
                            <p>Data not available.</p>
                        )}
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Top 5 Nifty 50 Losers</h2>
                    </div>
                    <div className={styles.cardContent}>
                        {stockPerformance?.topLosers ? (
                            renderStockList(stockPerformance.topLosers, 'loser')
                        ) : (
                            <p>Data not available.</p>
                        )}
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Top 5 Gaining Sectors</h2>
                    </div>
                    <div className={styles.cardContent}>
                        {sectorPerformance?.topGainers ? (
                            renderSectorList(sectorPerformance.topGainers, 'gainer')
                        ) : (
                            <p>Data not available.</p>
                        )}
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Top 5 Losing Sectors</h2>
                    </div>
                    <div className={styles.cardContent}>
                        {sectorPerformance?.topLosers ? (
                            renderSectorList(sectorPerformance.topLosers, 'loser')
                        ) : (
                            <p>Data not available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
