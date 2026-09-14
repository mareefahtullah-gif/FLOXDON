import React, { useState } from 'react';
import {
  Home,
  LayoutDashboard,
  FileCode,
  Sparkles,
  Zap,
  Wand2,
  ShoppingBag,
  Key,
  Cloud,
  Activity,
  RefreshCw,
  Cpu,
  Rocket,
  Grid,
  X,
  ChevronUp,
  FolderGit2,
  LayoutTemplate,
  Database,
  Server,
  Globe,
  Settings
} from 'lucide-react';
import { SidebarNavTab } from '../types';

interface MobileBottomNavProps {
  currentTab: SidebarNavTab;
  onSelectTab: (tab: SidebarNavTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // All platform tabs
  const allPlatformTabs: {
    id: SidebarNavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    description: string;
    color: string;
  }[] = [
    { id: 'landing', label: 'Landing Page', icon: Home, description: 'Ecosystem overview', color: 'text-blue-600 bg-blue-50' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Platform overview & metrics', color: 'text-sky-600 bg-sky-50' },
    { id: 'files', label: 'Workspace IDE', icon: FileCode, badge: 'Editor', description: 'Code & live preview', color: 'text-indigo-600 bg-indigo-50' },
    { id: 'ai-builder', label: 'AI Builder', icon: Sparkles, badge: 'AI', description: 'Autonomous pipeline', color: 'text-purple-600 bg-purple-50' },
    { id: 'store', label: 'Floxdon Store', icon: ShoppingBag, badge: 'Market', description: 'App & Play Store', color: 'text-amber-600 bg-amber-50' },
    { id: 'auth', label: 'Floxdon Account', icon: Key, badge: 'IAM', description: 'OAuth2 & Passkeys', color: 'text-emerald-600 bg-emerald-50' },
    { id: 'cloud', label: 'Floxdon Cloud', icon: Cloud, badge: 'Storage', description: 'NVMe & Object Store', color: 'text-cyan-600 bg-cyan-50' },
    { id: 'analytics', label: 'Analytics', icon: Activity, badge: 'Live', description: 'Real telemetry & events', color: 'text-teal-600 bg-teal-50' },
    { id: 'updates', label: 'Updates', icon: RefreshCw, badge: 'OTA', description: 'Rollouts & channels', color: 'text-rose-600 bg-rose-50' },
    { id: 'ai-refactor', label: 'AI Optimizer', icon: Zap, badge: 'Smart', description: 'Refactor & diagnostics', color: 'text-yellow-600 bg-yellow-50' },
    { id: 'design-engine', label: 'Design Engine', icon: Wand2, badge: 'UI/UX', description: 'Visual tokens & specs', color: 'text-pink-600 bg-pink-50' },
    { id: 'projects', label: 'Projects', icon: FolderGit2, badge: 'Multi', description: 'All active workspaces', color: 'text-blue-600 bg-blue-50' },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate, description: 'Production blueprints', color: 'text-indigo-600 bg-indigo-50' },
    { id: 'builds', label: 'Builds & APK', icon: Cpu, badge: 'Real', description: 'Android & desktop compilation', color: 'text-violet-600 bg-violet-50' },
    { id: 'deployments', label: 'Deploy PaaS', icon: Rocket, badge: 'PaaS', description: 'Container & SSL deployment', color: 'text-sky-600 bg-sky-50' },
    { id: 'databases', label: 'Databases', icon: Database, description: 'PostgreSQL 16 & queries', color: 'text-emerald-600 bg-emerald-50' },
    { id: 'servers', label: 'Servers', icon: Server, description: 'Clusters & nodes', color: 'text-slate-600 bg-slate-100' },
    { id: 'domains', label: 'Domains', icon: Globe, description: 'Custom TLS & DNS', color: 'text-cyan-600 bg-cyan-50' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Environment & tokens', color: 'text-slate-600 bg-slate-100' },
  ];

  const quickTabs = [
    { id: 'landing' as SidebarNavTab, label: 'Home', icon: Home },
    { id: 'ai-builder' as SidebarNavTab, label: 'AI Builder', icon: Sparkles },
    { id: 'files' as SidebarNavTab, label: 'Workspace', icon: FileCode },
    { id: 'store' as SidebarNavTab, label: 'Store', icon: ShoppingBag },
  ];

  const handleSelect = (tab: SidebarNavTab) => {
    onSelectTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Expanded All 12 Tabs Drawer Modal */}
      {isMenuOpen && (
        <div 
          id="mobile-nav-backdrop"
          className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            id="mobile-all-tabs-drawer"
            className="bg-white rounded-t-3xl border-t border-slate-200 p-5 max-h-[80vh] overflow-y-auto shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Floxdon Ecosystem Modules</h3>
                <p className="text-[11px] text-slate-500">All platform modules accessible on mobile & tablet</p>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 12 Tabs Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {allPlatformTabs.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`flex items-start gap-2.5 p-2.5 sm:p-3 rounded-2xl border text-left transition ${
                      isActive
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-blue-900' : 'text-slate-900'}`}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-700 font-semibold shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar on Mobile */}
      <nav 
        id="mobile-bottom-nav-bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-lg"
      >
        {quickTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition min-w-[56px] min-h-[44px] ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`relative p-1 rounded-lg ${isActive ? 'bg-blue-50' : ''}`}>
                <Icon className="w-4 h-4" />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600"></span>
                )}
              </div>
              <span className="text-[10px] leading-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* All Modules Drawer Button */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition min-w-[56px] min-h-[44px] ${
            isMenuOpen ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700">
            <Grid className="w-4 h-4" />
          </div>
          <span className="text-[10px] leading-tight mt-0.5">All Modules</span>
        </button>
      </nav>
    </>
  );
};
