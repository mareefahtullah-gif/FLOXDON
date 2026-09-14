import React, { useState } from 'react';
import { 
  Sparkles, X, Smartphone, Monitor, Layers, HardDrive, 
  ArrowRight, CheckCircle2, RefreshCw, Cpu, Server, ShieldCheck
} from 'lucide-react';
import { PlatformTarget, Project } from '../types';

interface AiPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectGenerated: (project: Project) => void;
}

export const AiPromptModal: React.FC<AiPromptModalProps> = ({
  isOpen,
  onClose,
  onProjectGenerated,
}) => {
  const [prompt, setPrompt] = useState('');
  const [targetPlatform, setTargetPlatform] = useState<PlatformTarget>('fullstack');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const presets = [
    {
      title: 'IoT Telemetry & Fleet OS',
      desc: 'Vehicle tracking, battery telemetry, Capacitor Android APK, Express backend & Postgres.',
      platform: 'fullstack' as PlatformTarget,
    },
    {
      title: 'Doctor & Clinic Appointments',
      desc: 'Patient booking, time slots calendar, iOS IPA & Android mobile apps, PostgreSQL schema.',
      platform: 'mobile' as PlatformTarget,
    },
    {
      title: 'AI Audio & Music Studio',
      desc: 'Desktop Electron .exe/.dmg workstation, audio waveform visualizer, export system.',
      platform: 'desktop' as PlatformTarget,
    },
    {
      title: 'Warehouse & Inventory Scanner',
      desc: 'Barcode scanning, stock levels, realtime sync, Docker Compose production PaaS.',
      platform: 'fullstack' as PlatformTarget,
    },
  ];

  const steps = [
    'Synthesizing responsive cross-platform UI (Web, Mobile, Tablet, Desktop)...',
    'Generating Express microservice routes & REST endpoints...',
    'Generating PostgreSQL 16 schema & relational migration tables...',
    'Configuring Capacitor Android SDK 34 & iOS Xcode Info.plist...',
    'Generating Electron 30 desktop wrapper & production Dockerfile...',
    'Compiling project package manifests and live preview harness...',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 450);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          platformType: targetPlatform,
          projectType: targetPlatform,
        }),
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (data.success && data.project) {
        const slug = (data.project.projectName || 'custom-app')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-');

        const newProject: Project = {
          id: `proj_${Date.now()}`,
          name: data.project.projectName || 'Custom AI App',
          slug,
          description: data.project.description || prompt,
          platform: targetPlatform,
          files: data.project.files || [],
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          activeFile: 'src/App.tsx',
        };

        onProjectGenerated(newProject);
        onClose();
      }
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Generate Complete Application</h2>
              <p className="text-xs text-slate-500">Web, Android/iOS Native Apps, Desktop Software & PaaS</p>
            </div>
          </div>

          {!isGenerating && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Target Platform Picker */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Select Primary Target Platform:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setTargetPlatform('fullstack')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition ${
                  targetPlatform === 'fullstack'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>Full-Stack PaaS</span>
              </button>

              <button
                onClick={() => setTargetPlatform('mobile')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition ${
                  targetPlatform === 'mobile'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Android & iOS</span>
              </button>

              <button
                onClick={() => setTargetPlatform('desktop')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition ${
                  targetPlatform === 'desktop'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Desktop App</span>
              </button>

              <button
                onClick={() => setTargetPlatform('web')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition ${
                  targetPlatform === 'web'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Web & PWA</span>
              </button>
            </div>
          </div>

          {/* Natural Language Prompt Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Natural Language Specification:</span>
              <span className="text-[11px] text-slate-400 font-normal">Floxdon AI 3.8 Flash • Production Compiler</span>
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              placeholder="e.g. Build an encrypted team messaging application with direct chat channels, desktop notification sound, offline sync, Android APK, and PostgreSQL schema."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
            />
          </div>

          {/* One-Click Presets */}
          {!isGenerating && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Or pick a quick architecture preset:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presets.map((p) => (
                  <div
                    key={p.title}
                    onClick={() => {
                      setPrompt(p.desc);
                      setTargetPlatform(p.platform);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 cursor-pointer text-xs transition space-y-0.5"
                  >
                    <div className="font-semibold text-slate-900">{p.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generation Progress Steps Indicator */}
          {isGenerating && (
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-700 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  Generating Full-Stack Multi-Platform Architecture...
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                {steps.map((s, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 text-[11px] ${
                      idx === currentStep
                        ? 'text-blue-700 font-bold'
                        : idx < currentStep
                        ? 'text-slate-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {idx < currentStep ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : idx === currentStep ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin shrink-0"></div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-200 shrink-0"></div>
                    )}
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Runs 100% on production infra</span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Compiling...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Full App</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
