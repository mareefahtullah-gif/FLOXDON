import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  FileCode,
  Cpu,
  Rocket,
  Download,
  Trash2,
  Copy,
  Smartphone,
  Monitor,
  Globe,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Project, PlatformTarget } from '../types';
import { downloadProjectArchive } from '../utils/packageExporter';

interface ProjectsViewProps {
  projects: Project[];
  currentProjectId: string;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (project: Project) => void;
  onOpenWorkspace: () => void;
  onNavigateBuilds: () => void;
  onNavigateDeployments: () => void;
  showNotification: (msg: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  onOpenWorkspace,
  onNavigateBuilds,
  onNavigateDeployments,
  showNotification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | PlatformTarget>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Project Form State
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectPlatform, setNewProjectPlatform] = useState<PlatformTarget>('fullstack');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = selectedFilter === 'all' || p.platform === selectedFilter;
    return matchesSearch && matchesPlatform;
  });

  const handleCreateNewProject = () => {
    if (!newProjectName.trim()) return;

    const slug = newProjectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      slug,
      description: newProjectDesc.trim() || 'Custom production application created in Floxdon Studio.',
      platform: newProjectPlatform,
      framework: 'React 19 + Vite + TypeScript',
      version: '1.0.0',
      activeFile: 'src/App.tsx',
      files: [
        {
          path: 'src/App.tsx',
          name: 'App.tsx',
          content: `import React from 'react';\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800 font-sans">\n      <div className="max-w-md w-full p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-4">\n        <h1 className="text-xl font-bold text-slate-900">${newProjectName}</h1>\n        <p className="text-xs text-slate-500">${newProjectDesc || 'Built with ForgeStudio'}</p>\n        <div className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">\n          Platform: ${newProjectPlatform.toUpperCase()}\n        </div>\n      </div>\n    </div>\n  );\n}`,
          language: 'typescript',
        },
        {
          path: 'package.json',
          name: 'package.json',
          content: JSON.stringify(
            {
              name: slug,
              version: '1.0.0',
              private: true,
              scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
              dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0', 'lucide-react': '^1.0.0' },
            },
            null,
            2
          ),
          language: 'json',
        },
        {
          path: 'Dockerfile',
          name: 'Dockerfile',
          content: `FROM node:20-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=build /app/dist /usr/share/nginx/html\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]`,
          language: 'dockerfile',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateProject(newProject);
    setIsCreateModalOpen(false);
    setNewProjectName('');
    setNewProjectDesc('');
    showNotification(`Created project "${newProject.name}"!`);
  };

  return (
    <div id="projects-view-root" className="h-full overflow-y-auto bg-slate-50 p-6 text-slate-800 font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 bg-white p-6 rounded-2xl border shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Project Repositories</h1>
            <span className="px-2 py-0.5 text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-semibold">
              {projects.length} Repositories
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your full-stack web, mobile (Capacitor/Native), and desktop applications in one unified workspace.
          </p>
        </div>

        <button
          id="new-project-open-modal-btn"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Project Repository</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs w-full sm:w-auto overflow-x-auto shadow-2xs">
          {(['all', 'fullstack', 'web', 'android', 'ios', 'desktop'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase transition whitespace-nowrap ${
                selectedFilter === filter
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((proj) => {
          const isCurrent = proj.id === currentProjectId;

          return (
            <div
              key={proj.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition ${
                isCurrent
                  ? 'bg-blue-50/40 border-blue-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600">
                      {proj.platform === 'android' ? (
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                      ) : proj.platform === 'desktop' ? (
                        <Monitor className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Layers className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{proj.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-blue-100 text-blue-700 font-semibold border border-blue-200">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{proj.slug}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                    {proj.platform}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>{proj.files.length} Files</span>
                  <span>{proj.framework}</span>
                  <span>v{proj.version}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    onSelectProject(proj.id);
                    onOpenWorkspace();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition active:scale-95 shadow-2xs"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Open IDE</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onSelectProject(proj.id);
                      onNavigateBuilds();
                    }}
                    title="Package application"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectProject(proj.id);
                      onNavigateDeployments();
                    }}
                    title="Deploy to PaaS"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition"
                  >
                    <Rocket className="w-3.5 h-3.5 text-emerald-600" />
                  </button>

                  <button
                    onClick={() => downloadProjectArchive(proj)}
                    title="Download Project ZIP"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Creating New Project */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-slate-900">Create New Project Repository</h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-medium">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. NextGen Telemetry Hub"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium">Description</label>
                <textarea
                  placeholder="Project purpose, target users, and key features..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium">Target Platform</label>
                <select
                  value={newProjectPlatform}
                  onChange={(e: any) => setNewProjectPlatform(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="fullstack">Full-Stack (React 19 + Express + PostgreSQL)</option>
                  <option value="web">Web Application (React 19 + Vite)</option>
                  <option value="android">Android Native/Capacitor (APK/AAB)</option>
                  <option value="ios">iOS Application (IPA)</option>
                  <option value="desktop">Desktop Application (Electron 30)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewProject}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
