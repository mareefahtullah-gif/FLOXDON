import React, { useState } from 'react';
import { 
  FileCode, FileText, Folder, FolderOpen, Plus, Trash2, 
  Search, Save, Play, Sparkles, Terminal as TerminalIcon, 
  MessageSquare, ChevronRight, ChevronDown, Check, X, 
  Layers, Copy, ExternalLink, RefreshCw, Send, AlertCircle,
  GitBranch as GitBranchIcon, Wrench, Bug, Zap, Maximize2, Minimize2
} from 'lucide-react';
import { Project, ProjectFile, ChatMessage } from '../types';

interface CodeEditorProps {
  project: Project;
  onUpdateFile: (path: string, newContent: string) => void;
  onAddFile: (path: string, content: string) => void;
  onDeleteFile: (path: string) => void;
  onRunBuild: () => void;
  onOpenAiRefactor?: (file: ProjectFile) => void;
  onOpenAiDebugger?: (errorInfo?: { errorMessage: string; errorStack?: string; sourceFile?: string }) => void;
  currentBranch?: string;
  onOpenGit?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  project,
  onUpdateFile,
  onAddFile,
  onDeleteFile,
  onRunBuild,
  onOpenAiRefactor,
  onOpenAiDebugger,
  currentBranch = 'main',
  onOpenGit,
}) => {
  const [openFiles, setOpenFiles] = useState<string[]>(['src/App.tsx', 'server/index.ts']);
  const [activeFilePath, setActiveFilePath] = useState<string>('src/App.tsx');
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [newFileInput, setNewFileInput] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isFileTreeOpen, setIsFileTreeOpen] = useState(true);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setIsFileTreeOpen(false);
    }
  }, []);

  const activeFile = project.files.find((f) => f.path === activeFilePath) || project.files[0];

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateFile(activeFilePath, e.target.value);
  };

  const handleOpenFile = (path: string) => {
    if (!openFiles.includes(path)) {
      setOpenFiles((prev) => [...prev, path]);
    }
    setActiveFilePath(path);
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setIsFileTreeOpen(false);
    }
  };

  const handleCloseTab = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    const remaining = openFiles.filter((p) => p !== path);
    setOpenFiles(remaining);
    if (activeFilePath === path) {
      setActiveFilePath(remaining[remaining.length - 1] || project.files[0]?.path || '');
    }
  };

  const handleCreateNewFile = () => {
    if (!newFileInput.trim()) return;
    const path = newFileInput.trim();
    onAddFile(path, `// ${path}\nexport default function File() {\n  return null;\n}\n`);
    setNewFileInput('');
    setIsCreatingFile(false);
    handleOpenFile(path);
  };

  const handleQuickAiEdit = () => {
    if (!aiPromptInput.trim() || !activeFile) return;
    setIsAiThinking(true);
    setTimeout(() => {
      const updatedCode = `// AI Modified: ${aiPromptInput}\n` + activeFile.content;
      onUpdateFile(activeFilePath, updatedCode);
      setAiPromptInput('');
      setIsAiThinking(false);
    }, 600);
  };

  const filteredFiles = project.files.filter((f) =>
    f.path.toLowerCase().includes(fileSearchQuery.toLowerCase())
  );

  const getFileIcon = (path: string) => {
    if (path.endsWith('.tsx') || path.endsWith('.ts') || path.endsWith('.js')) {
      return <FileCode className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (path.endsWith('.sql')) {
      return <FileText className="w-3.5 h-3.5 text-emerald-600" />;
    }
    if (path.endsWith('.json') || path.endsWith('.yml') || path.endsWith('.yaml')) {
      return <FileText className="w-3.5 h-3.5 text-amber-600" />;
    }
    if (path.endsWith('.xml') || path.endsWith('.plist')) {
      return <FileCode className="w-3.5 h-3.5 text-purple-600" />;
    }
    return <FileText className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden select-none font-sans">
      {/* Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left File Tree Sidebar */}
        {isFileTreeOpen && (
          <div className="w-52 sm:w-56 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 absolute sm:relative z-20 h-full shadow-lg sm:shadow-none">
            {/* File Explorer Header */}
            <div className="p-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Files
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsCreatingFile(!isCreatingFile)}
                  className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
                  title="Add File"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsFileTreeOpen(false)}
                  className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
                  title="Close file list"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          {/* New File Inline Form */}
          {isCreatingFile && (
            <div className="p-2 bg-white border-b border-slate-200 flex items-center gap-1">
              <input
                type="text"
                value={newFileInput}
                onChange={(e) => setNewFileInput(e.target.value)}
                placeholder="e.g. src/utils.ts"
                className="flex-1 bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateNewFile();
                  if (e.key === 'Escape') setIsCreatingFile(false);
                }}
              />
              <button
                onClick={handleCreateNewFile}
                className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsCreatingFile(false)}
                className="p-1 rounded hover:bg-slate-100 text-slate-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* File Search */}
          <div className="p-2 border-b border-slate-200">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
              <input
                type="text"
                value={fileSearchQuery}
                onChange={(e) => setFileSearchQuery(e.target.value)}
                placeholder="Filter files..."
                className="w-full bg-white border border-slate-200 rounded pl-6 pr-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 font-mono"
              />
            </div>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
            {filteredFiles.map((file) => (
              <div
                key={file.path}
                onClick={() => handleOpenFile(file.path)}
                className={`group px-2 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition ${
                  activeFilePath === file.path
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {getFileIcon(file.path)}
                  <span className="truncate font-mono text-[11px]">{file.path}</span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  {project.files.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.path);
                      }}
                      className="p-0.5 hover:text-rose-600 transition"
                      title="Delete file"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom branch tag */}
          <div className="p-2 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <button
              onClick={onOpenGit}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition"
              title="Open Git"
            >
              <GitBranchIcon className="w-3 h-3" />
              <span>{currentBranch}</span>
            </button>
            <span className="text-emerald-700 font-medium">{project.files.length} Files</span>
          </div>
        </div>
        )}

        {/* Center Main Editor */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Editor Tabs Bar */}
          <div className="min-h-[36px] bg-slate-50 border-b border-slate-200 flex items-center justify-between px-2 gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar min-w-0 flex-1">
              <button
                onClick={() => setIsFileTreeOpen((prev) => !prev)}
                className="px-2 py-1 rounded hover:bg-slate-200 text-slate-600 transition flex items-center gap-1 text-xs shrink-0"
                title={isFileTreeOpen ? "Hide File Tree" : "Show File Tree"}
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-medium hidden sm:inline">{isFileTreeOpen ? 'Hide' : 'Files'}</span>
              </button>
              {openFiles.map((filePath) => (
                <div
                  key={filePath}
                  onClick={() => setActiveFilePath(filePath)}
                  className={`px-2.5 py-1 rounded-t text-xs font-mono flex items-center gap-1.5 cursor-pointer transition border-b-2 shrink-0 ${
                    activeFilePath === filePath
                      ? 'bg-white text-blue-700 border-blue-600 font-semibold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-100'
                  }`}
                >
                  {getFileIcon(filePath)}
                  <span className="truncate max-w-[120px]">{filePath.split('/').pop()}</span>
                  <button
                    onClick={(e) => handleCloseTab(e, filePath)}
                    className="p-0.5 hover:text-slate-800 rounded hover:bg-slate-200 transition"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* AI Action Tools on Active File */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs shrink-0">
              {onOpenAiRefactor && activeFile && (
                <button
                  onClick={() => onOpenAiRefactor(activeFile)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-medium transition border border-indigo-200"
                  title="Optimize code algorithms & platform performance"
                >
                  <Zap className="w-3 h-3 text-indigo-600" />
                  <span className="hidden sm:inline">Refactor</span>
                </button>
              )}

              {onOpenAiDebugger && (
                <button
                  onClick={() => onOpenAiDebugger()}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-medium transition border border-rose-200"
                  title="Analyze errors and patch bugs"
                >
                  <Bug className="w-3 h-3 text-rose-600" />
                  <span className="hidden sm:inline">Debug</span>
                </button>
              )}

              <span className="text-[10px] font-mono text-slate-400 ml-1 hidden lg:inline max-w-[140px] truncate" title={activeFilePath}>
                {activeFilePath}
              </span>
            </div>
          </div>

          {/* Editor Content Area */}
          <div className="flex-1 relative flex overflow-hidden">
            {/* Line Numbers */}
            <div className="w-11 bg-slate-50 border-r border-slate-200 p-3 select-none text-right font-mono text-xs text-slate-400 leading-6 shrink-0">
              {activeFile ? (
                activeFile.content.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))
              ) : (
                <div>1</div>
              )}
            </div>

            {/* Code Textarea */}
            <textarea
              value={activeFile?.content || ''}
              onChange={handleEditorChange}
              spellCheck={false}
              className="flex-1 bg-white text-slate-900 font-mono text-xs p-3 leading-6 resize-none focus:outline-none focus:ring-0 overflow-auto whitespace-pre selection:bg-blue-100 selection:text-blue-900"
              placeholder="// Select or create a file to start editing..."
            />
          </div>

          {/* Quick AI Action Bar */}
          <div className="h-9 bg-slate-50 border-t border-slate-200 px-3 flex items-center justify-between text-xs">
            <div className="flex-1 flex items-center gap-2 text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-[11px] font-medium text-slate-700 shrink-0">AI Copilot:</span>
              <input
                type="text"
                value={aiPromptInput}
                onChange={(e) => setAiPromptInput(e.target.value)}
                placeholder={`Ask AI to edit, refactor, or add features to ${activeFilePath.split('/').pop()}...`}
                className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-0.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-sans"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleQuickAiEdit();
                }}
              />
              <button
                onClick={handleQuickAiEdit}
                disabled={isAiThinking || !aiPromptInput.trim()}
                className="px-2.5 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] flex items-center gap-1 disabled:opacity-50 transition"
              >
                <span>{isAiThinking ? 'Applying...' : 'Apply'}</span>
                <Send className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
