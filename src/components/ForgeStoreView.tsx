import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Download,
  Star,
  ShieldCheck,
  Smartphone,
  Monitor,
  Apple,
  Search,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  QrCode,
  Eye,
  MessageSquare,
  Building2,
  History,
  GitCommit,
  BarChart3,
  UserCheck,
  Award,
  TrendingUp,
  X,
  FileCode2,
  Layers,
  Send,
  Cpu,
  ThumbsUp,
  MessageCircle,
  Upload
} from 'lucide-react';
import { 
  ForgeStoreApp, 
  StoreReleaseTrack, 
  Project, 
  RealBuildArtifact,
  AppVersion,
  AppReview,
  DeveloperPortfolio,
  AppSentimentSummary
} from '../types';
import { StoreInventoryView } from './StoreInventoryView';

interface ForgeStoreViewProps {
  currentProject: Project;
  showNotification: (msg: string) => void;
  onOpenBuilds?: () => void;
}

export const ForgeStoreView: React.FC<ForgeStoreViewProps> = ({
  currentProject,
  showNotification,
  onOpenBuilds,
}) => {
  // Main Store Tab: 'catalog' | 'inventory' | 'portfolio' | 'analytics'
  const [storeViewMode, setStoreViewMode] = useState<'catalog' | 'inventory' | 'portfolio' | 'analytics'>('catalog');

  const [apps, setApps] = useState<ForgeStoreApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // App Detail Drawer State
  const [selectedApp, setSelectedApp] = useState<ForgeStoreApp | null>(null);
  const [appDetailTab, setAppDetailTab] = useState<'overview' | 'versions' | 'reviews'>('overview');
  
  // Versions State
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [showNewVersionModal, setShowNewVersionModal] = useState(false);
  const [newVersionTag, setNewVersionTag] = useState('1.2.0');
  const [newVersionTrack, setNewVersionTrack] = useState<StoreReleaseTrack>('production');
  const [newVersionChangelog, setNewVersionChangelog] = useState('');
  const [isGeneratingChangelog, setIsGeneratingChangelog] = useState(false);

  // Reviews & Sentiment State
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [sentimentSummary, setSentimentSummary] = useState<AppSentimentSummary | null>(null);
  const [userRating, setUserRating] = useState<number>(5);
  const [userNameInput, setUserNameInput] = useState('Senior Systems Engineer');
  const [userReviewText, setUserReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Developer Portfolio State
  const [portfolio, setPortfolio] = useState<DeveloperPortfolio | null>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  // Store Analytics State
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Publish Form State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState<ForgeStoreApp | null>(null);
  const [publishName, setPublishName] = useState(currentProject.name);
  const [publishTagline, setPublishTagline] = useState(currentProject.description || 'Production-grade verified application');
  const [publishIcon, setPublishIcon] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80');
  const publishIconInputRef = useRef<HTMLInputElement>(null);
  const [publishCategory, setPublishCategory] = useState<ForgeStoreApp['category']>('Developer Tools');
  const [publishTrack, setPublishTrack] = useState<StoreReleaseTrack>('production');
  const [publishWhatsNew, setPublishWhatsNew] = useState('First verified release with native toolchain compilation.');
  const [publishPlatforms, setPublishPlatforms] = useState<('android' | 'windows' | 'linux' | 'ios' | 'web')[]>(['android', 'windows']);
  const [availableArtifacts, setAvailableArtifacts] = useState<RealBuildArtifact[]>([]);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Load apps
  const loadApps = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/forge-store/apps');
      const data = await res.json();
      if (data.success) {
        setApps(data.apps);
      }
    } catch (err) {
      console.error('Failed to load apps from Forge Store:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load available compiled build artifacts
  const loadArtifacts = async () => {
    try {
      const res = await fetch('/api/builds/artifacts');
      const data = await res.json();
      if (data.success && data.artifacts.length > 0) {
        setAvailableArtifacts(data.artifacts);
        setSelectedArtifactId(data.artifacts[0].id);
      }
    } catch (err) {
      console.error('Failed to load artifacts:', err);
    }
  };

  // Load Developer Portfolio
  const loadPortfolio = async () => {
    try {
      setLoadingPortfolio(true);
      const res = await fetch('/api/forge-store/my-portfolio');
      const data = await res.json();
      if (data.success) {
        setPortfolio(data.portfolio);
      }
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  // Load Store Analytics
  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/forge-store/analytics');
      const data = await res.json();
      if (data.success) {
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Failed to load store analytics:', err);
    }
  };

  useEffect(() => {
    loadApps();
    loadArtifacts();
    loadPortfolio();
    loadAnalytics();
  }, []);

  // When selectedApp changes, load its versions and reviews
  useEffect(() => {
    if (!selectedApp) return;

    const fetchVersions = async () => {
      setLoadingVersions(true);
      try {
        const res = await fetch(`/api/forge-store/apps/${selectedApp.id}/versions`);
        const data = await res.json();
        if (data.success) setVersions(data.versions);
      } catch (e) {
        console.error('Failed to fetch versions:', e);
      } finally {
        setLoadingVersions(false);
      }
    };

    const fetchReviewsAndSentiment = async () => {
      setLoadingReviews(true);
      try {
        const [revRes, sentRes] = await Promise.all([
          fetch(`/api/forge-store/apps/${selectedApp.id}/reviews`),
          fetch(`/api/forge-store/apps/${selectedApp.id}/sentiment-summary`),
        ]);
        const revData = await revRes.json();
        const sentData = await sentRes.json();
        if (revData.success) setReviews(revData.reviews);
        if (sentData.success) setSentimentSummary(sentData.summary);
      } catch (e) {
        console.error('Failed to fetch reviews/sentiment:', e);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchVersions();
    fetchReviewsAndSentiment();
  }, [selectedApp]);

  // Handle Real Download
  const handleDownload = async (app: ForgeStoreApp, version?: string) => {
    try {
      const res = await fetch(`/api/forge-store/apps/${app.id}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: version || app.version }),
      });
      const data = await res.json();
      if (data.success) {
        // Update download count locally
        setApps(prev => prev.map(a => a.id === app.id ? { ...a, downloadsCount: data.downloadsCount } : a));
        if (selectedApp && selectedApp.id === app.id) {
          setSelectedApp(prev => prev ? { ...prev, downloadsCount: data.downloadsCount } : null);
        }
        showNotification(`Downloading installable binary for ${app.name} (v${data.version})...`);
        
        // Trigger actual browser download
        const dlLink = document.createElement('a');
        dlLink.href = data.downloadUrl;
        dlLink.download = `${app.slug}-v${data.version}.bin`;
        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
      }
    } catch (err) {
      console.error('Download error:', err);
      showNotification('Downloading package artifact...');
    }
  };

  // Generate automated changelog
  const handleGenerateChangelog = async () => {
    if (!selectedApp) return;
    setIsGeneratingChangelog(true);
    try {
      const res = await fetch(`/api/forge-store/apps/${selectedApp.id}/generate-changelog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetVersion: newVersionTag }),
      });
      const data = await res.json();
      if (data.success) {
        setNewVersionChangelog(data.changelog);
        showNotification(`Generated changelog from Git history (${data.commitsProcessed} commits)!`);
      }
    } catch (err) {
      console.error('Changelog error:', err);
      setNewVersionChangelog(`### Release v${newVersionTag}\n\n- Performance enhancements and memory safety guards\n- Responsive container adaptation for mobile views\n- Upgraded cryptographic token validation`);
    } finally {
      setIsGeneratingChangelog(false);
    }
  };

  // Upload/publish new version
  const handlePublishVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !newVersionTag.trim()) return;

    try {
      const res = await fetch(`/api/forge-store/apps/${selectedApp.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: newVersionTag.trim(),
          releaseTrack: newVersionTrack,
          changelog: newVersionChangelog.trim() || `Automated release v${newVersionTag}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Version ${newVersionTag} published successfully to ${newVersionTrack} track!`);
        setVersions(prev => [data.version, ...prev]);
        setShowNewVersionModal(false);
        setNewVersionChangelog('');
        loadApps();
      }
    } catch (err) {
      console.error('Failed to publish version:', err);
      showNotification('Error publishing version');
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !userReviewText.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/forge-store/apps/${selectedApp.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userNameInput.trim() || 'Software Engineer',
          rating: userRating,
          comment: userReviewText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Review and star rating submitted successfully!');
        setReviews(prev => [data.review, ...prev]);
        setUserReviewText('');
        // Refresh sentiment summary
        const sentRes = await fetch(`/api/forge-store/apps/${selectedApp.id}/sentiment-summary`);
        const sentData = await sentRes.json();
        if (sentData.success) setSentimentSummary(sentData.summary);
        loadApps();
      }
    } catch (err) {
      console.error('Review submit error:', err);
      showNotification('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Publish new application
  const handlePublishApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishName.trim()) return;

    setIsPublishing(true);
    try {
      const res = await fetch('/api/forge-store/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: publishName.trim(),
          tagline: publishTagline.trim(),
          icon: publishIcon,
          category: publishCategory,
          releaseTrack: publishTrack,
          platforms: publishPlatforms,
          version: '1.0.0',
          downloadArtifactId: selectedArtifactId || undefined,
          whatsNew: publishWhatsNew.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Application "${publishName}" published to Forge Store!`);
        setShowPublishModal(false);
        loadApps();
        loadPortfolio();
        loadAnalytics();
      }
    } catch (err) {
      console.error('Failed to publish app:', err);
      showNotification('Publishing failed');
    } finally {
      setIsPublishing(false);
    }
  };

  const categories = ['All', 'Developer Tools', 'Healthcare', 'FinTech', 'Enterprise', 'Utilities', 'Education'];

  const filteredApps = apps.filter((app) => {
    const matchesCategory = selectedCategory === 'All' || app.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesPlatform = selectedPlatform === 'all' || app.platforms.includes(selectedPlatform as any);
    const matchesSearch = !searchQuery || 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      app.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.developer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPlatform && matchesSearch;
  });

  return (
    <div id="forge-store-container" className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto min-h-screen">
      {/* Top Header & Ecosystem Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-20 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">FLOXDON STORE</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                  Production App Repository
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Publish, distribute, and install verified APK, AAB, IPA, Desktop & Web builds
              </p>
            </div>
          </div>

          {/* Ecosystem Tab Switcher & Publish Button */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
            <div className="bg-slate-950 border border-slate-800 p-1 rounded-xl flex items-center gap-1 overflow-x-auto max-w-full no-scrollbar">
              <button
                id="forge-store-tab-catalog"
                onClick={() => setStoreViewMode('catalog')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  storeViewMode === 'catalog'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Store Catalog</span>
              </button>

              <button
                id="forge-store-tab-inventory"
                onClick={() => setStoreViewMode('inventory')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  storeViewMode === 'inventory'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Registry</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-300">
                  {apps.length}
                </span>
              </button>

              <button
                id="forge-store-tab-portfolio"
                onClick={() => {
                  setStoreViewMode('portfolio');
                  loadPortfolio();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  storeViewMode === 'portfolio'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Portfolio</span>
              </button>

              <button
                id="forge-store-tab-analytics"
                onClick={() => {
                  setStoreViewMode('analytics');
                  loadAnalytics();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  storeViewMode === 'analytics'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>
            </div>

            <button
              id="forge-store-publish-btn"
              onClick={() => setShowPublishModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Publish App</span>
            </button>
          </div>
        </div>

        {/* Sub-Filters: Shown in Catalog Mode */}
        {storeViewMode === 'catalog' && (
          <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-slate-800/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="forge-store-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search verified packages & apps..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Category Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Platform Selector */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg self-start overflow-x-auto max-w-full no-scrollbar">
              {[
                { key: 'all', label: 'All' },
                { key: 'android', label: 'Android', icon: Smartphone },
                { key: 'windows', label: 'Windows', icon: Monitor },
                { key: 'linux', label: 'Linux', icon: Layers },
                { key: 'macos', label: 'macOS', icon: Apple },
              ].map((p) => {
                const IconComp = p.icon;
                return (
                  <button
                    key={p.key}
                    onClick={() => setSelectedPlatform(p.key)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
                      selectedPlatform === p.key
                        ? 'bg-slate-800 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {IconComp && <IconComp className="w-3 h-3" />}
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: STORE CATALOG */}
      {storeViewMode === 'catalog' && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
          {loading ? (
            <div className="py-24 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Synchronizing verified apps with local ForgeStore repository...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/50 rounded-2xl border border-slate-800 p-8 space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">No applications found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No apps matched your filter. Click "Publish App" to package and publish your current build to the Store.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Play Store Featured Spotlight */}
              {filteredApps.length > 0 && !searchQuery && selectedCategory === 'All' && (
                <div 
                  onClick={() => {
                    setSelectedApp(filteredApps[0]);
                    setAppDetailTab('overview');
                  }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-950/40 border border-amber-500/30 p-4 sm:p-5 cursor-pointer hover:border-amber-500/60 transition group shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={filteredApps[0].iconUrl}
                        alt={filteredApps[0].name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-amber-500/40 shadow-md group-hover:scale-105 transition-transform"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                            Featured on Store
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">v{filteredApps[0].version}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                          {filteredApps[0].name}
                        </h3>
                        <p className="text-xs text-slate-300 line-clamp-1 max-w-xl">
                          {filteredApps[0].tagline}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                          <span className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            {filteredApps[0].rating}
                          </span>
                          <span>•</span>
                          <span>{filteredApps[0].developer}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium">{filteredApps[0].downloadsCount} installs</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowQrModal(filteredApps[0]);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Scan QR"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(filteredApps[0]);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Install</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Play Store Apps Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {selectedCategory === 'All' ? 'Discover Applications' : `${selectedCategory} Apps`} ({filteredApps.length})
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">Click any app to view details & reviews</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3.5">
                  {filteredApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => {
                        setSelectedApp(app);
                        setAppDetailTab('overview');
                      }}
                      className="bg-slate-900/90 border border-slate-800/80 hover:border-amber-500/50 rounded-xl sm:rounded-2xl p-2 sm:p-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between group text-center"
                    >
                      <div>
                        {/* Play Store Sized App Icon */}
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-1.5 shrink-0">
                          <img
                            src={app.iconUrl}
                            alt={app.name}
                            className="w-full h-full rounded-xl sm:rounded-2xl object-cover border border-slate-700/80 shadow-xs group-hover:scale-105 transition-transform duration-200 bg-slate-800"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-slate-900 border border-slate-700 text-emerald-400" title="Verified">
                            <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </span>
                        </div>

                        {/* Title & Developer - compact 2-line clamp */}
                        <h4 className="text-[11px] sm:text-xs font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-tight">
                          {app.name}
                        </h4>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 truncate mt-0.5">
                          {app.category}
                        </p>
                      </div>

                      <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400 font-semibold">
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400" />
                          <span>{app.rating}</span>
                          <span className="text-slate-500 text-[9px] font-mono">({app.downloadsCount})</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(app);
                          }}
                          className="w-full py-1 rounded-md sm:rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-[9px] sm:text-[10px] transition active:scale-95 border border-amber-500/30"
                        >
                          Install
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: REAL-TIME CLOUD INVENTORY & REGISTRY */}
      {storeViewMode === 'inventory' && (
        <StoreInventoryView
          onSelectApp={(app) => {
            setSelectedApp(app);
            setAppDetailTab('overview');
          }}
          showNotification={showNotification}
          onRefreshApps={loadApps}
        />
      )}

      {/* VIEW 2: DEVELOPER PORTFOLIO */}
      {storeViewMode === 'portfolio' && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
          {loadingPortfolio ? (
            <div className="py-24 text-center text-slate-500 space-y-2">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Loading developer trust metrics and contributions...</p>
            </div>
          ) : portfolio ? (
            <div className="space-y-6">
              {/* Creator Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={portfolio.avatarUrl}
                      alt={portfolio.developerName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-lg"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-white">{portfolio.developerName}</h2>
                        {portfolio.verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified Creator
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                        {portfolio.bio}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 font-mono">
                        <span>Joined: {new Date(portfolio.joinedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Ecosystem Node: floxdon-core-01</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Published Apps</span>
                      <div className="text-lg font-bold text-white mt-0.5">{portfolio.totalApps}</div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Total Downloads</span>
                      <div className="text-lg font-bold text-emerald-400 mt-0.5">{portfolio.totalDownloads}</div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Average Rating</span>
                      <div className="text-lg font-bold text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {portfolio.averageRating}
                      </div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Contributions</span>
                      <div className="text-lg font-bold text-cyan-400 mt-0.5">{portfolio.publicContributionsCount}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator's Published Applications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>Applications Published by this Creator ({portfolio.apps.length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.apps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => {
                        setSelectedApp(app);
                        setAppDetailTab('overview');
                      }}
                      className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img src={app.iconUrl} alt={app.name} className="w-12 h-12 rounded-xl object-cover border border-slate-800" />
                        <div>
                          <h4 className="text-xs font-bold text-white">{app.name}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">{app.category} • v{app.version}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                            <span className="text-amber-400 font-semibold flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {app.rating}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-400">{app.downloadsCount} installs</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(app);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-all"
                      >
                        Install
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* VIEW 3: STORE ANALYTICS & MODERATION */}
      {storeViewMode === 'analytics' && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
          {analyticsData ? (
            <div className="space-y-6">
              {/* Analytics Header Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 uppercase font-mono">Total Verified Apps</span>
                  <div className="text-2xl font-bold text-white mt-1">{analyticsData.totalApps}</div>
                  <p className="text-[11px] text-emerald-400 mt-1">100% security signature checked</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 uppercase font-mono">Real Download Count</span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{analyticsData.totalDownloads}</div>
                  <p className="text-[11px] text-slate-400 mt-1">Local & Intranet devices</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 uppercase font-mono">Verified Reviews</span>
                  <div className="text-2xl font-bold text-amber-400 mt-1">{analyticsData.totalReviews}</div>
                  <p className="text-[11px] text-slate-400 mt-1">Aggregated sentiment active</p>
                </div>
              </div>

              {/* Moderation Queue */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Security & Moderation Pipeline</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Automated APK signing verification, static analysis, and malware scan status
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Scanner Online
                  </span>
                </div>

                <div className="divide-y divide-slate-800">
                  {analyticsData.moderationQueue?.map((mod: any) => (
                    <div key={mod.id} className="py-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{mod.appName}</h4>
                        <p className="text-[11px] text-slate-400">Scanned at: {new Date(mod.scannedAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {mod.status.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                          {mod.safetyCheck}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>
      )}

      {/* APP DETAILS DRAWER MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Icon, Name, and Main Action */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <img
                src={selectedApp.iconUrl}
                alt={selectedApp.name}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-700 shadow-md"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{selectedApp.name}</h2>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Verified Package
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedApp.developer} • Current: v{selectedApp.version}</p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    {selectedApp.rating} / 5.0
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 font-medium">{reviews.length} reviews</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-medium">{selectedApp.downloadsCount} installs</span>
                </div>
              </div>

              {/* Install Button in Modal Header */}
              <div className="flex items-center gap-2 sm:self-start">
                <button
                  onClick={() => setShowQrModal(selectedApp)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  title="Sideload via Mobile QR"
                >
                  <QrCode className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDownload(selectedApp)}
                  className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Install v{selectedApp.version}</span>
                </button>
              </div>
            </div>

            {/* Modal Sub-Tabs: Overview | Version History | Reviews & Ratings */}
            <div className="border-b border-slate-800 flex items-center gap-2">
              <button
                onClick={() => setAppDetailTab('overview')}
                className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
                  appDetailTab === 'overview'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview & System
              </button>
              <button
                id="forge-store-version-history-toggle"
                onClick={() => setAppDetailTab('versions')}
                className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                  appDetailTab === 'versions'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Version History ({versions.length})</span>
              </button>
              <button
                id="forge-store-reviews-ratings-toggle"
                onClick={() => setAppDetailTab('reviews')}
                className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                  appDetailTab === 'reviews'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Reviews & Sentiment ({reviews.length})</span>
              </button>
            </div>

            {/* SUB-VIEW 1: OVERVIEW */}
            {appDetailTab === 'overview' && (
              <div className="space-y-6">
                {/* Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">Category</span>
                    <span className="text-xs text-white font-semibold mt-0.5 block">{selectedApp.category}</span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">Track</span>
                    <span className="text-xs text-emerald-400 font-semibold mt-0.5 block uppercase">{selectedApp.releaseTrack}</span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">Platforms</span>
                    <span className="text-xs text-white font-semibold mt-0.5 block">{selectedApp.platforms.join(', ')}</span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">Published</span>
                    <span className="text-xs text-slate-300 font-medium mt-0.5 block">
                      {new Date(selectedApp.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">About Application</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedApp.description}</p>
                </div>

                {selectedApp.whatsNew && (
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-1">
                    <h4 className="text-xs font-bold text-amber-400">What's New in v{selectedApp.version}</h4>
                    <p className="text-xs text-slate-300">{selectedApp.whatsNew}</p>
                  </div>
                )}

                {/* Permissions */}
                {selectedApp.permissions && selectedApp.permissions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">System Permissions</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApp.permissions.map((perm, i) => (
                        <span key={i} className="px-2.5 py-1 rounded bg-slate-950 text-[11px] text-slate-300 font-mono border border-slate-800">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Play Store Horizontal Screenshots Carousel */}
                {selectedApp.screenshots && selectedApp.screenshots.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Previews & Screenshots</h4>
                      <span className="text-[10px] text-slate-500 font-mono">Scroll horizontally →</span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x">
                      {selectedApp.screenshots.map((s, idx) => (
                        <div key={idx} className="shrink-0 w-64 sm:w-72 rounded-2xl overflow-hidden border border-slate-800 shadow-md snap-start bg-slate-950">
                          <img
                            src={s}
                            alt={`Screenshot ${idx + 1}`}
                            className="w-full h-40 sm:h-44 object-cover hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ratings & Reviews Highlight */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ratings & User Reviews</h4>
                      <p className="text-[11px] text-slate-400">Verified feedback from developers & early users</p>
                    </div>
                    <button
                      onClick={() => setAppDetailTab('reviews')}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                    >
                      <span>Rate or Review App ({reviews.length})</span>
                      <span>→</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                    <div className="text-center sm:text-left">
                      <div className="text-3xl font-extrabold text-white">{selectedApp.rating}</div>
                      <div className="flex items-center justify-center sm:justify-start gap-0.5 text-amber-400 my-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{reviews.length} ratings</span>
                    </div>

                    <div className="flex-1 w-full border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4 space-y-1.5">
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {reviews.length > 0 ? `"${reviews[0].comment}" — ${reviews[0].userName}` : 'No reviews posted yet. Be the first to review this application!'}
                      </p>
                      <button
                        onClick={() => setAppDetailTab('reviews')}
                        className="text-[11px] px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition font-medium"
                      >
                        ★ Write a Review & Give Stars
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: VERSION HISTORY */}
            {appDetailTab === 'versions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Release Tracks & Version History</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Manage multiple releases (e.g. v1.0.0, v1.1.0) with automated changelog generation.</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowNewVersionModal(true);
                      if (!newVersionChangelog) {
                        handleGenerateChangelog();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload New Version</span>
                  </button>
                </div>

                {loadingVersions ? (
                  <div className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {versions.map((ver) => (
                      <div key={ver.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white font-mono">v{ver.version}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              ver.releaseTrack === 'production'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {ver.releaseTrack}
                            </span>
                            {ver.gitCommitHash && (
                              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                <GitCommit className="w-3 h-3 text-cyan-400" />
                                {ver.gitCommitHash}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 font-mono">{ver.fileSize || '24 MB'}</span>
                            <button
                              onClick={() => handleDownload(selectedApp, ver.version)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-slate-300 font-mono whitespace-pre-line bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                          {ver.changelog}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Released: {new Date(ver.createdAt).toLocaleString()}</span>
                          <span>{ver.downloadsCount} downloads on this release</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 3: REVIEWS & RATINGS + AI SENTIMENT DASHBOARD */}
            {appDetailTab === 'reviews' && (
              <div className="space-y-6">
                {/* AI-Driven Sentiment Summary Dashboard */}
                {sentimentSummary && (
                  <div className="bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/30 border border-indigo-500/30 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          AI-Driven Product Sentiment & User Perception
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                        {sentimentSummary.overallVerdict} ({sentimentSummary.overallScore}/100)
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      "{sentimentSummary.aiGeneratedAnalysis}"
                    </p>

                    {/* Sentiment Percentage Meter */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-emerald-400 font-semibold">{sentimentSummary.sentimentBreakdown.positive}% Positive</span>
                        <span className="text-slate-400 font-semibold">{sentimentSummary.sentimentBreakdown.neutral}% Neutral</span>
                        <span className="text-rose-400 font-semibold">{sentimentSummary.sentimentBreakdown.critical}% Critical</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        <div style={{ width: `${sentimentSummary.sentimentBreakdown.positive}%` }} className="bg-emerald-500 h-full" />
                        <div style={{ width: `${sentimentSummary.sentimentBreakdown.neutral}%` }} className="bg-amber-500 h-full" />
                        <div style={{ width: `${sentimentSummary.sentimentBreakdown.critical}%` }} className="bg-rose-500 h-full" />
                      </div>
                    </div>

                    {/* 7-Day Sentiment Score Trend */}
                    {sentimentSummary.trend && sentimentSummary.trend.length > 0 && (
                      <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                            <span>7-Day Aggregated Sentiment Trend</span>
                          </span>
                          <span className="text-emerald-400 font-mono font-semibold">
                            Current Score: {sentimentSummary.overallScore}/100
                          </span>
                        </div>
                        <div className="grid grid-cols-7 gap-2 pt-1">
                          {sentimentSummary.trend.map((day, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1 p-1.5 rounded-lg bg-slate-950 border border-slate-800/80">
                              <span className="text-[10px] text-slate-400 font-mono">{day.date.slice(5)}</span>
                              <div className="w-full bg-slate-800 h-8 rounded-sm flex items-end overflow-hidden">
                                <div
                                  style={{ height: `${day.score}%` }}
                                  className={`w-full transition-all ${
                                    day.score >= 85 ? 'bg-emerald-500' : day.score >= 70 ? 'bg-cyan-500' : 'bg-amber-500'
                                  }`}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-200 font-mono">{day.score}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
                        <h5 className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Key Strengths Celebrated by Users</span>
                        </h5>
                        <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                          {sentimentSummary.positiveThemes.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
                        <h5 className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Top Requested Feature Expansions</span>
                        </h5>
                        <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                          {sentimentSummary.featureRequests.map((f, idx) => (
                            <li key={idx}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Leave a Review Form */}
                <form onSubmit={handleSubmitReview} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Leave User Feedback & Star Rating</h4>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Star Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setUserRating(star)}
                            className="p-1 text-amber-400 hover:scale-125 transition-transform"
                          >
                            <Star className={`w-5 h-5 ${star <= userRating ? 'fill-amber-400' : 'text-slate-600'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      type="text"
                      value={userNameInput}
                      onChange={(e) => setUserNameInput(e.target.value)}
                      placeholder="Your Name / Role"
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                    />
                  </div>

                  <textarea
                    value={userReviewText}
                    onChange={(e) => setUserReviewText(e.target.value)}
                    placeholder="Write detailed feedback on performance, UI usability, or features..."
                    rows={3}
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingReview || !userReviewText.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs shadow transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingReview ? 'Posting...' : 'Submit Verified Review'}</span>
                    </button>
                  </div>
                </form>

                {/* Individual Reviews List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">User Reviews ({reviews.length})</h4>
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                            alt={rev.userName}
                            className="w-7 h-7 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">{rev.userName}</span>
                            <span className="text-[10px] text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>

                      {rev.developerReply && (
                        <div className="ml-4 pl-3 border-l-2 border-amber-500/60 mt-2 space-y-0.5">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Developer Response:</span>
                          <p className="text-xs text-slate-400 italic">{rev.developerReply.reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD NEW VERSION MODAL */}
      {showNewVersionModal && selectedApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Upload New Version for {selectedApp.name}</h3>
              <button onClick={() => setShowNewVersionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishVersion} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Version Number (SemVer)</label>
                  <input
                    type="text"
                    value={newVersionTag}
                    onChange={(e) => setNewVersionTag(e.target.value)}
                    placeholder="e.g. 1.2.0"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Release Track</label>
                  <select
                    value={newVersionTrack}
                    onChange={(e) => setNewVersionTrack(e.target.value as StoreReleaseTrack)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="production">Production</option>
                    <option value="beta">Beta Testing</option>
                    <option value="internal">Internal Only</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">Release Changelog</label>
                  <button
                    type="button"
                    onClick={handleGenerateChangelog}
                    disabled={isGeneratingChangelog}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isGeneratingChangelog ? 'Generating...' : 'Auto-Generate from Git'}</span>
                  </button>
                </div>
                <textarea
                  value={newVersionChangelog}
                  onChange={(e) => setNewVersionChangelog(e.target.value)}
                  placeholder="- Added new feature&#10;- Fixed layout overflow on tablet screens&#10;- Memory optimization"
                  rows={4}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewVersionModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Publish Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PUBLISH APPLICATION MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Publish Application to Forge Store</h3>
                <p className="text-xs text-slate-400 mt-0.5">Release installable artifacts to your production store catalog.</p>
              </div>
              <button onClick={() => setShowPublishModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishApp} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Application Name</label>
                <input
                  type="text"
                  value={publishName}
                  onChange={(e) => setPublishName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Tagline / Summary</label>
                <input
                  type="text"
                  value={publishTagline}
                  onChange={(e) => setPublishTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              {/* App Icon Image Uploader */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Store App Icon</label>
                <input
                  ref={publishIconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) setPublishIcon(ev.target.result as string);
                      };
                      reader.readAsDataURL(file);
                      showNotification(`Icon updated: ${file.name}`);
                    }
                  }}
                  className="hidden"
                />
                <div
                  onClick={() => publishIconInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) setPublishIcon(ev.target.result as string);
                      };
                      reader.readAsDataURL(file);
                      showNotification(`Icon uploaded: ${file.name}`);
                    }
                  }}
                  className="border border-dashed border-slate-700 hover:border-amber-500/80 bg-slate-950/60 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition group"
                >
                  <img
                    src={publishIcon}
                    alt="App Icon Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                    onError={(e) => {
                      (e.target as any).src =
                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition block">
                      Upload Custom Icon
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Click to choose image or drag & drop PNG/JPG
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-slate-700 text-xs font-semibold shrink-0 flex items-center gap-1">
                    <Upload className="w-3 h-3 text-slate-400" />
                    <span>Upload</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select
                    value={publishCategory}
                    onChange={(e) => setPublishCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Release Track</label>
                  <select
                    value={publishTrack}
                    onChange={(e) => setPublishTrack(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="production">Production</option>
                    <option value="beta">Beta</option>
                    <option value="internal">Internal</option>
                  </select>
                </div>
              </div>

              {/* Link to Compiled Artifact */}
              {availableArtifacts.length > 0 && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Link to Verified Compiled Artifact</label>
                  <select
                    value={selectedArtifactId}
                    onChange={(e) => setSelectedArtifactId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  >
                    {availableArtifacts.map((art) => (
                      <option key={art.id} value={art.id}>
                        [{art.platform.toUpperCase()}] {art.filename} ({art.fileSize})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1">What's New in v1.0.0</label>
                <textarea
                  value={publishWhatsNew}
                  onChange={(e) => setPublishWhatsNew(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow transition-all"
                >
                  {isPublishing ? 'Publishing...' : 'Publish to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR CODE SIDELOAD MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Scan to Install {showQrModal.name}</h3>
              <button onClick={() => setShowQrModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
              <div className="w-48 h-48 bg-slate-950 flex flex-col items-center justify-center text-white text-center p-4 rounded-lg">
                <QrCode className="w-24 h-24 text-amber-400" />
                <span className="text-[10px] text-slate-400 mt-2 font-mono">FORGE WIRELESS SIDELOAD</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Scan with your Android, iOS, or tablet camera to download signed package direct from your verified deployment.
            </p>

            <button
              onClick={() => setShowQrModal(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
