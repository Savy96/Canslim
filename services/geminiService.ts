import { GoogleGenAI } from "@google/genai";
import { StockAnalysis, AnalysisStatus, DiscoveryResult } from '../types';
import { CANSLIM_DEFINITIONS, INITIAL_ANALYSIS_STATE } from '../constants';

// Helper to sanitize JSON string from Markdown code blocks
const cleanJsonString = (text: string): string => {
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.substring(7);
  }
  if (clean.startsWith('```')) {
    clean = clean.substring(3);
  }
  if (clean.endsWith('```')) {
    clean = clean.substring(0, clean.length - 3);
  }
  return clean.trim();
};

export const discoverStocks = async (): Promise<DiscoveryResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a stock market expert specializing in William J. O'Neil's CANSLIM methodology (4th Edition).
    Identify 8 Indian stocks (NSE/BSE) that are currently exhibiting strong CANSLIM characteristics.
    
    Prioritize:
    1. **High Relative Strength (RS)**: Stocks outperforming the Nifty 50 and near 52-week highs.
    2. **Mid-cap and Small-cap Growth**: O'Neil emphasizes these often produce the biggest gains. Look for companies like Force Motors, Trent, Dixon, etc., if they fit the criteria.
    3. **Chart Patterns**: Stocks emerging from sound bases (Cup with Handle, Double Bottom, Flat Base, High Tight Flag).
    4. **Volume**: Look for volume spikes during breakouts.
    
    Use Google Search to verify recent price action, volume anomalies, and quarterly earnings acceleration.
    
    Return the result strictly as a JSON object with this structure:
    {
      "candidates": [
        { "symbol": "SYMBOL", "reason": "Brief reason: e.g., Breakout from cup with handle on 2x volume." },
        ...
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    return JSON.parse(cleanJsonString(text));
  } catch (error) {
    console.error("Discovery failed:", error);
    return { candidates: [] };
  }
};

export const discoverNearHighStocks = async (): Promise<DiscoveryResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a stock market expert specializing in Indian markets (NSE/BSE).
    Identify 8 Indian stocks that are currently trading within 25% of their 52-week highs.
    
    Criteria:
    1. **Proximity Rule**: Current Price must be >= 75% of the 52-Week High.
    2. **Momentum**: Prefer stocks in an uptrend or consolidating sideways (not crashing).
    3. **Data**: Use Google Search to get real-time price data.
    
    Return the result strictly as a JSON object with this structure:
    {
      "candidates": [
        { "symbol": "SYMBOL", "reason": "Trading at ₹2400, 52W High is ₹2500 (4% away). Strong momentum." },
        ...
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    return JSON.parse(cleanJsonString(text));
  } catch (error) {
    console.error("Near High Discovery failed:", error);
    return { candidates: [] };
  }
};

export const analyzeStock = async (symbol: string): Promise<StockAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Act as a strict CANSLIM analyst based on William J. O'Neil's "How to Make Money in Stocks" (4th Edition).
    Perform a detailed analysis for the Indian stock "${symbol}" (NSE/BSE).
    Use Google Search to find latest quarterly reports, annual financial statements, chart patterns, and market data.

    Evaluate the following 7 criteria rigorously:

    1. C (Current Earnings): Is the most recent quarterly EPS up >25% YoY? Is the growth rate accelerating (e.g., 10% -> 20% -> 35%)?
    2. A (Annual Earnings): Has annual earnings growth been positive in *each* of the last 3 years? Is ROE > 17%?
    3. N (New/Chart Pattern): Is there a new product/service/management/high? Is the stock breaking out of a specific base (Cup w/ Handle, Double Bottom, Flat Base, High Tight Flag) at a proper pivot point?
    4. S (Supply/Demand): Is volume drying up in consolidation and spiking (>40% above avg) on breakout? Is float relatively low?
    5. L (Leader): Is the RS (Relative Strength) Rating effectively >80? Is it trading near 52-week highs? Is it a leader in its industry group?
    6. I (Institutional): Is institutional sponsorship increasing in the last few quarters? Are top-quality funds buying?
    7. M (Market): Is the general market (Nifty 50/Sensex) in a "Confirmed Uptrend"?

    For each, determine PASS/FAIL/NEUTRAL and provide a concise technical/fundamental finding.
    
    Extract the last 5 quarters of EPS growth % (Year-over-Year) if available.

    Return the response strictly as a JSON object:
    {
      "symbol": "${symbol.toUpperCase()}",
      "companyName": "Full Company Name",
      "currentPrice": "Current price with currency",
      "canslimScore": number (0-100),
      "criteria": {
        "C": { "status": "PASS"|"FAIL"|"NEUTRAL", "finding": "..." },
        "A": { "status": "PASS"|"FAIL"|"NEUTRAL", "finding": "..." },
        "N": { "status": "PASS"|"FAIL"|"NEUTRAL", "finding": "..." },
        "S": { "status": "PASS"|"FAIL"|"NEUTRAL", "finding": "..." },
        "L": { "status": "PASS"|"FAIL"|"NEUTRAL", "finding": "..." },
        "I": { "status": "PASS"|"FAIL"|"NEUTRAL", "finding": "..." },
        "M": { "status": "PASS"|"FAIL"|"NEUTRAL", "finding": "..." }
      },
      "summary": "Brief buy/sell/watch recommendation based on the rules.",
      "epsTrend": [
        { "quarter": "Q3 24", "value": 25.5 },
        ...
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    const rawData = JSON.parse(cleanJsonString(text));

    // Extract grounding sources
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri || '#'
      }))
      .filter((s: any) => s.uri !== '#') || [];

    // Merge with static definitions
    const mergedResult: StockAnalysis = {
      ...INITIAL_ANALYSIS_STATE,
      symbol: rawData.symbol || symbol,
      companyName: rawData.companyName || symbol,
      currentPrice: rawData.currentPrice || 'N/A',
      canslimScore: rawData.canslimScore || 0,
      summary: rawData.summary || 'Analysis complete.',
      epsTrend: rawData.epsTrend || [],
      sources: sources,
      criteria: {
        C: { ...CANSLIM_DEFINITIONS.C, ...rawData.criteria?.C },
        A: { ...CANSLIM_DEFINITIONS.A, ...rawData.criteria?.A },
        N: { ...CANSLIM_DEFINITIONS.N, ...rawData.criteria?.N },
        S: { ...CANSLIM_DEFINITIONS.S, ...rawData.criteria?.S },
        L: { ...CANSLIM_DEFINITIONS.L, ...rawData.criteria?.L },
        I: { ...CANSLIM_DEFINITIONS.I, ...rawData.criteria?.I },
        M: { ...CANSLIM_DEFINITIONS.M, ...rawData.criteria?.M },
      }
    };

    return mergedResult;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};