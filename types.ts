
export enum AssetType {
    CRYPTO = 'CRYPTO',
    STOCK = 'STOCK'
}

export interface MarketData {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap?: number;
    volume?: number;
    image?: string; // URL for logo
    sparkline?: number[]; // Simple array of price history for mini charts
    type: AssetType;
}

export interface User {
    email: string;
    name: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
}

export enum ViewState {
    DASHBOARD = 'DASHBOARD',
    WATCHLIST = 'WATCHLIST',
    WALLET = 'WALLET',
    NEWS = 'NEWS',
    CRYPTO = 'CRYPTO',
    NASDAQ = 'NASDAQ',
    NYSE = 'NYSE',
    BIST = 'BIST',
    PENNY_STOCKS = 'PENNY_STOCKS',
    SETTINGS = 'SETTINGS'
}

export interface WalletAsset {
    token_address: string;
    name: string;
    symbol: string;
    logo?: string;
    thumbnail?: string;
    decimals: number;
    balance: string;
    possible_spam?: boolean;
    price_usd?: number;
    value_usd?: number;
    market_cap_usd?: number;
}

export interface WalletPortfolio {
    nativeBalance: string; // In Wei
    nativeBalanceFormatted: number; // In ETH
    totalNetWorth: number;
    assets: WalletAsset[];
}

export interface NewsArticle {
    title: string;
    image: string;
    site: string;
    text: string;
    url: string;
    publishedDate: string;
    symbol: string;
}
