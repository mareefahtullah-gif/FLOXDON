import React, { useState, useEffect } from 'react';
import { Menu, Search, Sparkles } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProjectWorkspace } from './components/ProjectWorkspace';
import { DashboardView } from './components/DashboardView';
import { ProjectsView } from './components/ProjectsView';
import { TemplatesView } from './components/TemplatesView';
import { AiBuilderView } from './components/AiBuilderView';
import { BuildsView } from './components/BuildsView';
import { ServersView } from './components/ServersView';
import { DomainsView } from './components/DomainsView';
import { SettingsView } from './components/SettingsView';
import { DeploymentPaaS } from './components/DeploymentPaaS';
import { DatabaseStudio } from './components/DatabaseStudio';
import { CommandPalette } from './components/CommandPalette';
import { AiPromptModal } from './components/AiPromptModal';
import { AiRefactorModal } from './components/AiRefactorModal';
import { AiDebuggerModal } from './components/AiDebuggerModal';
import { LandingPage } from './components/LandingPage';
import { PWAInstallModal } from './components/PWAInstallModal';
import { SmartDesignEngine } from './components/SmartDesignEngine';
import { ForgeStoreView } from './components/ForgeStoreView';
import { ForgeAuthView } from './components/ForgeAuthView';
import { ForgeCloudView } from './components/ForgeCloudView';
import { FloxdonAnalyticsView } from './components/FloxdonAnalyticsView';
import { FloxdonUpdatesView } from './components/FloxdonUpdatesView';
import { FloxdonRefactorView } from './components/FloxdonRefactorView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ErrorBoundary } from './components/ErrorBoundary';
import { INITIAL_PROJECTS } from './data/defaultProjects';
import { Project, ProjectFile, GitRepoState, GitCommit, GitBranch, SidebarNavTab, PlatformTarget } from './types';
import { downloadProjectArchive } from './utils/packageExporter';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentProjectId, setCurrentProjectId] = useState<string>(INITIAL_PROJECTS[0].id);
  const [sidebarTab, setSidebarTab] = useState<SidebarNavTab>('ai-builder');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [builderInitialPrompt, setBuilderInitialPrompt] = useState<string>('');

  // AI Prompt Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // AI Refactor Modal State
  const [isRefactorModalOpen, setIsRefactorModalOpen] = useState(false);
  const [refactorTargetFile, setRefactorTargetFile] = useState<ProjectFile>(INITIAL_PROJECTS[0].files[0]);

  // AI Debugger Modal State
  const [isDebuggerModalOpen, setIsDebuggerModalOpen] = useState(false);
  const [debuggerInitialError, setDebuggerInitialError] = useState<{
    errorMessage: string;
    errorStack?: string;
    sourceFile?: string;
  } | null>(null);

  // PWA Install Modal State
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState(false);

  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0] || INITIAL_PROJECTS[0];

  // Git Repository State per project
  const initialSnapshot: Record<string, string> = {};
  (currentProject?.files || []).forEach((f) => {
    if (f?.path) initialSnapshot[f.path] = f.content || '';
  });

  const [gitState, setGitState] = useState<GitRepoState>({
    isInitialized: true,
    currentBranch: 'main',
    branches: [
      {
        name: 'main',
        isDefault: true,
        lastCommitHash: 'e89a42f',
        lastCommitMessage: 'feat: initial multi-platform workspace',
        updatedAt: 'Today, 06:30 AM',
      },
      {
        name: 'feature/capacitor-telemetry',
        isDefault: false,
        lastCommitHash: '7c12b4d',
        lastCommitMessage: 'feat: capacitor native bridge for android battery state',
        updatedAt: 'Yesterday',
      },
      {
        name: 'perf/db-indexes',
        isDefault: false,
        lastCommitHash: '3f91a0c',
        lastCommitMessage: 'perf: postgres composite index on telemetry unit_id',
        updatedAt: 'Sep 05, 2026',
      }
    ],
    commits: [
      {
        id: 'c-1',
        hash: 'e89a42f',
        message: 'feat: initial multi-platform workspace',
        author: 'mareefahtullah@gmail.com',
        timestamp: 'Today, 06:30 AM',
        branch: 'main',
        filesChanged: currentProject.files.length,
        insertions: 342,
        deletions: 0,
        snapshot: initialSnapshot,
      },
      {
        id: 'c-2',
        hash: '7c12b4d',
        message: 'chore: configure PostgreSQL 16 schema & capacitor bridge',
        author: 'mareefahtullah@gmail.com',
        timestamp: 'Yesterday, 04:15 PM',
        branch: 'main',
        filesChanged: 3,
        insertions: 88,
        deletions: 12,
        snapshot: initialSnapshot,
      }
    ],
    stagedFiles: [],
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleUpdateFile = (filePath: string, newContent: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== currentProject.id) return proj;
        const updatedFiles = proj.files.map((file) =>
          file.path === filePath ? { ...file, content: newContent, isModified: true } : file
        );
        return {
          ...proj,
          files: updatedFiles,
          lastModified: new Date().toISOString(),
        };
      })
    );
  };

  const handleAddFile = (filePath: string, content: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== currentProject.id) return proj;
        const newFile: ProjectFile = {
          path: filePath,
          content,
          type: 'code',
          isModified: true,
        };
        return {
          ...proj,
          files: [...proj.files, newFile],
          lastModified: new Date().toISOString(),
        };
      })
    );
    showNotification(`File created: ${filePath}`);
  };

  const handleDeleteFile = (filePath: string) => {
    if (currentProject.files.length <= 1) return;
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== currentProject.id) return proj;
        return {
          ...proj,
          files: proj.files.filter((f) => f.path !== filePath),
          lastModified: new Date().toISOString(),
        };
      })
    );
    showNotification(`File removed: ${filePath}`);
  };

  const handleProjectGenerated = (newProj: Project, customMsg?: string, shouldSwitchToFiles = false) => {
    if (!newProj) return;
    const normalized: Project = {
      id: newProj.id || `proj_${Date.now()}`,
      name: newProj.name || (newProj as any).projectName || 'Synthesized Application',
      slug: newProj.slug || 'app-' + Date.now(),
      description: newProj.description || 'Production fullstack application',
      platform: newProj.platform || 'fullstack',
      framework: newProj.framework || 'React 19 + Tailwind CSS + Node.js',
      version: newProj.version || '1.0.0',
      createdAt: newProj.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: 'active',
      files: Array.isArray(newProj.files) && newProj.files.length > 0 ? newProj.files : currentProject?.files || [],
    };

    setProjects((prev) => {
      const exists = prev.some((p) => p.id === normalized.id);
      return exists ? prev.map((p) => (p.id === normalized.id ? normalized : p)) : [normalized, ...prev];
    });
    setCurrentProjectId(normalized.id);
    if (shouldSwitchToFiles) {
      setSidebarTab('files');
    }
    showNotification(customMsg || `Application "${normalized.name}" created successfully!`);
  };

  const handleExportZip = async () => {
    try {
      await downloadProjectArchive(currentProject);
      showNotification(`Exported complete source bundle: ${currentProject.slug}-fullstack-project.zip`);
    } catch (e) {
      console.error(e);
      showNotification('Error generating project archive');
    }
  };

  // Git Actions
  const handleCommit = (message: string) => {
    const snapshot: Record<string, string> = {};
    currentProject.files.forEach((f) => {
      snapshot[f.path] = f.content;
    });

    const newHash = Math.random().toString(16).substring(2, 9);
    const newCommit: GitCommit = {
      id: `c-${Date.now()}`,
      hash: newHash,
      message,
      author: 'mareefahtullah@gmail.com',
      timestamp: 'Just now',
      branch: gitState.currentBranch,
      filesChanged: gitState.stagedFiles.length || 1,
      insertions: 42,
      deletions: 8,
      snapshot,
    };

    setGitState((prev) => ({
      ...prev,
      commits: [newCommit, ...prev.commits],
      stagedFiles: [],
      branches: prev.branches.map((b) =>
        b.name === prev.currentBranch
          ? { ...b, lastCommitHash: newHash, lastCommitMessage: message, updatedAt: 'Just now' }
          : b
      ),
    }));

    showNotification(`Committed [${newHash}]: ${message}`);
  };

  const handleStageFile = (path: string) => {
    setGitState((prev) => ({
      ...prev,
      stagedFiles: prev.stagedFiles.includes(path) ? prev.stagedFiles : [...prev.stagedFiles, path],
    }));
  };

  const handleRestoreCommit = (commit: GitCommit) => {
    if (!commit.snapshot) return;

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== currentProject.id) return proj;
        const restoredFiles = proj.files.map((file) => {
          if (commit.snapshot[file.path] !== undefined) {
            return {
              ...file,
              content: commit.snapshot[file.path],
              isModified: false,
            };
          }
          return file;
        });
        return {
          ...proj,
          files: restoredFiles,
          lastModified: new Date().toISOString(),
        };
      })
    );

    showNotification(`Rolled back working directory to commit ${commit.hash}`);
  };

  // AI Refactor Actions
  const handleOpenAiRefactor = (file?: ProjectFile) => {
    const target = file || currentProject.files.find((f) => f.path === currentProject.activeFile) || currentProject.files[0];
    setRefactorTargetFile(target);
    setIsRefactorModalOpen(true);
  };

  const handleApplyRefactor = (filePath: string, newContent: string) => {
    handleUpdateFile(filePath, newContent);
    showNotification(`Applied AI optimization to ${filePath}`);
  };

  // AI Debugger Actions
  const handleOpenAiDebugger = (errorInfo?: { errorMessage: string; errorStack?: string; sourceFile?: string }) => {
    if (errorInfo) {
      setDebuggerInitialError(errorInfo);
    } else {
      setDebuggerInitialError({
        errorMessage: "TypeError: Cannot read properties of undefined (reading 'map')",
        errorStack: "TypeError: Cannot read properties of undefined (reading 'map')\n    at App (src/App.tsx:442:25)",
        sourceFile: 'src/App.tsx',
      });
    }
    setIsDebuggerModalOpen(true);
  };

  const handleApplyDebugFix = (filePath: string, fixedCode: string) => {
    handleUpdateFile(filePath, fixedCode);
    showNotification(`Fixed exception and applied patch to ${filePath}`);
  };

  // Deployments sample for Dashboard
  const sampleDeployments = [
    {
      id: 'dep_prod_01',
      appName: currentProject.name,
      domain: `${currentProject.slug}.floxdon.studio`,
      containers: [
        { name: 'frontend', image: `registry.floxdon.studio/${currentProject.slug}:v3.4.1`, port: 80 },
        { name: 'backend', image: `registry.floxdon.studio/${currentProject.slug}-api:v3.4.1`, port: 5000 },
        { name: 'database', image: 'postgres:16.3-alpine', port: 5432 }
      ],
      ssl: { tlsVersion: 'TLS 1.3', status: 'valid' }
    }
  ];

  return (
    <ErrorBoundary onReset={() => setSidebarTab('landing')}>
      <div className="h-screen w-screen flex bg-slate-50 text-slate-900 overflow-hidden font-sans">
        {/* Left Sidebar Navigation (Desktop + Mobile Drawer) */}
        <Sidebar
          currentTab={sidebarTab}
          onSelectTab={(tab) => setSidebarTab(tab)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          activeProjectName={currentProject.name}
          onOpenPWAInstall={() => setIsPWAInstallOpen(true)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main View Area */}
        <div className="flex-1 flex flex-col overflow-hidden pb-14 md:pb-0">
          {/* Mobile Top Navigation Bar with Hamburger */}
          {sidebarTab !== 'landing' && (
            <div className="md:hidden h-11 bg-white border-b border-slate-200 px-3 flex items-center justify-between shrink-0 select-none z-20">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition shrink-0"
                  title="Open Navigation Menu"
                  aria-label="Open Navigation Menu"
                >
                  <Menu className="w-5 h-5 text-slate-700" />
                </button>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-xs text-slate-900 truncate">
                    Floxdon
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold uppercase truncate">
                    {sidebarTab}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                  title="Quick Search (Cmd+K)"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-medium active:scale-95 transition"
                  title="AI Assistant"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI</span>
                </button>
              </div>
            </div>
          )}

          {/* Floating Notification Toast */}
          {notification && (
            <div className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xl shadow-blue-600/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span>{notification}</span>
            </div>
          )}

        {/* Dynamic View based on Active Sidebar Tab */}
        {sidebarTab === 'landing' && (
          <LandingPage
            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenWorkspace={() => setSidebarTab('files')}
            onOpenAiBuilder={() => setSidebarTab('ai-builder')}
            onOpenTemplates={() => setSidebarTab('templates')}
            onOpenProjects={() => setSidebarTab('projects')}
            onOpenPWAInstall={() => setIsPWAInstallOpen(true)}
            onSelectProject={(id) => {
              setCurrentProjectId(id);
              setSidebarTab('files');
            }}
            projects={projects}
            onNavigateStore={() => setSidebarTab('store')}
            onNavigateAuth={() => setSidebarTab('auth')}
            onNavigateCloud={() => setSidebarTab('cloud')}
            onNavigateAnalytics={() => setSidebarTab('analytics')}
            onNavigateUpdates={() => setSidebarTab('updates')}
            onNavigateRefactor={() => setSidebarTab('ai-refactor')}
          />
        )}

        {sidebarTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => setSidebarTab(tab)}
            projects={projects}
            deployments={sampleDeployments as any}
            onOpenAiBuilder={(prompt?: string) => {
              if (prompt) setBuilderInitialPrompt(prompt);
              setSidebarTab('ai-builder');
            }}
            onOpenPWAInstall={() => setIsPWAInstallOpen(true)}
          />
        )}

        {sidebarTab === 'projects' && (
          <ProjectsView
            projects={projects}
            currentProjectId={currentProjectId}
            onSelectProject={(id) => setCurrentProjectId(id)}
            onCreateProject={(newP) => {
              setProjects([newP, ...projects]);
              setCurrentProjectId(newP.id);
            }}
            onOpenWorkspace={() => setSidebarTab('files')}
            onNavigateBuilds={() => setSidebarTab('builds')}
            onNavigateDeployments={() => setSidebarTab('deployments')}
            showNotification={showNotification}
          />
        )}

        {sidebarTab === 'templates' && (
          <TemplatesView
            onUseTemplate={(tProj) => {
              setProjects([tProj, ...projects]);
              setCurrentProjectId(tProj.id);
              setSidebarTab('files');
            }}
            onOpenAiWithPrompt={(prompt, platform) => {
              if (prompt) setBuilderInitialPrompt(prompt);
              setSidebarTab('ai-builder');
            }}
            showNotification={showNotification}
          />
        )}

        {sidebarTab === 'ai-builder' && (
          <AiBuilderView
            currentProject={currentProject}
            onApplyGeneratedProject={(p, msg) => handleProjectGenerated(p, msg, false)}
            onOpenWorkspace={() => setSidebarTab('files')}
            showNotification={showNotification}
            onNavigateToStore={() => setSidebarTab('store')}
            onNavigateToDashboard={() => setSidebarTab('dashboard')}
            initialPrompt={builderInitialPrompt}
          />
        )}

        {sidebarTab === 'design-engine' && (
          <SmartDesignEngine
            currentProject={currentProject}
            onOpenWorkspace={() => setSidebarTab('files')}
            showNotification={showNotification}
          />
        )}

        {sidebarTab === 'store' && (
          <ForgeStoreView
            currentProject={currentProject}
            showNotification={showNotification}
            onOpenBuilds={() => setSidebarTab('builds')}
          />
        )}

        {sidebarTab === 'auth' && (
          <ForgeAuthView
            showNotification={showNotification}
          />
        )}

        {sidebarTab === 'cloud' && (
          <ForgeCloudView
            projects={projects}
            showNotification={showNotification}
          />
        )}

        {sidebarTab === 'analytics' && (
          <FloxdonAnalyticsView
            project={currentProject}
          />
        )}

        {sidebarTab === 'updates' && (
          <FloxdonUpdatesView
            project={currentProject}
          />
        )}

        {sidebarTab === 'ai-refactor' && (
          <FloxdonRefactorView
            project={currentProject}
            onApplyRefactor={(path, newContent) => {
              handleUpdateFile(path, newContent);
              showNotification(`Applied optimized code to ${path}`);
            }}
          />
        )}

        {sidebarTab === 'files' && (
          <ProjectWorkspace
            project={currentProject}
            onUpdateFile={handleUpdateFile}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
            gitState={gitState}
            onCommit={handleCommit}
            onStageFile={handleStageFile}
            onRestoreCommit={handleRestoreCommit}
            onOpenAiPrompt={() => setIsAiModalOpen(true)}
            onOpenAiRefactor={handleOpenAiRefactor}
            onOpenAiDebugger={handleOpenAiDebugger}
            onNavigateBuilds={() => setSidebarTab('builds')}
            onNavigateDeployments={() => setSidebarTab('deployments')}
            onExportProject={handleExportZip}
            showNotification={showNotification}
          />
        )}

        {sidebarTab === 'deployments' && (
          <DeploymentPaaS
            project={currentProject}
            onOpenAiDebugger={handleOpenAiDebugger}
          />
        )}

        {sidebarTab === 'builds' && (
          <BuildsView
            currentProject={currentProject}
            showNotification={showNotification}
            onNavigateStore={() => setSidebarTab('store')}
          />
        )}

        {sidebarTab === 'servers' && (
          <ServersView
            showNotification={showNotification}
          />
        )}

        {sidebarTab === 'databases' && (
          <DatabaseStudio
            appName={currentProject.name}
          />
        )}

        {sidebarTab === 'domains' && (
          <DomainsView
            showNotification={showNotification}
          />
        )}

        {sidebarTab === 'settings' && (
          <SettingsView
            showNotification={showNotification}
          />
        )}
      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => setSidebarTab(tab)}
        onTriggerAction={(actionId) => {
          if (actionId === 'action-ai') setIsAiModalOpen(true);
          else if (actionId === 'action-build-apk') setSidebarTab('builds');
          else if (actionId === 'action-deploy') setSidebarTab('deployments');
          else if (actionId === 'action-download') handleExportZip();
        }}
      />

      {/* Natural Language AI App Synthesis Modal */}
      <AiPromptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onProjectGenerated={handleProjectGenerated}
      />

      {/* AI Refactor & Optimization Modal */}
      <AiRefactorModal
        isOpen={isRefactorModalOpen}
        onClose={() => setIsRefactorModalOpen(false)}
        file={refactorTargetFile}
        platform={currentProject.platform}
        onApplyRefactor={handleApplyRefactor}
      />

      {/* AI Debugger & Diagnostic Modal */}
      <AiDebuggerModal
        isOpen={isDebuggerModalOpen}
        onClose={() => setIsDebuggerModalOpen(false)}
        initialError={debuggerInitialError}
        onApplyFix={handleApplyDebugFix}
        files={currentProject.files}
      />

      {/* PWA Direct Installation Modal */}
      <PWAInstallModal
        isOpen={isPWAInstallOpen}
        onClose={() => setIsPWAInstallOpen(false)}
        project={currentProject}
        onExportZip={handleExportZip}
        showNotification={showNotification}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={sidebarTab}
        onSelectTab={(tab) => setSidebarTab(tab)}
      />
    </div>
  </ErrorBoundary>
  );
}
