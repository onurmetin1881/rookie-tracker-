
import React, { useState, useMemo } from 'react';
import { MarketData } from '../types';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface MarketTableProps {
    assets: MarketData[];
    onSelectAsset: (asset: MarketData) => void;
    title: string;
}

type SortField = 'price' | 'change' | 'mcap' | 'name';
type SortDirection = 'asc' | 'desc';

export const MarketTable: React.FC<MarketTableProps> = ({ assets, onSelectAsset, title }) => {
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc'); // Default to desc (High to Low) for numbers usually
        }
    };

    // Explicit sorting buttons handler
    const setSort = (field: SortField, direction: SortDirection) => {
        setSortField(field);
        setSortDirection(direction);
    };

    const sortedAssets = useMemo(() => {
        if (!sortField) return assets;
        
        return [...assets].sort((a, b) => {
            let valA: number | string = 0;
            let valB: number | string = 0;

            switch (sortField) {
                case 'price':
                    valA = a.current_price || 0;
                    valB = b.current_price || 0;
                    break;
                case 'change':
                    valA = a.price_change_percentage_24h || 0;
                    valB = b.price_change_percentage_24h || 0;
                    break;
                case 'mcap':
                    valA = a.market_cap || 0;
                    valB = b.market_cap || 0;
                    break;
                case 'name':
                    valA = a.symbol;
                    valB = b.symbol;
                    // String comparison
                    return sortDirection === 'asc' 
                        ? (valA as string).localeCompare(valB as string)
                        : (valB as string).localeCompare(valA as string);
            }

            // Numeric comparison
            return sortDirection === 'asc' 
                ? (valA as number) - (valB as number) 
                : (valB as number) - (valA as number);
        });
    }, [assets, sortField, sortDirection]);

    // Helper to format price with appropriate decimals
    const formatPrice = (price: number) => {
        if (!price && price !== 0) return '0.00';
        if (price < 0.01 && price > 0) {
            return price.toFixed(8); // Show more precision for small coins like PEPE
        }
        if (price < 1 && price > 0) {
            return price.toFixed(4);
        }
        return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 px-1 gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                
                {/* Sorting Toolbar */}
                <div className="flex flex-wrap gap-2">
                     <button 
                        onClick={() => setSort('price', 'asc')}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${sortField === 'price' && sortDirection === 'asc' ? 'bg-apple-blue text-white border-apple-blue' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-transparent'}`}
                    >
                        Price: Low to High
                    </button>
                    <button 
                        onClick={() => setSort('change', 'asc')}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${sortField === 'change' && sortDirection === 'asc' ? 'bg-apple-blue text-white border-apple-blue' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-transparent'}`}
                    >
                        24h %: Low to High
                    </button>
                    <button 
                        onClick={() => setSort('mcap', 'asc')}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${sortField === 'mcap' && sortDirection === 'asc' ? 'bg-apple-blue text-white border-apple-blue' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-transparent'}`}
                    >
                        Cap: Low to High
                    </button>
                </div>
            </div>

            <div className="bg-white/50 dark:bg-apple-card/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-none relative">
                
                {/* Sticky Header with Sorting */}
                <div className="sticky top-0 z-10 grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/90 dark:bg-[#1c1c1e]/90 backdrop-blur-md">
                    <div 
                        className="col-span-4 md:col-span-3 cursor-pointer flex items-center hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => handleSort('name')}
                    >
                        Asset {sortField === 'name' && (sortDirection === 'asc' ? <ArrowUp size={12} className="ml-1"/> : <ArrowDown size={12} className="ml-1"/>)}
                    </div>
                    <div 
                        className="col-span-4 md:col-span-3 text-right cursor-pointer flex items-center justify-end hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => handleSort('price')}
                    >
                        Price {sortField === 'price' && (sortDirection === 'asc' ? <ArrowUp size={12} className="ml-1"/> : <ArrowDown size={12} className="ml-1"/>)}
                    </div>
                    <div 
                        className="col-span-4 md:col-span-3 text-right cursor-pointer flex items-center justify-end hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => handleSort('change')}
                    >
                        24h Change {sortField === 'change' && (sortDirection === 'asc' ? <ArrowUp size={12} className="ml-1"/> : <ArrowDown size={12} className="ml-1"/>)}
                    </div>
                    <div 
                        className="hidden md:block md:col-span-3 text-right cursor-pointer flex items-center justify-end hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => handleSort('mcap')}
                    >
                        Market Cap {sortField === 'mcap' && (sortDirection === 'asc' ? <ArrowUp size={12} className="ml-1"/> : <ArrowDown size={12} className="ml-1"/>)}
                    </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-white/5">
                    {sortedAssets.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No assets available.
                        </div>
                    ) : (
                        sortedAssets.map((asset) => {
                            const price = asset.current_price || 0;
                            const change = asset.price_change_percentage_24h || 0;
                            const isPositive = change >= 0;
                            
                            return (
                                <div 
                                    key={asset.id} 
                                    onClick={() => onSelectAsset(asset)}
                                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                                >
                                    <div className="col-span-4 md:col-span-3 flex items-center space-x-3">
                                        {asset.image ? (
                                            <img src={asset.image} alt={asset.symbol} className="w-8 h-8 rounded-full" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-700 dark:text-gray-300 font-bold">
                                                {asset.symbol ? asset.symbol.substring(0, 2) : '??'}
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white group-hover:text-apple-blue transition-colors">{asset.symbol}</span>
                                            <span className="text-xs text-gray-500 truncate max-w-[100px]">{asset.name}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-4 md:col-span-3 text-right font-mono text-sm text-gray-900 dark:text-gray-200">
                                        ${formatPrice(price)}
                                    </div>
                                    <div className="col-span-4 md:col-span-3 text-right flex justify-end">
                                        <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${isPositive ? 'bg-green-100 dark:bg-apple-green/10 text-apple-green' : 'bg-red-100 dark:bg-apple-red/10 text-apple-red'}`}>
                                            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            <span>{Math.abs(change).toFixed(2)}%</span>
                                        </div>
                                    </div>
                                    <div className="hidden md:block md:col-span-3 text-right text-sm text-gray-500 dark:text-gray-400">
                                        ${asset.market_cap ? (asset.market_cap / 1e9).toFixed(2) + 'B' : 'N/A'}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
