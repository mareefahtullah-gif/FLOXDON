import React from 'react';
import {
  Home,
  LayoutGrid,
  FileCode,
  Sparkles,
  Zap,
  Wand2,
  ShoppingBag,
  Key,
  Cloud,
  Activity,
  RefreshCw,
  Layers,
  Grid,
  Rocket,
  Cpu,
  Download,
  CheckCircle2,
  Search,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import { SidebarNavTab } from '../types';

interface SidebarProps {
  currentTab: SidebarNavTab;
  onSelectTab: (tab: SidebarNavTab) => void;
  onOpenCommandPalette: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  clusterHealth?: string;
  activeProjectName?: string;
  onOpenPWAInstall?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: SidebarNavTab | 'pwa-install';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isPwa?: boolean;
}

const navItems: NavItem[] = [
  { id: 'landing', label: 'Landing Page', icon: Home },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'files', label: 'Workspace (Editor)', icon: FileCode, badge: 'Unified' },
  { id: 'ai-builder', label: 'Floxdon AI Builder', icon: Sparkles, badge: 'AI' },
  { id: 'ai-refactor', label: 'AI Code Optimizer', icon: Zap, badge: 'Smart' },
  { id: 'design-engine', label: 'UI Design Engine', icon: Wand2 },
  { id: 'store', label: 'Floxdon Store', icon: ShoppingBag, badge: 'Market' },
  { id: 'auth', label: 'Floxdon Account', icon: Key, badge: 'IAM' },
  { id: 'cloud', label: 'Floxdon Cloud', icon: Cloud, badge: 'Storage' },
  { id: 'analytics', label: 'Floxdon Analytics', icon: Activity, badge: 'Live' },
  { id: 'updates', label: 'Floxdon Updates', icon: RefreshCw, badge: 'OTA' },
  { id: 'projects', label: 'Projects', icon: Layers, badge: '4' },
  { id: 'templates', label: 'Templates', icon: Grid },
  { id: 'deployments', label: 'Deployments', icon: Rocket, badge: 'PaaS' },
  { id: 'builds', label: 'Builds & APK', icon: Cpu, badge: 'Real' },
  { id: 'pwa-install', label: 'Install App (PWA)', icon: Download, badge: 'Ready', isPwa: true },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCommandPalette,
  isCollapsed,
  onToggleCollapse,
  activeProjectName = 'Production Workspace',
  onOpenPWAInstall,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const handleItemClick = (item: NavItem) => {
    if (item.isPwa || item.id === 'pwa-install') {
      if (onOpenPWAInstall) onOpenPWAInstall();
    } else {
      onSelectTab(item.id as SidebarNavTab);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (isMobileView: boolean) => (
    <div className="h-full flex flex-col bg-white text-slate-800 font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-slate-100 shrink-0">
        <div
          onClick={() => handleItemClick({ id: 'dashboard', label: 'Dashboard', icon: LayoutGrid })}
          className="flex items-center gap-2.5 cursor-pointer group min-w-0"
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {(!isCollapsed || isMobileView) && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-bold text-slate-900 tracking-tight truncate">
                  Floxdon Studio
                </span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold shrink-0">
                  V4.0
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium leading-none mt-0.5 truncate">
                {activeProjectName}
              </div>
            </div>
          )}
        </div>

        {isMobileView ? (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand menu' : 'Collapse menu'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Quick Search */}
      {(!isCollapsed || isMobileView) ? (
        <div className="px-3 pt-2.5 pb-1 shrink-0">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-400 hover:border-slate-300 hover:bg-white hover:text-slate-600 transition"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Quick Search...</span>
            </div>
            <kbd className="text-[10px] font-mono bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>
      ) : (
        <div className="p-2 flex justify-center shrink-0">
          <button
            onClick={onOpenCommandPalette}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Quick Search (Cmd+K)"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Scrollable Nav List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1 select-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isAiBuilder = item.id === 'ai-builder';

          if (item.isPwa) {
            return (
              <button
                key={item.id}
                id={`sidebar-btn-${item.id}`}
                onClick={() => handleItemClick(item)}
                title={isCollapsed && !isMobileView ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed && !isMobileView ? 'justify-center px-2' : 'justify-between px-3'
                } py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 active:scale-[0.99] transition shadow-2xs mt-2`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0 text-emerald-600" />
                  {(!isCollapsed || isMobileView) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>
                {(!isCollapsed || isMobileView) && item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`sidebar-btn-${item.id}`}
              onClick={() => handleItemClick(item)}
              title={isCollapsed && !isMobileView ? item.label : undefined}
              className={`w-full flex items-center ${
                isCollapsed && !isMobileView ? 'justify-center px-2' : 'justify-between px-3'
              } py-2 rounded-xl text-xs transition group ${
                isActive
                  ? isAiBuilder
                    ? 'bg-indigo-50/90 text-indigo-700 font-semibold border border-indigo-100 shadow-2xs'
                    : 'bg-blue-50/90 text-blue-700 font-semibold border border-blue-100 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition ${
                    isActive
                      ? isAiBuilder
                        ? 'text-indigo-600'
                        : 'text-blue-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {(!isCollapsed || isMobileView) && (
                  <span className="truncate">{item.label}</span>
                )}
              </div>

              {(!isCollapsed || isMobileView) && item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md shrink-0 transition ${
                    isActive
                      ? isAiBuilder
                        ? 'bg-indigo-100/90 text-indigo-700 border border-indigo-200/80 font-bold'
                        : 'bg-blue-100/80 text-blue-700 border border-blue-200/80 font-bold'
                      : 'bg-slate-100 text-slate-400 border border-slate-200/60 font-medium'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* CLUSTER SECTION */}
        {(!isCollapsed || isMobileView) ? (
          <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  CLUSTER
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-600">
                92 CORES / 288GB
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                  FS
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 leading-tight truncate">
                    Docker Engine
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                    Sandboxed :3000
                  </div>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
            </div>
          </div>
        ) : (
          <div className="pt-3 mt-2 border-t border-slate-100 flex justify-center" title="Cluster: 92 Cores / 288GB">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        id="sidebar-container"
        className={`hidden md:flex h-screen bg-white border-r border-slate-200 flex-col justify-between transition-all duration-200 z-30 select-none ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile Slide-Out Drawer & Backdrop */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full bg-white flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200 select-none">
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
