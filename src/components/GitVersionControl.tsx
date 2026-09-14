import React, { useState } from 'react';
import { 
  GitBranch as GitBranchIcon, GitCommit as GitCommitIcon, 
  GitPullRequest, History, Check, Plus, Trash2, RotateCcw, 
  Sparkles, FileText, FileCode, CheckCircle2, ChevronRight, 
  ArrowRight, FolderGit2, AlertCircle, Eye, RefreshCw, X
} from 'lucide-react';
import { Project, GitCommit, GitBranch, GitRepoState, GitFileDiff } from '../types';

interface GitVersionControlProps {
  project: Project;
  gitState: GitRepoState;
  onCommit: (message: string) => void;
  onStageFile: (path: string) => void;
  onUnstageFile: (path: string) => void;
  onStageAll: () => void;
  onUnstageAll: () => void;
  onSwitchBranch: (branchName: string) => void;
  onCreateBranch: (branchName: string) => void;
  onRestoreCommit: (commit: GitCommit) => void;
  onRestoreFileFromCommit: (commit: GitCommit, filePath: string) => void;
}

export const GitVersionControl: React.FC<GitVersionControlProps> = ({
  project,
  gitState,
  onCommit,
  onStageFile,
  onUnstageFile,
  onStageAll,
  onUnstageAll,
  onSwitchBranch,
  onCreateBranch,
  onRestoreCommit,
  onRestoreFileFromCommit,
}) => {
  const [activeTab, setActiveTab] = useState<'changes' | 'history' | 'branches'>('changes');
  const [commitMessage, setCommitMessage] = useState('');
  const [isAiGeneratingMsg, setIsAiGeneratingMsg] = useState(false);
  const [newBranchInput, setNewBranchInput] = useState('');
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [selectedDiffFile, setSelectedDiffFile] = useState<string>('src/App.tsx');
  const [selectedCommit, setSelectedCommit] = useState<GitCommit | null>(gitState.commits[0] || null);

  // Derive modified files by comparing current project files with last commit snapshot
  const lastCommit = gitState.commits[0];
  const modifiedFiles: { path: string; status: 'modified' | 'added' | 'deleted'; diffLines: string[] }[] = [];

  project.files.forEach((file) => {
    const original = lastCommit?.snapshot?.[file.path];
    if (original === undefined) {
      modifiedFiles.push({
        path: file.path,
        status: 'added',
        diffLines: file.content.split('\n').map((l) => `+ ${l}`),
      });
    } else if (original !== file.content) {
      const origLines = original.split('\n');
      const currLines = file.content.split('\n');
      const diffLines: string[] = [];

      // Simple unified diff representation
      const maxLen = Math.max(origLines.length, currLines.length);
      for (let i = 0; i < maxLen; i++) {
        if (origLines[i] !== currLines[i]) {
          if (origLines[i] !== undefined) diffLines.push(`- ${origLines[i]}`);
          if (currLines[i] !== undefined) diffLines.push(`+ ${currLines[i]}`);
        } else if (i < 5) {
          diffLines.push(`  ${currLines[i]}`);
        }
      }

      modifiedFiles.push({
        path: file.path,
        status: 'modified',
        diffLines: diffLines.length > 0 ? diffLines : [`+ // File updated`],
      });
    }
  });

  const stagedFiles = modifiedFiles.filter((f) => gitState.stagedFiles.includes(f.path));
  const unstagedFiles = modifiedFiles.filter((f) => !gitState.stagedFiles.includes(f.path));

  const handleGenerateAiCommitMessage = () => {
    setIsAiGeneratingMsg(true);
    setTimeout(() => {
      const filesSummary = stagedFiles.length > 0 ? stagedFiles.map((s) => s.path.split('/').pop()).join(', ') : 'core logic';
      const presets = [
        `feat(${project.slug}): enhance multi-platform bindings & update ${filesSummary}`,
        `refactor(${project.slug}): optimize container performance and state hydration`,
        `fix(${project.slug}): harden API error guards and improve mobile touch layout`,
        `chore(${project.slug}): update database schema migrations and packaging config`,
      ];
      setCommitMessage(presets[Math.floor(Math.random() * presets.length)]);
      setIsAiGeneratingMsg(false);
    }, 450);
  };

  const handleCreateBranchSubmit = () => {
    if (!newBranchInput.trim()) return;
    const cleanName = newBranchInput.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-_/]/g, '');
    onCreateBranch(cleanName);
    setNewBranchInput('');
    setIsCreatingBranch(false);
  };

  const currentDiff = modifiedFiles.find((f) => f.path === selectedDiffFile) || modifiedFiles[0];

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto select-none font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">Git Version Control</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
                  <GitBranchIcon className="w-3 h-3" />
                  {gitState.currentBranch}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Repo Initialized
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Integrated Git repository with branching, staging, line diffs, and version rollbacks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => setActiveTab('changes')}
                className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'changes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitCommitIcon className="w-3.5 h-3.5" />
                <span>Working Tree</span>
                {modifiedFiles.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                    {modifiedFiles.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Commit History</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-400 font-mono">
                  {gitState.commits.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('branches')}
                className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'branches' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitBranchIcon className="w-3.5 h-3.5" />
                <span>Branches</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-400 font-mono">
                  {gitState.branches.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Working Tree & Staged Changes */}
        {activeTab === 'changes' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Staging & Commit Box */}
            <div className="lg:col-span-5 space-y-4">
              {/* Commit Box */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <GitCommitIcon className="w-3.5 h-3.5 text-blue-400" />
                    Commit Staged Changes
                  </span>
                  <button
                    onClick={handleGenerateAiCommitMessage}
                    disabled={isAiGeneratingMsg}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                  >
                    <Sparkles className={`w-3 h-3 ${isAiGeneratingMsg ? 'animate-spin' : ''}`} />
                    <span>Generate Message</span>
                  </button>
                </div>

                <textarea
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="feat: describe your changes (or click Generate Message)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono resize-none h-20"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-slate-500 font-mono">
                    Author: <span className="text-slate-400">mareefahtullah@gmail.com</span>
                  </div>

                  <button
                    onClick={() => {
                      if (!commitMessage.trim()) return;
                      onCommit(commitMessage);
                      setCommitMessage('');
                    }}
                    disabled={!commitMessage.trim() || stagedFiles.length === 0}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                  >
                    Commit to {gitState.currentBranch}
                  </button>
                </div>
              </div>

              {/* Staged Files */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Staged Changes ({stagedFiles.length})
                  </span>
                  {stagedFiles.length > 0 && (
                    <button
                      onClick={onUnstageAll}
                      className="text-[11px] text-slate-400 hover:text-white transition"
                    >
                      Unstage All
                    </button>
                  )}
                </div>

                {stagedFiles.length === 0 ? (
                  <div className="p-4 rounded-lg bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                    No files staged. Stage modified files below to commit.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden bg-slate-950 font-mono text-xs">
                    {stagedFiles.map((file) => (
                      <div
                        key={file.path}
                        onClick={() => setSelectedDiffFile(file.path)}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition ${
                          selectedDiffFile === file.path ? 'bg-blue-600/10 text-blue-300' : 'hover:bg-slate-900/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-emerald-400 text-[10px] font-bold uppercase">{file.status[0]}</span>
                          <span className="truncate">{file.path}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnstageFile(file.path);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white transition"
                        >
                          Unstage
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Unstaged / Modified Files */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Unstaged Modifications ({unstagedFiles.length})
                  </span>
                  {unstagedFiles.length > 0 && (
                    <button
                      onClick={onStageAll}
                      className="text-[11px] text-blue-400 hover:text-blue-300 transition"
                    >
                      Stage All
                    </button>
                  )}
                </div>

                {unstagedFiles.length === 0 ? (
                  <div className="p-4 rounded-lg bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                    Working directory clean. All tracked changes committed.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden bg-slate-950 font-mono text-xs">
                    {unstagedFiles.map((file) => (
                      <div
                        key={file.path}
                        onClick={() => setSelectedDiffFile(file.path)}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition ${
                          selectedDiffFile === file.path ? 'bg-blue-600/10 text-blue-300' : 'hover:bg-slate-900/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-amber-400 text-[10px] font-bold uppercase">{file.status[0]}</span>
                          <span className="truncate">{file.path}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStageFile(file.path);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition"
                        >
                          Stage
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: File Diff Inspector */}
            <div className="lg:col-span-7">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col h-[560px] overflow-hidden space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-white font-mono">{currentDiff?.path || selectedDiffFile}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {currentDiff?.status || 'modified'}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">Comparing against HEAD</span>
                </div>

                <div className="flex-1 overflow-y-auto font-mono text-xs space-y-0.5 bg-slate-950 p-3 rounded-lg border border-slate-800 select-text">
                  {currentDiff?.diffLines?.map((line, idx) => {
                    const isAddition = line.startsWith('+');
                    const isDeletion = line.startsWith('-');
                    return (
                      <div
                        key={idx}
                        className={`px-2 py-0.5 rounded flex items-start gap-3 ${
                          isAddition ? 'bg-emerald-950/30 text-emerald-300 border-l-2 border-emerald-500' :
                          isDeletion ? 'bg-rose-950/30 text-rose-300 border-l-2 border-rose-500' :
                          'text-slate-400'
                        }`}
                      >
                        <span className="w-8 select-none text-[10px] text-slate-600 text-right">{idx + 1}</span>
                        <span className="whitespace-pre-wrap">{line}</span>
                      </div>
                    );
                  }) || (
                    <div className="text-slate-500 text-center py-12">Select a modified file to view diff</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Commit History Timeline */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Repository Commit History</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    View historical commits, inspect snapshots, and roll back project state.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                {gitState.commits.map((commit, idx) => (
                  <div key={commit.id} className="p-4 hover:bg-slate-900/40 transition space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {commit.hash}
                        </span>
                        <span className="font-semibold text-xs text-white">{commit.message}</span>
                        {idx === 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
                            HEAD
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            if (confirm(`Roll back project files to commit ${commit.hash} ("${commit.message}")?`)) {
                              onRestoreCommit(commit);
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-400" />
                          <span>Revert to this Commit</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                      <span>Author: {commit.author}</span>
                      <span>Branch: {commit.branch}</span>
                      <span>{commit.timestamp}</span>
                      <span className="text-emerald-400">+{commit.insertions}</span>
                      <span className="text-rose-400">-{commit.deletions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Branch Management */}
        {activeTab === 'branches' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Branch Management</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Isolate feature development, experiment with changes, and switch branches.
                  </p>
                </div>

                <button
                  onClick={() => setIsCreatingBranch(!isCreatingBranch)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Branch</span>
                </button>
              </div>

              {isCreatingBranch && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                  <GitBranchIcon className="w-4 h-4 text-blue-400" />
                  <input
                    type="text"
                    value={newBranchInput}
                    onChange={(e) => setNewBranchInput(e.target.value)}
                    placeholder="branch-name (e.g. feature/native-camera, fix/cors)..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateBranchSubmit()}
                  />
                  <button
                    onClick={handleCreateBranchSubmit}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setIsCreatingBranch(false)}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                {gitState.branches.map((b) => (
                  <div key={b.name} className="p-3.5 flex items-center justify-between hover:bg-slate-900/40 transition">
                    <div className="flex items-center gap-3">
                      <GitBranchIcon className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">{b.name}</span>
                          {b.name === gitState.currentBranch && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
                              CURRENT
                            </span>
                          )}
                          {b.isDefault && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                              default
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Last commit: {b.lastCommitMessage} • {b.updatedAt}
                        </div>
                      </div>
                    </div>

                    {b.name !== gitState.currentBranch && (
                      <button
                        onClick={() => onSwitchBranch(b.name)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                      >
                        Switch Branch
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
