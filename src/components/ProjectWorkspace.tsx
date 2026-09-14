import React, { useState, useRef, useEffect } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Columns,
  Maximize2,
  Minimize2,
  FileCode,
  Sparkles,
  Terminal,
  MessageSquare,
  Cpu,
  AlertCircle,
  GitBranch,
  Rocket,
  Download,
  Zap,
  Bug,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  Send,
  Layers,
  Search,
  Share2,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { Project, ProjectFile, GitRepoState, GitCommit, ChatMessage, DeviceView } from '../types';
import { CodeEditor } from './CodeEditor';
import { LivePreview } from './LivePreview';
import { TerminalPanel } from './TerminalPanel';

interface ProjectWorkspaceProps {
  project: Project;
  onUpdateFile: (path: string, newContent: string) => void;
  onAddFile: (path: string, content: string) => void;
  onDeleteFile: (path: string) => void;
  gitState: GitRepoState;
  onCommit: (message: string) => void;
  onStageFile: (path: string) => void;
  onRestoreCommit: (commit: GitCommit) => void;
  onOpenAiPrompt: () => void;
  onOpenAiRefactor: (file?: ProjectFile) => void;
  onOpenAiDebugger: (errorInfo?: any) => void;
  onNavigateBuilds: () => void;
  onNavigateDeployments: () => void;
  onExportProject: () => void;
  showNotification: (msg: string) => void;
  onOpenPWAInstall?: () => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  project,
  onUpdateFile,
  onAddFile,
  onDeleteFile,
  gitState,
  onCommit,
  onStageFile,
  onRestoreCommit,
  onOpenAiPrompt,
  onOpenAiRefactor,
  onOpenAiDebugger,
  onNavigateBuilds,
  onNavigateDeployments,
  onExportProject,
  showNotification,
  onOpenPWAInstall,
}) => {
  // View mode: 'split' | 'code' | 'preview'
  const [viewMode, setViewMode] = useState<'split' | 'code' | 'preview'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return 'preview';
    }
    return 'split';
  });
  // Device preview target: 'web' | 'mobile' | 'tablet' | 'desktop'
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');
  // Split ratio: 50% default
  const [splitRatio, setSplitRatio] = useState<number>(50);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Bottom drawer state: 'terminal' | 'ai' | 'build-logs' | 'problems' | 'git' | 'closed'
  const [bottomDrawerTab, setBottomDrawerTab] = useState<'terminal' | 'ai' | 'build-logs' | 'problems' | 'git' | 'closed'>('closed');

  // Tools menu dropdown state
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);

  // Quick commit input for Git tab in drawer
  const [commitMessageInput, setCommitMessageInput] = useState('');

  // Handle resizable split panel dragging & screen responsiveness
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      setIsMobileScreen(isMobile);
      if (isMobile && viewMode === 'split') {
        setViewMode('preview');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let newRatio: number;
      if (isMobileScreen) {
        newRatio = ((clientY - rect.top) / rect.height) * 100;
      } else {
        newRatio = ((clientX - rect.left) / rect.width) * 100;
      }
      // Clamp between 20% and 80%
      if (newRatio >= 20 && newRatio <= 80) {
        setSplitRatio(Math.round(newRatio));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isMobileScreen]);

  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    document.body.style.cursor = isMobileScreen ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Diagnostic problems
  const diagnostics = [
    {
      id: 'diag-1',
      file: 'src/App.tsx',
      line: 42,
      severity: 'warning' as const,
      message: 'Unused state variable "isSyncing" can be optimized or memoized.',
    },
    {
      id: 'diag-2',
      file: 'server/index.ts',
      line: 18,
      severity: 'info' as const,
      message: 'CORS whitelist initialized with local network fallback (*).',
    },
  ];

  const buildLogsSample = [
    `[Vite] Transforming client source code (48 modules)...`,
    `[Capacitor] Android SDK 34 platform bindings verified.`,
    `[Docker] Host daemon bridge: 0 port collisions detected.`,
    `[PostgreSQL] Connection pool established (max_connections: 50).`,
    `[Ready] Live hot-reload server listening on port 3000.`,
  ];

  return (
    <div id="project-workspace-root" className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden select-none">
      {/* Top Unified Workspace Toolbar */}
      <div className="min-h-[40px] bg-white border-b border-slate-200 px-2 sm:px-3 py-1 flex items-center justify-between text-xs text-slate-700 shrink-0 gap-1.5 sm:gap-2">
        {/* Left: Project title & Platform Badge */}
        <div className="flex items-center gap-1.5 shrink-0 min-w-0">
          <span className="font-bold text-slate-900 font-mono tracking-tight text-xs sm:text-sm truncate max-w-[80px] xs:max-w-[130px] sm:max-w-[180px] md:max-w-[240px]" title={project.name}>
            {project.name}
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase font-semibold shrink-0">
            {project.platform}
          </span>
        </div>

        {/* Center: Responsive View Mode & Device Preview Switchers */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* View Mode Toggle: [ Code | (Split on desktop) | Preview ] */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] sm:text-[11px]">
            <button
              onClick={() => setViewMode('code')}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition font-medium ${
                viewMode === 'code' ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Code
            </button>

            {/* Side-by-side only on desktop screens */}
            {!isMobileScreen && (
              <button
                onClick={() => setViewMode('split')}
                className={`hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-md transition font-medium ${
                  viewMode === 'split' ? 'bg-white text-blue-700 font-semibold shadow-2xs border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns className="w-3 h-3" />
                <span>Split</span>
                <span className="text-[10px] text-slate-400 font-mono ml-0.5">{splitRatio}:{100 - splitRatio}</span>
              </button>
            )}

            <button
              onClick={() => setViewMode('preview')}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition font-medium ${
                viewMode === 'preview' ? 'bg-white text-blue-700 font-semibold shadow-2xs border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Preview
            </button>
          </div>

          {/* Device Preview Mode Buttons: Only shown when preview or split is active */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="hidden sm:flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
              <button
                onClick={() => setDeviceView('web')}
                className={`p-1 sm:px-2 sm:py-0.5 rounded-md transition font-medium flex items-center gap-1 ${
                  deviceView === 'web' ? 'bg-white text-blue-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Web responsive"
              >
                <Monitor className="w-3 h-3" />
                <span className="hidden md:inline">Web</span>
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                className={`p-1 sm:px-2 sm:py-0.5 rounded-md transition font-medium flex items-center gap-1 ${
                  deviceView === 'mobile' ? 'bg-white text-blue-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mobile screen"
              >
                <Smartphone className="w-3 h-3 text-emerald-600" />
                <span className="hidden md:inline">Mobile</span>
              </button>
              <button
                onClick={() => setDeviceView('tablet')}
                className={`p-1 sm:px-2 sm:py-0.5 rounded-md transition font-medium flex items-center gap-1 ${
                  deviceView === 'tablet' ? 'bg-white text-blue-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tablet screen"
              >
                <Tablet className="w-3 h-3 text-cyan-600" />
                <span className="hidden md:inline">Tablet</span>
              </button>
              <button
                onClick={() => setDeviceView('desktop')}
                className={`p-1 sm:px-2 sm:py-0.5 rounded-md transition font-medium flex items-center gap-1 ${
                  deviceView === 'desktop' ? 'bg-white text-blue-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Desktop window"
              >
                <Laptop className="w-3 h-3 text-indigo-600" />
                <span className="hidden md:inline">Desktop</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Clean, Smart Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onOpenAiPrompt}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-[11px] font-semibold shadow-2xs transition active:scale-95"
            title="Describe modifications with AI"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden xs:inline">AI Prompt</span>
          </button>

          <button
            onClick={onNavigateBuilds}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-[11px] font-medium transition"
            title="Build APK, IPA, or Desktop"
          >
            <Cpu className="w-3 h-3 text-slate-600" />
            <span className="hidden md:inline">Build</span>
          </button>

          <button
            onClick={onNavigateDeployments}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] sm:text-[11px] font-semibold transition active:scale-95"
            title="Deploy stack to PaaS"
          >
            <Rocket className="w-3 h-3 text-emerald-400" />
            <span className="hidden xs:inline">Deploy</span>
          </button>

          {/* Secondary Tools on Large Desktop */}
          <div className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => onOpenAiRefactor()}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-[11px] font-medium transition"
              title="Refactor & optimize code"
            >
              <Zap className="w-3 h-3 text-indigo-600" />
              <span>Refactor</span>
            </button>

            <button
              onClick={() => onOpenAiDebugger()}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-medium transition"
              title="AI Debugger"
            >
              <Bug className="w-3 h-3 text-rose-600" />
              <span>Debug</span>
            </button>

            {onOpenPWAInstall && (
              <button
                onClick={onOpenPWAInstall}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-medium transition"
                title="Install PWA"
              >
                <Download className="w-3 h-3 text-emerald-600" />
                <span>PWA</span>
              </button>
            )}
          </div>

          {/* More Tools Dropdown for all screen sizes */}
          <div className="relative">
            <button
              onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition"
              title="Additional Workspace Tools"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {isToolsMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 space-y-1 text-xs">
                <button
                  onClick={() => {
                    onOpenAiRefactor();
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-left transition"
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AI Code Optimizer</span>
                </button>
                <button
                  onClick={() => {
                    onOpenAiDebugger();
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-left transition"
                >
                  <Bug className="w-3.5 h-3.5 text-rose-600" />
                  <span>AI Debugger</span>
                </button>
                <button
                  onClick={() => {
                    onNavigateBuilds();
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-left transition"
                >
                  <Cpu className="w-3.5 h-3.5 text-slate-600" />
                  <span>Build APK / Binaries</span>
                </button>
                {onOpenPWAInstall && (
                  <button
                    onClick={() => {
                      onOpenPWAInstall();
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-left transition"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Install PWA</span>
                  </button>
                )}
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => {
                    onExportProject();
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-left transition"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download ZIP Archive</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Split View Area */}
      <div
        ref={containerRef}
        className={`flex-1 flex ${isMobileScreen && viewMode === 'split' ? 'flex-col' : 'flex-row'} overflow-hidden relative`}
      >
        {/* Left Pane: Code Editor */}
        {(viewMode === 'split' || viewMode === 'code') && (
          <div
            style={{
              width: !isMobileScreen && viewMode === 'split' ? `${splitRatio}%` : '100%',
              height: isMobileScreen && viewMode === 'split' ? `${splitRatio}%` : '100%',
            }}
            className={`flex flex-col overflow-hidden border-slate-200 ${
              isMobileScreen && viewMode === 'split' ? 'border-b' : 'border-r'
            }`}
          >
            <CodeEditor
              project={project}
              onUpdateFile={onUpdateFile}
              onAddFile={onAddFile}
              onDeleteFile={onDeleteFile}
              onRunBuild={onNavigateBuilds}
              onOpenAiRefactor={onOpenAiRefactor}
              onOpenAiDebugger={onOpenAiDebugger}
              currentBranch={gitState.currentBranch}
              onOpenGit={() => setBottomDrawerTab('git')}
            />
          </div>
        )}

        {/* Resizable Split Handle */}
        {viewMode === 'split' && (
          <div
            onMouseDown={handleStartDrag}
            onTouchStart={handleStartDrag}
            onDoubleClick={() => setSplitRatio(50)}
            className={`${
              isMobileScreen
                ? 'h-2.5 -my-1 hover:h-3 cursor-row-resize'
                : 'w-2.5 -mx-1 hover:w-3 cursor-col-resize'
            } transition-all relative group select-none z-20 flex items-center justify-center bg-transparent`}
            title="Drag to resize panels (Double-click to reset 50/50)"
          >
            <div
              className={`${
                isMobileScreen ? 'h-1 w-full' : 'w-1 h-full'
              } bg-slate-200 group-hover:bg-blue-500 transition-colors`}
            />
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                isMobileScreen ? 'w-9 h-4' : 'w-4 h-9'
              } rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center text-[10px] text-slate-500 group-hover:text-blue-600 group-hover:border-blue-400 pointer-events-none`}
            >
              {isMobileScreen ? '⋯' : '⋮'}
            </div>
          </div>
        )}

        {/* Right Pane: Live Responsive Preview */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            style={{
              width: !isMobileScreen && viewMode === 'split' ? `${100 - splitRatio}%` : '100%',
              height: isMobileScreen && viewMode === 'split' ? `${100 - splitRatio}%` : '100%',
            }}
            className="flex flex-col overflow-hidden bg-slate-100"
          >
            <LivePreview
              project={project}
              onNavigateToEditor={() => setViewMode('code')}
              externalDevice={deviceView}
              onDeviceChange={(dev) => setDeviceView(dev)}
              onOpenPWAInstall={onOpenPWAInstall}
            />
          </div>
        )}
      </div>

      {/* Bottom Collapsible Drawer (Terminal / Git / Logs / AI) */}
      <div className="border-t border-slate-200 bg-white shrink-0">
        {/* Drawer Header Tabs */}
        <div className="h-8 bg-slate-50 border-b border-slate-200 px-3 flex items-center justify-between text-xs text-slate-600 overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setBottomDrawerTab(bottomDrawerTab === 'terminal' ? 'closed' : 'terminal')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                bottomDrawerTab === 'terminal'
                  ? 'bg-white text-blue-700 font-semibold shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3 h-3 text-blue-600" />
              <span>Terminal</span>
            </button>

            <button
              onClick={() => setBottomDrawerTab(bottomDrawerTab === 'build-logs' ? 'closed' : 'build-logs')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                bottomDrawerTab === 'build-logs'
                  ? 'bg-white text-blue-700 font-semibold shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3 h-3 text-cyan-600" />
              <span>Build Output</span>
            </button>

            <button
              onClick={() => setBottomDrawerTab(bottomDrawerTab === 'problems' ? 'closed' : 'problems')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                bottomDrawerTab === 'problems'
                  ? 'bg-white text-blue-700 font-semibold shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertCircle className="w-3 h-3 text-amber-500" />
              <span>Diagnostics (2)</span>
            </button>

            <button
              onClick={() => setBottomDrawerTab(bottomDrawerTab === 'git' ? 'closed' : 'git')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                bottomDrawerTab === 'git'
                  ? 'bg-white text-blue-700 font-semibold shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitBranch className="w-3 h-3 text-emerald-600" />
              <span>Git ({gitState.currentBranch})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Vite :3000 Ready
            </span>
            <button
              onClick={() => setBottomDrawerTab(bottomDrawerTab === 'closed' ? 'terminal' : 'closed')}
              className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
              title={bottomDrawerTab === 'closed' ? 'Expand Drawer' : 'Collapse Drawer'}
            >
              {bottomDrawerTab === 'closed' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        {bottomDrawerTab !== 'closed' && (
          <div className="h-44 bg-white overflow-y-auto">
            {bottomDrawerTab === 'terminal' && (
              <div className="h-full">
                <TerminalPanel />
              </div>
            )}

            {bottomDrawerTab === 'build-logs' && (
              <div className="p-3 font-mono text-xs text-slate-700 space-y-1 bg-slate-50 h-full overflow-y-auto">
                {buildLogsSample.map((log, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-slate-400 text-[10px] select-none">{index + 1}</span>
                    <span className={log.includes('Ready') ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {bottomDrawerTab === 'problems' && (
              <div className="p-3 space-y-2 h-full overflow-y-auto">
                {diagnostics.map((diag) => (
                  <div
                    key={diag.id}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="font-mono text-slate-600">{diag.file}:{diag.line}</span>
                      <span className="text-slate-800">{diag.message}</span>
                    </div>
                    <button
                      onClick={() => onOpenAiDebugger({ errorMessage: diag.message, sourceFile: diag.file })}
                      className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-medium border border-blue-200 transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Fix with AI</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {bottomDrawerTab === 'git' && (
              <div className="p-3 h-full overflow-y-auto flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">Quick Commit to {gitState.currentBranch}</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commitMessageInput}
                      onChange={(e) => setCommitMessageInput(e.target.value)}
                      placeholder="Commit message (e.g., feat: responsive layout)..."
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (commitMessageInput.trim()) {
                          onCommit(commitMessageInput.trim());
                          setCommitMessageInput('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
                    >
                      Commit
                    </button>
                  </div>
                </div>

                <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200 md:pl-4 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700">Recent Commits ({gitState.commits.length})</div>
                  <div className="space-y-1 text-xs font-mono max-h-24 overflow-y-auto">
                    {gitState.commits.slice(0, 3).map((c) => (
                      <div key={c.hash} className="p-1.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div className="truncate">
                          <span className="text-blue-600 font-bold">{c.hash}</span>: {c.message}
                        </div>
                        <button
                          onClick={() => onRestoreCommit(c)}
                          className="text-[10px] text-slate-500 hover:text-blue-600 ml-2 shrink-0"
                          title="Checkout commit"
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
