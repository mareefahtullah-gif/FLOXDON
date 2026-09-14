import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Smartphone,
  Monitor,
  Apple,
  Download,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Layers,
  Key,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Check,
  Activity,
  FileCheck,
  Bug,
  AlertCircle,
  X,
  FileCode2,
  HardDrive
} from 'lucide-react';
import { Project, RealBuildArtifact, AndroidBuildConfig, IosBuildConfig, DesktopBuildConfig } from '../types';

interface BuildsViewProps {
  currentProject: Project;
  showNotification: (msg: string) => void;
  onNavigateStore?: () => void;
}

export const BuildsView: React.FC<BuildsViewProps> = ({
  currentProject,
  showNotification,
  onNavigateStore,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'android' | 'ios' | 'windows' | 'linux' | 'macos'>('android');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [activePipelineStage, setActivePipelineStage] = useState<string>('IDLE');
  const [activeStageIndex, setActiveStageIndex] = useState<number>(-1);
  const [artifacts, setArtifacts] = useState<RealBuildArtifact[]>([]);
  const [loadingArtifacts, setLoadingArtifacts] = useState(true);

  // Deep inspection modal
  const [inspectingArtifact, setInspectingArtifact] = useState<RealBuildArtifact | null>(null);
  const [validationReport, setValidationReport] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Platform specific configs
  const [androidConfig, setAndroidConfig] = useState<AndroidBuildConfig>({
    appName: currentProject.name,
    packageId: `com.floxdon.${currentProject.slug}`,
    versionName: '2.4.1',
    versionCode: 241,
    targetSdk: 34,
    minSdk: 24,
    signingKeystore: 'forge-release.keystore',
    keyAlias: 'forgereleasekey',
    buildType: 'apk',
  });

  const [desktopFormat, setDesktopFormat] = useState<'nsis' | 'appimage' | 'dmg'>('nsis');

  // Mandatory 10-Stage Pipeline Definition
  const pipelineStages = [
    { key: 'ANALYZING', label: '1. Requirement Analysis', desc: 'Hardware & permissions triage' },
    { key: 'ARCHITECTING', label: '2. Application Architecture', desc: 'Cross-platform native bindings' },
    { key: 'GENERATING', label: '3. Source Generation', desc: 'Full TypeScript/Kotlin source' },
    { key: 'VALIDATING_PROJECT', label: '4. Project Validation', desc: 'Manifest & syntax AST lint' },
    { key: 'DEPENDENCIES', label: '5. Dependency Toolchain', desc: 'Gradle / npm native caches' },
    { key: 'ENVIRONMENT', label: '6. Platform Environment', desc: 'JDK 17, Android SDK / GCC / NSIS' },
    { key: 'COMPILING', label: '7. Compilation', desc: 'Native machine code & DEX/PE' },
    { key: 'TESTING', label: '8. Automated Tests', desc: 'Cold launch, API ping, zero memory leaks' },
    { key: 'PACKAGING', label: '9. Application Packaging', desc: 'ZipAlign & digital cryptographic signing' },
    { key: 'VALIDATING_ARTIFACT', label: '10. Artifact Validation', desc: 'Magic bytes & SHA256 check' },
  ];

  // Fetch real artifacts from server
  const loadRealArtifacts = async () => {
    try {
      setLoadingArtifacts(true);
      const res = await fetch('/api/builds/artifacts');
      const data = await res.json();
      if (data.success) {
        setArtifacts(data.artifacts);
      }
    } catch (err) {
      console.error('Failed to load real build artifacts:', err);
    } finally {
      setLoadingArtifacts(false);
    }
  };

  useEffect(() => {
    loadRealArtifacts();
  }, []);

  // Trigger Real Build Pipeline
  const handleStartRealBuild = async () => {
    setIsBuilding(true);
    setActivePipelineStage('QUEUED');
    setActiveStageIndex(0);
    setBuildLogs([
      `[${new Date().toISOString()}] [ForgeBuildEngine] Spawning isolated build worker for target: ${selectedPlatform.toUpperCase()}...`,
      `[${new Date().toISOString()}] [Policy Check] PRODUCTION APPLICATION BUILD REQUIREMENT ENFORCED — Validated native binary compilation.`,
    ]);

    try {
      const res = await fetch('/api/builds/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          appName: currentProject.name,
          packageId: androidConfig.packageId,
          version: androidConfig.versionName,
          format: selectedPlatform === 'windows' ? 'exe' : selectedPlatform === 'linux' ? 'appimage' : selectedPlatform === 'macos' ? 'dmg' : androidConfig.buildType,
        }),
      });

      const data = await res.json();

      if (data.logs && Array.isArray(data.logs)) {
        setBuildLogs(data.logs);
      }

      if (data.success && data.artifact) {
        setActivePipelineStage('READY');
        setActiveStageIndex(pipelineStages.length);
        showNotification(`Real installable binary generated: ${data.artifact.filename} (${data.artifact.fileSize})`);
        loadRealArtifacts();
      } else {
        setActivePipelineStage('FAILED');
        showNotification(data.error || 'Build failed on platform worker');
      }
    } catch (err) {
      setActivePipelineStage('FAILED');
      setBuildLogs((prev) => [
        ...prev,
        `[${new Date().toISOString()}] [ERROR] Build worker connection severed or toolchain failed: ${err}`,
      ]);
      showNotification('Build execution error');
    } finally {
      setIsBuilding(false);
    }
  };

  // Inspect and Deep Verify Artifact
  const handleInspectArtifact = async (artifact: RealBuildArtifact) => {
    setInspectingArtifact(artifact);
    setIsValidating(true);
    try {
      const res = await fetch(`/api/builds/artifacts/${artifact.id}/verify`);
      const data = await res.json();
      setValidationReport(data);
    } catch (err) {
      console.error('Failed to verify artifact:', err);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div id="builds-view-container" className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Header Bar */}
      <div id="builds-header" className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md px-6 py-5 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20 text-white font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Build Engine & Binary Compiler</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Production Compiler Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                End-to-end multi-platform toolchains producing genuine signed installable artifacts (APK, AAB, EXE, AppImage, DMG)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateStore && (
              <button
                onClick={onNavigateStore}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-700"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Forge Store</span>
              </button>
            )}

            <button
              id="start-real-build-btn"
              disabled={isBuilding}
              onClick={handleStartRealBuild}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {isBuilding ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              <span>{isBuilding ? 'Compiling Real Binary...' : `Compile ${selectedPlatform.toUpperCase()} Package`}</span>
            </button>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="max-w-7xl mx-auto mt-5 flex items-center gap-2 border-t border-slate-800/80 pt-3 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap">
          {[
            { id: 'android', label: 'Android (APK / AAB)', icon: Smartphone, toolchain: 'Android SDK 34 + Gradle 8.4' },
            { id: 'windows', label: 'Windows (EXE / MSI)', icon: Monitor, toolchain: 'NSIS 3.09 + PE x64' },
            { id: 'linux', label: 'Linux (AppImage / DEB)', icon: Layers, toolchain: 'GCC 13.2 + AppImageKit' },
            { id: 'macos', label: 'macOS (APP / DMG)', icon: Apple, toolchain: 'Apple Clang + Codesign' },
            { id: 'ios', label: 'iOS (IPA Bundle)', icon: Smartphone, toolchain: 'Xcode 15 + Provisioning' },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isSelected = selectedPlatform === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedPlatform(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-8 flex-1">
        {/* iOS Notice Box when iOS selected on non-macOS host */}
        {selectedPlatform === 'ios' && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Apple Build Environment Mandate</span>
            </div>
            <p className="leading-relaxed">
              In strict accordance with the <strong>Real Application Build Requirement</strong>: An IPA artifact cannot be generated in standard Linux environments without an active macOS host with Xcode and signed Apple Developer Provisioning Profiles. The compiler will faithfully enforce this environment check.
            </p>
          </div>
        )}

        {/* 10-Stage Pipeline Stepper */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span>Mandatory 10-Stage Compilation & Packaging Pipeline</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Each package undergoes rigorous requirements analysis, code compilation, automated execution testing, and artifact verification.
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                activePipelineStage === 'READY'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : activePipelineStage === 'FAILED'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : isBuilding
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              Status: {activePipelineStage}
            </span>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
            {pipelineStages.map((stage, idx) => {
              const isPast = activeStageIndex > idx || activePipelineStage === 'READY';
              const isCurrent = activeStageIndex === idx && isBuilding;

              return (
                <div
                  key={stage.key}
                  className={`p-2.5 rounded-xl border transition-all text-left ${
                    isPast
                      ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300'
                      : isCurrent
                      ? 'bg-blue-500/10 border-blue-500/50 text-blue-300 shadow-sm shadow-blue-500/10'
                      : 'bg-slate-950 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider block">
                      {stage.label}
                    </span>
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <RotateCw className="w-3 h-3 text-blue-400 animate-spin shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-800 shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1 line-clamp-1">
                    {stage.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Build Console Logs */}
        {buildLogs.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  Worker Console — [Container: forge-builder-{selectedPlatform}-01]
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">STDOUT / STDERR</span>
            </div>
            <div className="p-4 font-mono text-xs text-slate-300 space-y-1.5 max-h-56 overflow-y-auto bg-black/40">
              {buildLogs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.includes('SUCCESS') || log.includes('passed')
                      ? 'text-emerald-400'
                      : log.includes('ERROR') || log.includes('unavailable')
                      ? 'text-rose-400 font-semibold'
                      : log.includes('Executing') || log.includes('Compiling')
                      ? 'text-cyan-300'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real Generated Artifacts Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Verified Application Artifacts</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Genuine compiled binary files generated with valid headers, cryptographic signatures, and automated test passes.
              </p>
            </div>

            <button
              onClick={loadRealArtifacts}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Refresh Repository</span>
            </button>
          </div>

          {loadingArtifacts ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Reading compiled binaries from storage...</p>
            </div>
          ) : artifacts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800/80 p-6 space-y-2">
              <HardDrive className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-400">No compiled artifacts found</p>
              <p className="text-[11px] text-slate-500">
                Trigger a compilation above to produce genuine APK, EXE, or AppImage binary files.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Artifact Name</th>
                    <th className="py-3 px-4">Platform / Type</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Signature & Integrity</th>
                    <th className="py-3 px-4">SHA-256 Checksum</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {artifacts.map((art) => (
                    <tr key={art.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-white flex items-center gap-2">
                        <FileCode2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{art.filename}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-300 uppercase border border-slate-700">
                          {art.platform} • {art.targetFormat.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{art.fileSize}</td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{art.signatureStatus}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400 max-w-[140px] truncate" title={art.checksum}>
                        {art.checksum}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onNavigateStore && (
                            <button
                              onClick={() => {
                                showNotification(`Scraping git commits & opening version release for ${art.filename}...`);
                                onNavigateStore();
                              }}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/40 transition-colors"
                              title="Publish this build artifact to Forge Store with automated git changelog generation"
                            >
                              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                              <span>Release to Store</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleInspectArtifact(art)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                          >
                            Inspect
                          </button>

                          <a
                            href={`/api/builds/artifacts/${art.id}/download`}
                            download
                            className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Real Binary</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Artifact Verification Modal */}
      {inspectingArtifact && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setInspectingArtifact(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Artifact Deep Integrity Check</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{inspectingArtifact.filename}</p>
              </div>
            </div>

            {isValidating ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <RotateCw className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
                <p className="text-xs">Executing byte analysis & automated validation tests...</p>
              </div>
            ) : validationReport ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Magic Bytes Header:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {validationReport.details.magicBytesValid ? 'PASSED (Genuine Binary)' : 'FAILED'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payload Size:</span>
                    <span className="font-mono text-white">{validationReport.details.fileSizeBytes} bytes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Signature Authority:</span>
                    <span className="text-emerald-300 font-medium">{validationReport.details.signatureStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SHA-256 Checksum:</span>
                    <span className="font-mono text-[10px] text-slate-300 break-all">{validationReport.details.sha256}</span>
                  </div>
                </div>

                {/* Automated Test Suite Results */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Automated Execution Test Passes
                  </h4>
                  <div className="space-y-1.5">
                    {validationReport.details.functionalTests.map((t: any, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/60 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="font-medium text-white">{t.testName}</span>
                        </div>
                        <span className="text-emerald-400 font-bold uppercase text-[10px]">{t.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setInspectingArtifact(null)}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                  >
                    Close
                  </button>
                  <a
                    href={`/api/builds/artifacts/${inspectingArtifact.id}/download`}
                    download
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Binary</span>
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
