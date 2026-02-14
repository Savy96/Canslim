import React from 'react';
import { StockAnalysis, AnalysisStatus, CanslimCriterion } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalysisResultProps {
  data: StockAnalysis;
}

const StatusBadge: React.FC<{ status: AnalysisStatus }> = ({ status }) => {
  const colors = {
    [AnalysisStatus.PASS]: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    [AnalysisStatus.FAIL]: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
    [AnalysisStatus.NEUTRAL]: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    [AnalysisStatus.UNKNOWN]: 'bg-slate-700 text-slate-400 border-slate-600',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-bold rounded border ${colors[status] || colors[AnalysisStatus.UNKNOWN]}`}>
      {status}
    </span>
  );
};

const CriterionCard: React.FC<{ item: CanslimCriterion }> = ({ item }) => {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-100 shadow-sm">
            {item.letter}
          </div>
          <h3 className="text-slate-200 font-semibold">{item.name}</h3>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <p className="text-slate-300 text-sm mb-2">{item.finding}</p>
      <p className="text-slate-500 text-xs italic">{item.description}</p>
    </div>
  );
};

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ data }) => {
  const criteriaList = Object.values(data.criteria);
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-2 rounded shadow-xl">
          <p className="text-slate-200 text-sm font-medium">{`${label}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">{data.companyName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-emerald-400 font-mono text-xl">{data.symbol}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 text-lg">{data.currentPrice}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">CANSLIM Score</div>
              <div className={`text-4xl font-black ${
                data.canslimScore >= 80 ? 'text-emerald-400' : 
                data.canslimScore >= 50 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {data.canslimScore}/100
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <h4 className="text-slate-400 text-xs uppercase font-bold mb-2 tracking-wider">AI Summary</h4>
            <p className="text-slate-200 leading-relaxed">{data.summary}</p>
          </div>
        </div>

        {/* EPS Chart */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex flex-col">
          <h3 className="text-slate-400 text-xs uppercase font-bold mb-4 tracking-wider">Recent EPS Growth %</h3>
          <div className="flex-1 min-h-[150px]">
            {data.epsTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.epsTrend}>
                  <XAxis dataKey="quarter" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.epsTrend.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value >= 25 ? '#10b981' : entry.value > 0 ? '#fbbf24' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                No growth data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {criteriaList.map((criterion) => (
          <CriterionCard key={criterion.letter} item={criterion} />
        ))}
        {/* Fill remaining space if odd number */}
        <div className="hidden xl:block bg-slate-800/20 rounded-xl border border-dashed border-slate-700/50 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-slate-500 text-sm">Remember: CANSLIM is a growth strategy. Always verify with your own research.</p>
        </div>
      </div>

      {/* Sources */}
      {data.sources.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h4 className="text-slate-500 text-xs uppercase font-bold mb-3">Data Sources</h4>
          <div className="flex flex-wrap gap-2">
            {data.sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors bg-slate-800 px-3 py-1 rounded-full border border-slate-700 truncate max-w-[200px]"
              >
                {source.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
