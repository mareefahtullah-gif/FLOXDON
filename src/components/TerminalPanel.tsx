import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, X, Play, Trash2, CornerDownLeft, 
  Copy, Check, Bug, Sparkles, Filter, ShieldAlert, CheckCircle2,
  RefreshCw, ArrowDown
} from 'lucide-react';
import { Project, TerminalEntry } from '../types';

interface TerminalPanelProps {
  project?: Project;
  onClose?: () => void;
  onAnalyzeError?: (errorInfo: { errorMessage: string; errorStack?: string; sourceFile?: string }) => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  project,
  onClose,
  onAnalyzeError,
}) => {
  const projName = project?.name || 'Floxdon App';
  const projSlug = project?.slug || 'floxdon-app';
  const projPlatform = project?.platform || 'web';

  const [entries, setEntries] = useState<TerminalEntry[]>([
    {
      id: 'init-1',
      type: 'system',
      content: `Floxdon Studio Shell v3.4.0 (x86_64-alpine-linux)\nProject: ${projName} (${projSlug})\nPlatform: ${projPlatform.toUpperCase()} • Container Mesh Active`,
      timestamp: '07:14:00',
    },
    {
      id: 'init-2',
      type: 'output',
      content: `✓ Node.js 20.12.0 LTS active\n✓ PostgreSQL 16.2 running on localhost:5432\n✓ Capacitor Android SDK 34 ready\n✓ Electron 30.0.0 bundler installed`,
      timestamp: '07:14:01',
    },
    {
      id: 'init-3',
      type: 'command',
      content: 'npm run build',
      timestamp: '07:14:03',
    },
    {
      id: 'init-4',
      type: 'output',
      content: `> ${projSlug}@1.0.0 build\n> vite build\n✓ 48 modules transformed in 420ms.\ndist/index.html 0.62 kB\ndist/assets/index.js 142 kB\n✓ Built successfully. Zero fatal errors.`,
      timestamp: '07:14:04',
    }
  ]);

  const [inputCommand, setInputCommand] = useState('');
  const [history, setHistory] = useState<string[]>(['npm run build']);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [activeTab, setActiveTab] = useState<'all' | 'build' | 'docker' | 'git' | 'database' | 'errors'>('all');
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries, activeTab]);

  const handleRunCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    const commandEntry: TerminalEntry = {
      id: `cmd_${Date.now()}`,
      type: 'command',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString(),
    };

    let responseOutput = '';
    let isError = false;
    let sourceError: { file?: string; line?: number; errorText: string } | undefined;

    const lower = trimmed.toLowerCase();

    if (lower === 'help') {
      responseOutput = `Available Floxdon commands:
  • npm run build       - Compiles Vite bundle & platform assets
  • docker ps           - Lists PaaS container services
  • docker-compose up   - Boots web, api, and database containers
  • git status          - Shows working tree status and active branch
  • git log --oneline   - Shows recent commit history
  • psql                - Connects to local PostgreSQL 16 database
  • npx cap sync        - Syncs web assets to Capacitor Android & iOS shells
  • electron-builder    - Bundles Windows .exe & macOS .dmg installers
  • clear               - Clears terminal output`;
    } else if (lower === 'clear') {
      setEntries([]);
      setInputCommand('');
      return;
    } else if (lower === 'docker ps') {
      responseOutput = `CONTAINER ID   IMAGE                 COMMAND                  STATUS          PORTS
a81f0923e11    forgestudio-web:latest   "nginx -g 'daemon of…"   Up 4 hours      0.0.0.0:80->80/tcp
b92e1034f22    forgestudio-api:latest   "node dist/server.js"    Up 4 hours      0.0.0.0:3000->3000/tcp
c03d2145e33    postgres:16-alpine       "docker-entrypoint.s…"   Up 4 hours      0.0.0.0:5432->5432/tcp`;
    } else if (lower === 'git status') {
      responseOutput = `On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean`;
    } else if (lower === 'psql' || lower.includes('select')) {
      responseOutput = `psql (PostgreSQL 16.2 (Debian 16.2-1.pgdg120+2))
Type "help" for help.

forgestudio_db=# SELECT count(*) FROM telemetry_events;
 count 
-------
 24890
(1 row)`;
    } else {
      responseOutput = `bash: ${trimmed}: command executed (PID: ${Math.floor(1000 + Math.random() * 9000)}, exit code 0)`;
    }

    const outputEntry: TerminalEntry = {
      id: `out_${Date.now()}`,
      type: isError ? 'error' : 'output',
      content: responseOutput,
      timestamp: new Date().toLocaleTimeString(),
      sourceError,
    };

    setEntries((prev) => [...prev, commandEntry, outputEntry]);
    setInputCommand('');
  };

  const handleCopyLogs = () => {
    const text = entries.map((e) => `[${e.timestamp}] ${e.content}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredEntries = entries.filter((e) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'errors') return e.type === 'error';
    if (activeTab === 'build') return e.content.includes('build') || e.content.includes('vite') || e.content.includes('dist');
    if (activeTab === 'docker') return e.content.includes('docker') || e.content.includes('container') || e.content.includes('nginx');
    if (activeTab === 'git') return e.content.includes('git') || e.content.includes('branch') || e.content.includes('commit');
    if (activeTab === 'database') return e.content.includes('psql') || e.content.includes('postgres') || e.content.includes('5432');
    return true;
  });

  const errorCount = entries.filter((e) => e.type === 'error').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-white font-mono text-xs overflow-hidden select-text">
      {/* Terminal Title Bar */}
      <div className="h-8 bg-slate-50 border-b border-slate-200 px-3 flex items-center justify-between text-slate-600 select-none shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-bold text-slate-800">Terminal & Console</span>
          </div>

          {/* Filter tabs */}
          <div className="hidden sm:flex items-center gap-1 text-[11px]">
            {[
              { id: 'all', label: 'All Output' },
              { id: 'build', label: 'Build' },
              { id: 'docker', label: 'Docker' },
              { id: 'git', label: 'Git' },
              { id: 'database', label: 'Database' },
              { id: 'errors', label: `Errors (${errorCount})`, isErr: true },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2 py-0.5 rounded transition ${
                  activeTab === tab.id
                    ? tab.isErr && errorCount > 0
                      ? 'bg-rose-600 text-white font-semibold'
                      : 'bg-white text-blue-700 font-semibold shadow-2xs border border-slate-200'
                    : tab.isErr && errorCount > 0
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyLogs}
            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
            title="Copy logs to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setEntries([])}
            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-slate-50/50">
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="leading-relaxed">
            {entry.type === 'command' && (
              <div className="flex items-start gap-2 text-slate-900 font-bold">
                <span className="text-blue-600 select-none">$</span>
                <span>{entry.content}</span>
                <span className="text-slate-400 text-[10px] ml-auto select-none font-normal">{entry.timestamp}</span>
              </div>
            )}

            {entry.type === 'output' && (
              <div className="pl-4 text-slate-700 whitespace-pre-wrap">
                {entry.content}
              </div>
            )}

            {entry.type === 'system' && (
              <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-blue-900 whitespace-pre-wrap">
                {entry.content}
              </div>
            )}

            {entry.type === 'error' && (
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Error:</span>
                </div>
                <div className="whitespace-pre-wrap pl-5">{entry.content}</div>
                {onAnalyzeError && entry.sourceError && (
                  <button
                    onClick={() =>
                      onAnalyzeError({
                        errorMessage: entry.sourceError!.errorText,
                        sourceFile: entry.sourceError!.file,
                        errorStack: entry.sourceError!.line ? `Line ${entry.sourceError!.line}` : undefined,
                      })
                    }
                    className="mt-1 ml-5 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-medium text-[11px] flex items-center gap-1 shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Debug & Patch with AI</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Input Prompt */}
      <div className="p-2 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0">
        <span className="text-blue-600 font-bold select-none pl-2">$</span>
        <input
          type="text"
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleRunCommand(inputCommand);
            } else if (e.key === 'ArrowUp') {
              if (history.length > 0) {
                const nextIdx = historyIdx < history.length - 1 ? historyIdx + 1 : historyIdx;
                setHistoryIdx(nextIdx);
                setInputCommand(history[history.length - 1 - nextIdx] || '');
              }
            } else if (e.key === 'ArrowDown') {
              if (historyIdx > 0) {
                const nextIdx = historyIdx - 1;
                setHistoryIdx(nextIdx);
                setInputCommand(history[history.length - 1 - nextIdx] || '');
              } else {
                setHistoryIdx(-1);
                setInputCommand('');
              }
            }
          }}
          placeholder="Type command (try 'help', 'npm run build', 'docker ps', 'psql')..."
          className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none font-mono text-xs"
        />
        <button
          onClick={() => handleRunCommand(inputCommand)}
          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
        >
          Run
        </button>
      </div>
    </div>
  );
};
