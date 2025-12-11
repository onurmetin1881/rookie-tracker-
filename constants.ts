
// In a production app, these should be in environment variables or a proxy server.
// Using provided keys for the prototype.

export const COINGECKO_API_KEY = "CG-XY6gUEp1jHyZ9aKWiQFi4DS8";
export const FMP_API_KEY = "sPj9Ep9D1cAYgJJL6dXjxyt8vDuPxcno";
export const MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjI4NjMzN2E5LWE2NWUtNGE3Yi04NmExLTRlNDJmZjVhZGNhOSIsIm9yZ0lkIjoiNDg1MDA3IiwidXNlcklkIjoiNDk4OTg1IiwidHlwZUlkIjoiMDczODUyYTEtZThmMi00ZGZjLTg3YjMtMGFhMDhmNDFiZjA1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NjUxMTU1NzcsImV4cCI6NDkyMDg3NTU3N30.irvn9EnSrC-IPi97ZVWj6ZQNRxRoCsAUIYLCKY1mdLE";

export const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
export const FMP_BASE_URL = "https://financialmodelingprep.com/api/v3";
export const MORALIS_BASE_URL = "https://deep-index.moralis.io/api/v2.2";
export const YAPIKREDI_BASE_URL = "https://api.yapikredi.com.tr/api/stockmarket/v1";

// Extended list of assets to track
export const DEFAULT_CRYPTO_IDS = "bitcoin,ethereum,binancecoin,solana,ripple,staked-ether,cardano,dogecoin,avalanche-2,tron,chainlink,polkadot,matic-network,shiba-inu,near,uniswap,litecoin,bitcoin-cash,internet-computer,pepe,aptos,render-token,fetch-ai,arbitrum,cosmos,stellar,monero,ethereum-classic,filecoin,hedera-hashgraph,vechain,maker,quant,the-graph,fantom,theta-token,sandbox,decentraland,axie-infinity,eos,aave,flow,tezos,algorand,chiliz,immutable-x,neo,kucoin-shares,gatetoken,sinthetix-network-token,klay-token,iota,bittorrent,arweave,mina-protocol";

// Exchange specific lists
export const NASDAQ_SYMBOLS = "AAPL,MSFT,NVDA,GOOGL,AMZN,META,TSLA,AVGO,PEP,COST,CSCO,TMUS,ADBE,NFLX,AMD,INTC,QCOM,SBUX,AMGN,ISRG,TXN,HON,BKNG,GILD,ADP,MDLZ,REGN,VRTX,LRCX,ADI";
export const NYSE_SYMBOLS = "JPM,V,WMT,PG,JNJ,MA,HD,BAC,XOM,CVX,KO,LLY,DIS,MCD,PFE,ABBV,MRK,ORCL,CRM,ACN,T,VZ,NKE,IBM,GE,GS,CAT,MMM,BA,C";
export const BIST_SYMBOLS = "THYAO.IS,GARAN.IS,AKBNK.IS,KCHOL.IS,SAHOL.IS,TUPRS.IS,ASELS.IS,BIMAS.IS,EREGL.IS,SISE.IS,YKBNK.IS,VAKBN.IS,PETKM.IS,TCELL.IS,FROTO.IS,EKGYO.IS,HALKB.IS,ARCLK.IS,TOASO.IS,TTKOM.IS,ISCTR.IS,SASA.IS,HEKTS.IS,KOZAL.IS,MGROS.IS";

// Deprecated generic lists (kept for backward compatibility if needed, but we will use specific ones)
export const DEFAULT_US_STOCKS = NASDAQ_SYMBOLS; // Fallback
export const DEFAULT_TR_STOCKS = BIST_SYMBOLS; // Fallback

// Common penny stocks or volatile stocks (FMP symbols)
export const PENNY_STOCKS = "SNDL,ZOM,CTXR,NAKD,GSAT,DNN,ASRT,IDEX,FCEL,OCGN";
