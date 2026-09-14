import React, { useState, useEffect } from 'react';
import { 
  Rocket, Server, ShieldCheck, Globe, Key, History, 
  RefreshCw, CheckCircle2, AlertTriangle, Play, Pause, 
  ExternalLink, Plus, Trash2, Eye, EyeOff, Terminal,
  Cpu, HardDrive, Activity, Lock, ArrowUpRight, Edit2,
  Download, Upload, Check, Copy, Sparkles, Bug, Calendar,
  Shield, Zap, Clock
} from 'lucide-react';
import { Project, Deployment, ContainerInfo, EnvVariable, SslCertInfo, MetricDataPoint } from '../types';
import { INITIAL_DEPLOYMENT } from '../data/defaultProjects';
import { ForgeMetricsDashboard } from './ForgeMetricsDashboard';

interface DeploymentPaaSProps {
  project: Project;
  onOpenAiDebugger?: (errorInfo: { errorMessage: string; errorStack?: string; sourceFile?: string }) => void;
}

export const DeploymentPaaS: React.FC<DeploymentPaaSProps> = ({ 
  project, 
  onOpenAiDebugger 
}) => {
  const [deployment, setDeployment] = useState<Deployment>(INITIAL_DEPLOYMENT);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySteps, setDeploySteps] = useState<{ label: string; done: boolean }[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'health' | 'resources' | 'ssl' | 'env' | 'domains' | 'rollback' | 'logs' | 'metrics'>('health');

  // Time range selector for resource charts
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');

  // Domains state
  const [domains, setDomains] = useState<string[]>([
    'fleet.floxdon.studio',
    'dispatch.floxdon.corp',
  ]);
  const [newDomainInput, setNewDomainInput] = useState('');

  // Environment variables state
  const [envVars, setEnvVars] = useState<EnvVariable[]>([
    { id: 'env-1', key: 'PORT', value: '5000', isSecret: false, environment: 'production', category: 'system', updatedAt: 'Today' },
    { id: 'env-2', key: 'NODE_ENV', value: 'production', isSecret: false, environment: 'production', category: 'system', updatedAt: 'Today' },
    { id: 'env-3', key: 'DATABASE_URL', value: `postgresql://forge:secret@db:5432/${project.slug}_db`, isSecret: true, environment: 'production', category: 'database', updatedAt: 'Today' },
    { id: 'env-4', key: 'JWT_SECRET', value: 'f8a7e0c2d4b6a9c1e3f5d7b901234567', isSecret: true, environment: 'production', category: 'auth', updatedAt: 'Today' },
    { id: 'env-5', key: 'PUBLIC_DOMAIN', value: 'fleet.floxdon.studio', isSecret: false, environment: 'production', category: 'api', updatedAt: 'Today' },
    { id: 'env-6', key: 'STAGING_API_URL', value: 'https://staging.floxdon.studio/api', isSecret: false, environment: 'staging', category: 'api', updatedAt: 'Yesterday' },
    { id: 'env-7', key: 'DEV_LOG_LEVEL', value: 'debug', isSecret: false, environment: 'development', category: 'custom', updatedAt: 'Sep 05' },
  ]);

  const [selectedEnvFilter, setSelectedEnvFilter] = useState<'all' | 'production' | 'staging' | 'development'>('production');
  const [searchEnvQuery, setSearchEnvQuery] = useState('');
  const [revealAllSecrets, setRevealAllSecrets] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [editingEnvId, setEditingEnvId] = useState<string | null>(null);
  const [editEnvKey, setEditEnvKey] = useState('');
  const [editEnvVal, setEditEnvVal] = useState('');
  const [editEnvCategory, setEditEnvCategory] = useState<'database' | 'auth' | 'api' | 'system' | 'custom'>('custom');

  // New Env Form State
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvVal, setNewEnvVal] = useState('');
  const [newEnvIsSecret, setNewEnvIsSecret] = useState(true);
  const [newEnvCategory, setNewEnvCategory] = useState<'database' | 'auth' | 'api' | 'system' | 'custom'>('custom');
  const [newEnvTargetEnv, setNewEnvTargetEnv] = useState<'production' | 'staging' | 'development'>('production');

  // Bulk Import modal state
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkEnvText, setBulkEnvText] = useState('');

  // SSL Certificate State
  const [sslCert, setSslCert] = useState<SslCertInfo>({
    enabled: true,
    issuer: 'Floxdon Studio Automated CA (ACME v2)',
    commonName: 'fleet.floxdon.studio',
    sanDomains: ['fleet.floxdon.studio', '*.floxdon.studio', 'dispatch.floxdon.corp'],
    issuedDate: '2026-06-10T00:00:00Z',
    expiresAt: '2026-12-07T00:00:00Z',
    daysRemaining: 88,
    fingerprint: 'SHA256: 4A:2F:99:C1:B8:23:44:0E:17:DE:8F:22:91:CA:5B:3C:D0:11:7F:89',
    tlsVersion: 'TLSv1.3',
    cipherSuite: 'TLS_AES_256_GCM_SHA384 (X25519 Curve)',
    autoRenew: true,
  });
  const [isRenewingSsl, setIsRenewingSsl] = useState(false);
  const [sslRenewalSuccess, setSslRenewalSuccess] = useState(false);

  // Live Metric Datapoints for Charts (Simulated 24 data points)
  const [metricHistory, setMetricHistory] = useState<MetricDataPoint[]>([
    { time: '10:00', cpu: 1.2, memory: 288, networkIn: 42, networkOut: 85, latency: 2.4 },
    { time: '10:15', cpu: 1.8, memory: 295, networkIn: 58, networkOut: 110, latency: 2.6 },
    { time: '10:30', cpu: 3.4, memory: 320, networkIn: 120, networkOut: 240, latency: 3.1 },
    { time: '10:45', cpu: 2.1, memory: 310, networkIn: 75, networkOut: 150, latency: 2.8 },
    { time: '11:00', cpu: 1.5, memory: 298, networkIn: 60, networkOut: 95, latency: 2.5 },
    { time: '11:15', cpu: 2.8, memory: 315, networkIn: 95, networkOut: 190, latency: 2.9 },
    { time: '11:30', cpu: 2.2, memory: 305, networkIn: 80, networkOut: 160, latency: 2.7 },
    { time: '11:45', cpu: 1.9, memory: 300, networkIn: 70, networkOut: 140, latency: 2.6 },
  ]);

  // Live container logs
  const [containerLogs, setContainerLogs] = useState<string[]>([
    `[07:14:00] [web-frontend] nginx/1.25.4 worker process 1 ready on port 443 (SSL TLSv1.3)`,
    `[07:14:00] [api-backend] [OmniFlow Backend] Listening on port 5000`,
    `[07:14:00] [api-backend] Connected to PostgreSQL 16 pool (max: 20 connections)`,
    `[07:14:01] [postgres-db] PostgreSQL database server = 16.2 is ready to accept connections`,
    `[07:14:02] [reverse-proxy] Upstream health check passed: http://localhost:5000/api/health [200 OK, 2.8ms]`,
    `[07:14:15] [api-backend] GET /api/telemetry/live - 200 OK (3.1ms, gzip: 1.4kB)`,
  ]);

  const handleDeployNow = () => {
    setIsDeploying(true);
    setDeploySteps([
      { label: "1. Allocating isolated Docker bridge network 'forge-prod-net'", done: false },
      { label: "2. Provisioning PostgreSQL 16 container 'db-omniflow-prod'", done: false },
      { label: "3. Applying database migrations from db/schema.sql", done: false },
      { label: "4. Compiling backend API container 'api-omniflow-prod'", done: false },
      { label: "5. Building frontend static Nginx container 'web-omniflow-prod'", done: false },
      { label: "6. Configuring high-performance reverse proxy & TLS 1.3 certificate", done: false },
      { label: "7. Health probe verification (HTTP 200 OK, 2.8ms latency)", done: false },
    ]);

    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex++;
      setDeploySteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          done: idx < stepIndex,
        }))
      );

      if (stepIndex >= 7) {
        clearInterval(interval);
        setIsDeploying(false);
        setDeployment((prev) => ({
          ...prev,
          status: 'active',
          healthCheck: '200 OK (2.6ms latency)',
          createdAt: 'Just now',
        }));
      }
    }, 450);
  };

  const handleRenewCertificate = () => {
    setIsRenewingSsl(true);
    setTimeout(() => {
      setIsRenewingSsl(false);
      setSslRenewalSuccess(true);
      setSslCert((prev) => ({
        ...prev,
        daysRemaining: 90,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      }));
      setTimeout(() => setSslRenewalSuccess(false), 3000);
    }, 1200);
  };

  const handleAddDomain = () => {
    if (!newDomainInput.trim()) return;
    setDomains([...domains, newDomainInput.trim()]);
    setNewDomainInput('');
  };

  const handleDeleteDomain = (dom: string) => {
    setDomains(domains.filter((d) => d !== dom));
  };

  const handleAddEnv = () => {
    if (!newEnvKey.trim()) return;
    const newVar: EnvVariable = {
      id: `env-${Date.now()}`,
      key: newEnvKey.trim().toUpperCase(),
      value: newEnvVal,
      isSecret: newEnvIsSecret,
      environment: newEnvTargetEnv,
      category: newEnvCategory,
      updatedAt: 'Just now',
    };
    setEnvVars([newVar, ...envVars]);
    setNewEnvKey('');
    setNewEnvVal('');
  };

  const handleStartEditEnv = (item: EnvVariable) => {
    setEditingEnvId(item.id);
    setEditEnvKey(item.key);
    setEditEnvVal(item.value);
    setEditEnvCategory(item.category || 'custom');
  };

  const handleSaveEditEnv = (id: string) => {
    setEnvVars(
      envVars.map((e) =>
        e.id === id
          ? {
              ...e,
              key: editEnvKey.trim().toUpperCase(),
              value: editEnvVal,
              category: editEnvCategory,
              updatedAt: 'Just now',
            }
          : e
      )
    );
    setEditingEnvId(null);
  };

  const handleDeleteEnv = (id: string) => {
    setEnvVars(envVars.filter((e) => e.id !== id));
  };

  const toggleRevealItem = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBulkImportSubmit = () => {
    if (!bulkEnvText.trim()) return;
    const lines = bulkEnvText.split('\n');
    const imported: EnvVariable[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const cleanLine = trimmed.replace(/^export\s+/, '');
      const eqIdx = cleanLine.indexOf('=');
      if (eqIdx > 0) {
        const key = cleanLine.slice(0, eqIdx).trim().toUpperCase();
        let value = cleanLine.slice(eqIdx + 1).trim();
        // Remove surrounding quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        imported.push({
          id: `bulk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          key,
          value,
          isSecret: key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD'),
          environment: selectedEnvFilter === 'all' ? 'production' : selectedEnvFilter,
          category: key.includes('DB') || key.includes('POSTGRES') ? 'database' : key.includes('JWT') || key.includes('AUTH') ? 'auth' : 'custom',
          updatedAt: 'Just now',
        });
      }
    });

    if (imported.length > 0) {
      setEnvVars([...imported, ...envVars]);
      setBulkEnvText('');
      setIsBulkImportOpen(false);
    }
  };

  const handleExportEnv = () => {
    const filtered = envVars.filter(
      (e) => selectedEnvFilter === 'all' || e.environment === selectedEnvFilter
    );
    const content = `# Generated by Floxdon Studio PaaS (${selectedEnvFilter.toUpperCase()})\n` +
      filtered.map((e) => `${e.key}=${e.value}`).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `.env.${selectedEnvFilter}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredEnvVars = envVars.filter((e) => {
    const matchEnv = selectedEnvFilter === 'all' || e.environment === selectedEnvFilter;
    const matchSearch = e.key.toLowerCase().includes(searchEnvQuery.toLowerCase()) || e.value.toLowerCase().includes(searchEnvQuery.toLowerCase());
    return matchEnv && matchSearch;
  });

  return (
    <div className="flex-1 bg-slate-50 p-6 overflow-y-auto select-none font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 bg-white p-6 rounded-2xl border shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-emerald-600" />
                Floxdon PaaS Deployment Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                Active Production Mesh
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              One-click production deployment of <strong>Frontend + Backend + PostgreSQL</strong> with automated SSL, health tracking, and secret management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDeployNow}
              disabled={isDeploying}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-xs active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDeploying ? 'animate-spin' : ''}`} />
              <span>{isDeploying ? 'Deploying Containers...' : 'Deploy Containers'}</span>
            </button>
          </div>
        </div>

        {/* Deploying Progress Banner */}
        {isDeploying && (
          <div className="p-4 rounded-2xl bg-white border border-emerald-300 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                Orchestrating Production Containers...
              </span>
              <span className="font-mono text-slate-500">Docker Engine 26.0 (Compose v2)</span>
            </div>

            <div className="space-y-1 font-mono text-xs text-slate-700">
              {deploySteps.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {s.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-emerald-600 animate-spin shrink-0"></div>
                  )}
                  <span className={s.done ? 'text-slate-800 font-medium' : 'text-slate-400'}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-1 border-b border-slate-200 pb-1 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('health')}
            className={`px-3 py-2 border-b-2 font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'health'
                ? 'border-emerald-600 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Health & Uptime</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          <button
            onClick={() => setActiveSubTab('resources')}
            className={`px-3 py-2 border-b-2 font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'resources'
                ? 'border-emerald-600 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Resource Usage Charts</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ssl')}
            className={`px-3 py-2 border-b-2 font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'ssl'
                ? 'border-emerald-600 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>SSL Certificate Expiry</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-50 text-emerald-700 font-mono border border-emerald-200">
              {sslCert.daysRemaining}d
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('env')}
            className={`px-3 py-2 border-b-2 font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'env'
                ? 'border-emerald-600 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-indigo-600" />
            <span>Environment Secrets</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700 font-mono border border-slate-200">
              {envVars.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('domains')}
            className={`px-3 py-2 border-b-2 font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'domains'
                ? 'border-emerald-600 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-600" />
            <span>Domains ({domains.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rollback')}
            className={`px-3 py-2 border-b-2 font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'rollback'
                ? 'border-emerald-600 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5 text-purple-600" />
            <span>Rollback</span>
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3 py-2 border-b-2 font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'logs'
                ? 'border-emerald-600 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-slate-600" />
            <span>Live Logs</span>
          </button>

          <button
            onClick={() => setActiveSubTab('metrics')}
            className={`px-3 py-2 border-b-2 font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'metrics'
                ? 'border-emerald-600 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Forge Metrics</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold uppercase">
              Live
            </span>
          </button>
        </div>

        {/* Tab 1: Live Health Status Dashboard & Uptime */}
        {activeSubTab === 'health' && (
          <div className="space-y-6">
            {/* Top Metric Highlight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Uptime Rate */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold flex items-center justify-between">
                  <span>30-Day Uptime</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-2xl font-black text-emerald-600">99.98%</div>
                <div className="text-[11px] text-slate-400 font-mono">Target SLA: 99.9% (Exceeded)</div>
              </div>

              {/* Latency */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold flex items-center justify-between">
                  <span>Ping Latency</span>
                  <span className="text-[10px] text-emerald-600 font-mono font-semibold">Real-Time</span>
                </div>
                <div className="text-2xl font-black text-slate-900">2.6 ms</div>
                <div className="text-[11px] text-slate-400 font-mono">Min: 1.1ms • Max: 4.2ms</div>
              </div>

              {/* Active Containers */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold flex items-center justify-between">
                  <span>Healthy Services</span>
                  <span className="text-[10px] text-blue-600 font-mono font-semibold">All Green</span>
                </div>
                <div className="text-2xl font-black text-blue-600">4 / 4</div>
                <div className="text-[11px] text-slate-400 font-mono">Web, API, DB, Proxy</div>
              </div>

              {/* SSL Status */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold flex items-center justify-between">
                  <span>TLS 1.3 Security</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600">{sslCert.daysRemaining} Days</div>
                <div className="text-[11px] text-slate-400 font-mono">Auto-Renewal Active</div>
              </div>
            </div>

            {/* Service Health Grid */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-600" />
                    Container Cluster Topology & Health Probes
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Continuous HTTP/TCP liveness checks executing every 15 seconds.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  All 4 containers operational
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {deployment.containers.map((c) => (
                  <div key={c.name} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {c.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold">
                        Port {c.port}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 font-mono">
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Memory:</span>
                        <span className="text-slate-900 font-semibold">{c.memory}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>CPU:</span>
                        <span className="text-slate-900 font-semibold">{c.cpu}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Uptime:</span>
                        <span className="text-slate-900 font-semibold">{c.uptime || '14d 8h'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Probe:</span>
                        <span className="text-emerald-700 font-bold">200 OK (2ms)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 24-Hour Latency Spark Timeline */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    24-Hour Response Latency Histogram
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Round-trip latency across reverse proxy and backend API.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Optimal (&lt;5ms)
                  </span>
                </div>
              </div>

              <div className="h-28 bg-slate-50 rounded-xl p-4 flex items-end justify-between gap-1.5 border border-slate-200">
                {[
                  2.4, 2.1, 2.8, 2.2, 3.1, 2.5, 2.7, 2.4, 2.6, 2.9, 3.4, 2.8, 2.3, 2.5, 2.4, 2.6, 2.7, 2.9, 2.5, 2.4, 2.8, 2.6, 2.5, 2.6
                ].map((val, idx) => {
                  const heightPct = Math.min(100, (val / 5.0) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div 
                        style={{ height: `${heightPct}%` }}
                        className="w-full rounded-t bg-emerald-600/80 hover:bg-emerald-500 transition-all cursor-pointer"
                      />
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-20">
                        {val}ms
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>24 hours ago</span>
                <span>12 hours ago</span>
                <span>Current (2.6ms)</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Resource Usage Charts */}
        {activeSubTab === 'resources' && (
          <div className="space-y-6">
            {/* Range Selector Bar */}
            <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Time Horizon:</span>
                {(['1h', '6h', '24h', '7d'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition ${
                      timeRange === r
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="text-xs font-mono text-slate-500">
                Sampling interval: <span className="text-slate-900 font-semibold">15s</span>
              </div>
            </div>

            {/* Grid of Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CPU Usage Chart */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      CPU Utilization (%)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Average load across container cores.</p>
                  </div>
                  <span className="text-xs font-mono text-blue-700 font-bold">Current: 2.2%</span>
                </div>

                <div className="h-44 bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col justify-between">
                  <div className="flex-1 flex items-end gap-2 pb-2 border-b border-slate-200">
                    {metricHistory.map((m, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div 
                          style={{ height: `${Math.max(10, (m.cpu / 5.0) * 100)}%` }}
                          className="w-full bg-blue-600/80 hover:bg-blue-500 rounded-t transition-all cursor-pointer"
                        />
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-20">
                          {m.cpu}% CPU ({m.time})
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>{metricHistory[0]?.time}</span>
                    <span>5.0% Limit</span>
                    <span>{metricHistory[metricHistory.length - 1]?.time}</span>
                  </div>
                </div>
              </div>

              {/* Memory Usage Chart */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-purple-600" />
                      Memory Footprint (RAM)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Allocated RSS memory across Node + Postgres.</p>
                  </div>
                  <span className="text-xs font-mono text-purple-700 font-bold">305 MB / 3840 MB</span>
                </div>

                <div className="h-44 bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col justify-between">
                  <div className="flex-1 flex items-end gap-2 pb-2 border-b border-slate-200">
                    {metricHistory.map((m, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div 
                          style={{ height: `${Math.max(15, (m.memory / 500) * 100)}%` }}
                          className="w-full bg-purple-600/80 hover:bg-purple-500 rounded-t transition-all cursor-pointer"
                        />
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-20">
                          {m.memory} MB ({m.time})
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>{metricHistory[0]?.time}</span>
                    <span>Cap: 3.8 GB</span>
                    <span>{metricHistory[metricHistory.length - 1]?.time}</span>
                  </div>
                </div>
              </div>

              {/* Network Throughput */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      Network Throughput (I/O)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Ingress and egress traffic over reverse proxy.</p>
                  </div>
                  <div className="text-xs font-mono text-slate-700 font-semibold">
                    <span className="text-emerald-700">▼ 80 KB/s</span> • <span className="text-blue-700">▲ 160 KB/s</span>
                  </div>
                </div>

                <div className="h-36 bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-around font-mono text-xs">
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-emerald-700">80 KB/s</div>
                    <div className="text-[10px] text-slate-500 uppercase">Current Ingress</div>
                  </div>
                  <div className="h-12 w-px bg-slate-200"></div>
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-blue-700">160 KB/s</div>
                    <div className="text-[10px] text-slate-500 uppercase">Current Egress</div>
                  </div>
                  <div className="h-12 w-px bg-slate-200"></div>
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-slate-900">4.2 GB</div>
                    <div className="text-[10px] text-slate-500 uppercase">30-Day Transferred</div>
                  </div>
                </div>
              </div>

              {/* Disk Storage Volume */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-amber-600" />
                      Persistent Storage Volumes
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">PostgreSQL WAL logs and Docker container layers.</p>
                  </div>
                  <span className="text-xs font-mono text-amber-700 font-bold">12% Used</span>
                </div>

                <div className="h-36 bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-700">/var/lib/postgresql/data</span>
                    <span className="text-slate-900 font-bold">2.4 GB / 20.0 GB</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>File System: ext4 on NVMe</span>
                    <span className="text-emerald-700 font-semibold">17.6 GB Free</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: SSL Certificate Expiry Tracking */}
        {activeSubTab === 'ssl' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">Automated SSL/TLS Certificate Status</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                        ACTIVE & SECURED
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Issued and managed by automated internal ACME service with automated renewal.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRenewCertificate}
                  disabled={isRenewingSsl}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRenewingSsl ? 'animate-spin' : ''}`} />
                  <span>{isRenewingSsl ? 'Verifying & Re-issuing...' : 'Renew Certificate Now'}</span>
                </button>
              </div>

              {/* Renewal Success Alert */}
              {sslRenewalSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SSL Certificate renewed successfully! New validity period: 90 days remaining.</span>
                </div>
              )}

              {/* Expiry Countdown Card */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Validity Window & Expiry Tracker
                  </span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {sslCert.daysRemaining} Days Left (Valid until Dec 07, 2026)
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" 
                    style={{ width: `${(sslCert.daysRemaining / 90) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Issued: Jun 10, 2026</span>
                  <span className="text-slate-600 font-semibold">Auto-Renews when &lt; 30 days remaining</span>
                  <span>Expires: Dec 07, 2026</span>
                </div>
              </div>

              {/* Certificate Details Table */}
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white font-mono text-xs">
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Common Name (CN):</span>
                  <span className="text-slate-900 font-bold">{sslCert.commonName}</span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Certificate Issuer:</span>
                  <span className="text-slate-700">{sslCert.issuer}</span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Subject Alternative Names (SANs):</span>
                  <div className="flex items-center gap-1.5">
                    {sslCert.sanDomains.map((d) => (
                      <span key={d} className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Protocol & Cipher:</span>
                  <span className="text-emerald-700 font-semibold">{sslCert.tlsVersion} • {sslCert.cipherSuite}</span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">SHA-256 Fingerprint:</span>
                  <span className="text-slate-600 text-[11px]">{sslCert.fingerprint}</span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Auto-Renewal Mechanism:</span>
                  <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    ACME HTTP-01 Challenge Daemon Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Environment Variables & Secrets Management UI */}
        {activeSubTab === 'env' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
              {/* Top Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-600" />
                    Runtime Environment Variables & Secrets
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Encrypted and securely injected into application containers at startup.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBulkImportOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Bulk Import .env</span>
                  </button>

                  <button
                    onClick={handleExportEnv}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Export .env</span>
                  </button>

                  <button
                    onClick={() => setRevealAllSecrets(!revealAllSecrets)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200"
                  >
                    {revealAllSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{revealAllSecrets ? 'Mask All' : 'Reveal All'}</span>
                  </button>
                </div>
              </div>

              {/* Add New Variable Form */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  Add Variable or Secret
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <input
                    type="text"
                    value={newEnvKey}
                    onChange={(e) => setNewEnvKey(e.target.value)}
                    placeholder="VARIABLE_NAME"
                    className="sm:col-span-4 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={newEnvVal}
                    onChange={(e) => setNewEnvVal(e.target.value)}
                    placeholder="value_or_secret"
                    className="sm:col-span-4 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <select
                    value={newEnvTargetEnv}
                    onChange={(e) => setNewEnvTargetEnv(e.target.value as any)}
                    className="sm:col-span-2 bg-white border border-slate-300 rounded-lg px-2 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                  <button
                    onClick={handleAddEnv}
                    className="sm:col-span-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                {/* Environment Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {(['production', 'staging', 'development', 'all'] as const).map((env) => (
                    <button
                      key={env}
                      onClick={() => setSelectedEnvFilter(env)}
                      className={`px-3 py-1 rounded-lg capitalize transition font-medium text-xs ${
                        selectedEnvFilter === env
                          ? 'bg-white text-slate-900 shadow-2xs font-semibold border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <input
                  type="text"
                  value={searchEnvQuery}
                  onChange={(e) => setSearchEnvQuery(e.target.value)}
                  placeholder="Filter keys or values..."
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-60"
                />
              </div>

              {/* Variables Table */}
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white font-mono text-xs">
                {filteredEnvVars.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    No environment variables found matching the filter criteria.
                  </div>
                ) : (
                  filteredEnvVars.map((env) => {
                    const isRevealed = revealAllSecrets || revealedIds[env.id];
                    const isEditing = editingEnvId === env.id;

                    if (isEditing) {
                      return (
                        <div key={env.id} className="p-3 bg-slate-50 flex flex-col sm:flex-row items-center gap-2">
                          <input
                            type="text"
                            value={editEnvKey}
                            onChange={(e) => setEditEnvKey(e.target.value)}
                            className="w-full sm:w-1/3 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                          />
                          <input
                            type="text"
                            value={editEnvVal}
                            onChange={(e) => setEditEnvVal(e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleSaveEditEnv(env.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingEnvId(null)}
                              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={env.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-900">{env.key}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-mono bg-slate-100 text-slate-600 border border-slate-200">
                            {env.environment}
                          </span>
                          {env.category && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
                              {env.category}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-slate-600 select-all font-mono">
                            {env.isSecret && !isRevealed ? '••••••••••••••••••••' : env.value}
                          </span>

                          <div className="flex items-center gap-1">
                            {env.isSecret && (
                              <button
                                onClick={() => toggleRevealItem(env.id)}
                                className="p-1 text-slate-400 hover:text-slate-700 transition"
                                title={isRevealed ? 'Mask' : 'Reveal'}
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <button
                              onClick={() => handleStartEditEnv(env)}
                              className="p-1 text-slate-400 hover:text-blue-600 transition"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEnv(env.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bulk Import Modal */}
            {isBulkImportOpen && (
              <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-blue-600" />
                      Bulk Import .env Key-Value Pairs
                    </h3>
                    <button onClick={() => setIsBulkImportOpen(false)} className="text-slate-400 hover:text-slate-700">
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Paste raw `.env` contents below. Lines will be parsed into individual variables for <strong>{selectedEnvFilter}</strong>.
                  </p>

                  <textarea
                    value={bulkEnvText}
                    onChange={(e) => setBulkEnvText(e.target.value)}
                    placeholder={`PORT=5000\nDATABASE_URL=postgresql://user:pass@host:5432/db\nJWT_SECRET=super_secret_key\nAPI_KEY=xyz123`}
                    className="w-full h-44 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsBulkImportOpen(false)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkImportSubmit}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                    >
                      Parse & Import
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Domains */}
        {activeSubTab === 'domains' && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Custom Domain Bindings</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Route external or internal corporate domains to this application.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDomainInput}
                  onChange={(e) => setNewDomainInput(e.target.value)}
                  placeholder="e.g. app.mycompany.org or portal.local"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-mono"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                />
                <button
                  onClick={handleAddDomain}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Domain
                </button>
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {domains.map((dom) => (
                  <div key={dom} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <span className="font-mono text-slate-900 font-bold">{dom}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono border border-emerald-200 font-semibold">
                        TLS 1.3 Active
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[10px] font-mono">Proxy: 127.0.0.1:443</span>
                      {domains.length > 1 && (
                        <button
                          onClick={() => handleDeleteDomain(dom)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Remove domain"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Rollback */}
        {activeSubTab === 'rollback' && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-600" />
                    Production Deployment History & Rollbacks
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Instantly revert running containers to a previous deployment image without data loss.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {deployment.rollbackVersions.map((rb, idx) => (
                  <div key={rb.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono">{rb.version}</span>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-semibold border border-emerald-200">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-xs">{rb.summary}</p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {rb.timestamp} by {rb.author}
                      </div>
                    </div>

                    {idx !== 0 && (
                      <button
                        onClick={() => alert(`Rolled back containers to ${rb.id}`)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200"
                      >
                        Rollback
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Logs */}
        {activeSubTab === 'logs' && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">Production Container Logs Stream</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    LIVE
                  </span>
                </div>

                {onOpenAiDebugger && (
                  <button
                    onClick={() => {
                      onOpenAiDebugger({
                        errorMessage: 'Reverse proxy upstream timeout check on port 5000',
                        errorStack: '[reverse-proxy] 504 Gateway Timeout checking backend',
                        sourceFile: 'server/index.ts',
                      });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition text-[11px] font-semibold"
                  >
                    <Bug className="w-3 h-3" />
                    <span>Debug with AI</span>
                  </button>
                )}
              </div>

              <div className="h-64 overflow-y-auto bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs">
                {containerLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Real-Time Forge Metrics (Recharts Telemetry) */}
        {activeSubTab === 'metrics' && (
          <ForgeMetricsDashboard
            project={project}
            onOpenAiDebugger={onOpenAiDebugger}
          />
        )}
      </div>
    </div>
  );
};
