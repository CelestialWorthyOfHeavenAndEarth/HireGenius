import React from 'react';
import { ComparisonResult, BatchCandidateResult } from '../types';
import { Trophy, ArrowLeft, Swords, Crown, Zap } from 'lucide-react';

interface ComparisonViewProps {
  result: ComparisonResult;
  candidateA: BatchCandidateResult;
  candidateB: BatchCandidateResult;
  onBack: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ result, candidateA, candidateB, onBack }) => {
  const nameA = candidateA.analysis?.extractedName || candidateA.fileName;
  const nameB = candidateB.analysis?.extractedName || candidateB.fileName;

  const isAWinner = result.winnerId === 'candidateA';
  const isBWinner = result.winnerId === 'candidateB';

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20 pt-4">
      <button 
        onClick={onBack}
        className="flex items-center text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 uppercase tracking-wider group transition-colors"
      >
        <ArrowLeft className="w-3 h-3 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Leaderboard
      </button>

      <div className="flex flex-col gap-6 mb-8">
        {/* Winner Announcement */}
        <div className="w-full glass-panel rounded-3xl p-1 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-amber-100/30 to-indigo-100/30 dark:from-amber-900/20 dark:to-indigo-900/20 animate-pulse-glow"></div>
           <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[20px] p-8 relative z-10 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 animate-float">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2 border border-amber-200 dark:border-amber-700/50 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30">Winner Declared</div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {result.winnerName}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
                {result.reasoning}
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         {/* Candidate A Card */}
         <div className={`glass-card rounded-2xl p-6 border-t-4 transition-all ${isAWinner ? 'border-t-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/20 shadow-emerald-500/10' : 'border-t-slate-300 dark:border-t-slate-700 bg-white/40 dark:bg-slate-800/40'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{nameA}</h2>
              {isAWinner && <Crown className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-500/20" />}
            </div>
            <div className="space-y-3">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Strengths</div>
               <div className="flex flex-wrap gap-2">
                 {result.comparativeSkills.filter(s => s.winner === 'A').slice(0, 3).map((s, i) => (
                   <span key={i} className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center">
                     <Zap className="w-3 h-3 text-amber-500 mr-1" /> {s.skill}
                   </span>
                 ))}
               </div>
               <div className="mt-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-700">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Differentiator:</span>
                  {result.keyDifferentiators[0] || "Strong profile alignment."}
               </div>
            </div>
         </div>

         {/* Candidate B Card */}
         <div className={`glass-card rounded-2xl p-6 border-t-4 transition-all ${isBWinner ? 'border-t-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/20 shadow-emerald-500/10' : 'border-t-slate-300 dark:border-t-slate-700 bg-white/40 dark:bg-slate-800/40'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{nameB}</h2>
              {isBWinner && <Crown className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-500/20" />}
            </div>
            <div className="space-y-3">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Strengths</div>
               <div className="flex flex-wrap gap-2">
                 {result.comparativeSkills.filter(s => s.winner === 'B').slice(0, 3).map((s, i) => (
                   <span key={i} className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center">
                     <Zap className="w-3 h-3 text-amber-500 mr-1" /> {s.skill}
                   </span>
                 ))}
               </div>
               <div className="mt-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-700">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Differentiator:</span>
                  {result.keyDifferentiators[1] || result.keyDifferentiators[0] || "Strong profile alignment."}
               </div>
            </div>
         </div>
      </div>

      {/* Head to Head Table */}
      <div className="glass-card rounded-2xl p-8">
         <div className="flex items-center gap-2 mb-6">
            <Swords className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Skill Duel</h3>
         </div>
         
         <div className="space-y-4">
            {result.comparativeSkills.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 text-xs">
                 <div className={`flex-1 text-right font-medium ${item.winner === 'A' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    {item.candidateAStrength}
                 </div>
                 
                 <div className="w-32 flex flex-col items-center">
                    <div className="text-[9px] font-bold text-slate-400 uppercase mb-1 text-center truncate w-full">{item.skill}</div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full flex overflow-hidden">
                       <div className={`h-full ${item.winner === 'A' ? 'bg-emerald-500 w-full' : item.winner === 'Tie' ? 'bg-slate-300 dark:bg-slate-600 w-1/2' : 'bg-transparent w-0'} transition-all duration-500`}></div>
                       <div className={`h-full ${item.winner === 'B' ? 'bg-indigo-500 w-full' : item.winner === 'Tie' ? 'bg-slate-300 dark:bg-slate-600 w-1/2' : 'bg-transparent w-0'} transition-all duration-500`}></div>
                    </div>
                 </div>

                 <div className={`flex-1 text-left font-medium ${item.winner === 'B' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'}`}>
                    {item.candidateBStrength}
                 </div>
              </div>
            ))}
         </div>
      </div>

    </div>
  );
};

export default ComparisonView;