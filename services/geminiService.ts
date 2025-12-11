import { GoogleGenAI } from "@google/genai";
import { MarketData } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || ''; 

// Initialize GenAI
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const analyzeAsset = async (asset: MarketData): Promise<string> => {
    if (!GEMINI_API_KEY) return "AI Analysis Unavailable: API Key missing.";

    try {
        const prompt = `
        You are a senior financial analyst. Provide a concise, professional investment summary for the following asset.
        Focus on price action, volatility, and general market sentiment. Keep it under 100 words.
        
        Asset: ${asset.name} (${asset.symbol})
        Price: $${asset.current_price}
        24h Change: ${asset.price_change_percentage_24h}%
        Type: ${asset.type}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "Analysis could not be generated.";
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return "AI Analysis temporarily unavailable.";
    }
};

export const getMarketOutlook = async (): Promise<string> => {
    if (!GEMINI_API_KEY) return "Market Outlook Unavailable.";

    try {
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Give me a very brief, bulleted global financial market outlook for today (Crypto, US Tech Stocks, Emerging Markets). Maximum 3 bullets.",
        });
        return response.text || "No outlook available.";
    } catch (error) {
        return "Market outlook unavailable.";
    }
}
