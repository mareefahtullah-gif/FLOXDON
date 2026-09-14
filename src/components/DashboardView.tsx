import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Rocket,
  Cpu,
  Server,
  Database,
  Globe,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  FolderGit2,
  Download,
  Plus,
  Mic,
  MicOff,
  ArrowRight,
  Paperclip,
  X,
  FileCode,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SidebarNavTab, Project, Deployment } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: SidebarNavTab) => void;
  projects: Project[];
  deployments: Deployment[];
  onOpenAiBuilder: (initialPrompt?: string) => void;
  onOpenPWAInstall?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  projects,
  deployments,
  onOpenAiBuilder,
  onOpenPWAInstall,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleSendPrompt = (textToSend?: string) => {
    const finalPrompt = textToSend || promptInput;
    if (!finalPrompt.trim()) return;
    onOpenAiBuilder(finalPrompt.trim());
  };

  const handleFeelingLucky = () => {
    const luckyPrompts = [
      'Build a high-performance offline-first task tracker with calendar schedule and biometric auth.',
      'Build a real-time collaborative whiteboarding & notes app with cloud sync and markdown export.',
      'Build a modern ecommerce store with instant checkout, live order tracking, and product filters.',
      'Build an Android & Web fitness habit tracker with audio breathing exercises and SQLite charts.'
    ];
    const picked = luckyPrompts[Math.floor(Math.random() * luckyPrompts.length)];
    setPromptInput(picked);
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is not supported in this browser. Please type your prompt.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setPromptInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error', err);
      setIsListening(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFileNames = Array.from(files).map((f) => f.name);
    setAttachedFiles((prev) => [...prev, ...newFileNames]);
  };

  const quickPills = [
    { label: '📱 Build an Android app', prompt: 'Build an Android app with native navigation, offline caching, and responsive UI' },
    { label: '💾 Cloud Sync', prompt: 'Add real-time cloud data synchronization and automatic offline queue' },
    { label: '📊 Database & Tables', prompt: 'Create relational PostgreSQL tables with schemas, filters, and live search' },
    { label: '✉️ Notifications', prompt: 'Integrate Web Push Notifications and device alert triggers' },
    { label: '📅 Scheduler', prompt: 'Add an interactive calendar scheduler with event reminders' },
  ];

  const galleryTemplates = [
    {
      title: 'Mobile & Web Cross-Platform App',
      description: 'Native Android APK bundle, responsive tablet layouts, and PWA offline storage.',
      tag: 'Android & Web',
      prompt: 'Build a cross-platform mobile & web application with Android APK support and offline PWA service worker.'
    },
    {
      title: 'Real-Time Team Workspace',
      description: 'Collaborative document editing, role permissions, activity logs, and chat.',
      tag: 'Full-Stack',
      prompt: 'Build a team collaboration workspace with live document editing, activity logs, and user roles.'
    },
    {
      title: 'Telemetry & Analytics Dashboard',
      description: 'Real-time charts, event counters, server metrics, and interactive filtering.',
      tag: 'Dashboard',
      prompt: 'Build a real-time analytics dashboard with interactive charts, event counters, and telemetry metrics.'
    }
  ];

  return (
    <div id="dashboard-view-root" className="h-full overflow-y-auto bg-white text-slate-800 font-sans">
      {/* Hidden File Picker */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10 sm:space-y-14">
        {/* ========================================================================= */}
        {/* GOOGLE AI STUDIO HERO: Sparkle Icon + Centered Headline + Big Prompt Box  */}
        {/* ========================================================================= */}
        <section className="text-center space-y-6 pt-2 sm:pt-4">
          {/* Sparkle Icon */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto shadow-xs">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>

          {/* Large Centered Headline */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Build your ideas with Floxdon
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Autonomous multi-agent pipeline for instant web, mobile, and desktop synthesis.
            </p>
          </div>

          {/* Big Google AI Studio Rounded Prompt Input Box */}
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-slate-200/90 shadow-sm bg-white p-3 sm:p-4 text-left transition hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/60">
              {/* Attached Files Chips */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {attachedFiles.map((fn, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono"
                    >
                      <Paperclip className="w-3 h-3" />
                      <span>{fn}</span>
                      <button
                        onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="hover:text-rose-600 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Textarea */}
              <textarea
                id="dashboard-prompt-input"
                rows={2}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
                placeholder="Describe an app and let Floxdon AI do the rest"
                className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
              />

              {/* Bottom Actions Row inside prompt container */}
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100/80">
                {/* Left: Attachment + Voice buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                    title="Attach files or documentation"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleVoiceInput}
                    className={`p-2 rounded-xl transition ${
                      isListening ? 'bg-rose-100 text-rose-600 animate-pulse' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                    title="Dictate with microphone"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>

                {/* Right: "I'm feeling lucky" + Send Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFeelingLucky}
                    className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                    title="Generate an inspirational app idea"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>I'm feeling lucky</span>
                  </button>

                  <button
                    id="dashboard-submit-prompt-btn"
                    onClick={() => handleSendPrompt()}
                    disabled={!promptInput.trim() && attachedFiles.length === 0}
                    className="w-8 h-8 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center transition shadow-2xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Synthesize application"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Suggestion Pills Row */}
            <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar justify-start sm:justify-center">
              {quickPills.map((pill) => (
                <button
                  key={pill.label}
                  onClick={() => {
                    setPromptInput((prev) => {
                      const trimmed = prev.trim();
                      if (!trimmed) return pill.prompt;
                      if (trimmed.includes(pill.prompt)) return trimmed;
                      return `${trimmed}. ${pill.prompt}`;
                    });
                  }}
                  className="px-3 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium whitespace-nowrap transition shadow-2xs hover:border-slate-300"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* DISCOVER AND REMIX APP IDEAS                                              */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Discover and remix app ideas
            </h2>
            <button
              onClick={() => onNavigate('templates')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
            >
              <span>Browse the app gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {galleryTemplates.map((tpl, i) => (
              <div
                key={i}
                onClick={() => handleSendPrompt(tpl.prompt)}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    {tpl.tag}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Click to build</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FLOXDON CONTROL PLANE & STATUS SECTION (PRESERVING ALL EXISTING DATA)     */}
        {/* ========================================================================= */}
        <section className="space-y-5 pt-4 border-t border-slate-100">
          {/* Top Control Plane Banner Card */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Floxdon Studio Control Plane
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
                  Production Active
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                Unified development studio with side-by-side IDE, compiler pipelines, container sandboxes, and 1-click device PWA installation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
              {onOpenPWAInstall && (
                <button
                  onClick={onOpenPWAInstall}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Install PWA</span>
                </button>
              )}

              <button
                id="dashboard-open-ai-btn"
                onClick={() => onOpenAiBuilder()}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Multi-Agent Pipeline</span>
              </button>

              <button
                id="dashboard-deploy-btn"
                onClick={() => onNavigate('deployments')}
                className="flex items-center gap-2 px-3 sm:px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
              >
                <Rocket className="w-3.5 h-3.5 text-indigo-600" />
                <span>Deploy Stack</span>
              </button>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div
              onClick={() => onNavigate('projects')}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-2xs transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">Active Projects</span>
                <FolderGit2 className="w-4 h-4 text-blue-600 group-hover:scale-105 transition" />
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-2">{projects.length}</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                <span>Web, Android, iOS, Desktop</span>
              </div>
            </div>

            <div
              onClick={() => onNavigate('servers')}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-2xs transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">Docker Sandboxes</span>
                <Server className="w-4 h-4 text-indigo-600 group-hover:scale-105 transition" />
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-2">46 Running</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Zero Port Conflicts</span>
              </div>
            </div>

            <div
              onClick={() => onNavigate('builds')}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-2xs transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">Build Pipelines</span>
                <Cpu className="w-4 h-4 text-cyan-600 group-hover:scale-105 transition" />
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-2">8 Workers</div>
              <div className="text-[11px] text-blue-600 mt-1 font-medium">APK, IPA, Electron, Web</div>
            </div>

            <div
              onClick={() => onNavigate('deployments')}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-2xs transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">PaaS Deployments</span>
                <Rocket className="w-4 h-4 text-emerald-600 group-hover:scale-105 transition" />
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-2">{deployments.length} Active</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-medium">Auto-SSL + DNS Live</div>
            </div>
          </div>

          {/* Cluster Hardware Load & Quick Launchpad */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Cluster Load Card */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/90 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Cluster Load & Sandboxes</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">Docker Engine 26.1.4 (AMD64)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
                    <span>CPU Allocation</span>
                    <span className="text-slate-900 font-bold font-mono">31.2%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '31.2%' }}></div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1.5 font-mono">28.7 / 92 Cores</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
                    <span>RAM Usage</span>
                    <span className="text-slate-900 font-bold font-mono">42.8%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '42.8%' }}></div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1.5 font-mono">123.4 GB / 288 GB</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
                    <span>NVMe Storage</span>
                    <span className="text-slate-900 font-bold font-mono">21.5%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '21.5%' }}></div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1.5 font-mono">1.18 TB / 5.50 TB</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">4 Master/Worker Nodes Healthy</span>
                  <span>• Ubuntu 24.04 LTS</span>
                </div>
                <button
                  onClick={() => onNavigate('servers')}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold transition"
                >
                  <span>View Nodes & Quotas</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Operations Launchpad */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 flex flex-col justify-between space-y-3 shadow-2xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Unified Operations</h3>
                <p className="text-xs text-slate-500 mt-0.5">Instant shortcuts into studio modules.</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => onNavigate('files')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 text-xs text-slate-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-semibold">Workspace (Editor)</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => onNavigate('builds')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50/50 border border-slate-100 text-xs text-slate-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-cyan-600" />
                    <span className="font-semibold">Package Native APK</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => onNavigate('databases')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-100 text-xs text-slate-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-semibold">PostgreSQL Studio</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
