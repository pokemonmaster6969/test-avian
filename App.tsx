
import React, { useState, useEffect } from 'react';
import { 
  Dna, 
  Moon, 
  Sun, 
  Upload, 
  FileText, 
  Database, 
  Play, 
  Info,
  Trash2,
  Settings2
} from 'lucide-react';
import { SequenceResult, InputMode, AnalysisOptions } from './types';
import { analyzeSequences } from './services/vntrEngine';
import { SAMPLE_DATA, DEFAULT_MOTIF, DEFAULT_MIN_REPEATS } from './constants';
import ResultsView from './components/ResultsView';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => 
    localStorage.getItem('theme') as 'light' | 'dark' || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [motif, setMotif] = useState(DEFAULT_MOTIF);
  const [minRepeats, setMinRepeats] = useState(DEFAULT_MIN_REPEATS);
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<SequenceResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const clearAll = () => {
    setResults([]);
    setTextInput('');
    setFile(null);
    setMotif(DEFAULT_MOTIF);
    setMinRepeats(DEFAULT_MIN_REPEATS);
  };

  const startAnalysis = async () => {
    if (!motif || motif.length < 1) {
      alert("Please enter a valid motif.");
      return;
    }

    let content = '';
    if (inputMode === 'upload') {
      if (!file) { alert("Please select a file."); return; }
      content = await file.text();
    } else if (inputMode === 'text') {
      if (!textInput.trim()) { alert("Please enter sequence data."); return; }
      content = textInput;
    } else {
      content = SAMPLE_DATA;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      try {
        const analysisOptions: AnalysisOptions = { motif, minRepeats };
        const res = analyzeSequences(content, analysisOptions);
        setResults(res);
        setTimeout(() => {
          document.getElementById('results-view')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      } catch (err) {
        console.error(err);
        alert("An error occurred during sequence analysis.");
      } finally {
        setIsAnalyzing(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen pb-12 transition-colors duration-300 flex flex-col">
      {/* Header - Full Width */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 w-full">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-forest-600 rounded-lg shadow-lg shadow-forest-600/20">
              <Dna className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="hidden xs:block">
              <h1 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-forest-800 to-forest-600 dark:from-forest-400 dark:to-forest-200 bg-clip-text text-transparent">
                VNTR Seeker <span className="text-forest-500 font-light">Pro</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-gray-300" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 mt-8 animate-fade-in max-w-[1920px] mx-auto">
        <div className="mb-10 lg:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
            Genomic <span className="text-forest-600 dark:text-forest-400">Repeat Finder</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
            A production-grade bioinformatics dashboard for rapid Variable Number Tandem Repeat (VNTR) discovery. 
            Deterministic matching optimized for sequence lengths up to 100kb.
          </p>
        </div>

        {/* Configuration Section - Grid that expands with viewport */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 sm:gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 mb-6 overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setInputMode('upload')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${inputMode === 'upload' ? 'bg-forest-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <Upload className="w-4 h-4" /> FASTA File
              </button>
              <button 
                onClick={() => setInputMode('text')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${inputMode === 'text' ? 'bg-forest-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <FileText className="w-4 h-4" /> Plain Text
              </button>
              <button 
                onClick={() => setInputMode('sample')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${inputMode === 'sample' ? 'bg-forest-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <Database className="w-4 h-4" /> Sample Data
              </button>
            </div>

            <div className="flex-1 space-y-4 min-h-[180px]">
              {inputMode === 'upload' && (
                <div className="h-full min-h-[180px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-10 hover:bg-forest-50/30 dark:hover:bg-forest-900/5 transition-all cursor-pointer relative group">
                  <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept=".fasta,.fa,.txt"
                  />
                  <div className="p-4 bg-forest-50 dark:bg-forest-900/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-forest-600 dark:text-forest-400" />
                  </div>
                  <p className="text-gray-900 dark:text-gray-200 font-bold text-base sm:text-lg text-center">
                    {file ? file.name : "Drop FASTA file here"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">Maximum file size recommended: 10MB</p>
                </div>
              )}

              {inputMode === 'text' && (
                <textarea 
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste multi-FASTA or raw DNA sequence..."
                  className="w-full h-full min-h-[180px] p-5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl font-mono text-xs sm:text-sm focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 outline-none transition-all dark:text-gray-300 resize-none"
                />
              )}

              {inputMode === 'sample' && (
                <div className="h-full flex items-center bg-forest-50/40 dark:bg-forest-900/10 border border-forest-100 dark:border-forest-900/30 rounded-2xl p-6 sm:p-8">
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="p-3 bg-forest-100 dark:bg-forest-900/50 rounded-2xl flex-shrink-0">
                      <Database className="w-6 h-6 text-forest-700 dark:text-forest-400" />
                    </div>
                    <div>
                      <h4 className="font-black text-forest-900 dark:text-forest-200 text-base sm:text-xl">C. Liberibacter Microsatellites</h4>
                      <p className="text-forest-700 dark:text-forest-400 mt-2 text-sm sm:text-base leading-relaxed max-w-2xl">
                        Reference sequences for CLas isolate analysis. Optimized for detecting the <span className="font-mono bg-forest-200/50 dark:bg-forest-900/50 px-2 py-0.5 rounded font-bold text-forest-900 dark:text-forest-100">ACACA</span> motif which displays high phenotypic variation.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4 mb-2">
                <Settings2 className="w-5 h-5 text-forest-600" />
                <h3 className="font-black text-base uppercase tracking-wider text-gray-900 dark:text-white">Analysis Parameters</h3>
              </div>

              <div className="space-y-3">
                <label className="text-xs sm:text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Target Motif</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={motif}
                    onChange={(e) => setMotif(e.target.value.toUpperCase())}
                    placeholder="e.g. AGACACA"
                    className="w-full p-4 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl font-mono text-base sm:text-lg font-bold tracking-widest focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 outline-none uppercase dark:text-white transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-[10px] bg-forest-100 dark:bg-forest-900/50 text-forest-600 px-2 py-1 rounded font-black uppercase">DNA/RNA</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-xs sm:text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Min. Consecutive Repeats</label>
                  <span className="text-sm font-black text-forest-600 bg-forest-50 dark:bg-forest-900/30 px-3 py-1 rounded-xl shadow-sm border border-forest-100 dark:border-forest-900/50">{minRepeats}x</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="50" 
                  value={minRepeats}
                  onChange={(e) => setMinRepeats(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full appearance-none cursor-pointer accent-forest-600 transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800 space-y-4">
              <button 
                onClick={startAnalysis}
                disabled={isAnalyzing}
                className="w-full py-4 bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-forest-600/20 transition-all active:scale-95 group"
              >
                {isAnalyzing ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <> 
                    <Play className="w-5 h-5 fill-current group-hover:translate-x-1 transition-transform" /> 
                    Execute Analysis 
                  </>
                )}
              </button>
              <button 
                onClick={clearAll}
                className="w-full py-3 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 text-xs sm:text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Reset Workspace
              </button>
            </div>
          </div>
        </section>

        {/* Results Area - Full Width */}
        <div id="results-view" className="scroll-mt-20 w-full mb-12">
          {results.length > 0 ? (
            <ResultsView results={results} motif={motif} onReset={clearAll} />
          ) : !isAnalyzing && (
             <div className="flex flex-col items-center justify-center py-20 sm:py-32 bg-gray-50/50 dark:bg-gray-900/30 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800/50">
               <div className="p-6 bg-white dark:bg-gray-900 rounded-full shadow-sm mb-6 opacity-40">
                <Dna className="w-12 h-12 sm:w-16 sm:h-16 text-forest-600" />
               </div>
               <p className="text-base sm:text-xl font-bold text-gray-400 dark:text-gray-600 px-4 text-center">
                 Awaiting sequence input for pattern matching...
               </p>
             </div>
          )}
        </div>
      </main>

      <footer className="mt-auto border-t border-gray-100 dark:border-gray-900 py-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
        <div className="px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-[10px] sm:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
            <span>VNTR SEEKER v2.1.0</span>
            <span className="hidden sm:inline">•</span>
            <span>ACADEMIC OPEN LICENSE</span>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center sm:text-right font-medium leading-relaxed">
            Engineered for high-throughput genomic visualization &bull; Designed by Bio-UX Systems
          </p>
        </div>
      </footer>
    </div>
  );
}
