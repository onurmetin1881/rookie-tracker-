
import React from 'react';
import { ViewState } from '../types';
import { 
    LayoutDashboard, 
    Bitcoin, 
    TrendingUp, 
    Globe, 
    DollarSign, 
    Settings, 
    LogOut,
    Activity,
    Search,
    Star,
    Wallet,
    Newspaper,
    BarChart3,
    Building2,
    Menu
} from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    currentView: ViewState;
    onChangeView: (view: ViewState) => void;
    onLogout: () => void;
    onSearch: (query: string) => void;
    userName: string;
}

const viewTitles: Record<ViewState, string> = {
    [ViewState.DASHBOARD]: 'Dashboard',
    [ViewState.WATCHLIST]: 'My Watchlist',
    [ViewState.WALLET]: 'My Wallet',
    [ViewState.NEWS]: 'Market News',
    [ViewState.CRYPTO]: 'Crypto Assets',
    [ViewState.NASDAQ]: 'NASDAQ (Tech)',
    [ViewState.NYSE]: 'NYSE (Blue Chips)',
    [ViewState.BIST]: 'Borsa Istanbul',
    [ViewState.PENNY_STOCKS]: 'Penny Stocks',
    [ViewState.SETTINGS]: 'Settings'
};

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, onLogout, onSearch, userName }) => {
    const NavItem = ({ view, icon: Icon, label, dataTour }: { view: ViewState; icon: any; label: string, dataTour?: string }) => {
        const isActive = currentView === view;
        return (
            <button
                onClick={() => onChangeView(view)}
                data-tour={dataTour}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-md' 
                        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
            >
                <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                <span className={`font-medium text-sm ${isActive ? 'font-bold' : ''}`}>{label}</span>
            </button>
        );
    };

    return (
        <div className="flex h-screen w-full bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white overflow-hidden font-sans transition-colors duration-300">
            {/* Sidebar (Minimal / Line Art Style) */}
            <div className="hidden md:flex flex-col w-64 bg-white/80 dark:bg-black border-r border-gray-200 dark:border-white/10 p-4 transition-colors duration-300">
                <div className="flex items-center space-x-3 px-4 py-6 mb-6">
                    <div className="w-10 h-10 flex items-center justify-center">
                        {/* Placeholder for user provided logo. Assumes logo.png is in root/public */}
                        <img 
                            src="logo.png" 
                            alt="Logo" 
                            className="w-full h-full object-contain dark:invert" 
                            onError={(e) => {
                                e.currentTarget.onerror = null; 
                                e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3309/3309991.png'; // Fallback Line Chart Icon
                            }}
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-mono">ROOKIE<span className="text-apple-blue">.</span></span>
                </div>

                <div className="space-y-1 flex-1 overflow-y-auto pr-2">
                    <div className="px-4 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-2 mt-2">Main</div>
                    <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="Dashboard" dataTour="nav-dashboard" />
                    <NavItem view={ViewState.WATCHLIST} icon={Star} label="Watchlist" dataTour="nav-watchlist" />
                    <NavItem view={ViewState.WALLET} icon={Wallet} label="Portfolio" dataTour="nav-wallet" />
                    <NavItem view={ViewState.NEWS} icon={Newspaper} label="News & Alerts" />

                    <div className="px-4 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-2 mt-6">Markets</div>
                    <NavItem view={ViewState.CRYPTO} icon={Bitcoin} label="Crypto" />
                    <NavItem view={ViewState.NASDAQ} icon={BarChart3} label="NASDAQ" />
                    <NavItem view={ViewState.NYSE} icon={Building2} label="NYSE" />
                    <NavItem view={ViewState.BIST} icon={Globe} label="BIST 100" />
                    <NavItem view={ViewState.PENNY_STOCKS} icon={DollarSign} label="Penny Stocks" />

                    <div className="px-4 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-2 mt-6">System</div>
                    <NavItem view={ViewState.SETTINGS} icon={Settings} label="Preferences" dataTour="nav-settings" />
                </div>

                <div className="mt-auto pt-6 border-t border-gray-200 dark:border-white/10">
                    <div className="px-4 py-3 flex items-center space-x-3 mb-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                        <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center text-xs font-bold text-white dark:text-black">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate text-gray-900 dark:text-white">{userName}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Pro Member</p>
                        </div>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-sm"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Nav - Updated to be darker/cleaner */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-black border-t border-gray-200 dark:border-white/10 flex justify-around items-center px-2 z-50 pb-safe transition-colors duration-300">
                <button 
                    onClick={() => onChangeView(ViewState.DASHBOARD)} 
                    data-tour="nav-dashboard"
                    className={`p-2 rounded-xl transition-all ${currentView === ViewState.DASHBOARD ? 'text-black dark:text-white' : 'text-gray-400'}`}
                >
                    <LayoutDashboard size={24} strokeWidth={currentView === ViewState.DASHBOARD ? 2.5 : 2} />
                </button>
                <button 
                    onClick={() => onChangeView(ViewState.WATCHLIST)} 
                    data-tour="nav-watchlist"
                    className={`p-2 rounded-xl transition-all ${currentView === ViewState.WATCHLIST ? 'text-black dark:text-white' : 'text-gray-400'}`}
                >
                    <Star size={24} strokeWidth={currentView === ViewState.WATCHLIST ? 2.5 : 2} />
                </button>
                 <button 
                    onClick={() => onChangeView(ViewState.CRYPTO)} 
                    className={`p-2 rounded-xl transition-all ${currentView === ViewState.CRYPTO ? 'text-black dark:text-white' : 'text-gray-400'}`}
                >
                    <Bitcoin size={24} strokeWidth={currentView === ViewState.CRYPTO ? 2.5 : 2} />
                </button>
                <button 
                    onClick={() => onChangeView(ViewState.NEWS)} 
                    className={`p-2 rounded-xl transition-all ${currentView === ViewState.NEWS ? 'text-black dark:text-white' : 'text-gray-400'}`}
                >
                    <Newspaper size={24} strokeWidth={currentView === ViewState.NEWS ? 2.5 : 2} />
                </button>
                <button 
                    onClick={() => onChangeView(ViewState.SETTINGS)} 
                    data-tour="nav-settings"
                    className={`p-2 rounded-xl transition-all ${currentView === ViewState.SETTINGS ? 'text-black dark:text-white' : 'text-gray-400'}`}
                >
                    <Settings size={24} strokeWidth={currentView === ViewState.SETTINGS ? 2.5 : 2} />
                </button>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-[#0a0a0a] relative transition-colors duration-300">
                {/* Header with Search */}
                <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
                    <div className="flex items-center">
                         {/* Mobile Logo Only */}
                        <div className="md:hidden mr-3">
                             <img 
                                src="logo.png" 
                                alt="Rookie" 
                                className="w-8 h-8 object-contain dark:invert" 
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight truncate">{viewTitles[currentView]}</h2>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="relative group" data-tour="search-bar">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-apple-blue transition-colors" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search symbol..." 
                                className="bg-gray-100 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-black focus:border-gray-300 dark:focus:border-gray-700 w-32 md:w-64 transition-all placeholder-gray-500 font-medium"
                                onChange={(e) => onSearch(e.target.value)}
                            />
                        </div>
                        {/* Mobile Wallet Icon */}
                        <button 
                            onClick={() => onChangeView(ViewState.WALLET)}
                            className={`md:hidden p-2 rounded-full transition-colors ${currentView === ViewState.WALLET ? 'text-black dark:text-white bg-gray-100 dark:bg-white/10' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                        >
                            <Wallet size={20} />
                        </button>
                    </div>
                </header>
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
};
