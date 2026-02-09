import React, { useState } from 'react';
import { Upload, FileText, Briefcase, ChevronRight, Sparkles, Wand2, FileType, Zap, ScanLine } from 'lucide-react';

interface InputFormProps {
  onSubmit: (name: string, resume: string, jd: string) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [name, setName] = useState('');
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/plain' || file.name.endsWith('.md')) {
        const text = await file.text();
        setResume(text);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain' || file.name.endsWith('.md')) {
         const text = await file.text();
         setResume(text);
      } else alert("Please upload .txt or .md files.");
    }
  };

  const handleDemoFill = () => {
    setName("Alex Chen");
    setResume(`Alex Chen\nSenior Full Stack Engineer\nSUMMARY\nResults-driven software engineer with 8 years of experience. Expert in React, Node.js.\nEXPERIENCE\nTechFlow Inc. | Senior Engineer\n- Led microservices migration.\nSKILLS\nJavaScript, TypeScript, React, Node.js, AWS.`);
    setJd(`Senior Full Stack Engineer\nRequirements:\n- 5+ years experience.\n- Strong React and Node.js.\n- Cloud experience.`);
  };

  return (
    <div className="max-w-5xl mx-auto pt-6 animate-fade-in pb-20">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-white mb-3 tracking-tighter transition-colors">
          Intelligence <span className="text-gradient">Scanner</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-lg mx-auto transition-colors">
          AI-driven candidate analysis engine. Predict success factors and cultural alignment instantly.
        </p>
      </div>

      <div className="glass-panel rounded-[24px] p-2 shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-500/10 bg-gradient-to-b from-white/80 to-white/40 dark:from-slate-800 dark:to-slate-900/50 transition-colors">
        <div className="bg-white/50 dark:bg-slate-900/60 rounded-[20px] p-6 md:p-8 backdrop-blur-xl border border-white/60 dark:border-white/5 relative overflow-hidden transition-colors">
          
          {/* Scanner Line Animation */}
          {isLoading && <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.8)] animate-[scan_2s_ease-in-out_infinite] z-20"></div>}

          <div className="mb-6">
            <div className="relative group">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-4 bg-white/60 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-lg font-medium placeholder-slate-400 text-slate-900 dark:text-slate-100" placeholder="Candidate Name (e.g. Alex Chen)" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume Input */}
            <div className={`relative flex flex-col min-h-[260px] rounded-2xl border-2 border-dashed transition-all duration-300 group ${dragActive ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
               <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">Resume Data</span>
               </div>
               <textarea value={resume} onChange={(e) => setResume(e.target.value)} className="w-full h-full p-6 pt-12 bg-transparent outline-none resize-none text-xs font-mono text-slate-600 dark:text-slate-300 relative z-10 leading-relaxed custom-scrollbar" placeholder="Drag & Drop Resume (TXT/MD) or Paste Text..." />
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <FileText className="w-20 h-20 text-indigo-500/10 dark:text-indigo-500/10 transform scale-90 group-hover:scale-100 transition-transform duration-500" />
               </div>
               <div className="absolute bottom-4 right-4 z-20">
                 <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-500 transition-all text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md">
                   <Upload className="w-3 h-3" /> Upload
                   <input type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
                 </label>
               </div>
            </div>

            {/* JD Input */}
            <div className="relative flex flex-col min-h-[260px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 shadow-inner focus-within:ring-2 focus-within:ring-purple-500/10 focus-within:border-purple-400 transition-all">
               <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">Target Role</span>
               </div>
               <textarea value={jd} onChange={(e) => setJd(e.target.value)} className="w-full h-full p-6 pt-12 bg-transparent outline-none resize-none text-xs font-mono text-slate-600 dark:text-slate-300 leading-relaxed custom-scrollbar" placeholder="Paste Job Description..." />
               <div className="absolute bottom-4 right-4 pointer-events-none">
                  <Briefcase className="w-14 h-14 text-slate-200 dark:text-slate-700/50" />
               </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700/50">
            <button type="button" onClick={handleDemoFill} className="flex items-center text-xs font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 uppercase tracking-wider">
              <Wand2 className="w-3.5 h-3.5 mr-2" /> Load Demo Data
            </button>

            <button onClick={() => onSubmit(name, resume, jd)} disabled={isLoading || !resume || !jd} className={`group relative flex items-center justify-center px-8 py-3 rounded-xl font-bold text-white shadow-xl transition-all duration-300 overflow-hidden ${isLoading || !resume || !jd ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed shadow-none' : 'bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:shadow-indigo-500/30 hover:scale-[1.02]'}`}>
              <div className="relative z-10 flex items-center gap-2 text-sm tracking-wide">
                {isLoading ? <><ScanLine className="animate-spin w-4 h-4"/> Processing...</> : <><Zap className="w-4 h-4 fill-white"/> Run Analysis</>}
              </div>
              {!isLoading && <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputForm;