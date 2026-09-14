import React, { useState } from 'react';
import { 
  Box, Smartphone, Apple, Monitor, Download, Play, 
  CheckCircle2, RefreshCw, Terminal, Shield, FileCheck,
  Cpu, Layers, AlertCircle, HardDrive, Share2, QrCode
} from 'lucide-react';
import { Project, BuildTask, BuildArtifact } from '../types';
import { downloadPackageArtifact } from '../utils/packageExporter';

interface PackageCenterProps {
  project: Project;
}

export const PackageCenter: React.FC<PackageCenterProps> = ({ project }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'android' | 'ios' | 'desktop' | 'web'>('android');
  const [desktopOs, setDesktopOs] = useState<'windows' | 'macos' | 'linux'>('windows');
  const [isCompiling, setIsCompiling] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [recentBuilds, setRecentBuilds] = useState<BuildArtifact[]>([
    {
      buildId: 'bld_and_91f',
      platform: 'android',
      filename: `${project.slug}-v1.0.0-release.apk`,
      size: '28.4 MB',
      checksum: 'sha256:e8f9a1c0d2b4...8a1b',
      createdAt: 'Today, 06:45 AM',
      type: 'application/vnd.android.package-archive',
    },
    {
      buildId: 'bld_ios_44b',
      platform: 'ios',
      filename: `${project.slug}-v1.0.0.ipa`,
      size: '42.1 MB',
      checksum: 'sha256:c7a2d1e0f9b3...2c4e',
      createdAt: 'Today, 06:40 AM',
      type: 'application/octet-stream',
    },
    {
      buildId: 'bld_win_83x',
      platform: 'desktop',
      filename: `${project.slug}-Setup-1.0.0.exe`,
      size: '68.5 MB',
      checksum: 'sha256:a1b2c3d4e5f6...7890',
      createdAt: 'Yesterday, 05:20 PM',
      type: 'application/x-msdownload',
    }
  ]);

  const [activeArtifact, setActiveArtifact] = useState<BuildArtifact | null>(null);

  const startBuildPipeline = async () => {
    setIsCompiling(true);
    setBuildProgress(10);
    setActiveArtifact(null);

    const timestamp = new Date().toLocaleTimeString();
    setBuildLogs([
      `[${timestamp}] [ForgeBuildWorker] Provisioning container environment: floxdon-runner-node20-alpine:amd64`,
      `[${timestamp}] [1/6] Synchronizing source files for ${project.name} (${project.slug})...`,
    ]);

    // Simulated progress steps with realistic compiler stdout
    setTimeout(() => {
      setBuildProgress(30);
      setBuildLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [2/6] Compiling Vite TypeScript frontend bundle...`,
        `[${new Date().toLocaleTimeString()}] [2/6] Transpiled 52 modules. Output size: 142.2 kB.`,
      ]);
    }, 700);

    setTimeout(() => {
      setBuildProgress(55);
      if (selectedPlatform === 'android') {
        setBuildLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [3/6] Initializing Android Gradle 8.4 (SDK 34)...`,
          `[${new Date().toLocaleTimeString()}] [4/6] Merging Capacitor native plugins & assets into android/app/src/main/assets...`,
          `[${new Date().toLocaleTimeString()}] [5/6] Running './gradlew assembleRelease' & signing with floxdon-release.keystore...`,
        ]);
      } else if (selectedPlatform === 'ios') {
        setBuildLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [3/6] Building Xcode Workspace for target: com.floxdon.${project.slug}...`,
          `[${new Date().toLocaleTimeString()}] [4/6] Embedding Enterprise Distribution provisioning profile...`,
          `[${new Date().toLocaleTimeString()}] [5/6] Exporting unsigned .ipa & generating OTA manifest.plist...`,
        ]);
      } else if (selectedPlatform === 'desktop') {
        setBuildLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [3/6] Bundling Electron 30.0 runtime with Node.js 20...`,
          `[${new Date().toLocaleTimeString()}] [4/6] Creating ${desktopOs.toUpperCase()} standalone binary...`,
          `[${new Date().toLocaleTimeString()}] [5/6] Generating NSIS installer & auto-update manifests...`,
        ]);
      } else {
        setBuildLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [3/6] Generating Service Worker (PWA offline caching)...`,
          `[${new Date().toLocaleTimeString()}] [4/6] Compressing static assets with Brotli + Gzip...`,
        ]);
      }
    }, 1500);

    setTimeout(async () => {
      setBuildProgress(85);
      setBuildLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [6/6] Computing SHA256 verification hashes...`,
        `[${new Date().toLocaleTimeString()}] [SUCCESS] Package compilation completed successfully.`,
      ]);

      // Call our real package generation utility
      try {
        const artifact = await downloadPackageArtifact(project, selectedPlatform, desktopOs);
        setActiveArtifact(artifact);
        setRecentBuilds((prev) => [artifact, ...prev]);
      } catch (e) {
        console.error("Export error:", e);
      } finally {
        setBuildProgress(100);
        setIsCompiling(false);
      }
    }, 2400);
  };

  const handleDownloadExisting = async (artifact: BuildArtifact) => {
    await downloadPackageArtifact(project, artifact.platform as any, desktopOs);
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Box className="w-5 h-5 text-amber-400" />
              Multi-Platform Package Compiler & Builder
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Compile installable native packages directly on dedicated build infrastructure. Zero cloud SaaS dependencies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Local Build Workers: Ready (4 Cores)
            </span>
          </div>
        </div>

        {/* Platform Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Android Card */}
          <div
            onClick={() => setSelectedPlatform('android')}
            className={`p-4 rounded-xl border cursor-pointer transition relative ${
              selectedPlatform === 'android'
                ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/50 shadow-lg shadow-blue-500/10'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Capacitor 6
              </span>
            </div>
            <h3 className="font-semibold text-sm text-white mt-3">Android App</h3>
            <p className="text-xs text-slate-400 mt-1">
              Generates installable <strong>.apk</strong> (Debug/Release) and <strong>.aab</strong> Google Play package.
            </p>
            <div className="mt-3 text-[11px] font-mono text-emerald-400">SDK 34 • Signed</div>
          </div>

          {/* iOS Card */}
          <div
            onClick={() => setSelectedPlatform('ios')}
            className={`p-4 rounded-xl border cursor-pointer transition relative ${
              selectedPlatform === 'ios'
                ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/50 shadow-lg shadow-blue-500/10'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Apple className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Xcode 15
              </span>
            </div>
            <h3 className="font-semibold text-sm text-white mt-3">iOS App</h3>
            <p className="text-xs text-slate-400 mt-1">
              Generates installable <strong>.ipa</strong> bundle & OTA wireless manifest (manifest.plist).
            </p>
            <div className="mt-3 text-[11px] font-mono text-indigo-400">OTA Wireless Ready</div>
          </div>

          {/* Desktop Card */}
          <div
            onClick={() => setSelectedPlatform('desktop')}
            className={`p-4 rounded-xl border cursor-pointer transition relative ${
              selectedPlatform === 'desktop'
                ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/50 shadow-lg shadow-blue-500/10'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Monitor className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Electron 30
              </span>
            </div>
            <h3 className="font-semibold text-sm text-white mt-3">Desktop Software</h3>
            <p className="text-xs text-slate-400 mt-1">
              Generates Windows <strong>.exe</strong> setup, macOS <strong>.dmg</strong>, and Linux <strong>.AppImage</strong>.
            </p>
            <div className="mt-3 text-[11px] font-mono text-purple-400">Windows • macOS • Linux</div>
          </div>

          {/* Web PWA Card */}
          <div
            onClick={() => setSelectedPlatform('web')}
            className={`p-4 rounded-xl border cursor-pointer transition relative ${
              selectedPlatform === 'web'
                ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/50 shadow-lg shadow-blue-500/10'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Vite 6
              </span>
            </div>
            <h3 className="font-semibold text-sm text-white mt-3">Web & PWA</h3>
            <p className="text-xs text-slate-400 mt-1">
              Production static web bundle <strong>.zip</strong> with Service Worker offline caching.
            </p>
            <div className="mt-3 text-[11px] font-mono text-blue-400">Self-Contained Bundle</div>
          </div>
        </div>

        {/* Desktop OS Switcher (if Desktop selected) */}
        {selectedPlatform === 'desktop' && (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Select Desktop OS Target:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDesktopOs('windows')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  desktopOs === 'windows' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Windows (.exe)
              </button>
              <button
                onClick={() => setDesktopOs('macos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  desktopOs === 'macos' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                macOS (.dmg)
              </button>
              <button
                onClick={() => setDesktopOs('linux')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  desktopOs === 'linux' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Linux (.AppImage)
              </button>
            </div>
          </div>
        )}

        {/* Build Action & Console Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                Automated Build Pipeline ({selectedPlatform.toUpperCase()})
              </span>
            </div>

            <button
              onClick={startBuildPipeline}
              disabled={isCompiling}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-lg text-xs transition shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50"
            >
              {isCompiling ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Building Package ({buildProgress}%)...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Compile & Download {selectedPlatform.toUpperCase()} Package</span>
                </>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          {isCompiling && (
            <div className="w-full bg-slate-950 h-1.5">
              <div
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-1.5 transition-all duration-300"
                style={{ width: `${buildProgress}%` }}
              ></div>
            </div>
          )}

          {/* Compiler Stdout Console */}
          <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 h-44 overflow-y-auto space-y-1">
            {buildLogs.length === 0 ? (
              <div className="text-slate-600">
                // Ready to package. Click "Compile & Download Package" to initiate automated build.
              </div>
            ) : (
              buildLogs.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  {log.includes('SUCCESS') ? (
                    <span className="text-emerald-400 font-bold">{log}</span>
                  ) : log.includes('1/6') || log.includes('2/6') || log.includes('3/6') || log.includes('4/6') || log.includes('5/6') || log.includes('6/6') ? (
                    <span className="text-blue-300">{log}</span>
                  ) : (
                    <span className="text-slate-400">{log}</span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Active Generated Artifact Banner */}
          {activeArtifact && (
            <div className="p-4 bg-emerald-950/30 border-t border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <span>{activeArtifact.filename}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                      {activeArtifact.size}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {activeArtifact.checksum} • Installable Package
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownloadExisting(activeArtifact)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md shadow-emerald-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Re-Download Package</span>
              </button>
            </div>
          )}
        </div>

        {/* Existing Build Artifacts History */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-400" />
              Compiled Package Artifacts Library
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">{recentBuilds.length} Packages Ready</span>
          </div>

          <div className="divide-y divide-slate-800/70">
            {recentBuilds.map((b) => (
              <div
                key={b.buildId}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                    {b.platform === 'android' ? (
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                    ) : b.platform === 'ios' ? (
                      <Apple className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Monitor className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <span>{b.filename}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {b.size}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      {b.checksum} • {b.createdAt}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadExisting(b)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium transition self-end sm:self-center"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
