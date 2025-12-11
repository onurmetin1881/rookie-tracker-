
import React, { useEffect, useState, useMemo } from 'react';
import { MarketData } from '../types';
import { X, TrendingUp, TrendingDown, Sparkles, Star, Bell, Activity, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { analyzeAsset } from '../services/geminiService';

interface AssetDetailProps {
    asset: MarketData;
    onClose: () => void;
    isWatched?: boolean;
    onToggleWatchlist?: (assetId: string) => void;
}

type Tab = 'overview' | 'analysis' | 'alerts';

export const AssetDetail: React.FC<AssetDetailProps> = ({ asset, onClose, isWatched = false, onToggleWatchlist }) => {
    const [analysis, setAnalysis] = useState<string>('');
    const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [alertPrice, setAlertPrice] = useState<string>('');
    const [activeAlerts, setActiveAlerts] = useState<number[]>([]);

    useEffect(() => {
        const getAnalysis = async () => {
            if(activeTab === 'overview' && !analysis) {
                setLoadingAnalysis(true);
                const result = await analyzeAsset(asset);
                setAnalysis(result);
                setLoadingAnalysis(false);
            }
        };
        getAnalysis();
    }, [asset, activeTab]);

    // Mock chart data generation based on current price/trend
    const data = useMemo(() => {
        if (asset.sparkline && asset.sparkline.length > 0) {
            return asset.sparkline.map((price, i) => ({ time: i, price }));
        }
        // Fallback generator
        const points = [];
        let price = asset.current_price || 100; // Default base price if 0
        if (price === 0) price = 10;
        
        for (let i = 0; i < 24; i++) {
            points.unshift({ time: i, price });
            price = price * (1 - (Math.random() * 0.02 - 0.01));
        }
        return points;
    }, [asset]);

    // Simple Technical Indicators Calculation
    const technicals = useMemo(() => {
        const prices = data.map(d => d.price);
        if (prices.length < 14) return null;

        // RSI
        let gains = 0;
        let losses = 0;
        for (let i = 1; i < 14; i++) {
            const diff = prices[prices.length - 1 - i + 1] - prices[prices.length - 1 - i];
            if (diff >= 0) gains += diff;
            else losses -= diff;
        }
        const avgGain = gains / 14;
        const avgLoss = losses / 14;
        const rs = avgGain / (avgLoss || 1); // Avoid div by zero
        const rsi = 100 - (100 / (1 + rs));

        // SMA
        const sum = prices.slice(0, 14).reduce((a, b) => a + b, 0);
        const sma = sum / 14;

        return { rsi: rsi.toFixed(1), sma: sma.toFixed(2) };
    }, [data]);

    const change = asset.price_change_percentage_24h || 0;
    const isPositive = change >= 0;
    const displayPrice = asset.current_price || 0;

    // Helper for formatting large or small numbers
    const formatPrice = (p: number) => {
        if (p < 0.01 && p > 0) return p.toFixed(8);
        if (p < 1 && p > 0) return p.toFixed(4);
        return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleAddAlert = () => {
        const p = parseFloat(alertPrice);
        if (!isNaN(p)) {
            setActiveAlerts(prev => [...prev, p]);
            setAlertPrice('');
        }
    };

    const removeAlert = (index: number) => {
        setActiveAlerts(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white dark:bg-apple-card border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                    <div className="flex items-center space-x-4">
                        {asset.image && <img src={asset.image} alt={asset.name} className="w-12 h-12 rounded-full bg-white p-1 shadow-sm" />}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{asset.name}</h2>
                            <span className="text-gray-500 dark:text-gray-400 font-mono text-sm">{asset.symbol}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {onToggleWatchlist && (
                            <button 
                                onClick={() => onToggleWatchlist(asset.id)}
                                className={`p-2 rounded-full transition-colors ${isWatched ? 'bg-yellow-500/10 text-yellow-500' : 'hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 dark:hover:text-white'}`}
                                title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
                            >
                                <Star size={24} fill={isWatched ? "currentColor" : "none"} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                            <X size={24} className="text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-white/10">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'text-apple-blue border-b-2 border-apple-blue' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('analysis')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'analysis' ? 'text-apple-blue border-b-2 border-apple-blue' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Technical Analysis
                    </button>
                    <button 
                        onClick={() => setActiveTab('alerts')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'alerts' ? 'text-apple-blue border-b-2 border-apple-blue' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Alerts
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-6">
                    {/* Price Info Header (Always Visible) */}
                    <div className="flex items-end space-x-4">
                        <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                            ${formatPrice(displayPrice)}
                        </span>
                        <div className={`flex items-center space-x-1 mb-1 px-2 py-0.5 rounded text-sm font-medium ${isPositive ? 'bg-green-100 dark:bg-apple-green/20 text-apple-green' : 'bg-red-100 dark:bg-apple-red/20 text-apple-red'}`}>
                            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span>{Math.abs(change).toFixed(2)}%</span>
                        </div>
                    </div>

                    {activeTab === 'overview' && (
                        <>
                            {/* Chart */}
                            <div className="h-64 w-full bg-gray-50 dark:bg-black/20 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data}>
                                        <XAxis dataKey="time" hide />
                                        <YAxis domain={['auto', 'auto']} hide />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'var(--tooltip-bg, #1c1c1e)', 
                                                borderColor: 'var(--tooltip-border, #333)', 
                                                borderRadius: '8px',
                                                color: 'var(--tooltip-text, #fff)'
                                            }}
                                            itemStyle={{ color: 'var(--tooltip-text, #fff)' }}
                                            formatter={(value: number) => [`$${formatPrice(value)}`, 'Price']}
                                            labelStyle={{ display: 'none' }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="price" 
                                            stroke={isPositive ? '#30d158' : '#ff453a'} 
                                            strokeWidth={3} 
                                            dot={false} 
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Gemini Analysis */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-5 border border-indigo-100 dark:border-indigo-500/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <Sparkles size={64} className="text-indigo-400" />
                                </div>
                                <div className="flex items-center space-x-2 mb-3">
                                    <Sparkles className="text-indigo-500 dark:text-indigo-400" size={20} />
                                    <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-100">Gemini AI Insight</h3>
                                </div>
                                {loadingAnalysis ? (
                                    <div className="flex space-x-1 items-center h-12">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                ) : (
                                    <p className="text-indigo-900 dark:text-indigo-200 leading-relaxed text-sm">
                                        {analysis}
                                    </p>
                                )}
                            </div>
                            
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                                    <span className="text-gray-500 text-xs uppercase tracking-wide">Market Cap</span>
                                    <div className="text-lg font-semibold mt-1 text-gray-900 dark:text-white">
                                        ${asset.market_cap?.toLocaleString() || 'N/A'}
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                                    <span className="text-gray-500 text-xs uppercase tracking-wide">Volume</span>
                                    <div className="text-lg font-semibold mt-1 text-gray-900 dark:text-white">
                                        {asset.volume?.toLocaleString() || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="space-y-6">
                             <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-6">
                                <div className="flex items-center mb-4 text-gray-900 dark:text-white">
                                    <Activity size={20} className="mr-2 text-apple-blue" />
                                    <h3 className="text-lg font-semibold">Technical Indicators (14D)</h3>
                                </div>
                                {technicals ? (
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">RSI</p>
                                            <div className="flex items-baseline space-x-2">
                                                <span className={`text-2xl font-bold ${parseFloat(technicals.rsi) > 70 ? 'text-red-500' : parseFloat(technicals.rsi) < 30 ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
                                                    {technicals.rsi}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {parseFloat(technicals.rsi) > 70 ? 'Overbought' : parseFloat(technicals.rsi) < 30 ? 'Oversold' : 'Neutral'}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">SMA</p>
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                ${technicals.sma}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-sm">Insufficient data for technical analysis.</div>
                                )}
                            </div>
                            
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-start space-x-3">
                                <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                    <p className="font-semibold mb-1">About Indicators</p>
                                    <p>RSI (Relative Strength Index) measures momentum. Values above 70 indicate overbought conditions, while below 30 indicate oversold.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'alerts' && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Bell size={20} className="mr-2 text-apple-blue" />
                                    Set Price Alert
                                </h3>
                                <div className="flex space-x-2">
                                    <input 
                                        type="number" 
                                        placeholder="Target Price ($)" 
                                        value={alertPrice}
                                        onChange={(e) => setAlertPrice(e.target.value)}
                                        className="flex-1 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-apple-blue"
                                    />
                                    <button 
                                        onClick={handleAddAlert}
                                        disabled={!alertPrice}
                                        className="bg-apple-blue text-white px-4 py-2 rounded-xl font-medium disabled:opacity-50 hover:bg-blue-600 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Active Alerts</h4>
                                {activeAlerts.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                                        No active alerts
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {activeAlerts.map((price, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-apple-card border border-gray-200 dark:border-white/10 rounded-xl shadow-sm">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-2 h-2 rounded-full bg-apple-green animate-pulse"></div>
                                                    <span className="font-mono font-medium text-gray-900 dark:text-white">${formatPrice(price)}</span>
                                                </div>
                                                <button 
                                                    onClick={() => removeAlert(idx)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
