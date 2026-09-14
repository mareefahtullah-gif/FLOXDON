import React from 'react';
import {
  LayoutTemplate,
  Sparkles,
  Smartphone,
  Monitor,
  Database,
  Layers,
  ArrowRight,
  Server,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Project, PlatformTarget } from '../types';

interface TemplatesViewProps {
  onUseTemplate: (templateProject: Project) => void;
  onOpenAiWithPrompt: (prompt: string, platform: PlatformTarget) => void;
  showNotification: (msg: string) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  onUseTemplate,
  onOpenAiWithPrompt,
  showNotification,
}) => {
  const templates = [
    {
      id: 'tmpl-fullstack-saas',
      title: 'Full-Stack Enterprise SaaS & PaaS',
      category: 'Full-Stack',
      platform: 'fullstack' as PlatformTarget,
      desc: 'Production architecture featuring React 19 SPA, Express REST API, PostgreSQL 16 relational store, Docker Compose orchestration, and automated reverse proxy routing.',
      tags: ['React 19', 'Express', 'PostgreSQL 16', 'Docker Compose', 'Nginx TLS'],
      filesCount: 14,
      defaultPrompt: 'Create an enterprise SaaS platform with team billing, role-based access, and audit streaming',
    },
    {
      id: 'tmpl-capacitor-mobile',
      title: 'Cross-Platform Mobile App (Android & iOS)',
      category: 'Mobile',
      platform: 'android' as PlatformTarget,
      desc: 'Native Capacitor bridge with biometric authentication, background geolocation tracking, offline SQLite cache, and camera hardware bindings. Produces installable APK and IPA packages.',
      tags: ['Capacitor 6', 'Android SDK 34', 'iOS IPA', 'Offline SQLite', 'Hardware APIs'],
      filesCount: 16,
      defaultPrompt: 'Build a mobile logistics driver app with GPS geolocation, offline sync, and camera signature capture',
    },
    {
      id: 'tmpl-desktop-electron',
      title: 'Native Desktop Application (Windows, Mac, Linux)',
      category: 'Desktop',
      platform: 'desktop' as PlatformTarget,
      desc: 'Electron 30 runtime bundled with local file system sandboxing, native OS notifications, system tray menu, and NSIS / DMG / AppImage cross-compilation configurations.',
      tags: ['Electron 30', 'Windows NSIS', 'macOS DMG', 'Linux AppImage', 'Node Native IPC'],
      filesCount: 12,
      defaultPrompt: 'Build a high-performance desktop developer tool with local SQLite query runner and dark mode UI',
    },
    {
      id: 'tmpl-telemetry-iot',
      title: 'Real-Time Telemetry & TimescaleDB Hub',
      category: 'Data & IoT',
      platform: 'fullstack' as PlatformTarget,
      desc: 'High-frequency streaming broker with WebSocket multiplexing, real-time live charting, threshold anomaly detection, and PostgreSQL telemetry partition tables.',
      tags: ['WebSockets', 'PostgreSQL Timescale', 'Recharts', 'Docker Sandboxes'],
      filesCount: 15,
      defaultPrompt: 'Build a real-time IoT device telemetry dashboard with streaming sensor charts and automated alerts',
    },
  ];

  const handleCreateFromTemplate = (tmpl: (typeof templates)[0]) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: tmpl.title.split('(')[0].trim(),
      slug: tmpl.id.replace('tmpl-', ''),
      description: tmpl.desc,
      platform: tmpl.platform,
      framework: tmpl.tags.join(' • '),
      version: '1.0.0',
      files: [
        {
          path: 'src/App.tsx',
          name: 'App.tsx',
          content: `import React from 'react';\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800 font-sans">\n      <div className="max-w-md w-full p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-4">\n        <h1 className="text-xl font-bold text-slate-900">${tmpl.title}</h1>\n        <p className="text-xs text-slate-500">${tmpl.desc}</p>\n        <div className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">\n          Platform: ${tmpl.platform.toUpperCase()}\n        </div>\n      </div>\n    </div>\n  );\n}`,
          language: 'typescript',
        },
        {
          path: 'package.json',
          name: 'package.json',
          content: JSON.stringify(
            {
              name: tmpl.id.replace('tmpl-', ''),
              version: '1.0.0',
              dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
            },
            null,
            2
          ),
          language: 'json',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUseTemplate(newProj);
    showNotification(`Initialized workspace from template "${tmpl.title}"!`);
  };

  return (
    <div id="templates-view-root" className="h-full overflow-y-auto bg-slate-50 p-6 text-slate-800 font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 bg-white p-6 rounded-2xl border shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Production Architecture Templates</h1>
            <span className="px-2 py-0.5 text-[11px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-semibold">
              Production Blueprint Library
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pre-configured production skeletons designed for instant synthesis, container packaging, and cross-platform compilation.
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 flex flex-col justify-between transition space-y-4 shadow-2xs"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-indigo-600">
                    {tmpl.platform === 'android' ? (
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                    ) : tmpl.platform === 'desktop' ? (
                      <Monitor className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Layers className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{tmpl.title}</h2>
                    <span className="text-[10px] font-mono text-indigo-600 font-semibold">{tmpl.category}</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                  {tmpl.platform}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {tmpl.desc}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {tmpl.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleCreateFromTemplate(tmpl)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition active:scale-95"
              >
                <span>Use Template</span>
              </button>

              <button
                onClick={() => onOpenAiWithPrompt(tmpl.defaultPrompt, tmpl.platform)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Customize with AI</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
