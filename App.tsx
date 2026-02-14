import React, { useState, useEffect } from 'react';
import { analyzeStock, discoverStocks, discoverNearHighStocks } from './services/geminiService';
import { StockAnalysis, DiscoveryResult } from './types';
import { AnalysisResult } from './components/AnalysisResult';
import { INITIAL_ANALYSIS_STATE } from './constants';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [discovery, setDiscovery] = useState<DiscoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Track which discovery button is loading: 'candidates', 'highs', or null
  const [discoveryTypeLoading, setDiscoveryTypeLoading] = useState<'candidates' | 'highs' | null>(null);

  // Suggest some stocks initially or on empty state
  const handleDiscover = async () => {
    setDiscoveryTypeLoading('candidates');
    setDiscovery(null);
    try {
      const result = await discoverStocks();
      setDiscovery(result);
    } catch (err) {
      console.error(err);
    } finally {
      setDiscoveryTypeLoading(null);
    }
  };

  const handleNearHighs = async () => {
    setDiscoveryTypeLoading('highs');
    setDiscovery(null);
    try {
      const result = await discoverNearHighStocks();
      setDiscovery(result);
    } catch (err) {
      console.error(err);
    } finally {
      setDiscoveryTypeLoading(null);
    }
  };

  const handleAnalyze = async (symbolOverride?: string) => {
    const symbol = symbolOverride || query;
    if (!symbol) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setQuery(symbol); // Sync input if clicked from discovery

    try {
      const result = await analyzeStock(symbol);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze stock. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-slate-900">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
             </div>
             <div>
               <h1 className="text-2xl font-bold tracking-tight text-white">CANSLIM<span className="text-emerald-400">.in</span></h1>
               <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Indian Stock Analyzer</p>
             </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleNearHighs}
              disabled={!!discoveryTypeLoading}
              className="group flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-all border border-slate-700 hover:border-slate-600 disabled:opacity-50"
            >
              {discoveryTypeLoading === 'highs' ? (
                 <svg className="animate-spin h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-emerald-500 group-hover:-translate-y-0.5 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              )}
              Near 52W Highs
            </button>

            <button 
              onClick={handleDiscover}
              disabled={!!discoveryTypeLoading}
              className="group flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-all border border-slate-700 hover:border-slate-600 disabled:opacity-50"
            >
              {discoveryTypeLoading === 'candidates' ? (
                 <svg className="animate-spin h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
              ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                 </svg>
              )}
              Find Candidates
            </button>
          </div>
        </header>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-30 group-hover:opacity-60 blur transition duration-500"></div>
            <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-700 shadow-2xl">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter stock symbol (e.g., RELIANCE, TCS, ZOMATO)"
                className="w-full bg-transparent border-none text-white px-6 py-4 text-lg focus:ring-0 placeholder:text-slate-600 font-medium"
              />
              <button 
                onClick={() => handleAnalyze()}
                disabled={loading || !query}
                className="absolute right-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 border border-slate-700 hover:border-slate-600"
              >
                {loading ? 'Analyzing...' : 'Scan'}
              </button>
            </div>
          </div>
          
          {/* Discovery Results as Tags */}
          {discovery && (
             <div className="mt-6 animate-fade-in-down">
               <p className="text-sm text-slate-500 mb-3 font-medium">Discovery Results:</p>
               <div className="flex flex-wrap gap-2">
                 {discovery.candidates.map((cand, idx) => (
                   <button
                     key={idx}
                     onClick={() => handleAnalyze(cand.symbol)}
                     className="group text-left p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-emerald-500/50 rounded-xl transition-all w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.5rem)]"
                   >
                     <div className="flex items-center justify-between">
                       <span className="font-bold text-emerald-400">{cand.symbol}</span>
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 text-slate-600 group-hover:text-emerald-500 transition-colors">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                       </svg>
                     </div>
                     <p className="text-xs text-slate-400 mt-1 line-clamp-1">{cand.reason}</p>
                   </button>
                 ))}
               </div>
             </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="max-w-4xl mx-auto text-center py-20">
             <div className="inline-flex items-center justify-center p-4 rounded-full bg-slate-800/50 mb-6 relative">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
             </div>
             <h3 className="text-xl font-semibold text-white mb-2">Analyzing {query.toUpperCase()}...</h3>
             <p className="text-slate-400 max-w-md mx-auto">
               Our AI agent is scanning quarterly reports, chart patterns, and institutional data sources. This may take up to 20 seconds.
             </p>
             <div className="mt-8 flex justify-center gap-2">
               <div className="w-2 h-2 rounded-full bg-slate-600 animate-bounce" style={{ animationDelay: '0s' }}></div>
               <div className="w-2 h-2 rounded-full bg-slate-600 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
               <div className="w-2 h-2 rounded-full bg-slate-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
             </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-2xl mx-auto p-4 bg-rose-500/10 border border-rose-500/50 rounded-xl text-center">
             <p className="text-rose-400 font-medium">{error}</p>
          </div>
        )}

        {/* Results */}
        {analysis && !loading && (
          <AnalysisResult data={analysis} />
        )}

      </div>
    </div>
  );
};

export default App;