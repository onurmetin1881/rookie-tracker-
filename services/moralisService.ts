
import { MORALIS_API_KEY, MORALIS_BASE_URL } from '../constants';
import { WalletPortfolio, WalletAsset } from '../types';

const CHAIN = '0x1'; // Ethereum Mainnet

export const fetchWalletData = async (address: string): Promise<WalletPortfolio | null> => {
    if (!address || !address.startsWith('0x')) return null;

    try {
        const headers = {
            'accept': 'application/json',
            'X-API-Key': MORALIS_API_KEY
        };

        // 1. Get Native Balance
        const balanceRes = await fetch(`${MORALIS_BASE_URL}/${address}/balance?chain=${CHAIN}`, { headers });
        const balanceData = await balanceRes.json();
        const nativeBalanceWei = balanceData.balance || '0';
        const nativeBalanceEth = parseFloat(nativeBalanceWei) / 1e18;

        // 2. Get ERC20 Token Balances
        const tokensRes = await fetch(`${MORALIS_BASE_URL}/${address}/erc20?chain=${CHAIN}&exclude_spam=true`, { headers });
        const tokensData = await tokensRes.json();

        // 3. Process Tokens & Calculate Value (Simplification: Use basic price estimation if available or fetch prices)
        // Note: Moralis /erc20 endpoint often returns basic metadata. For real value, we might need /erc20/price for each or rely on a portfolio endpoint if available on the plan.
        // For this prototype, we will try to use the /wallets/{address}/tokens endpoint which provides prices if available on the plan, 
        // otherwise we fall back to manual calculation or just display balances.
        
        // Let's attempt the detailed portfolio endpoint if possible, otherwise standard ERC20
        // Using standard ERC20 response mapping for now.
        
        const assets: WalletAsset[] = (tokensData || []).map((token: any) => ({
            token_address: token.token_address,
            name: token.name,
            symbol: token.symbol,
            logo: token.logo,
            thumbnail: token.thumbnail,
            decimals: token.decimals,
            balance: (parseFloat(token.balance) / Math.pow(10, token.decimals)).toFixed(4),
            possible_spam: token.possible_spam,
            // Mocking price/value for prototype as generic ERC20 endpoint doesn't always include USD price without paid addons
            // In a real paid tier, we would use `response.usd_price` if available
            price_usd: 0, 
            value_usd: 0
        }));

        // Add Native ETH as an asset
        const ethAsset: WalletAsset = {
            token_address: '0x0000000000000000000000000000000000000000',
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
            balance: nativeBalanceEth.toFixed(4),
            logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
            price_usd: 0, // Would need to fetch current ETH price
            value_usd: 0
        };

        return {
            nativeBalance: nativeBalanceWei,
            nativeBalanceFormatted: nativeBalanceEth,
            totalNetWorth: 0, // Calculated in UI if we have prices
            assets: [ethAsset, ...assets]
        };

    } catch (error) {
        console.error("Moralis API Error:", error);
        return null;
    }
};
