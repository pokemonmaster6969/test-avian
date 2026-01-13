
import React, { useState } from 'react';
import { 
  Download, 
  Trash2, 
  BarChart3, 
  Info,
  List,
  LayoutGrid,
  TrendingUp,
  FileText
} from 'lucide-react';
import { SequenceResult, VNTRRegion } from '../types';

interface ResultsViewProps {
  results: SequenceResult[];
  motif: string;
  onReset: () => void;
}

type TabType = 'detailed' | 'summary';

const ResultsView: React.FC<ResultsViewProps> = ({ results, motif, onReset }) => {
  const [activeTab, setActiveTab] = useState<TabType>('detailed');
  const [highlightedRegion, setHighlightedRegion] = useState<string | null>(null);

  const downloadCSV = () => {
    let csv = "Sequence,Length,Region_ID,Motif,Repeats,Start,End,Length_BP,Density_1kb\n";
    results.forEach(res => {
      if (res.regions.length === 0) {
        csv += `"${res.name}",${res.length},None,${motif},0,0,0,0,${res.density.toFixed(2)}\n`;
      } else {
        res.regions.forEach((reg, idx) => {
          csv += `"${res.name}",${res.length},${idx + 1},${motif},${reg.repeats},${reg.start},${reg.end},${reg.length},${res.density.toFixed(2)}\n`;
        });
      }
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VNTR_Analysis_${motif}.csv`;
    a.click();
  };

  const totalRegions = results.reduce((sum, res) => sum + res.regions.length, 0);
  const avgDensity = results.length > 0 ? (results.reduce((sum, res) => sum + res.density, 0) / results.length) : 0;

  // Flattened data for Summary view
  const allRegions = results.flatMap(res => 
    res.regions.map(reg => ({ ...reg, sequenceName: res.name, seqLength: res.length }))
  );

  return (
    <div className="space-y-8 animate-fade-in w-full">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            Discovery Results
          </h3>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-forest-50 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400 rounded-full font-black text-xs uppercase tracking-widest border border-forest-100 dark:border-forest-900/30">
            <TrendingUp className="w-3 h-3" /> {totalRegions} Regions Identified
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Tab Switcher - Styled like a pro dashboard toggle */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
            <button
              onClick={() => setActiveTab('detailed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'detailed' ? 'bg-white dark:bg-gray-700 text-forest-700 dark:text-forest-400 shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Detailed
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'summary' ? 'bg-white dark:bg-gray-700 text-forest-700 dark:text-forest-400 shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            >
              <List className="w-4 h-4" /> Summary
            </button>
          </div>

          <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-2 hidden lg:block" />

          <button 
            onClick={downloadCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gray-900/10"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={onReset}
            className="p-2.5 border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
            title="Clear Analysis"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* High-Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Parsed Sequences', value: results.length, icon: FileText, color: 'text-gray-600 dark:text-gray-300' },
          { label: 'VNTR Instances', value: totalRegions, icon: BarChart3, color: 'text-forest-600 dark:text-forest-400' },
          { label: 'Average Repeat Length', value: `${(results.reduce((s, r) => s + r.regions.reduce((ss, rr) => ss + rr.length, 0), 0) / (totalRegions || 1)).toFixed(1)} bp`, icon: TrendingUp, color: 'text-gray-600 dark:text-gray-300' },
          { label: 'Region Density', value: `${avgDensity.toFixed(2)}/kb`, icon: TrendingUp, color: 'text-forest-600 dark:text-forest-400' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 rounded-[1.5rem] shadow-sm flex items-center gap-5 group hover:border-forest-200 dark:hover:border-forest-800 transition-colors">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl group-hover:bg-forest-50 dark:group-hover:bg-forest-900/20 transition-colors">
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {activeTab === 'detailed' ? (
        /* Detailed View - Wide Grid */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {results.map((res) => (
            <div key={res.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-sm flex flex-col hover:shadow-xl hover:shadow-gray-200/20 dark:hover:shadow-black/40 transition-all duration-300 border-b-4 border-b-forest-600/10">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-forest-600 dark:text-forest-400 shadow-sm flex-shrink-0">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-lg font-black text-gray-900 dark:text-white truncate" title={res.originalHeader}>
                      {res.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      <span>{res.length.toLocaleString()} BP</span>
                      <span>•</span>
                      <span className="text-forest-600 dark:text-forest-400">{res.regions.length} REPEATS</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Density</p>
                   <p className="text-xl font-black text-gray-900 dark:text-gray-200">{res.density.toFixed(2)}</p>
                </div>
              </div>

              <div className="p-8 flex-1">
                {/* Visualizer - Full Width Strip */}
                <div className="mb-10 group relative">
                  <div className="flex justify-between text-[10px] font-black text-gray-400 mb-3 tracking-tighter uppercase">
                    <span>Origin (1)</span>
                    <span className="text-forest-600 dark:text-forest-500 font-black">Region Map</span>
                    <span>{res.length.toLocaleString()} BP</span>
                  </div>
                  <div className="relative h-6 w-full bg-gray-100 dark:bg-gray-800 rounded-full shadow-inner ring-1 ring-gray-200/50 dark:ring-gray-700/50">
                    {res.regions.map((reg) => {
                      const left = (reg.start / res.length) * 100;
                      const width = (reg.length / res.length) * 100;
                      return (
                        <div 
                          key={reg.id}
                          onMouseEnter={() => setHighlightedRegion(reg.id)}
                          onMouseLeave={() => setHighlightedRegion(null)}
                          className={`absolute top-0 h-full bg-forest-500 hover:bg-forest-400 transition-all cursor-crosshair rounded-sm ${highlightedRegion === reg.id ? 'ring-4 ring-forest-600/30 dark:ring-forest-400/20 scale-y-125 z-10' : ''}`}
                          style={{ left: `${left}%`, width: `${Math.max(width, 0.4)}%` }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Local Results Table */}
                {res.regions.length > 0 ? (
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                          <th className="py-4 pr-6">Locus</th>
                          <th className="py-4 px-6">Count</th>
                          <th className="py-4 px-6">Span</th>
                          <th className="py-4 pl-6">Motif Context</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {res.regions.map((reg) => (
                          <tr 
                            key={reg.id} 
                            onMouseEnter={() => setHighlightedRegion(reg.id)}
                            onMouseLeave={() => setHighlightedRegion(null)}
                            className={`border-b border-gray-50/50 dark:border-gray-800/30 last:border-0 transition-all ${highlightedRegion === reg.id ? 'bg-forest-50/50 dark:bg-forest-900/20 scale-[1.01] origin-left' : ''}`}
                          >
                            <td className="py-5 pr-6 font-mono font-bold text-gray-700 dark:text-gray-300">
                              {reg.start}—{reg.end}
                            </td>
                            <td className="py-5 px-6">
                              <span className="inline-flex items-center px-2.5 py-1 bg-forest-600 text-white rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                {reg.repeats}x
                              </span>
                            </td>
                            <td className="py-5 px-6 font-mono text-gray-400 text-xs">
                              {reg.length} bp
                            </td>
                            <td className="py-5 pl-6 font-mono text-[10px] sm:text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px] sm:max-w-[200px]">
                              <span className="opacity-30">{reg.context.before}</span>
                              <span className="text-forest-600 dark:text-forest-400 bg-forest-50 dark:bg-forest-900/40 px-1 rounded font-black border border-forest-100 dark:border-forest-900/50">{reg.context.repeat}</span>
                              <span className="opacity-30">{reg.context.after}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-gray-300 dark:text-gray-700 border-2 border-dashed border-gray-50 dark:border-gray-800/50 rounded-3xl">
                    <Info className="w-10 h-10 mb-3 opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest">No matching repeats detected</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Summary Table - Ultra-Wide Dashboard Style */
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/10 dark:shadow-black/30">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm">
                <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">ID / Sequence Name</th>
                  <th className="px-8 py-6">Genomic Locus</th>
                  <th className="px-8 py-6">Target Motif</th>
                  <th className="px-8 py-6">Multiplier</th>
                  <th className="px-8 py-6">Total Span</th>
                  <th className="px-8 py-6">Relative Pos (%)</th>
                  <th className="px-8 py-6">Preview</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {allRegions.length > 0 ? (
                  allRegions.map((reg, idx) => (
                    <tr key={reg.id} className="border-b border-gray-50 dark:border-gray-800/30 last:border-0 hover:bg-forest-50/20 dark:hover:bg-forest-900/5 transition-colors group">
                      <td className="px-8 py-5 font-black text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                        {reg.sequenceName}
                      </td>
                      <td className="px-8 py-5 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap font-bold">
                        {reg.start}:{reg.end}
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-mono font-black text-forest-700 dark:text-forest-400 uppercase tracking-widest bg-forest-100/50 dark:bg-forest-900/30 px-2 py-1 rounded-lg border border-forest-200/50 dark:border-forest-800/50">
                          {reg.motif}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-black text-gray-900 dark:text-gray-100">
                          {reg.repeats}<span className="text-[10px] text-gray-400 ml-0.5">X</span>
                        </span>
                      </td>
                      <td className="px-8 py-5 font-mono text-gray-500 dark:text-gray-400">
                        {reg.length} bp
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                           <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-forest-500" style={{ width: `${(reg.start / reg.seqLength) * 100}%` }}></div>
                           </div>
                           <span className="text-[10px] font-black text-gray-400">{Math.round((reg.start / reg.seqLength) * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-[10px] text-gray-400 group-hover:text-forest-600 dark:group-hover:text-forest-400 transition-colors">
                        {reg.context.repeat}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 opacity-20">
                        <Info className="w-12 h-12" />
                        <p className="text-sm font-black uppercase tracking-widest">No global data points detected</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsView;
