
import React, { useEffect, useState } from 'react';
import { MarketData } from '../types';
import { MarketTable } from './MarketTable';
import { getMarketOutlook } from '../services/geminiService';
import { Sparkles, Flame, TrendingUp } from 'lucide-react';

interface DashboardProps {
    cryptoData: MarketData[];
    usStockData: MarketData[];
    trStockData: MarketData[];
    trendingData: MarketData[];
    onSelectAsset: (asset: MarketData) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ cryptoData, usStockData, trStockData, trendingData, onSelectAsset }) => {
    const [outlook, setOutlook] = useState<string>('Analyzing market trends...');

    useEffect(() => {
        getMarketOutlook().then(setOutlook);
    }, []);

    // Get top movers
    const allAssets = [...cryptoData, ...usStockData, ...trStockData];
    const topGainers = [...allAssets].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5);

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-mono text-xs">MARKET STATUS: OPEN</p>
                </div>
                
                {/* AI Summary Card - Minimal Style */}
                <div className="flex-1 md:max-w-xl bg-white dark:bg-[#050505] border border-gray-200 dark:border-white/10 rounded-xl p-4 flex items-start space-x-4 shadow-sm">
                    <div className="bg-black dark:bg-white p-2 rounded-lg text-white dark:text-black">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wide">AI Insight</h3>
                        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1 font-medium">
                            {outlook.split('\n').map((line, i) => (
                                <p key={i}>{line.replace('*', '• ')}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Trending & Top Gainers Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Global Top Gainers */}
                <div className="bg-white dark:bg-[#050505] rounded-2xl p-1 border border-gray-200 dark:border-white/10">
                    <div className="flex items-center space-x-2 px-4 py-3 border-b border-gray-100 dark:border-white/5 mb-2">
                        <TrendingUp className="text-black dark:text-white" size={18} />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">Top Gainers</h2>
                    </div>
                    <MarketTable 
                        title="" 
                        assets={topGainers} 
                        onSelectAsset={onSelectAsset} 
                    />
                </div>

                {/* Trending Searches */}
                <div className="bg-white dark:bg-[#050505] rounded-2xl p-1 border border-gray-200 dark:border-white/10">
                    <div className="flex items-center space-x-2 px-4 py-3 border-b border-gray-100 dark:border-white/5 mb-2">
                        <Flame className="text-black dark:text-white" size={18} />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">Trending</h2>
                    </div>
                    {trendingData.length > 0 ? (
                        <MarketTable 
                            title="" 
                            assets={trendingData.slice(0, 5)} 
                            onSelectAsset={onSelectAsset} 
                        />
                    ) : (
                        <div className="p-8 text-center text-gray-500 text-sm font-mono">
                            DATA LOADING...
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <MarketTable title="Crypto" assets={cryptoData.slice(0, 5)} onSelectAsset={onSelectAsset} />
                <MarketTable title="US Tech" assets={usStockData.slice(0, 5)} onSelectAsset={onSelectAsset} />
            </div>
        </div>
    );
};
