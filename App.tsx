
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { MarketTable } from './components/MarketTable';
import { AssetDetail } from './components/AssetDetail';
import { Settings } from './components/Settings';
import { Tutorial } from './components/Tutorial';
import { WalletView } from './components/WalletView';
import { NewsView } from './components/NewsView';
import { AuthState, User, ViewState, MarketData } from './types';
import { fetchCryptoData, fetchStockData, fetchTrendingCoins, fetchBistData } from './services/marketService';
import { 
    NASDAQ_SYMBOLS,
    NYSE_SYMBOLS,
    PENNY_STOCKS 
} from './constants';

const App: React.FC = () => {
    // Auth State
    const [auth, setAuth] = useState<AuthState>(() => {
        const saved = localStorage.getItem('rookie_user');
        return saved ? { isAuthenticated: true, user: JSON.parse(saved) } : { isAuthenticated: false, user: null };
    });

    // Theme State
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        const saved = localStorage.getItem('rookie_theme');
        if (saved) return saved as 'dark' | 'light';
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        return 'dark'; // Default
    });

    // Apply Theme
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('rookie_theme', theme);
    }, [theme]);

    // Settings State
    const [refreshInterval, setRefreshInterval] = useState<number>(() => {
        const saved = localStorage.getItem('rookie_refresh_interval');
        return saved ? parseInt(saved, 10) : 60000;
    });

    // Watchlist State (List of IDs)
    const [watchlist, setWatchlist] = useState<string[]>(() => {
        const saved = localStorage.getItem('rookie_watchlist');
        return saved ? JSON.parse(saved) : [];
    });

    // Tutorial State
    const [showTutorial, setShowTutorial] = useState(false);

    // Data State
    const [cryptoData, setCryptoData] = useState<MarketData[]>([]);
    const [nasdaqData, setNasdaqData] = useState<MarketData[]>([]);
    const [nyseData, setNyseData] = useState<MarketData[]>([]);
    const [bistData, setBistData] = useState<MarketData[]>([]);
    const [pennyStockData, setPennyStockData] = useState<MarketData[]>([]);
    const [trendingData, setTrendingData] = useState<MarketData[]>([]);
    const [loading, setLoading] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MarketData[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // View State
    const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
    const [selectedAsset, setSelectedAsset] = useState<MarketData | null>(null);

    // Persist Watchlist
    useEffect(() => {
        localStorage.setItem('rookie_watchlist', JSON.stringify(watchlist));
    }, [watchlist]);

    // Check Tutorial Status
    useEffect(() => {
        if (auth.isAuthenticated) {
            const tutorialCompleted = localStorage.getItem('rookie_tutorial_completed');
            if (!tutorialCompleted) {
                setShowTutorial(true);
            }
        }
    }, [auth.isAuthenticated]);

    // Fetch Data
    useEffect(() => {
        if (!auth.isAuthenticated) return;

        const loadData = async () => {
            // Only show loader on initial load if data is empty, to prevent flickering on refresh
            if (cryptoData.length === 0) setLoading(true);
            
            try {
                // Fetch in parallel
                const [crypto, nasdaq, nyse, bist, penny, trending] = await Promise.all([
                    fetchCryptoData(), 
                    fetchStockData(NASDAQ_SYMBOLS),
                    fetchStockData(NYSE_SYMBOLS),
                    fetchBistData(), // Uses Yapi Kredi with FMP fallback
                    fetchStockData(PENNY_STOCKS),
                    fetchTrendingCoins()
                ]);

                setCryptoData(crypto);
                setNasdaqData(nasdaq);
                setNyseData(nyse);
                setBistData(bist);
                setPennyStockData(penny);
                setTrendingData(trending);
            } catch (error) {
                console.error("Failed to load market data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
        
        // Dynamic interval
        if (refreshInterval > 0) {
            const interval = setInterval(loadData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [auth.isAuthenticated, refreshInterval]);

    // Search Logic with Debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            const lowerQuery = searchQuery.toLowerCase();

            // 1. Filter locally loaded data
            const localResults = [
                ...cryptoData, 
                ...nasdaqData,
                ...nyseData,
                ...bistData, 
                ...pennyStockData
            ].filter(asset => 
                asset.symbol.toLowerCase().includes(lowerQuery) || 
                asset.name.toLowerCase().includes(lowerQuery)
            );

            // 2. If valid ticker length and not found locally, try fetching from API
            if (searchQuery.length >= 2 && searchQuery.length <= 6 && !searchQuery.includes(' ')) {
                const exactMatch = localResults.find(a => a.symbol.toLowerCase() === lowerQuery);
                
                if (!exactMatch) {
                    try {
                        const newStockData = await fetchStockData(searchQuery.toUpperCase());
                        if (newStockData && newStockData.length > 0) {
                            const isDuplicate = localResults.some(r => r.symbol === newStockData[0].symbol);
                            if (!isDuplicate) {
                                localResults.push(...newStockData);
                            }
                        }
                    } catch (e) {
                        console.log("Search fetch failed", e);
                    }
                }
            }

            setSearchResults(localResults);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, cryptoData, nasdaqData, nyseData, bistData, pennyStockData]);

    // Handlers
    const handleLogin = (user: User) => {
        localStorage.setItem('rookie_user', JSON.stringify(user));
        setAuth({ isAuthenticated: true, user });
    };

    const handleLogout = () => {
        localStorage.removeItem('rookie_user');
        setAuth({ isAuthenticated: false, user: null });
    };

    const handleIntervalChange = (interval: number) => {
        setRefreshInterval(interval);
        localStorage.setItem('rookie_refresh_interval', interval.toString());
    };

    const handleToggleWatchlist = (assetId: string) => {
        setWatchlist(prev => {
            if (prev.includes(assetId)) {
                return prev.filter(id => id !== assetId);
            } else {
                return [...prev, assetId];
            }
        });
    };

    const handleTutorialComplete = () => {
        localStorage.setItem('rookie_tutorial_completed', 'true');
        setShowTutorial(false);
    };

    // Get all assets combined for lookup (include search results to ensure added search items appear)
    const getAllAssets = () => {
        // Use a Map to deduplicate by ID
        const assetMap = new Map<string, MarketData>();
        
        [...cryptoData, ...nasdaqData, ...nyseData, ...bistData, ...pennyStockData, ...searchResults, ...trendingData].forEach(asset => {
            if (!assetMap.has(asset.id)) {
                assetMap.set(asset.id, asset);
            }
        });
        
        return Array.from(assetMap.values());
    };

    const renderContent = () => {
        // Search View Overlay
        if (searchQuery) {
            return (
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <MarketTable 
                        title={`Search Results for "${searchQuery}"`} 
                        assets={searchResults} 
                        onSelectAsset={setSelectedAsset} 
                    />
                    {searchResults.length === 0 && !loading && (
                        <div className="text-center text-gray-500 mt-12">
                            No assets found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            );
        }

        if (loading && cryptoData.length === 0) {
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-apple-blue border-t-transparent rounded-full animate-spin"></div>
                </div>
            );
        }

        switch (currentView) {
            case ViewState.DASHBOARD:
                return (
                    <Dashboard 
                        cryptoData={cryptoData} 
                        usStockData={nasdaqData} // Default dashboard to Nasdaq for US overview
                        trStockData={bistData} 
                        trendingData={trendingData}
                        onSelectAsset={setSelectedAsset} 
                    />
                );
            case ViewState.WATCHLIST:
                // Filter all known assets by watchlist IDs
                const watchlistAssets = getAllAssets().filter(asset => watchlist.includes(asset.id));
                return (
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        {watchlistAssets.length > 0 ? (
                            <MarketTable 
                                title="My Watchlist" 
                                assets={watchlistAssets} 
                                onSelectAsset={setSelectedAsset} 
                            />
                        ) : (
                            <div className="text-center py-20">
                                <div className="bg-white/5 dark:bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">⭐</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your watchlist is empty</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Star your favorite stocks and crypto assets to track them here.
                                </p>
                            </div>
                        )}
                    </div>
                );
            case ViewState.WALLET:
                return <WalletView />;
            case ViewState.NEWS:
                return <NewsView />;
            case ViewState.CRYPTO:
                return (
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <MarketTable title="Cryptocurrency Market" assets={cryptoData} onSelectAsset={setSelectedAsset} />
                    </div>
                );
            case ViewState.NASDAQ:
                return (
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <MarketTable title="NASDAQ (Technology & Growth)" assets={nasdaqData} onSelectAsset={setSelectedAsset} />
                    </div>
                );
            case ViewState.NYSE:
                return (
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <MarketTable title="New York Stock Exchange" assets={nyseData} onSelectAsset={setSelectedAsset} />
                    </div>
                );
            case ViewState.BIST:
                return (
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                         <MarketTable title="Borsa Istanbul (Turkey)" assets={bistData} onSelectAsset={setSelectedAsset} />
                    </div>
                );
            case ViewState.PENNY_STOCKS:
                return (
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-4 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 p-4 rounded-xl text-sm">
                            ⚠️ Warning: Penny stocks are highly volatile. Invest with caution.
                        </div>
                        <MarketTable title="High Volatility / Penny Stocks" assets={pennyStockData} onSelectAsset={setSelectedAsset} />
                    </div>
                );
            case ViewState.SETTINGS:
                return (
                    <Settings 
                        refreshInterval={refreshInterval} 
                        onIntervalChange={handleIntervalChange} 
                        theme={theme}
                        onThemeChange={setTheme}
                    />
                );
            default:
                return <div className="p-8 text-center text-gray-500">Coming Soon</div>;
        }
    };

    if (!auth.isAuthenticated) {
        return <Auth onLogin={handleLogin} />;
    }

    return (
        <Layout 
            currentView={currentView} 
            onChangeView={(view) => {
                setCurrentView(view);
                setSearchQuery(''); // Clear search on view change
            }}
            onLogout={handleLogout}
            onSearch={setSearchQuery}
            userName={auth.user?.name || 'User'}
        >
            {renderContent()}
            {selectedAsset && (
                <AssetDetail 
                    asset={selectedAsset} 
                    onClose={() => setSelectedAsset(null)} 
                    isWatched={watchlist.includes(selectedAsset.id)}
                    onToggleWatchlist={handleToggleWatchlist}
                />
            )}
            {showTutorial && (
                <Tutorial 
                    onComplete={handleTutorialComplete} 
                    onSkip={handleTutorialComplete} 
                />
            )}
        </Layout>
    );
};

export default App;
