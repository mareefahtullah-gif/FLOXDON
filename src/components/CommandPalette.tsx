import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  FolderGit2,
  LayoutTemplate,
  Sparkles,
  FileCode,
  Rocket,
  Cpu,
  Server,
  Database,
  Globe,
  Settings,
  X,
  Play,
  Download,
  Plus,
  Wand2,
  ShoppingBag,
  Key
} from 'lucide-react';
import { SidebarNavTab } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: SidebarNavTab) => void;
  onTriggerAction: (action: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onTriggerAction,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { type: 'nav', id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { type: 'nav', id: 'projects', label: 'Go to Projects Manager', icon: FolderGit2, category: 'Navigation' },
    { type: 'nav', id: 'templates', label: 'Go to Production Templates', icon: LayoutTemplate, category: 'Navigation' },
    { type: 'nav', id: 'ai-builder', label: 'Go to Floxdon AI Builder', icon: Sparkles, category: 'Navigation' },
    { type: 'nav', id: 'design-engine', label: 'Go to Smart UI Design Engine', icon: Wand2, category: 'Navigation' },
    { type: 'nav', id: 'store', label: 'Go to Floxdon Store (App & Play Store Marketplace)', icon: ShoppingBag, category: 'Navigation' },
    { type: 'nav', id: 'auth', label: 'Go to Floxdon Account IAM (Identity & Access)', icon: Key, category: 'Navigation' },
    { type: 'nav', id: 'files', label: 'Go to Integrated Workspace IDE', icon: FileCode, category: 'Navigation' },
    { type: 'nav', id: 'deployments', label: 'Go to PaaS Deployments', icon: Rocket, category: 'Navigation' },
    { type: 'nav', id: 'builds', label: 'Go to Build Orchestrator (APK/IPA/Desktop)', icon: Cpu, category: 'Navigation' },
    { type: 'nav', id: 'servers', label: 'Go to Infrastructure & Sandboxes', icon: Server, category: 'Navigation' },
    { type: 'nav', id: 'databases', label: 'Go to PostgreSQL Database Studio', icon: Database, category: 'Navigation' },
    { type: 'nav', id: 'domains', label: 'Go to Domains & SSL Certificates', icon: Globe, category: 'Navigation' },
    { type: 'nav', id: 'settings', label: 'Go to Settings & Security', icon: Settings, category: 'Navigation' },
    { type: 'action', id: 'action-ai', label: 'Run Floxdon AI Synthesizer', icon: Sparkles, category: 'Actions' },
    { type: 'action', id: 'action-build-apk', label: 'Package Android APK / AAB', icon: Cpu, category: 'Actions' },
    { type: 'action', id: 'action-deploy', label: 'Deploy Full-Stack App to PaaS', icon: Rocket, category: 'Actions' },
    { type: 'action', id: 'action-download', label: 'Download Workspace Project Archive (.zip)', icon: Download, category: 'Actions' },
  ];

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-start justify-center pt-12 sm:pt-24 p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-3.5 border-b border-slate-200 flex items-center gap-2.5 bg-slate-50/60">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search section..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No matching commands found.</div>
          ) : (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'nav') {
                      onNavigate(item.id as SidebarNavTab);
                    } else {
                      onTriggerAction(item.id);
                    }
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{item.category}</span>
                </button>
              );
            })
          )}
        </div>

        <div className="p-2.5 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between px-4">
          <span>Navigate with ⌘K / Ctrl+K</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};
