'use client';

import { useState, useEffect, useMemo } from 'react';
import { getBhavcopy, searchBhavcopy } from '@/lib/api';
import styles from './BhavcopyViewer.module.css';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 15;

interface BhavcopyData {
    SYMBOL: string;
    SERIES: string;
    OPEN: number;
    HIGH: number;
    LOW: number;
    CLOSE: number;
    LAST: number;
    PREVCLOSE: number;
    TIMESTAMP: string;
}

export default function BhavcopyViewer() {
    const [data, setData] = useState<BhavcopyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState<string>('latest');
    const [dates, setDates] = useState<string[]>([]);

    useEffect(() => {
        // Fetch available dates for the filter dropdown
        const fetchDates = async () => {
            // This is a placeholder. In a real app, you'd have an API endpoint
            // to get all unique dates from your database.
            setDates(['20230101', '20230102', '20230103']); // Example dates
        };
        fetchDates();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                let result;
                if (searchTerm) {
                    result = await searchBhavcopy(searchTerm, filterDate, currentPage, PAGE_SIZE);
                } else {
                    result = await getBhavcopy(filterDate, currentPage, PAGE_SIZE);
                }
                setData(result.data);
                setTotalPages(result.totalPages);
            } catch (err) {
                setError('Failed to fetch bhavcopy data.');
                console.error(err);
            }
            setLoading(false);
        };

        fetchData();
    }, [currentPage, searchTerm, filterDate]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleDateChange = (value: string) => {
        setFilterDate(value);
        setCurrentPage(1);
    };

    const visiblePages = useMemo(() => {
        const pages = [];
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, start + 4);
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    }, [currentPage, totalPages]);

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <div className={styles.controlGroup}>
                    <Label htmlFor="search-input">Search by Symbol</Label>
                    <Input
                        id="search-input"
                        placeholder="Search by symbol..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                        aria-label="Search by stock symbol"
                    />
                </div>
                <div className={styles.controlGroup}>
                    <Label htmlFor="date-filter">Filter by Date</Label>
                    <Select value={filterDate} onValueChange={handleDateChange}>
                        <SelectTrigger id="date-filter" className={styles.dateFilter} aria-label="Filter by date">
                            <SelectValue placeholder="Filter by date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="latest">Latest</SelectItem>
                            {dates.map(date => (
                                <SelectItem key={date} value={date}>{date}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading && <div className={styles.loading}>Loading data...</div>}
            {error && <div className={styles.error}>{error}</div>}

            {!loading && !error && (
                <>
                    <div className={styles.tableContainer}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Symbol</TableHead>
                                    <TableHead>Series</TableHead>
                                    <TableHead className="text-right">Open</TableHead>
                                    <TableHead className="text-right">High</TableHead>
                                    <TableHead className="text-right">Low</TableHead>
                                    <TableHead className="text-right">Close</TableHead>
                                    <TableHead className="text-right">Last</TableHead>
                                    <TableHead className="text-right">Prev. Close</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{row.SYMBOL}</TableCell>
                                        <TableCell>{row.SERIES}</TableCell>
                                        <TableCell className="text-right">{row.OPEN}</TableCell>
                                        <TableCell className="text-right">{row.HIGH}</TableCell>
                                        <TableCell className="text-right">{row.LOW}</TableCell>
                                        <TableCell className="text-right">{row.CLOSE}</TableCell>
                                        <TableCell className="text-right">{row.LAST}</TableCell>
                                        <TableCell className="text-right">{row.PREVCLOSE}</TableCell>
                                        <TableCell>{new Date(row.TIMESTAMP).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className={styles.pagination}>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <div className={styles.pageNumbers}>
                            {visiblePages.map(page => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "ghost"}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
