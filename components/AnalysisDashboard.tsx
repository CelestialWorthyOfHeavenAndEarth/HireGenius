import React from 'react';
import { HireGeniusResponse, Skill } from '../types';
import SkillsChart from './SkillsChart';
import { CheckCircle2, AlertTriangle, HelpCircle, Briefcase, AlertOctagon, Target, BarChart3, ChevronDown, Activity, User, Fingerprint } from 'lucide-react';

interface AnalysisDashboardProps {
  data: HireGeniusResponse;
  candidateName: string;
  onReset: () => void;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data, candidateName, onReset }) => {
  const getRecStyles = (rec: string) => {
    switch (rec) {
      case 'Strong Hire': return { gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' };
      case 'Hire': return { gradient: 'from-green-500 to-emerald-500', shadow: 'shadow-green-500/20' };
      case 'Maybe': return { gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' };
      case 'Pass': return { gradient: 'from-rose-500 to-red-600', shadow: 'shadow-rose-500/20' };
      default: return { gradient: 'from-slate-500 to-gray-600', shadow: 'shadow-slate-500/20' };
    }
  };

  const styles = getRecStyles(data.recommendation);
  const displaySkills = [...data.skillsAnalysis].sort((a, b) => b.score - a.score).slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-8 border-b border-slate-300/50 dark:border-slate-700/60 pb-5">
        <div className="flex items-center gap-4">
           <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
             <Fingerprint className="w-5 h-5" />
           </div>
           <div>
             <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none mb-1">{candidateName}</h1>
             <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
           </div>
        </div>
        <button onClick={onReset} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-white transition-all shadow-sm hover:shadow">
          NEW SCAN
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Score Card */}
        <div className="lg:col-span-3">
           <div className={`h-full rounded-2xl relative overflow-hidden bg-gradient-to-br ${styles.gradient} p-6 text-white flex flex-col justify-between shadow-xl ${styles.shadow}`}>
              <div className="relative z-10">
                 <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-1 rounded backdrop-blur-md border border-white/20">Verdict</div>
                    <Activity className="w-4 h-4 opacity-80" />
                 </div>
                 <h2 className="text-3xl font-bold tracking-tight mb-1">{data.recommendation}</h2>
                 <div className="text-xs font-medium opacity-80">AI Confidence Level</div>
              </div>
              <div className="relative z-10 mt-6">
                 <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-mono font-bold">{data.confidenceScore}</span>
                    <span className="text-lg opacity-60 mb-1">%</span>
                 </div>
                 <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                   <div className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${data.confidenceScore}%` }}></div>
                 </div>
              </div>
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
           </div>
        </div>

        {/* Executive Summary */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-6 relative group transition-colors">
           <div className="flex items-center gap-2 mb-3">
             <User className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
             <h3 className="text-sm font-bold text-slate-800 dark:text-white">Executive Summary</h3>
           </div>
           <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-4">
             {data.summary}
           </p>
           <div className="grid grid-cols-3 gap-3">
              <MetricBox label="Ramp-Up" value={data.predictiveModeling.rampUpTime} />
              <MetricBox label="Retention" value={data.predictiveModeling.retentionRisk} color={data.predictiveModeling.retentionRisk === 'High' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'} />
              <MetricBox label="Culture" value={`${data.cultureFit.score}/100`} />
           </div>
        </div>

        {/* Risks */}
        <div className="lg:col-span-3 flex flex-col gap-3">
            <div className="glass-card rounded-2xl p-4 flex-1 border-l-4 border-l-indigo-500">
               <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Target className="w-3 h-3 text-indigo-500" /> Culture Fit
               </h3>
               <div className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-snug">{data.cultureFit.analysis.substring(0, 120)}...</div>
            </div>
            
            <div className={`glass-card rounded-2xl p-4 border-l-4 ${data.predictiveModeling.redFlags.length > 0 ? 'border-l-rose-500 bg-rose-50/50 dark:bg-rose-900/10' : 'border-l-emerald-500'}`}>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <AlertTriangle className={`w-3 h-3 ${data.predictiveModeling.redFlags.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`} /> Risk Assessment
                </h3>
                {data.predictiveModeling.redFlags.length > 0 ? (
                  <ul className="space-y-1">
                    {data.predictiveModeling.redFlags.slice(0, 2).map((flag, i) => (
                      <li key={i} className="flex items-center text-[10px] font-bold text-rose-700 dark:text-rose-400">
                         <span className="w-1 h-1 bg-rose-500 rounded-full mr-1.5"></span> {flag}
                      </li>
                    ))}
                  </ul>
                ) : <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">No significant risks detected.</div>}
            </div>
        </div>

        {/* Skills */}
        <div className="lg:col-span-12 glass-card rounded-2xl p-6">
           <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Skills Matrix</h3>
           </div>
           <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/3 h-[220px] relative">
                 <SkillsChart skills={data.skillsAnalysis} />
              </div>
              <div className="w-full md:w-2/3 grid grid-cols-2 gap-3">
                 {displaySkills.map((skill, idx) => (
                    <div key={idx} className="bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col justify-center hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-colors">
                       <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">{skill.name}</span>
                          <span className="font-mono text-[10px] text-slate-400 font-bold">{skill.score}%</span>
                       </div>
                       <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${skill.status === 'Inflation Risk' ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${skill.score}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Interview Guide */}
        <div className="lg:col-span-12 glass-card rounded-2xl p-6">
           <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-indigo-500"/> Interview Strategy</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.interviewGuide.map((item, idx) => (
                 <div key={idx} className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-all relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                    <div className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-2">{item.topic}</div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">"{item.question}"</p>
                    <div className="bg-slate-50/50 dark:bg-slate-900/50 p-2 rounded border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{item.rubric}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

const MetricBox = ({ label, value, color = 'text-slate-800 dark:text-white' }: { label: string, value: string, color?: string }) => (
  <div className="bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl p-3 text-center transition-colors">
     <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</div>
     <div className={`text-sm font-bold ${color}`}>{value}</div>
  </div>
);

export default AnalysisDashboard;