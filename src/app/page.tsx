import { getTopGainersLosers, getSectorPerformance } from '@/lib/api';
import styles from './page.module.css';

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

const StockList: React.FC<{ stocks: Stock[]; type: 'gainer' | 'loser' }> = ({ stocks, type }) => (
    <ul className={styles.list}>
        {stocks.map((stock) => (
            <li key={stock.Symbol} className={styles.listItem}>
                <span className={styles.symbol}>{stock.Symbol}</span>
                <span className={type === 'gainer' ? styles.gainer : styles.loser}>
                    <span aria-hidden="true">{type === 'gainer' ? '▲' : '▼'}</span>
                    <span className="sr-only">{type === 'gainer' ? 'Gain of' : 'Loss of'}</span>
                    {stock["%Chng"].toFixed(2)}%
                </span>
            </li>
        ))}
    </ul>
);

const SectorList: React.FC<{ sectors: Sector[]; type: 'gainer' | 'loser' }> = ({ sectors, type }) => (
    <ul className={styles.list}>
        {sectors.map((sector) => (
            <li key={sector.name} className={styles.listItem}>
                <span className={styles.symbol}>{sector.name}</span>
                <span className={type === 'gainer' ? styles.gainer : styles.loser}>
                    <span aria-hidden="true">{type === 'gainer' ? '▲' : '▼'}</span>
                    <span className="sr-only">{type === 'gainer' ? 'Gain of' : 'Loss of'}</span>
                     {sector.percentChange.toFixed(2)}%
                </span>
            </li>
        ))}
    </ul>
);

export default async function Home() {
    const { stockPerformance, sectorPerformance } = await getLatestData();

    return (
        <>
            <header className={styles.hero}>
                <h1 className={styles.heroTitle}>MarketPulse</h1>
                <p className={styles.heroSubtitle}>Your daily snapshot of the NSE market.</p>
            </header>

            <div className={styles.grid}>
                <section className={styles.card} aria-labelledby="top-gainers-title" role="region">
                    <h2 id="top-gainers-title" className={styles.cardTitle}>Top 5 Nifty 50 Gainers</h2>
                    {stockPerformance?.topGainers ? (
                        <StockList stocks={stockPerformance.topGainers} type="gainer" />
                    ) : (
                        <p className={styles.noData} role="status">Data not available.</p>
                    )}
                </section>

                <section className={styles.card} aria-labelledby="top-losers-title" role="region">
                    <h2 id="top-losers-title" className={styles.cardTitle}>Top 5 Nifty 50 Losers</h2>
                    {stockPerformance?.topLosers ? (
                        <StockList stocks={stockPerformance.topLosers} type="loser" />
                    ) : (
                        <p className={styles.noData} role="status">Data not available.</p>
                    )}
                </section>

                <section className={styles.card} aria-labelledby="top-gaining-sectors-title" role="region">
                    <h2 id="top-gaining-sectors-title" className={styles.cardTitle}>Top 5 Gaining Sectors</h2>
                    {sectorPerformance?.topGainers ? (
                        <SectorList sectors={sectorPerformance.topGainers} type="gainer" />
                    ) : (
                        <p className={styles.noData} role="status">Data not available.</p>
                    )}
                </section>

                <section className={styles.card} aria-labelledby="top-losing-sectors-title" role="region">
                    <h2 id="top-losing-sectors-title" className={styles.cardTitle}>Top 5 Losing Sectors</h2>
                    {sectorPerformance?.topLosers ? (
                        <SectorList sectors={sectorPerformance.topLosers} type="loser" />
                    ) : (
                        <p className={styles.noData} role="status">Data not available.</p>
                    )}
                </section>
            </div>
        </>
    );
}
