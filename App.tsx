import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import AnalysisDashboard from './components/AnalysisDashboard';
import MassScreening from './components/MassScreening';
import { analyzeCandidate } from './services/geminiService';
import { HireGeniusResponse } from './types';
import { User, Users, Sparkles, BrainCircuit, Hexagon, Sun, Moon } from 'lucide-react';

type AppMode = 'single' | 'mass';

function App() {
  const [mode, setMode] = useState<AppMode>('single');
  const [candidateData, setCandidateData] = useState<HireGeniusResponse | null>(null);
  const [candidateName, setCandidateName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage or system preference
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleAnalysis = async (name: string, resume: string, jd: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeCandidate(resume, jd);
      setCandidateData(result);
      setCandidateName(result.extractedName || name || "Candidate");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCandidateData(null);
    setCandidateName('');
    setError(null);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-500 selection:text-white pb-12 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Tech Grid */}
      <div className="fixed inset-0 z-[-1] bg-tech-grid opacity-60 pointer-events-none"></div>
      
      {/* Ambient Glows */}
      <div className="fixed top-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-[-1] animate-pulse-glow"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-500/5 dark:bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none z-[-1]"></div>

      {/* Compact Navigation */}
      <div className="sticky top-4 z-40 px-4 mb-6">
        <nav className="glass-panel max-w-5xl mx-auto rounded-full px-4 py-2 flex items-center justify-between shadow-xl shadow-slate-200/50 dark:shadow-black/20 ring-1 ring-white/60 dark:ring-white/10 transition-all duration-300">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setMode('single'); handleReset(); }}>
               <div className="relative">
                 <div className="absolute inset-0 bg-indigo-500 rounded-lg blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
                 <div className="relative p-1.5 bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-500/30 group-hover:border-indigo-200 transition-colors">
                   <Hexagon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-50 dark:fill-indigo-900/40" />
                 </div>
               </div>
               <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors hidden sm:block">
                 HireGenius
               </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Mode Switcher */}
              <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-full border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
                  <button 
                    onClick={() => { setMode('single'); handleReset(); }}
                    className={`flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                      mode === 'single' 
                        ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-black/5 dark:ring-white/5' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 mr-1.5" /> Individual
                  </button>
                  <button 
                    onClick={() => { setMode('mass'); handleReset(); }}
                    className={`flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                      mode === 'mass' 
                        ? 'bg-white dark:bg-slate-700 text-fuchsia-700 dark:text-fuchsia-300 shadow-sm ring-1 ring-black/5 dark:ring-white/5' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 mr-1.5" /> Batch Rank
                  </button>
              </div>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 dark:hover:text-indigo-400 transition-colors focus:outline-none"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
        </nav>
      </div>

      <main className="container mx-auto px-4 max-w-7xl">
        {error && (
          <div className="animate-slide-up mb-6 max-w-2xl mx-auto">
            <div className="bg-rose-50/90 dark:bg-rose-900/20 backdrop-blur border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 px-4 py-3 rounded-xl flex items-center shadow-lg shadow-rose-500/5 text-sm">
              <span className="font-bold mr-2">System Alert:</span> {error}
            </div>
          </div>
        )}

        <div className="transition-all duration-500 ease-in-out">
        {mode === 'single' ? (
           !candidateData ? (
            <InputForm onSubmit={handleAnalysis} isLoading={loading} />
          ) : (
            <AnalysisDashboard 
              data={candidateData} 
              candidateName={candidateName} 
              onReset={handleReset} 
            />
          )
        ) : (
          <MassScreening onBack={() => setMode('single')} />
        )}
        </div>
      </main>
      
      <footer className="fixed bottom-0 w-full py-2 text-center border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/80 backdrop-blur-md z-30 transition-colors duration-300">
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold tracking-wide flex items-center justify-center gap-2 uppercase">
          <Sparkles className="w-3 h-3 text-indigo-500" /> Intelligence Engine v3.0 • Powered by Gemini Pro
        </p>
      </footer>
    </div>
  );
}

export default App;