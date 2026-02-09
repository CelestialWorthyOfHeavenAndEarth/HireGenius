import React, { useState } from 'react';
import JSZip from 'jszip';
import { Upload, ChevronRight, CheckCircle2, AlertTriangle, Loader2, Trophy, RefreshCw, Briefcase, Square, CheckSquare, Swords, Crown, Medal, FileStack, Sparkles, Trash2, Play, FileText } from 'lucide-react';
import { analyzeCandidate, compareCandidates } from '../services/geminiService';
import { BatchCandidateResult, ComparisonResult } from '../types';
import AnalysisDashboard from './AnalysisDashboard';
import ComparisonView from './ComparisonView';

interface MassScreeningProps {
  onBack: () => void;
}

const MassScreening: React.FC<MassScreeningProps> = ({ onBack }) => {
  const [jd, setJd] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, content: string}[]>([]);
  const [results, setResults] = useState<BatchCandidateResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const loadDemoData = () => {
    setJd(`Senior Frontend Engineer

We are looking for an experienced Frontend Engineer to lead our core product team.
Key Requirements:
- 5+ years with React, TypeScript, and modern state management.
- Experience with performance optimization and web vitals.
- Strong UI/UX sensibility.`);

    const demoResumes = [
      { name: "sarah_jenkins.txt", content: `Sarah Jenkins\nFrontend Architect\nSUMMARY\nPassionate frontend leader with 7 years of experience scaling React applications. specialized in design systems and performance.\nEXPERIENCE\nTech Giant Corp | Staff Engineer\n- Improved Core Web Vitals LCP by 45%.\nSKILLS\nReact, TypeScript, WebGL, Node.js.` },
      { name: "david_kim.txt", content: `David Kim\nSenior UI Engineer\nSUMMARY\n5 years React Native and Web.\nEXPERIENCE\nStartup Inc | Senior Engineer\n- Built design system.\nSKILLS\nReact, CSS, HTML, Figma.` },
      { name: "alex_chen.txt", content: `Alex Chen\nFull Stack Engineer\nSUMMARY\n8 years exp. Expert in React and Node.js.\nEXPERIENCE\nTechFlow Inc.\n- Led migration to microservices.\nSKILLS\nJavaScript, TypeScript, React, Node.js.` },
      { name: "mike_newman.txt", content: `Mike Newman\nWeb Developer\nSUMMARY\nBackend focus.\nEXPERIENCE\nLegacy Bank | Java Developer\n- Maintained JSP apps.\nSKILLS\nJava, Spring Boot, MySQL.` },
      { name: "emily_ross.txt", content: `Emily Ross\nJunior Dev\nSUMMARY\nBootcamp grad.\nSKILLS\nReact, Redux.` }
    ];

    setUploadedFiles(demoResumes);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesToProcess: { name: string; content: string }[] = [];

    // Check if it's a single ZIP file
    if (files.length === 1 && files[0].name.endsWith('.zip')) {
        try {
            const zip = new JSZip();
            const contents = await zip.loadAsync(files[0]);
            
            for (const [relativePath, zipEntry] of Object.entries(contents.files)) {
                const entry = zipEntry as any;
                if (!entry.dir && (relativePath.endsWith('.txt') || relativePath.endsWith('.md'))) {
                    const content = await entry.async('string');
                    filesToProcess.push({ name: relativePath, content });
                }
            }
        } catch (err) {
            console.error(err);
            alert("Failed to read ZIP file.");
            return;
        }
    } else {
        // Handle multiple individual files
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
                const content = await file.text();
                filesToProcess.push({ name: file.name, content });
            }
        }
    }

    if (filesToProcess.length === 0) return alert("No valid .txt or .md files found. Please upload text files or a zip containing them.");
    
    // Append new files to existing uploaded files
    setUploadedFiles(prev => [...prev, ...filesToProcess]);
    // Reset file input
    e.target.value = '';
  };

  const removeFile = (indexToRemove: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleRunAnalysis = async () => {
    if (uploadedFiles.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: uploadedFiles.length });
    
    const initialResults: BatchCandidateResult[] = uploadedFiles.map((f, i) => ({
      id: `cand-${i}-${Date.now()}`,
      fileName: f.name,
      resumeContent: f.content,
      analysis: null,
      status: 'pending'
    }));
    setResults(initialResults);

    const updatedResults = [...initialResults];
    for (let i = 0; i < uploadedFiles.length; i++) {
      updatedResults[i].status = 'processing';
      setResults([...updatedResults]);
      try {
        const analysis = await analyzeCandidate(uploadedFiles[i].content, jd);
        updatedResults[i].analysis = analysis;
        updatedResults[i].status = 'completed';
      } catch (error: any) {
        updatedResults[i].status = 'error';
        updatedResults[i].error = error.message;
      }
      setResults([...updatedResults]);
      setProgress(prev => ({ ...prev, current: i + 1 }));
    }
    setIsProcessing(false);
  };

  const toggleSelection = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(prev => prev.filter(item => item !== id));
    } else {
      if (selectedForComparison.length < 2) setSelectedForComparison(prev => [...prev, id]);
      else setSelectedForComparison(prev => [prev[1], id]);
    }
  };

  const runComparison = async () => {
    if (selectedForComparison.length !== 2) return;
    setIsComparing(true);
    const candA = results.find(r => r.id === selectedForComparison[0]);
    const candB = results.find(r => r.id === selectedForComparison[1]);
    if (candA && candB) {
      const comparison = await compareCandidates(candA.resumeContent || '', candA.analysis?.extractedName || candA.fileName, candB.resumeContent || '', candB.analysis?.extractedName || candB.fileName, jd);
      setComparisonResult(comparison);
    }
    setIsComparing(false);
  };

  // View Routing
  if (comparisonResult && selectedForComparison.length === 2) {
    const candA = results.find(r => r.id === selectedForComparison[0])!;
    const candB = results.find(r => r.id === selectedForComparison[1])!;
    return <ComparisonView result={comparisonResult} candidateA={candA} candidateB={candB} onBack={() => { setComparisonResult(null); setSelectedForComparison([]); }} />;
  }
  if (selectedCandidateId) {
    const candidate = results.find(r => r.id === selectedCandidateId);
    if (candidate?.analysis) return <AnalysisDashboard data={candidate.analysis} candidateName={candidate.analysis.extractedName || candidate.fileName} onReset={() => setSelectedCandidateId(null)} />;
  }

  // Initial State (Upload & Staging)
  if (results.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-6 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-fuchsia-500/10 mb-3 animate-float ring-1 ring-white dark:ring-white/10">
            <Trophy className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Batch Intelligence</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Upload multiple resumes to simulate an AI recruitment tournament.</p>
        </div>

        <div className="glass-panel rounded-3xl p-1 shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-500/10 bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900">
          <div className="bg-white/60 dark:bg-slate-900/60 rounded-[20px] p-6 md:p-8 backdrop-blur-sm">
            <div className="flex flex-col h-full mb-5">
              <label className="mb-2"><span className="text-[10px] font-bold text-indigo-900/60 dark:text-indigo-300/60 uppercase tracking-widest">Target Role</span></label>
              <textarea value={jd} onChange={(e) => setJd(e.target.value)} className="w-full h-24 p-4 bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none resize-none text-sm font-mono text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 transition-all" placeholder="Paste job requirements here to unlock upload..." />
            </div>
            
            {/* Upload Area */}
            {uploadedFiles.length === 0 ? (
              <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${!jd ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 opacity-70' : 'border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/10 dark:bg-indigo-500/5 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/10 hover:border-indigo-400'}`}>
                  <input 
                    type="file" 
                    accept=".zip,.txt,.md" 
                    multiple
                    onChange={handleFileUpload} 
                    disabled={!jd} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20" 
                  />
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg mx-auto mb-3 transition-transform ${!jd ? 'bg-slate-200 dark:bg-slate-800 shadow-slate-200 dark:shadow-none' : 'bg-white dark:bg-slate-800 shadow-indigo-100 dark:shadow-none group-hover:scale-110'}`}>
                    {jd ? <FileStack className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> : <Upload className="w-5 h-5 text-slate-400" />}
                  </div>
                  <h3 className={`text-base font-bold ${!jd ? 'text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-white'}`}>
                    Upload Resumes
                  </h3>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-1">Select multiple text files OR drop a ZIP archive</p>
                  
                  {!jd && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 text-[9px] font-bold rounded-full border border-amber-200 dark:border-amber-800 animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> Please enter Job Description first
                    </div>
                  )}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <div className="p-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1.5 rounded-lg"><FileStack className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400"/></div>
                     <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{uploadedFiles.length} files staged</span>
                   </div>
                   <div className="relative overflow-hidden">
                     <input type="file" accept=".zip,.txt,.md" multiple onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                     <button className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 uppercase tracking-wide">+ Add More</button>
                   </div>
                </div>
                <div className="max-h-48 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-colors group">
                       <div className="flex items-center gap-3">
                         <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                           <FileText className="w-3.5 h-3.5" />
                         </div>
                         <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{file.name}</div>
                       </div>
                       <button onClick={() => removeFile(idx)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                         <Trash2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={handleRunAnalysis} 
                    className="w-full py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.01] transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" /> Run Analysis ({uploadedFiles.length})
                  </button>
                </div>
              </div>
            )}

            {uploadedFiles.length === 0 && (
              <div className="flex justify-center pt-5 border-t border-slate-100 dark:border-slate-700 mt-5">
                <button onClick={loadDemoData} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-[10px] font-bold transition-all uppercase tracking-wide">
                  <Sparkles className="w-3 h-3" /> Load Demo Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const sortedResults = [...results].sort((a, b) => {
    if (a.analysis && b.analysis) return b.analysis.confidenceScore - a.analysis.confidenceScore;
    if (a.analysis) return -1;
    if (b.analysis) return 1;
    return 0;
  });

  const podium = sortedResults.slice(0, 3);
  const rest = sortedResults.slice(3);

  return (
    <div className="max-w-7xl mx-auto py-2 animate-fade-in relative pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500 fill-amber-500" /> Leaderboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">AI-Ranked Candidates based on JD Match</p>
        </div>
        <div className="flex items-center gap-3">
             {isProcessing && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-500/30 rounded-full shadow-sm text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing {progress.current}/{progress.total}</span>
                </div>
             )}
             <button onClick={() => { setResults([]); setUploadedFiles([]); setProgress({current:0, total:0}); }} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all shadow-sm">
               <RefreshCw className="w-4 h-4" />
             </button>
        </div>
      </div>

      {/* Podium View */}
      {podium.length > 0 && (
        <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 mb-12 min-h-[300px]">
          {/* 2nd Place */}
          {podium[1] && <PodiumCard candidate={podium[1]} place={2} onSelect={() => toggleSelection(podium[1].id)} isSelected={selectedForComparison.includes(podium[1].id)} onView={() => setSelectedCandidateId(podium[1].id)} />}
          {/* 1st Place */}
          {podium[0] && <PodiumCard candidate={podium[0]} place={1} onSelect={() => toggleSelection(podium[0].id)} isSelected={selectedForComparison.includes(podium[0].id)} onView={() => setSelectedCandidateId(podium[0].id)} />}
          {/* 3rd Place */}
          {podium[2] && <PodiumCard candidate={podium[2]} place={3} onSelect={() => toggleSelection(podium[2].id)} isSelected={selectedForComparison.includes(podium[2].id)} onView={() => setSelectedCandidateId(podium[2].id)} />}
        </div>
      )}

      {/* Battle Grid for the Rest */}
      {rest.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contenders</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((r, i) => (
              <BattleCard key={r.id} candidate={r} rank={i + 4} onSelect={() => toggleSelection(r.id)} isSelected={selectedForComparison.includes(r.id)} onView={() => setSelectedCandidateId(r.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Comparison Dock */}
      {selectedForComparison.length > 0 && (
         <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
            <div className="bg-slate-900/90 dark:bg-indigo-950/90 backdrop-blur-md text-white rounded-2xl shadow-2xl px-2 py-2 flex items-center gap-2 border border-white/10 ring-1 ring-black/20">
               <div className="px-3 py-1.5 bg-white/10 rounded-xl">
                 <span className="text-xs font-bold">{selectedForComparison.length} selected</span>
               </div>
               <button 
                  onClick={runComparison}
                  disabled={selectedForComparison.length !== 2 || isComparing}
                  className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedForComparison.length !== 2 ? 'opacity-50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30'}`}
               >
                  {isComparing ? <Loader2 className="w-3 h-3 animate-spin mr-2"/> : <Swords className="w-3 h-3 mr-2" />}
                  {isComparing ? 'Simulating...' : 'Start Duel'}
               </button>
            </div>
         </div>
      )}
    </div>
  );
};

interface PodiumCardProps {
  candidate: BatchCandidateResult;
  place: number;
  onSelect: () => void;
  isSelected: boolean;
  onView: () => void;
}

const PodiumCard: React.FC<PodiumCardProps> = ({ candidate, place, onSelect, isSelected, onView }) => {
  const isLoading = candidate.status === 'processing' || candidate.status === 'pending';
  const score = candidate.analysis?.confidenceScore || 0;
  
  // Podium Styles
  const isFirst = place === 1;
  const isSecond = place === 2;
  const isThird = place === 3;
  
  const heightClass = isFirst ? 'h-[280px] w-full md:w-[280px] z-10' : isSecond ? 'h-[240px] w-full md:w-[240px]' : 'h-[220px] w-full md:w-[240px]';
  
  const borderClass = isFirst 
    ? 'border-amber-200 dark:border-amber-500/30 ring-4 ring-amber-100/50 dark:ring-amber-500/10 shadow-2xl shadow-amber-200/20 dark:shadow-amber-500/10' 
    : isSecond 
      ? 'border-slate-200 dark:border-slate-600 ring-4 ring-slate-100/50 dark:ring-slate-600/20 shadow-xl' 
      : 'border-orange-200 dark:border-orange-500/30 ring-4 ring-orange-100/50 dark:ring-orange-500/10 shadow-xl';
      
  const bgClass = isFirst
    ? 'bg-gradient-to-b from-amber-50/80 to-white/60 dark:from-amber-950/40 dark:to-slate-900/80'
    : isSecond
      ? 'bg-gradient-to-b from-slate-50/80 to-white/60 dark:from-slate-800/40 dark:to-slate-900/80'
      : 'bg-gradient-to-b from-orange-50/80 to-white/60 dark:from-orange-950/40 dark:to-slate-900/80';

  const badgeIcon = isFirst ? <Crown className="w-5 h-5 text-amber-600 dark:text-amber-500 fill-amber-100 dark:fill-amber-500/20" /> : <Medal className={`w-5 h-5 ${isSecond ? 'text-slate-500 dark:text-slate-400' : 'text-orange-600 dark:text-orange-500'}`} />;

  return (
    <div className={`relative rounded-3xl border ${borderClass} ${bgClass} ${heightClass} flex flex-col items-center justify-between p-6 transition-all duration-500 backdrop-blur-md ${isSelected ? 'scale-[1.02] ring-indigo-400 dark:ring-indigo-500' : 'hover:-translate-y-2'}`}>
      
      {/* Absolute Rank Badge */}
      <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-800 shadow-md ${isFirst ? 'bg-amber-500 text-white' : isSecond ? 'bg-slate-400 text-white' : 'bg-orange-400 text-white'}`}>
        {place}
      </div>

      <div className="flex flex-col items-center w-full mt-4">
        {isLoading ? (
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 mb-3"></div>
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
          </div>
        ) : (
          <>
            <div className="mb-1">{badgeIcon}</div>
            <div className="text-center mb-1">
              <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{candidate.analysis?.extractedName || candidate.fileName}</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{candidate.analysis?.recommendation}</p>
            </div>
          </>
        )}
      </div>

      {!isLoading && candidate.analysis && (
        <div className="text-center w-full">
           <div className="text-4xl font-bold text-slate-800 dark:text-white tracking-tighter mb-1 font-mono">{score}%</div>
           <div className="text-[10px] text-slate-400 font-bold uppercase mb-4">Match Score</div>
           
           <div className="flex gap-2 justify-center w-full">
             <button onClick={onView} className="flex-1 bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-500 dark:text-slate-400 text-[10px] font-bold py-2 rounded-xl transition-colors">
               VIEW
             </button>
             <button onClick={onSelect} className={`flex-1 border text-[10px] font-bold py-2 rounded-xl transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white/60 dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-500/50'}`}>
               {isSelected ? 'SELECTED' : 'SELECT'}
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

interface BattleCardProps {
  candidate: BatchCandidateResult;
  rank: number;
  onSelect: () => void;
  isSelected: boolean;
  onView: () => void;
}

const BattleCard: React.FC<BattleCardProps> = ({ candidate, rank, onSelect, isSelected, onView }) => {
  const isLoading = candidate.status === 'processing' || candidate.status === 'pending';
  const score = candidate.analysis?.confidenceScore || 0;

  return (
    <div className={`glass-card rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 ${isSelected ? 'bg-indigo-50/60 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-500/50' : 'hover:bg-white/70 dark:hover:bg-white/5'}`}>
      <div className="text-xs font-bold text-slate-300 dark:text-slate-600 font-mono w-6">#{rank}</div>
      
      <div className="flex-1 min-w-0">
        {isLoading ? (
          <div className="animate-pulse h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
        ) : (
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{candidate.analysis?.extractedName || candidate.fileName}</h4>
            <div className="flex items-center gap-2 mt-0.5">
               <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${score > 70 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{candidate.analysis?.recommendation}</span>
               <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Match: {score}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
         <button onClick={onView} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
           <ChevronRight className="w-4 h-4" />
         </button>
         <button onClick={onSelect} className={`p-2 rounded-lg transition-colors ${isSelected ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : 'text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400'}`}>
           {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
         </button>
      </div>
    </div>
  );
};

export default MassScreening;