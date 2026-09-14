import React from 'react';
import { 
  Sparkles, Layers, Box, Rocket, Download, Monitor, 
  Smartphone, Tablet, HardDrive, Terminal, Shield, 
  ExternalLink, ChevronDown, CheckCircle2, RefreshCw, 
  Server, GitBranch as GitBranchIcon, Database, Bug, Zap
} from 'lucide-react';
import { Project } from '../types';

interface HeaderProps {
  activeTab: 'editor' | 'preview' | 'packages' | 'deploy' | 'database' | 'git';
  setActiveTab: (tab: 'editor' | 'preview' | 'packages' | 'deploy' | 'database' | 'git') => void;
  currentProject: Project;
  allProjects: Project[];
  onSelectProject: (proj: Project) => void;
  onOpenAiPrompt: () => void;
  onExportProject: () => void;
  isGenerating?: boolean;
  currentBranch?: string;
  onOpenAiRefactor?: () => void;
  onOpenAiDebugger?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentProject,
  allProjects,
  onSelectProject,
  onOpenAiPrompt,
  onExportProject,
  isGenerating = false,
  currentBranch = 'main',
  onOpenAiRefactor,
  onOpenAiDebugger,
}) => {
  return (
    <header className="h-14 bg-slate-950 border-b border-slate-800/90 px-4 flex items-center justify-between select-none z-40 sticky top-0 font-sans">
      {/* Brand & Project Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-400 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30">
            F
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-tight">Floxdon Studio</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Production PaaS
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Host: 0.0.0.0 (Floxdon Mesh)</span>
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

        {/* Project Selector */}
        <div className="relative group hidden sm:block">
          <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="max-w-[150px] truncate">{currentProject.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <div className="absolute left-0 top-full mt-1 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-2 py-1">Switch Project</div>
            {allProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectProject(p)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between transition ${
                  p.id === currentProject.id ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="truncate">{p.name}</span>
                <span className="text-[10px] opacity-75 font-mono uppercase">{p.platform}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800/80 overflow-x-auto max-w-[50vw] sm:max-w-none shrink">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition shrink-0 ${
            activeTab === 'editor'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition shrink-0 ${
            activeTab === 'preview'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Preview</span>
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition shrink-0 ${
            activeTab === 'packages'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span><span className="hidden md:inline">Native </span>Packages</span>
        </button>

        <button
          onClick={() => setActiveTab('deploy')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition shrink-0 ${
            activeTab === 'deploy'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Rocket className="w-3.5 h-3.5 text-emerald-400" />
          <span><span className="hidden md:inline">Deployment </span>PaaS</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition shrink-0 ${
            activeTab === 'database'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span><span className="hidden sm:inline">Postgre</span>SQL</span>
        </button>

        <button
          onClick={() => setActiveTab('git')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition shrink-0 ${
            activeTab === 'git'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <GitBranchIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>Git</span>
        </button>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {onOpenAiRefactor && (
          <button
            onClick={onOpenAiRefactor}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 text-xs font-medium transition"
            title="Refactor & Optimize Code with AI"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Refactor</span>
          </button>
        )}

        {onOpenAiDebugger && (
          <button
            onClick={onOpenAiDebugger}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-500/20 text-xs font-medium transition"
            title="Diagnose & Patch Code Errors with AI"
          >
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            <span>AI Debugger</span>
          </button>
        )}

        <button
          onClick={onOpenAiPrompt}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition active:scale-95 disabled:opacity-50 shrink-0"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isGenerating ? 'Synthesizing...' : 'Prompt to App'}</span>
          <span className="sm:hidden">{isGenerating ? '...' : 'AI'}</span>
        </button>

        <button
          onClick={onExportProject}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition shrink-0"
          title="Export Full Project Bundle"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
