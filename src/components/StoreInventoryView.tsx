import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  RefreshCw,
  Download,
  Layers,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  ExternalLink,
  Search,
  Filter,
  ArrowUpDown,
  Smartphone,
  Monitor,
  Apple,
  Globe,
  Database,
  Cloud,
  Eye,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ForgeStoreApp } from '../types';

interface StoreCategoryIndex {
  name: string;
  slug: string;
  count: number;
  icon?: string;
  description: string;
}

interface InventoryResponse {
  success: boolean;
  cloudBucket: string;
  cloudPath: string;
  totalApps: number;
  totalDownloads: number;
  lastSyncedAt: string;
  categories: StoreCategoryIndex[];
  apps: ForgeStoreApp[];
}

interface StoreInventoryViewProps {
  onSelectApp: (app: ForgeStoreApp) => void;
  showNotification: (msg: string) => void;
  onRefreshApps: () => void;
}

export const StoreInventoryView: React.FC<StoreInventoryViewProps> = ({
  onSelectApp,
  showNotification,
  onRefreshApps,
}) => {
  const [inventory, setInventory] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [inspectingManifestApp, setInspectingManifestApp] = useState<ForgeStoreApp | null>(null);
  const [downloadingAppId, setDownloadingAppId] = useState<string | null>(null);

  // Fetch Inventory and Categories from Backend
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/forge-store/inventory');
      const data = await res.json();
      if (data.success) {
        setInventory(data);
      }
    } catch (err) {
      console.error('Failed to load store inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Trigger On-Demand Cloud Storage Sync
  const handleCloudSync = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/forge-store/inventory/sync', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Cloud Registry synchronized with ${data.cloudBucket}!`);
        await fetchInventory();
        onRefreshApps();
      } else {
        throw new Error(data.error || 'Failed to sync with cloud registry');
      }
    } catch (err: any) {
      showNotification(err.message || 'Cloud storage sync error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Trigger Real Binary Download with Dynamic Counter Increment
  const handleDownloadApp = async (app: ForgeStoreApp, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setDownloadingAppId(app.id);
      const res = await fetch(`/api/forge-store/apps/${app.id}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'dev_local_admin' }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Download initiated! Dynamic counter for '${app.name}': ${data.totalDownloads}`);
        // Increment locally for instant UI response
        setInventory((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            totalDownloads: prev.totalDownloads + 1,
            apps: prev.apps.map((a) =>
              a.id === app.id ? { ...a, downloadsCount: (a.downloadsCount || 0) + 1 } : a
            ),
          };
        });

        // Trigger native download
        const dlUrl = data.downloadUrl || `/api/builds/artifacts/art_${app.platforms?.[0] || 'web'}/download`;
        const a = document.createElement('a');
        a.href = dlUrl;
        a.setAttribute('download', `${app.slug}-${app.version || '1.0.0'}`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err: any) {
      showNotification(err.message || 'Download error');
    } finally {
      setDownloadingAppId(null);
    }
  };

  const appsList = inventory?.apps || [];
  const filteredApps = appsList.filter((app) => {
    const matchesSearch =
      !searchQuery ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.developer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === 'all' ||
      app.category.toLowerCase() === selectedCategoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      {/* Cloud Storage Registry Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Cloud className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Real-Time Cloud Inventory & Registry</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                Dynamic Object Store
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              All published application metadata, version binaries, and download counters are automatically serialized to persistent cloud storage bucket{' '}
              <code className="text-amber-400 font-mono">floxdon-store-registry</code>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCloudSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs shadow-amber-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing Cloud...' : 'Sync with Cloud Storage'}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Cloud Storage Bucket</span>
            <p className="font-mono text-xs font-bold text-amber-400 truncate">
              {inventory?.cloudBucket || 'floxdon-store-registry'}
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Total Cataloged Apps</span>
            <p className="font-mono text-base font-bold text-white">
              {inventory?.totalApps || appsList.length}
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Dynamic Downloads</span>
            <p className="font-mono text-base font-bold text-emerald-400">
              {(inventory?.totalDownloads || 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Last Sync Status</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online & Persisted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Category Indexing Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Dynamic Category Indexing</h3>
          </div>
          <span className="text-xs text-slate-400">
            {inventory?.categories?.length || 0} Categories Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`p-3 rounded-xl border text-left transition ${
              selectedCategoryFilter === 'all'
                ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-bold">All Categories</div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">{appsList.length} apps total</div>
          </button>

          {(inventory?.categories || []).map((cat) => {
            const isSelected = selectedCategoryFilter.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategoryFilter(cat.name)}
                className={`p-3 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold truncate">{cat.name}</div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">{cat.count} published</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filtering Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inventory by name, slug, author..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <strong>{filteredApps.length}</strong> of {appsList.length} applications
        </div>
      </div>

      {/* Real-Time Apps Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Application</th>
                <th className="py-3.5 px-4">Category & Track</th>
                <th className="py-3.5 px-4">Supported Platforms</th>
                <th className="py-3.5 px-4">Version</th>
                <th className="py-3.5 px-4">Dynamic Downloads</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredApps.map((app) => {
                const isDownloading = downloadingAppId === app.id;

                return (
                  <tr key={app.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                          {app.iconUrl ? (
                            <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
                          ) : (
                            <HardDrive className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate hover:text-amber-400 cursor-pointer" onClick={() => onSelectApp(app)}>
                            {app.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 truncate">
                            {app.slug} • {app.developer}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="text-xs text-slate-200">{app.category}</span>
                        <div>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-semibold uppercase ${
                              app.releaseTrack === 'production'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : app.releaseTrack === 'beta'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            }`}
                          >
                            {app.releaseTrack}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {app.platforms.map((p) => (
                          <span
                            key={p}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800 uppercase"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      v{app.version || '1.0.0'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400">
                        <Download className="w-3.5 h-3.5" />
                        <span>{(app.downloadsCount || 0).toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setInspectingManifestApp(app)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                          title="Inspect Cloud JSON Manifest"
                        >
                          <FileCode2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDownloadApp(app, e)}
                          disabled={isDownloading}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition disabled:opacity-50"
                        >
                          <Download className={`w-3 h-3 ${isDownloading ? 'animate-bounce' : ''}`} />
                          <span>{isDownloading ? 'DL...' : 'Download'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: INSPECT CLOUD JSON MANIFEST */}
      {inspectingManifestApp && (
        <div 
          id="modal-inspect-manifest"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Cloud Storage Manifest: {inspectingManifestApp.slug}.json
                </h3>
              </div>
              <button
                onClick={() => setInspectingManifestApp(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Storage Path: <strong className="text-amber-400">floxdon-store-registry/manifests/{inspectingManifestApp.slug}.json</strong></span>
                <span className="text-emerald-400">Synced</span>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-72">
                {JSON.stringify(inspectingManifestApp, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(inspectingManifestApp, null, 2));
                  showNotification('Manifest copied to clipboard!');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Copy JSON
              </button>
              <button
                onClick={() => setInspectingManifestApp(null)}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
