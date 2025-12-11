
import { AssetType, MarketData, NewsArticle } from '../types';
import { COINGECKO_API_KEY, COINGECKO_BASE_URL, FMP_API_KEY, FMP_BASE_URL, YAPIKREDI_BASE_URL, BIST_SYMBOLS } from '../constants';

export const fetchCryptoData = async (ids?: string): Promise<MarketData[]> => {
    try {
        const params = new URLSearchParams({
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: '250',
            page: '1',
            sparkline: 'true',
            price_change_percentage: '24h',
            x_cg_demo_api_key: COINGECKO_API_KEY
        });

        // Only append ids if provided and not empty. 
        // If omitted, CoinGecko returns the top coins by market cap (default behavior).
        if (ids && ids.trim().length > 0) {
            params.append('ids', ids);
        }

        const response = await fetch(`${COINGECKO_BASE_URL}/coins/markets?${params.toString()}`);
        
        if (!response.ok) throw new Error('Failed to fetch crypto data');
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            console.warn("Crypto API returned unexpected format:", data);
            return [];
        }

        return data.map((coin: any) => ({
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            current_price: typeof coin.current_price === 'number' ? coin.current_price : 0,
            price_change_percentage_24h: typeof coin.price_change_percentage_24h === 'number' ? coin.price_change_percentage_24h : 0,
            market_cap: coin.market_cap || 0,
            volume: coin.total_volume || 0,
            image: coin.image,
            sparkline: coin.sparkline_in_7d?.price || [],
            type: AssetType.CRYPTO
        }));
    } catch (error) {
        console.error("Crypto API Error:", error);
        return [];
    }
};

export const fetchTrendingCoins = async (): Promise<MarketData[]> => {
    try {
        const response = await fetch(`${COINGECKO_BASE_URL}/search/trending?x_cg_demo_api_key=${COINGECKO_API_KEY}`);
        
        if (!response.ok) return [];
        
        const data = await response.json();
        
        if (!data.coins || !Array.isArray(data.coins)) return [];

        return data.coins.map((coin: any) => {
            const item = coin.item;
            // Handle potentially string formatted prices (e.g. "$0.043")
            let price = 0;
            if (typeof item.data.price === 'number') {
                price = item.data.price;
            } else if (typeof item.data.price === 'string') {
                price = parseFloat(item.data.price.replace(/[^0-9.-]/g, ''));
            }

            let change = 0;
            if (item.data.price_change_percentage_24h && item.data.price_change_percentage_24h.usd) {
                change = item.data.price_change_percentage_24h.usd;
            }

            // Market Cap parsing
            let mcap = 0;
            if (typeof item.data.market_cap === 'string') {
                mcap = parseFloat(item.data.market_cap.replace(/[^0-9.-]/g, ''));
            }

            return {
                id: item.id,
                symbol: item.symbol,
                name: item.name,
                current_price: price || 0,
                price_change_percentage_24h: change || 0,
                market_cap: mcap || 0,
                volume: 0, // Trending endpoint doesn't always have volume cleanly
                image: item.large || item.thumb,
                sparkline: [], 
                type: AssetType.CRYPTO
            };
        });
    } catch (error) {
        console.error("Trending API Error:", error);
        return [];
    }
};

export const fetchStockData = async (symbols: string, isTurkish: boolean = false): Promise<MarketData[]> => {
    try {
        const response = await fetch(`${FMP_BASE_URL}/quote/${symbols}?apikey=${FMP_API_KEY}`);
        
        if (!response.ok) throw new Error(`Failed to fetch stock data: ${response.statusText}`);
        
        const data = await response.json();
        
        // FMP API validation
        if (!Array.isArray(data)) {
             // Handle error messages from API (e.g., "Invalid API KEY")
             if (data && typeof data === 'object' && 'Error Message' in data) {
                 console.error("FMP API Error Message:", data['Error Message']);
             } else {
                 console.error("FMP API returned non-array data:", data);
             }
             return [];
        }
        
        return data.map((stock: any) => ({
            id: stock.symbol,
            symbol: stock.symbol,
            name: stock.name || stock.symbol,
            // Ensure numbers are actually numbers, default to 0 if null
            current_price: typeof stock.price === 'number' ? stock.price : 0,
            price_change_percentage_24h: typeof stock.changesPercentage === 'number' ? stock.changesPercentage : 0,
            market_cap: stock.marketCap || 0,
            volume: stock.volume || 0,
            image: `https://financialmodelingprep.com/image-stock/${stock.symbol}.png`,
            sparkline: [], // FMP Quote doesn't give history in one call, would need separate calls
            type: AssetType.STOCK
        }));
    } catch (error) {
        console.error("Stock API Error:", error);
        return [];
    }
};

// Specialized fetch for BIST data using Yapi Kredi API with fallback
export const fetchBistData = async (): Promise<MarketData[]> => {
    try {
        // Attempt to fetch from Yapi Kredi
        // Note: Without exact endpoint documentation or a public key, this is a best-effort implementation.
        // We are assuming a standard REST structure like /stock/list or similar.
        const response = await fetch(`${YAPIKREDI_BASE_URL}/stocks/list`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                // 'Authorization': 'Bearer ...' // Typically required for bank APIs
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Assuming response structure maps roughly to standard market data
            // { data: [ { symbol: 'THYAO', lastPrice: 250.5, change: 2.5 ... } ] }
            const stocks = data.data || data; 
            
            if (Array.isArray(stocks)) {
                 return stocks.map((item: any) => ({
                    id: item.symbol || item.code,
                    symbol: item.symbol || item.code,
                    name: item.name || item.description || item.symbol,
                    current_price: item.lastPrice || item.price || 0,
                    price_change_percentage_24h: item.changePercent || item.dailyChange || 0,
                    market_cap: item.marketCap || 0,
                    volume: item.volume || 0,
                    image: '', // Yapi Kredi unlikely to provide logos directly
                    sparkline: [],
                    type: AssetType.STOCK
                }));
            }
        }
        
        // If response not ok or format unknown, throw to trigger fallback
        throw new Error("Yapi Kredi API unreachable or format unknown");

    } catch (error) {
        console.warn("Yapi Kredi API failed, falling back to FMP:", error);
        // Fallback to FMP
        return fetchStockData(BIST_SYMBOLS, true);
    }
};

// Helper to get historical data for charts (FMP)
export const fetchStockHistory = async (symbol: string): Promise<any[]> => {
    try {
         const response = await fetch(`${FMP_BASE_URL}/historical-chart/1hour/${symbol}?apikey=${FMP_API_KEY}`);
         if (!response.ok) return [];
         const data = await response.json();
         return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
}

// Fetch current ETH price and market cap for wallet calculation
export const fetchEthereumPrice = async (): Promise<{price: number, marketCap: number}> => {
    try {
        const response = await fetch(`${COINGECKO_BASE_URL}/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true&x_cg_demo_api_key=${COINGECKO_API_KEY}`);
        if (!response.ok) return { price: 0, marketCap: 0 };
        const data = await response.json();
        return {
            price: data.ethereum?.usd || 0,
            marketCap: data.ethereum?.usd_market_cap || 0
        };
    } catch (error) {
        console.error("Error fetching ETH price:", error);
        return { price: 0, marketCap: 0 };
    }
};

// Fetch prices and market caps for a list of token contract addresses on Ethereum
export const fetchTokenPrices = async (contractAddresses: string[]): Promise<Record<string, {price: number, marketCap: number}>> => {
    if (contractAddresses.length === 0) return {};
    
    try {
        const addressesString = contractAddresses.join(',');
        const response = await fetch(`${COINGECKO_BASE_URL}/simple/token_price/ethereum?contract_addresses=${addressesString}&vs_currencies=usd&include_market_cap=true&x_cg_demo_api_key=${COINGECKO_API_KEY}`);
        
        if (!response.ok) return {};
        
        const data = await response.json();
        // CoinGecko returns data keyed by lowercase address: { "0x123...": { "usd": 12.34, "usd_market_cap": 500000 } }
        
        const results: Record<string, {price: number, marketCap: number}> = {};
        
        Object.keys(data).forEach(addr => {
            if (data[addr]) {
                results[addr.toLowerCase()] = {
                    price: data[addr].usd || 0,
                    marketCap: data[addr].usd_market_cap || 0
                };
            }
        });

        return results;
    } catch (error) {
        console.error("Error fetching token prices:", error);
        return {};
    }
};

export const fetchMarketNews = async (): Promise<NewsArticle[]> => {
    try {
        // Fetch General Stock Market News
        const response = await fetch(`${FMP_BASE_URL}/stock_news?limit=20&apikey=${FMP_API_KEY}`);
        if (!response.ok) return [];
        const data = await response.json();
        
        if(!Array.isArray(data)) return [];

        return data.map((item: any) => ({
            title: item.title,
            image: item.image,
            site: item.site,
            text: item.text,
            url: item.url,
            publishedDate: item.publishedDate,
            symbol: item.symbol
        }));
    } catch (error) {
        console.error("News API Error:", error);
        return [];
    }
};

export const fetchCryptoNews = async (): Promise<NewsArticle[]> => {
    try {
        const response = await fetch(`${COINGECKO_BASE_URL}/news?x_cg_demo_api_key=${COINGECKO_API_KEY}`);
        
        if (!response.ok) return [];
        const data = await response.json();
        
        // CoinGecko news response wraps array in 'data' usually
        const articles = data.data || [];

        if (!Array.isArray(articles)) return [];

        return articles.map((item: any) => ({
            title: item.title,
            image: item.thumb_2x || 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', // Fallback image
            site: item.news_site_long || 'Crypto News',
            text: item.description || '',
            url: item.url,
            publishedDate: item.updated_at ? new Date(item.updated_at * 1000).toISOString() : new Date().toISOString(),
            symbol: 'CRYPTO'
        }));
    } catch (error) {
        console.error("Crypto News API Error:", error);
        return [];
    }
};
