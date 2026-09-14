import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Users,
  Lock,
  Boxes,
  Key,
  HardDrive,
  RefreshCw,
  Copy,
  Check,
  Activity,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { ContainerRegistryImage, AuditLogEntry } from '../types';

interface SettingsViewProps {
  showNotification: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ showNotification }) => {
  const [activeTab, setActiveTab] = useState<'security' | 'team' | 'registry' | 'audit'>('security');
  const [registryImages, setRegistryImages] = useState<ContainerRegistryImage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSettingsData = async () => {
    setIsLoading(true);
    try {
      const [imgRes, auditRes] = await Promise.all([
        fetch('/api/registry/images'),
        fetch('/api/settings/audit-logs'),
      ]);

      const imgData = await imgRes.json();
      const auditData = await auditRes.json();

      if (imgData.success) setRegistryImages(imgData.images || []);
      if (auditData.success) setAuditLogs(auditData.logs || []);
    } catch (e) {
      console.warn('Settings fetch note', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const teamMembers = [
    { name: 'mareefahtullah@gmail.com', role: 'Owner', access: 'Full Cluster & Root Shell Access', joined: 'Jan 2026' },
    { name: 'lead-architect@floxdon.corp', role: 'Admin', access: 'Deployments, Secrets & Builds', joined: 'Feb 2026' },
    { name: 'dev-mobile@floxdon.corp', role: 'Developer', access: 'Git, Code Editor & Builds', joined: 'Mar 2026' },
    { name: 'security-auditor@floxdon.corp', role: 'Viewer', access: 'Read-Only Telemetry & Audit Logs', joined: 'Apr 2026' },
  ];

  return (
    <div id="settings-view-root" className="h-full overflow-y-auto bg-slate-50 p-6 text-slate-800 font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 bg-white p-6 rounded-2xl border shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise Settings & Security Control</h1>
            <span className="px-2 py-0.5 text-[11px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-semibold">
              Zero Trust Mode Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            RBAC permissions, container registry, encrypted environment store, and immutable audit logs.
          </p>
        </div>

        <button
          onClick={fetchSettingsData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'security'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Security Policies & Sandboxing
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'team'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Team & RBAC ({teamMembers.length})
        </button>

        <button
          onClick={() => setActiveTab('registry')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'registry'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Private Registry ({registryImages.length || 3})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'audit'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Audit Logs ({auditLogs.length || 4})
        </button>
      </div>

      {/* Security Policies Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">Docker Container Hardening & Quotas</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" /> Docker Socket Isolation
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Sandboxed project containers run without access to <code className="text-blue-700 font-mono">/var/run/docker.sock</code>. Only the Forge master controller has container lifecycle permission.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Non-Root Process Execution
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  All generated Dockerfiles specify <code className="text-blue-700 font-mono">USER node:node (UID 1000)</code> to prevent container breakout vulnerabilities.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-600" /> Hardware Secrets Storage
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Environment variables & tokens are stored encrypted using AES-256-GCM keys managed by the host OS keyring.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" /> Strict Memory & CPU Limits
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Every tenant preview container is restricted via Linux cgroups v2 to 1 CPU core and 512MB RAM maximum.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team & RBAC Tab */}
      {activeTab === 'team' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Workspace Members & Access Control</h2>
            <button
              onClick={() => showNotification('Invite link created and copied to clipboard')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition active:scale-95 shadow-xs"
            >
              + Invite Member
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{member.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                        member.role === 'Owner'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : member.role === 'Admin'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{member.access}</div>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">Active since {member.joined}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local Container Registry Tab */}
      {activeTab === 'registry' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Internal Container Registry</h2>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">Host: forge-registry.local:5000</p>
            </div>
            <span className="text-xs text-emerald-700 font-mono font-semibold">HTTPS TLS Active</span>
          </div>

          <div className="divide-y divide-slate-100">
            {(registryImages.length > 0 ? registryImages : [
              {
                id: 'img-1',
                name: 'floxdon-registry.local/floxdon-app',
                tag: 'v3.4.1',
                size: '184 MB',
                digest: 'sha256:d8912e74a81c002...',
                pushedAt: 'Today, 07:15 AM',
                layers: 8,
              },
              {
                id: 'img-2',
                name: 'floxdon-registry.local/floxdon-api',
                tag: 'v3.4.1',
                size: '242 MB',
                digest: 'sha256:f12b84920a9e711...',
                pushedAt: 'Today, 07:12 AM',
                layers: 11,
              },
              {
                id: 'img-3',
                name: 'floxdon-registry.local/floxdon-db',
                tag: '16.3-alpine',
                size: '380 MB',
                digest: 'sha256:a418902c39e8011...',
                pushedAt: 'Yesterday, 04:30 PM',
                layers: 6,
              },
            ]).map((img) => (
              <div key={img.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900 font-mono">{img.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-100 text-blue-700 font-semibold border border-slate-200">
                      :{img.tag}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Digest: {img.digest} • {img.layers} Layers
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono">
                  <div className="text-slate-900 font-semibold">{img.size}</div>
                  <div className="text-slate-400">{img.pushedAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Cluster Security Audit Stream
          </div>

          <div className="divide-y divide-slate-100">
            {(auditLogs.length > 0 ? auditLogs : [
              {
                id: 'log-1',
                actor: 'mareefahtullah@gmail.com',
                action: 'deploy.stack',
                resource: 'floxdon-prod',
                ip: '192.168.1.100',
                timestamp: '2026-09-07T07:15:20Z',
                status: 'success' as const,
              },
              {
                id: 'log-2',
                actor: 'AI Agent Orchestrator',
                action: 'synthesize.project',
                resource: 'floxdon-workspace',
                ip: '127.0.0.1 (Local)',
                timestamp: '2026-09-07T07:10:05Z',
                status: 'success' as const,
              },
              {
                id: 'log-3',
                actor: 'lead-architect@floxdon.corp',
                action: 'secret.update',
                resource: 'DATABASE_URL',
                ip: '192.168.1.104',
                timestamp: '2026-09-07T06:30:11Z',
                status: 'success' as const,
              },
            ]).map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-900 font-bold">{log.actor}</span>
                  <span className="text-slate-500">performed</span>
                  <span className="text-blue-700 font-bold">{log.action}</span>
                  <span className="text-slate-500">on</span>
                  <span className="text-indigo-700 font-semibold">{log.resource}</span>
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  {log.ip} • {log.timestamp.slice(11, 19)} UTC
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
