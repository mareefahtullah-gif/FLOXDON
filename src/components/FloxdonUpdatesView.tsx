import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Rocket,
  ShieldCheck,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  Check,
  Plus,
  Radio,
  Sliders,
  FileCode,
  Layers,
  ChevronRight,
  ExternalLink,
  GitBranch
} from 'lucide-react';
import { Project } from '../types';

interface FloxdonUpdatesViewProps {
  project?: Project;
}

export const FloxdonUpdatesView: React.FC<FloxdonUpdatesViewProps> = ({ project }) => {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState<'all' | 'production' | 'beta' | 'nightly'>('all');
  const [showNewReleaseModal, setShowNewReleaseModal] = useState(false);
  const [manifestData, setManifestData] = useState<any>(null);
  const [showManifestDrawer, setShowManifestDrawer] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New release form state
  const [newVersion, setNewVersion] = useState('2.5.1');
  const [newChannel, setNewChannel] = useState<'production' | 'beta' | 'nightly'>('production');
  const [newRolloutPct, setNewRolloutPct] = useState(100);
  const [isMandatory, setIsMandatory] = useState(false);
  const [newChangelog, setNewChangelog] = useState(`### Floxdon Release Highlights
- **Performance**: Reduced startup latency by 28% via bundle precompilation
- **Security**: Upgraded TLS cyphersuite to ChaCha20-Poly1305
- **Fix**: Resolved background task suspension on modern mobile OS`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReleases = async () => {
    setLoading(true);
    try {
      const channelParam = activeChannel === 'all' ? '' : `?channel=${activeChannel}`;
      const res = await fetch(`/api/floxdon/updates/releases${channelParam}`);
      const json = await res.json();
      if (json.success) {
        setReleases(json.releases);
      }
    } catch (err) {
      console.error('Failed to load Floxdon updates releases:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManifest = async () => {
    try {
      const res = await fetch('/api/floxdon/updates/manifest/omniflow-telemetry');
      const json = await res.json();
      setManifestData(json);
    } catch (err) {
      console.error('Failed to load updater manifest:', err);
    }
  };

  useEffect(() => {
    fetchReleases();
    fetchManifest();
  }, [activeChannel]);

  const handleUpdateRollout = async (releaseId: string, newPct: number) => {
    try {
      const res = await fetch('/api/floxdon/updates/rollout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ releaseId, stagedRolloutPct: newPct }),
      });
      const json = await res.json();
      if (json.success) {
        setNotification(json.message);
        setTimeout(() => setNotification(null), 3000);
        fetchReleases();
      }
    } catch (err) {
      console.error('Failed to update staged rollout:', err);
    }
  };

  const handleToggleStatus = async (releaseId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch('/api/floxdon/updates/rollout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ releaseId, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setNotification(`Release ${newStatus === 'active' ? 'resumed' : 'paused'} successfully!`);
        setTimeout(() => setNotification(null), 3000);
        fetchReleases();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handlePublishRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/floxdon/updates/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appSlug: project?.slug || 'omniflow-telemetry',
          appName: project?.name || 'OmniFlow Telemetry & Operations',
          version: newVersion,
          channel: newChannel,
          stagedRolloutPct: newRolloutPct,
          isMandatory,
          changelogMarkdown: newChangelog,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNotification(`Release v${newVersion} published successfully!`);
        setTimeout(() => setNotification(null), 3500);
        setShowNewReleaseModal(false);
        fetchReleases();
        fetchManifest();
      }
    } catch (err) {
      console.error('Failed to publish release:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyManifestToClipboard = () => {
    if (!manifestData) return;
    navigator.clipboard.writeText(JSON.stringify(manifestData, null, 2));
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 text-slate-900 font-sans">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shadow-indigo-500/20">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">Floxdon Updates</h1>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
                  Production OTA Distribution
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatic application version management, staged rollouts, differential updates, and live client manifests.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowManifestDrawer(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-500" />
              <span>Updater Manifest</span>
            </button>

            <button
              onClick={() => setShowNewReleaseModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Update</span>
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <div className="bg-indigo-600 text-white text-xs px-6 py-2.5 font-medium flex items-center justify-between shadow-xs">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-indigo-100 hover:text-white">✕</button>
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Release Channels Selector & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 mr-1">Channel Filter:</span>
            {(['all', 'production', 'beta', 'nightly'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition ${
                  activeChannel === ch
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Active Rollouts: <strong className="text-slate-900 font-mono">2</strong></span>
            <span>Target OS Fleets: <strong className="text-slate-900 font-mono">Android, Win, Linux</strong></span>
            <span>Kill Switch: <strong className="text-emerald-600 font-semibold">Armed</strong></span>
          </div>
        </div>

        {/* Releases List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
              Loading releases & distribution channels...
            </div>
          ) : releases.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs">
              No releases found for this channel filter.
            </div>
          ) : (
            releases.map((rel) => (
              <div
                key={rel.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition hover:border-slate-300"
              >
                {/* Header Row */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      rel.channel === 'production'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rel.channel === 'beta'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {rel.channel === 'production' ? 'PROD' : rel.channel === 'beta' ? 'BETA' : 'DEV'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900 font-mono">v{rel.version}</h2>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                          rel.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {rel.status}
                        </span>
                        {rel.isMandatory && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Mandatory Update
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{rel.appName}</span>
                        <span>•</span>
                        <span>Released: {new Date(rel.releaseDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Staged Rollout Slider & Controls */}
                  <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-600">Staged Rollout:</span>
                        <span className="font-mono font-bold text-indigo-600">{rel.stagedRolloutPct}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[10, 25, 50, 100].map((pct) => (
                          <button
                            key={pct}
                            onClick={() => handleUpdateRollout(rel.id, pct)}
                            className={`px-2 py-0.5 text-[10px] font-mono rounded font-semibold transition ${
                              rel.stagedRolloutPct === pct
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-8 w-px bg-slate-200"></div>

                    <button
                      onClick={() => handleToggleStatus(rel.id, rel.status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        rel.status === 'active'
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {rel.status === 'active' ? 'Pause Rollout' : 'Resume Rollout'}
                    </button>
                  </div>
                </div>

                {/* Content Details: Artifacts & Changelog */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/50">
                  {/* Left: Artifacts & Checksums */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                      Distributed Binary Artifacts
                    </h3>
                    <div className="space-y-2">
                      {rel.artifacts.map((art: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            {art.platform === 'android' ? (
                              <Smartphone className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Laptop className="w-4 h-4 text-blue-600" />
                            )}
                            <div>
                              <div className="font-semibold text-slate-800 uppercase font-mono">
                                {art.format} • {art.fileSizeMb} MB
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[240px]">
                                SHA256: {art.sha256}
                              </div>
                            </div>
                          </div>

                          <a
                            href={art.downloadUrl}
                            download
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-500" />
                            <span>Download</span>
                          </a>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
                      Min OS: Android {rel.minOsVersion?.android} • Win {rel.minOsVersion?.windows} • Linux {rel.minOsVersion?.linux}
                    </div>
                  </div>

                  {/* Right: Changelog */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                      Version Changelog
                    </h3>
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1.5 font-sans whitespace-pre-wrap leading-relaxed">
                      {rel.changelogMarkdown}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Updater Manifest Drawer Modal */}
      {showManifestDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Live Client Auto-Updater Manifest (JSON)</h3>
              </div>
              <button
                onClick={() => setShowManifestDrawer(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs max-h-96 overflow-y-auto">
              <pre>{JSON.stringify(manifestData, null, 2)}</pre>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Endpoint: GET /api/floxdon/updates/manifest/omniflow-telemetry
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyManifestToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  {copiedManifest ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedManifest ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={() => setShowManifestDrawer(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish New Release Modal */}
      {showNewReleaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handlePublishRelease}>
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-sm text-slate-900">Publish New Floxdon Update</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewReleaseModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Version String *</label>
                    <input
                      type="text"
                      value={newVersion}
                      onChange={(e) => setNewVersion(e.target.value)}
                      required
                      placeholder="e.g. 2.5.1"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Channel *</label>
                    <select
                      value={newChannel}
                      onChange={(e: any) => setNewChannel(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                    >
                      <option value="production">Production (Stable)</option>
                      <option value="beta">Beta Channel</option>
                      <option value="nightly">Nightly Build</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Initial Staged Rollout Pct</label>
                    <span className="font-mono text-indigo-600 font-bold">{newRolloutPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={newRolloutPct}
                    onChange={(e) => setNewRolloutPct(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="mandatoryCheck"
                    checked={isMandatory}
                    onChange={(e) => setIsMandatory(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="mandatoryCheck" className="text-slate-700 font-medium cursor-pointer">
                    Mark as Mandatory Update (forces client update before execution)
                  </label>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Release Changelog (Markdown)</label>
                  <textarea
                    rows={4}
                    value={newChangelog}
                    onChange={(e) => setNewChangelog(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs leading-relaxed"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewReleaseModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-xs"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
