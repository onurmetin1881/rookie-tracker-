
import React, { useState, useEffect } from 'react';
import { WalletPortfolio } from '../types';
import { fetchWalletData } from '../services/moralisService';
import { fetchEthereumPrice, fetchTokenPrices } from '../services/marketService';
import { Wallet, Search, ArrowRight, AlertCircle, RefreshCw, DollarSign, Plus, Minus } from 'lucide-react';

export const WalletView: React.FC = () => {
    const [address, setAddress] = useState('');
    const [portfolio, setPortfolio] = useState<WalletPortfolio | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const savedAddress = localStorage.getItem('rookie_wallet_address');
        if (savedAddress) {
            setAddress(savedAddress);
            handleFetch(savedAddress);
        }
    }, []);

    const handleFetch = async (addr: string) => {
        setLoading(true);
        setError('');
        try {
            // 1. Fetch Basic Wallet Data (Balances)
            const basicData = await fetchWalletData(addr);
            
            if (basicData) {
                // 2. Fetch Prices
                // Separate ETH from tokens for price fetching
                const tokenAddresses = basicData.assets
                    .filter(a => a.symbol !== 'ETH' && a.token_address && a.token_address !== '0x0000000000000000000000000000000000000000')
                    .map(a => a.token_address);

                const [ethData, tokenData] = await Promise.all([
                    fetchEthereumPrice(),
                    fetchTokenPrices(tokenAddresses)
                ]);

                // 3. Enrich Data with Prices, Market Cap and Calculate Value
                let totalValue = 0;
                
                const enrichedAssets = basicData.assets.map(asset => {
                    let price = 0;
                    let mcap = 0;
                    
                    if (asset.symbol === 'ETH') {
                        price = ethData.price;
                        mcap = ethData.marketCap;
                    } else if (asset.token_address) {
                        // CoinGecko keys are lowercase
                        const data = tokenData[asset.token_address.toLowerCase()];
                        if (data) {
                            price = data.price;
                            mcap = data.marketCap;
                        }
                    }

                    const balanceNum = parseFloat(asset.balance);
                    const value = balanceNum * price;
                    
                    if (!isNaN(value)) {
                        totalValue += value;
                    }

                    return {
                        ...asset,
                        price_usd: price,
                        value_usd: value,
                        market_cap_usd: mcap
                    };
                });

                // Sort by value (descending)
                enrichedAssets.sort((a, b) => (b.value_usd || 0) - (a.value_usd || 0));

                setPortfolio({
                    ...basicData,
                    totalNetWorth: totalValue,
                    assets: enrichedAssets
                });

                localStorage.setItem('rookie_wallet_address', addr);
            } else {
                setError('Could not fetch wallet data. Check address or API availability.');
            }
        } catch (e) {
            console.error(e);
            setError('An error occurred while fetching wallet data.');
        } finally {
            setLoading(false);
        }
    };

    const isValidEthereumAddress = (addr: string) => {
        return /^0x[a-fA-F0-9]{40}$/.test(addr);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValidEthereumAddress(address)) {
            handleFetch(address);
        } else {
            setError('Invalid format. Please enter a valid Ethereum address (0x...).');
        }
    };

    const handleBuy = (symbol: string) => {
        // Placeholder for future integration (e.g. Uniswap widget or routing)
        alert(`Buying ${symbol} is coming soon! Integration with DEX pending.`);
    };

    const handleSell = (symbol: string) => {
        // Placeholder for future integration
        alert(`Selling ${symbol} is coming soon! Integration with DEX pending.`);
    };

    // Helper for currency formatting
    const formatCurrency = (val: number | undefined) => {
        if (val === undefined) return '$0.00';
        return val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    // Helper for large number formatting
    const formatLargeNumber = (num: number | undefined) => {
        if (!num) return 'N/A';
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        return `$${num.toLocaleString()}`;
    };

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Minimal Dark Header */}
            <div className="bg-black dark:bg-[#050505] rounded-3xl p-8 text-white border border-gray-800 dark:border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="bg-white text-black p-2 rounded-xl">
                            <Wallet size={20} />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
                    </div>

                    {!portfolio ? (
                        <div className="max-w-md">
                            <p className="text-gray-400 mb-6 font-mono text-xs">CONNECT ETHEREUM WALLET</p>
                            <form onSubmit={onSubmit} className="flex space-x-2">
                                <div className="relative flex-1">
                                    <input 
                                        type="text" 
                                        placeholder="0x..." 
                                        value={address}
                                        onChange={(e) => {
                                            setAddress(e.target.value);
                                            if (error) setError('');
                                        }}
                                        className="w-full bg-white/10 border border-white/10 rounded-xl py-3 pl-4 pr-4 text-white placeholder-gray-500 focus:outline-none focus:bg-white/20 transition-all font-mono text-sm"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center disabled:opacity-50"
                                >
                                    {loading ? <RefreshCw className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                                </button>
                            </form>
                            {error && (
                                <div className="flex items-center space-x-2 mt-4 text-red-400 bg-red-900/20 p-2 rounded-lg text-xs font-mono border border-red-500/20">
                                    <AlertCircle size={14} />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row justify-between items-end">
                            <div className="flex-1">
                                <p className="text-gray-400 text-xs font-mono mb-2 flex items-center space-x-2">
                                    <span>{address.substring(0, 6)}...{address.substring(address.length - 4)}</span>
                                    <button 
                                        onClick={() => { setPortfolio(null); localStorage.removeItem('rookie_wallet_address'); setAddress(''); }}
                                        className="text-[10px] uppercase bg-white/10 px-2 py-0.5 rounded hover:bg-white/20 transition-colors"
                                    >
                                        Disconnect
                                    </button>
                                </p>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total Net Worth</span>
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-5xl font-bold tracking-tighter">
                                            {formatCurrency(portfolio.totalNetWorth)}
                                        </h2>
                                        <button 
                                            onClick={() => handleFetch(address)}
                                            className="bg-white/10 hover:bg-white/20 border border-white/10 p-2 rounded-full transition-colors"
                                            title="Refresh Portfolio"
                                        >
                                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Assets List - Minimal */}
            {portfolio && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white px-2">Holdings</h3>
                    <div className="bg-white dark:bg-[#050505] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 md:gap-4 p-4 border-b border-gray-100 dark:border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <div className="col-span-4 md:col-span-3">Asset</div>
                            <div className="col-span-3 md:col-span-2 lg:col-span-1 text-right">Balance</div>
                            <div className="hidden md:block col-span-2 text-right">Price</div>
                            <div className="hidden lg:block col-span-2 text-right">Market Cap</div>
                            <div className="hidden sm:block col-span-2 text-right">Value</div>
                            <div className="col-span-5 sm:col-span-3 md:col-span-3 lg:col-span-2 text-right">Actions</div>
                        </div>
                        
                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                            {portfolio.assets.map((asset, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-2 md:gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                    {/* Asset Name & Icon */}
                                    <div className="col-span-4 md:col-span-3 flex items-center space-x-3">
                                        {asset.logo ? (
                                            <img src={asset.logo} alt={asset.symbol} className="w-8 h-8 rounded-full bg-white/10" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center text-xs font-bold text-white dark:text-black">
                                                {asset.symbol ? asset.symbol.charAt(0) : '?'}
                                            </div>
                                        )}
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-gray-900 dark:text-white truncate">{asset.name || 'Unknown Token'}</span>
                                            <span className="text-xs text-gray-500 font-mono">{asset.symbol}</span>
                                        </div>
                                    </div>

                                    {/* Balance */}
                                    <div className="col-span-3 md:col-span-2 lg:col-span-1 text-right">
                                        <span className="font-mono text-sm text-gray-900 dark:text-white font-medium block">
                                            {parseFloat(asset.balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="hidden md:block col-span-2 text-right">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                            {asset.price_usd && asset.price_usd > 0 ? formatCurrency(asset.price_usd) : '-'}
                                        </span>
                                    </div>

                                    {/* Market Cap */}
                                    <div className="hidden lg:block col-span-2 text-right">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                            {formatLargeNumber(asset.market_cap_usd)}
                                        </span>
                                    </div>

                                    {/* Value */}
                                    <div className="hidden sm:block col-span-2 text-right">
                                         <span className="font-bold text-gray-900 dark:text-white font-mono">
                                            {formatCurrency(asset.value_usd)}
                                         </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-5 sm:col-span-3 md:col-span-3 lg:col-span-2 flex justify-end space-x-2">
                                        <button 
                                            onClick={() => handleBuy(asset.symbol)}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-xs font-bold transition-colors flex items-center"
                                        >
                                            Buy
                                        </button>
                                        <button 
                                            onClick={() => handleSell(asset.symbol)}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-xs font-bold transition-colors flex items-center"
                                        >
                                            Sell
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
