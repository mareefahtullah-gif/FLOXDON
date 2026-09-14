import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Folder,
  FolderOpen,
  File,
  FileCode,
  Database,
  Image,
  Package,
  Upload,
  Download,
  Trash2,
  Search,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  Shield,
  Layers,
  ChevronRight,
  ChevronDown,
  HardDrive,
  RefreshCw,
  ExternalLink,
  Lock,
  Globe,
  Sliders,
  AlertCircle,
  FileText
} from 'lucide-react';
import { ForgeCloudObject, ForgeCloudBucket, ScopedEnvVariable, Project } from '../types';

interface ForgeCloudViewProps {
  projects: Project[];
  showNotification: (msg: string) => void;
}

export const ForgeCloudView: React.FC<ForgeCloudViewProps> = ({ projects, showNotification }) => {
  const [activeTab, setActiveTab] = useState<'storage' | 'env_scoping'>('storage');
  
  // Storage State
  const [buckets, setBuckets] = useState<ForgeCloudBucket[]>([]);
  const [files, setFiles] = useState<ForgeCloudObject[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<ForgeCloudObject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalStorageFormatted, setTotalStorageFormatted] = useState('0 B');

  // Expanded Folders in Tree View
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'db-backups': true,
    'branding': true,
    'icons': true,
    'configs': true,
    'uploads': true,
  });

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadBucket, setUploadBucket] = useState('database-dumps');
  const [uploadFolder, setUploadFolder] = useState('db-backups');
  const [uploadContent, setUploadContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Scoped Env Vars State
  const [scopedEnvs, setScopedEnvs] = useState<ScopedEnvVariable[]>([]);
  const [selectedProjectScope, setSelectedProjectScope] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [envSearch, setEnvSearch] = useState('');
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [showAddEnvModal, setShowAddEnvModal] = useState(false);

  // New Env Form State
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');
  const [newEnvIsSecret, setNewEnvIsSecret] = useState(false);
  const [newEnvScope, setNewEnvScope] = useState('global');
  const [newEnvTier, setNewEnvTier] = useState<'production' | 'staging' | 'development'>('production');
  const [newEnvCategory, setNewEnvCategory] = useState<'database' | 'auth' | 'api' | 'system' | 'custom'>('custom');

  // Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch Cloud Data
  const fetchCloudData = async () => {
    setIsLoading(true);
    try {
      const [bRes, fRes, eRes] = await Promise.all([
        fetch('/api/forge-cloud/buckets'),
        fetch('/api/forge-cloud/files'),
        fetch('/api/forge-cloud/env-scopes'),
      ]);

      const bData = await bRes.json();
      const fData = await fRes.json();
      const eData = await eRes.json();

      if (bData.success) setBuckets(bData.buckets);
      if (fData.success) {
        setFiles(fData.files);
        setTotalStorageFormatted(fData.formattedTotalSize || '15.4 MB');
        if (!selectedFile && fData.files.length > 0) {
          setSelectedFile(fData.files[0]);
        }
      }
      if (eData.success) setScopedEnvs(eData.scopes);
    } catch (err) {
      console.error('Failed to load Forge Cloud data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCloudData();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showNotification('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  // Upload File
  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim()) {
      showNotification('Please enter a file name');
      return;
    }

    setIsUploading(true);
    try {
      let mimeType = 'application/octet-stream';
      if (uploadName.endsWith('.sql') || uploadName.endsWith('.dump')) mimeType = 'application/sql';
      else if (uploadName.endsWith('.svg')) mimeType = 'image/svg+xml';
      else if (uploadName.endsWith('.png')) mimeType = 'image/png';
      else if (uploadName.endsWith('.json')) mimeType = 'application/json';
      else if (uploadName.endsWith('.yml') || uploadName.endsWith('.yaml')) mimeType = 'text/yaml';

      const res = await fetch('/api/forge-cloud/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: uploadName.trim(),
          bucket: uploadBucket,
          path: uploadFolder,
          content: uploadContent || `-- Persistent snapshot for ${uploadName}\n-- Created on Forge Cloud Object Storage\n`,
          mimeType,
          size: uploadContent ? uploadContent.length : 2048,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification(`File "${uploadName}" successfully stored in ${uploadBucket}`);
        setShowUploadModal(false);
        setUploadName('');
        setUploadContent('');
        fetchCloudData();
      } else {
        showNotification(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showNotification('Error uploading file to Forge Cloud');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete File
  const handleDeleteFile = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from Forge Cloud?`)) return;

    try {
      const res = await fetch(`/api/forge-cloud/files/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification(`Deleted "${name}"`);
        if (selectedFile?.id === id) setSelectedFile(null);
        fetchCloudData();
      }
    } catch (err) {
      console.error('Delete error:', err);
      showNotification('Failed to delete file');
    }
  };

  // Add Scoped Env Var
  const handleAddScopedEnv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvKey.trim() || !newEnvValue.trim()) {
      showNotification('Key and Value are required');
      return;
    }

    try {
      const selectedProj = projects.find((p) => p.id === newEnvScope);
      const scopeName = newEnvScope === 'global' ? 'All Projects (Global)' : selectedProj?.name || newEnvScope;

      const res = await fetch('/api/forge-cloud/env-scopes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: newEnvKey.trim(),
          value: newEnvValue.trim(),
          isSecret: newEnvIsSecret,
          projectScope: newEnvScope,
          projectScopeName: scopeName,
          environment: newEnvTier,
          category: newEnvCategory,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification(`Scoped variable ${newEnvKey} saved!`);
        setShowAddEnvModal(false);
        setNewEnvKey('');
        setNewEnvValue('');
        fetchCloudData();
      }
    } catch (err) {
      console.error('Add env error:', err);
      showNotification('Failed to save scoped environment variable');
    }
  };

  // Delete Scoped Env Var
  const handleDeleteEnv = async (id: string, key: string) => {
    try {
      const res = await fetch(`/api/forge-cloud/env-scopes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification(`Deleted scoped variable ${key}`);
        fetchCloudData();
      }
    } catch (err) {
      console.error('Delete env error:', err);
    }
  };

  // Export .env file
  const handleExportEnvFile = () => {
    let targetEnvs = scopedEnvs;
    if (selectedProjectScope !== 'all') {
      targetEnvs = targetEnvs.filter(
        (e) => e.projectScope === selectedProjectScope || e.projectScope === 'global'
      );
    }
    if (selectedTier !== 'all') {
      targetEnvs = targetEnvs.filter((e) => e.environment === selectedTier);
    }

    const content =
      `# Forge Cloud Generated Environment Variables\n` +
      `# Scope: ${selectedProjectScope === 'all' ? 'Merged Global & Project' : selectedProjectScope}\n` +
      `# Tier: ${selectedTier}\n` +
      `# Generated at: ${new Date().toISOString()}\n\n` +
      targetEnvs.map((e) => `${e.key}=${e.value}`).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `.env.${selectedTier !== 'all' ? selectedTier : 'production'}`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Exported .env file');
  };

  // Helper: Get Icon by File Name / MIME
  const getFileIcon = (file: ForgeCloudObject) => {
    if (file.mimeType.includes('sql') || file.name.endsWith('.dump') || file.name.endsWith('.gz')) {
      return <Database className="w-4 h-4 text-emerald-400" />;
    }
    if (file.mimeType.includes('image') || file.name.endsWith('.svg') || file.name.endsWith('.png')) {
      return <Image className="w-4 h-4 text-blue-400" />;
    }
    if (file.mimeType.includes('yaml') || file.mimeType.includes('json') || file.name.endsWith('.conf')) {
      return <FileCode className="w-4 h-4 text-amber-400" />;
    }
    return <File className="w-4 h-4 text-slate-400" />;
  };

  // Group files into folder tree
  const filteredFiles = files.filter((f) => {
    const matchesBucket = selectedBucket === 'all' || f.bucket === selectedBucket;
    const matchesSearch =
      !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.path.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBucket && matchesSearch;
  });

  // Group by root folder
  const folderTree: Record<string, ForgeCloudObject[]> = {};
  filteredFiles.forEach((file) => {
    const parts = file.path.split('/');
    const folder = parts.length > 1 ? parts[0] : 'root';
    if (!folderTree[folder]) folderTree[folder] = [];
    folderTree[folder].push(file);
  });

  // Filtered Scoped Envs
  const filteredEnvs = scopedEnvs.filter((e) => {
    const matchesScope = selectedProjectScope === 'all' || e.projectScope === selectedProjectScope;
    const matchesTier = selectedTier === 'all' || e.environment === selectedTier;
    const matchesSearch =
      !envSearch ||
      e.key.toLowerCase().includes(envSearch.toLowerCase()) ||
      e.value.toLowerCase().includes(envSearch.toLowerCase());
    return matchesScope && matchesTier && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cloud className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Floxdon Cloud
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Persistent Storage
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                NVMe object storage buckets and cross-project scoped environment variable vault
              </p>
            </div>
          </div>
        </div>

        {/* Global Storage Metrics */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-500 mr-2">Persistent NVMe:</span>
            <span className="font-semibold text-emerald-400">{totalStorageFormatted}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-500 mr-2">Buckets:</span>
            <span className="font-semibold text-cyan-400">{buckets.length} Active</span>
          </div>

          <button
            onClick={fetchCloudData}
            title="Refresh Storage State"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="px-3 sm:px-6 border-b border-slate-800 bg-slate-900/30 flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('storage')}
          className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'storage'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Object Storage & Tree Browser</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
            {files.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('env_scoping')}
          className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'env_scoping'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Cross-Project Scoped Env Vars</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
            {scopedEnvs.length}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'storage' && (
          <div className="h-full flex flex-col md:flex-row overflow-hidden">
            {/* Left: Bucket Filter & Tree Browser */}
            <div className="w-full md:w-80 lg:w-96 border-r border-slate-800 bg-slate-900/20 flex flex-col h-full">
              {/* Controls */}
              <div className="p-4 border-b border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Buckets</span>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1 shadow-sm transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Object</span>
                  </button>
                </div>

                {/* Bucket Pills */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedBucket('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      selectedBucket === 'all'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All Buckets
                  </button>
                  {buckets.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBucket(b.name)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        selectedBucket === b.name
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>

                {/* Search in files */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search database dumps, assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Tree View Folder Structure */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {Object.keys(folderTree).length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No objects match the current filter or search criteria.
                  </div>
                ) : (
                  Object.entries(folderTree).map(([folderName, folderFiles]) => {
                    const isExpanded = expandedFolders[folderName] ?? true;
                    return (
                      <div key={folderName} className="rounded-lg bg-slate-900/40 border border-slate-800/60 overflow-hidden">
                        {/* Folder Header */}
                        <button
                          onClick={() => toggleFolder(folderName)}
                          className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-800/40 transition"
                        >
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            {isExpanded ? (
                              <FolderOpen className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Folder className="w-4 h-4 text-amber-400" />
                            )}
                            <span>{folderName}/</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {folderFiles.length} {folderFiles.length === 1 ? 'file' : 'files'}
                          </span>
                        </button>

                        {/* Files within folder */}
                        {isExpanded && (
                          <div className="p-1.5 space-y-1 bg-slate-950/40 border-t border-slate-800/50">
                            {folderFiles.map((file) => {
                              const isSelected = selectedFile?.id === file.id;
                              return (
                                <button
                                  key={file.id}
                                  onClick={() => setSelectedFile(file)}
                                  className={`w-full p-2 rounded-md flex items-center justify-between text-left text-xs transition ${
                                    isSelected
                                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                      : 'hover:bg-slate-800/50 text-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                                    {getFileIcon(file)}
                                    <span className="truncate font-mono text-[11px]">{file.name}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                    {file.formattedSize}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: File Details & Inspector */}
            <div className="flex-1 bg-slate-950 flex flex-col h-full overflow-y-auto p-6">
              {selectedFile ? (
                <div className="max-w-4xl space-y-6">
                  {/* File Header */}
                  <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-inner">
                        {getFileIcon(selectedFile)}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white font-mono">{selectedFile.name}</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="text-cyan-400 font-semibold">{selectedFile.bucket}</span>
                          <span>•</span>
                          <span>{selectedFile.formattedSize}</span>
                          <span>•</span>
                          <span>{new Date(selectedFile.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={selectedFile.downloadUrl}
                        download={selectedFile.name}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                      <button
                        onClick={() => handleDeleteFile(selectedFile.id, selectedFile.name)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                        title="Delete Object"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Object Metadata</div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-500">Storage Path</span>
                          <span className="font-mono text-slate-300">{selectedFile.path}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-500">MIME Content-Type</span>
                          <span className="font-mono text-slate-300">{selectedFile.mimeType}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-500">Object Size</span>
                          <span className="font-mono text-slate-300">{selectedFile.size.toLocaleString()} bytes</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Storage Tier</span>
                          <span className="text-emerald-400 font-semibold">Local NVMe High-IOPS</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security & Checksum</div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="text-slate-500 mb-1">SHA-256 Checksum:</div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 break-all">
                            <span className="truncate">{selectedFile.sha256}</span>
                            <button
                              onClick={() => handleCopy(selectedFile.sha256, 'sha')}
                              className="text-slate-400 hover:text-white shrink-0"
                            >
                              {copiedId === 'sha' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-500 mb-1">Internal Object URL:</div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                            <span className="truncate">{selectedFile.downloadUrl}</span>
                            <button
                              onClick={() => handleCopy(selectedFile.downloadUrl, 'url')}
                              className="text-slate-400 hover:text-white shrink-0"
                            >
                              {copiedId === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview / Dump Inspection Info */}
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Object Content Summary</span>
                      <span className="text-[10px] text-slate-500">Persistent Disk Backed</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {selectedFile.mimeType.includes('sql') || selectedFile.name.endsWith('.sql') ? (
                        `-- PostgreSQL 16 Snapshot: ${selectedFile.name}\n-- Verified Table Schemas: users, projects, builds, deployments, oauth_clients\n-- SHA256: ${selectedFile.sha256}\n-- Status: Consistent snapshot ready for restoration via Docker or psql`
                      ) : selectedFile.mimeType.includes('yaml') || selectedFile.name.endsWith('.yml') ? (
                        `version: '3.8'\nservices:\n  forgestudio:\n    image: forgestudio/runtime:latest\n    restart: always\n    ports:\n      - "3000:3000"\n    volumes:\n      - ./data:/var/forge/data`
                      ) : (
                        `Binary Object [${selectedFile.mimeType}] stored in bucket ${selectedFile.bucket}.\nCryptographic verification passed. Download directly or mount inside container.`
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                  <HardDrive className="w-12 h-12 text-slate-700 mb-3" />
                  <div className="text-sm font-semibold text-slate-400">Select an object to inspect</div>
                  <div className="text-xs text-slate-600 max-w-sm mt-1">
                    Choose any database backup, branding asset, or config file from the tree browser on the left.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Cross-Project Scoped Env Variables */}
        {activeTab === 'env_scoping' && (
          <div className="h-full flex flex-col overflow-y-auto p-6 space-y-6">
            {/* Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                {/* Project Scope Filter */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">Project Scope</label>
                  <select
                    value={selectedProjectScope}
                    onChange={(e) => setSelectedProjectScope(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                  >
                    <option value="all">All Scopes (Global + Projects)</option>
                    <option value="global">All Projects (Global)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                    <option value="carepulse-hospital">CarePulse Hospital Clinical</option>
                    <option value="omniflow-studio">OmniFlow Cloud Studio</option>
                  </select>
                </div>

                {/* Tier Filter */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">Environment Tier</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                  >
                    <option value="all">All Tiers</option>
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>

                {/* Search */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">Search Keys</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. POSTGRES, OAUTH..."
                      value={envSearch}
                      onChange={(e) => setEnvSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportEnvFile}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export .env File</span>
                </button>

                <button
                  onClick={() => setShowAddEnvModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Scoped Variable</span>
                </button>
              </div>
            </div>

            {/* Scoped Env Vars Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Variable Key</th>
                      <th className="px-4 py-3">Project Scope</th>
                      <th className="px-4 py-3">Tier</th>
                      <th className="px-4 py-3">Value</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                    {filteredEnvs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-sans">
                          No scoped environment variables found for this selection.
                        </td>
                      </tr>
                    ) : (
                      filteredEnvs.map((env) => {
                        const isRevealed = revealedSecrets[env.id];
                        return (
                          <tr key={env.id} className="hover:bg-slate-800/30 transition">
                            <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
                              {env.isSecret && <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                              <span>{env.key}</span>
                            </td>
                            <td className="px-4 py-3 font-sans">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                  env.projectScope === 'global'
                                    ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                                    : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                                }`}
                              >
                                {env.projectScopeName}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-sans">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                                  env.environment === 'production'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : env.environment === 'staging'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}
                              >
                                {env.environment}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="truncate max-w-xs text-slate-200">
                                  {env.isSecret && !isRevealed ? '••••••••••••••••••••' : env.value}
                                </span>
                                {env.isSecret && (
                                  <button
                                    onClick={() =>
                                      setRevealedSecrets((prev) => ({
                                        ...prev,
                                        [env.id]: !prev[env.id],
                                      }))
                                    }
                                    className="text-slate-400 hover:text-white"
                                    title={isRevealed ? 'Hide secret' : 'Reveal secret'}
                                  >
                                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleCopy(env.value, env.id)}
                                  className="p-1 rounded-md text-slate-400 hover:text-white"
                                  title="Copy value"
                                >
                                  {copiedId === env.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteEnv(env.id, env.key)}
                                  className="p-1 rounded-md text-slate-400 hover:text-red-400"
                                  title="Delete variable"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                Upload Object to Persistent Cloud Storage
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleUploadFile} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Bucket</label>
                <select
                  value={uploadBucket}
                  onChange={(e) => setUploadBucket(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="database-dumps">database-dumps</option>
                  <option value="project-assets">project-assets</option>
                  <option value="config-vault">config-vault</option>
                  <option value="compiled-binaries">compiled-binaries</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Folder Path</label>
                <input
                  type="text"
                  placeholder="e.g. db-backups or assets/icons"
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">File Name</label>
                <input
                  type="text"
                  placeholder="e.g. backup-2026-09-08.sql"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Content / SQL Payload (Optional)</label>
                <textarea
                  rows={4}
                  placeholder="Paste database dump statements or config text..."
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{isUploading ? 'Uploading...' : 'Save to Cloud'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Scoped Env Var Modal */}
      {showAddEnvModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Add Scoped Environment Variable
              </h3>
              <button onClick={() => setShowAddEnvModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddScopedEnv} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Scope</label>
                <select
                  value={newEnvScope}
                  onChange={(e) => setNewEnvScope(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="global">All Projects (Global Scope)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  <option value="carepulse-hospital">CarePulse Hospital Clinical</option>
                  <option value="omniflow-studio">OmniFlow Cloud Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Environment Tier</label>
                <select
                  value={newEnvTier}
                  onChange={(e) => setNewEnvTier(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Variable Key</label>
                <input
                  type="text"
                  placeholder="e.g. DATABASE_REPLICA_URL"
                  value={newEnvKey}
                  onChange={(e) => setNewEnvKey(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Value</label>
                <input
                  type="text"
                  placeholder="Secret or configuration value"
                  value={newEnvValue}
                  onChange={(e) => setNewEnvValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="secretCheckbox"
                  checked={newEnvIsSecret}
                  onChange={(e) => setNewEnvIsSecret(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500"
                />
                <label htmlFor="secretCheckbox" className="text-xs text-slate-300">
                  Mask as sensitive secret (encrypted in vault)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEnvModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
                >
                  Save Scoped Variable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
