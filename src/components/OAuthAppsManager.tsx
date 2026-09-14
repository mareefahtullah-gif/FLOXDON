import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Globe,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Layers,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Smartphone,
  Laptop,
  Terminal,
  Code2
} from 'lucide-react';
import { AuthorizedOAuthApp, OAuthClientApp, OAuthScopeDefinition } from '../types';

interface OAuthAppsManagerProps {
  showNotification: (msg: string) => void;
}

export const OAuthAppsManager: React.FC<OAuthAppsManagerProps> = ({ showNotification }) => {
  const [activeSection, setActiveSection] = useState<'authorized' | 'clients' | 'simulator'>('authorized');

  // Authorized Apps state
  const [authorizedApps, setAuthorizedApps] = useState<AuthorizedOAuthApp[]>([]);
  const [loadingAuthorized, setLoadingAuthorized] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Registered OAuth2 Clients state
  const [clients, setClients] = useState<OAuthClientApp[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  // Register New Client Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppDesc, setNewAppDesc] = useState('');
  const [newHomepageUrl, setNewHomepageUrl] = useState('https://myapp.dev');
  const [newRedirectUris, setNewRedirectUris] = useState('https://myapp.dev/auth/callback');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['openid', 'profile', 'email']);
  const [isRegisteringClient, setIsRegisteringClient] = useState(false);

  // Scopes definition state
  const [availableScopes, setAvailableScopes] = useState<OAuthScopeDefinition[]>([
    { id: 'openid', label: 'OpenID Connect', description: 'Authenticate identity via Floxdon SSO ID token', isDefault: true },
    { id: 'profile', label: 'User Profile', description: 'Read display name, avatar, bio, and time zone', isDefault: true },
    { id: 'email', label: 'Email Address', description: 'Access primary verified account email', isDefault: true },
    { id: 'phone', label: 'Phone Number', description: 'Access verified SMS telephone credential' },
    { id: 'offline_access', label: 'Offline Refresh Token', description: 'Maintain background API access with rotating refresh tokens' },
    { id: 'store.install', label: 'Floxdon Store Install', description: 'Remotely download and install published ecosystem apps' },
    { id: 'projects.read', label: 'Workspace Projects Read', description: 'Read metadata of developer workspace repositories' },
    { id: 'projects.write', label: 'Workspace Projects Write', description: 'Push commits and create new projects on developer account' },
  ]);

  // OAuth2 Consent Screen Simulator State
  const [simClientId, setSimClientId] = useState('');
  const [simScopes, setSimScopes] = useState<string[]>(['openid', 'profile', 'email', 'store.install']);
  const [simConsentResult, setSimConsentResult] = useState<any | null>(null);
  const [isSimulatingConsent, setIsSimulatingConsent] = useState(false);

  // Fetch Authorized Apps
  const fetchAuthorizedApps = async () => {
    try {
      setLoadingAuthorized(true);
      const res = await fetch('/api/forge-auth/oauth/authorized-apps');
      const data = await res.json();
      if (data.success && Array.isArray(data.apps)) {
        setAuthorizedApps(data.apps);
      }
    } catch (err) {
      console.error('Failed to load authorized apps:', err);
    } finally {
      setLoadingAuthorized(false);
    }
  };

  // Fetch Registered Clients
  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const res = await fetch('/api/forge-auth/oauth/clients');
      const data = await res.json();
      if (data.success && Array.isArray(data.clients)) {
        setClients(data.clients);
        if (data.clients.length > 0 && !simClientId) {
          setSimClientId(data.clients[0].clientId);
        }
      }
    } catch (err) {
      console.error('Failed to load OAuth clients:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  // Fetch Scopes
  const fetchScopes = async () => {
    try {
      const res = await fetch('/api/forge-auth/oauth/scopes');
      const data = await res.json();
      if (data.success && Array.isArray(data.scopes)) {
        setAvailableScopes(data.scopes);
      }
    } catch (err) {
      console.error('Failed to load scopes:', err);
    }
  };

  useEffect(() => {
    fetchAuthorizedApps();
    fetchClients();
    fetchScopes();
  }, []);

  // Revoke App Authorization
  const handleRevokeApp = async (appId: string, appName: string) => {
    try {
      setRevokingId(appId);
      const res = await fetch(`/api/forge-auth/oauth/authorized-apps/${appId}/revoke`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Revoked access for '${appName}'. All tokens invalidated.`);
        setAuthorizedApps((prev) =>
          prev.map((a) => (a.id === appId || a.clientId === appId ? { ...a, status: 'revoked' } : a))
        );
      } else {
        throw new Error(data.error || 'Failed to revoke application');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error revoking application session');
    } finally {
      setRevokingId(null);
    }
  };

  // Register New Client
  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) {
      showNotification('Application name is required');
      return;
    }

    try {
      setIsRegisteringClient(true);
      const res = await fetch('/api/forge-auth/oauth/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: newAppName.trim(),
          description: newAppDesc.trim(),
          homepageUrl: newHomepageUrl.trim(),
          redirectUris: newRedirectUris.split('\n').map((u) => u.trim()).filter(Boolean),
          allowedScopes: selectedScopes,
        }),
      });
      const data = await res.json();
      if (data.success && data.client) {
        showNotification(`OAuth2 application '${data.client.appName}' registered successfully!`);
        setClients((prev) => [data.client, ...prev]);
        setShowRegisterModal(false);
        setNewAppName('');
        setNewAppDesc('');
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to register client');
    } finally {
      setIsRegisteringClient(false);
    }
  };

  // Regenerate Secret
  const handleRegenerateSecret = async (clientId: string) => {
    try {
      setRegeneratingId(clientId);
      const res = await fetch(`/api/forge-auth/oauth/clients/${clientId}/regenerate-secret`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.clientSecret) {
        showNotification('New Client Secret issued. Update your third-party service credentials.');
        setClients((prev) =>
          prev.map((c) => (c.clientId === clientId || c.id === clientId ? { ...c, clientSecret: data.clientSecret } : c))
        );
        setRevealedSecrets((prev) => ({ ...prev, [clientId]: true }));
      }
    } catch (err: any) {
      showNotification('Failed to regenerate secret');
    } finally {
      setRegeneratingId(null);
    }
  };

  // Delete Client
  const handleDeleteClient = async (clientId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete OAuth client '${name}'? This will terminate all active token grants.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/forge-auth/oauth/clients/${clientId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`OAuth2 client '${name}' deleted.`);
        setClients((prev) => prev.filter((c) => c.clientId !== clientId && c.id !== clientId));
        fetchAuthorizedApps();
      }
    } catch (err) {
      showNotification('Failed to delete client');
    }
  };

  // Test Simulate Consent Flow
  const handleSimulateConsent = async (allow: boolean) => {
    if (!simClientId) return;
    try {
      setIsSimulatingConsent(true);
      setSimConsentResult(null);
      const res = await fetch('/api/forge-auth/oauth/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: simClientId,
          scopes: simScopes,
          redirectUri: 'https://demo.thirdparty.app/oauth/callback',
          state: 'flx_state_' + Math.random().toString(36).substring(2, 8),
          allow,
        }),
      });
      const data = await res.json();
      setSimConsentResult(data);
      if (data.success && data.authorizationCode) {
        showNotification(`OAuth2 Code issued: ${data.authorizationCode.slice(0, 14)}...`);
        fetchAuthorizedApps();
      } else if (data.redirectUrl?.includes('access_denied')) {
        showNotification('User denied consent. OAuth authorization aborted.');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error simulating consent');
    } finally {
      setIsSimulatingConsent(false);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showNotification(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1 text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Floxdon OAuth2 & Identity Provider (IdP)</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                OIDC Provider v2.1
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Authenticate external web, desktop, and mobile applications using native Floxdon Account credentials. Manage third-party session tokens, register developer client IDs, and configure scope permissions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                fetchAuthorizedApps();
                fetchClients();
                showNotification('Refreshed OAuth2 provider state');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-xs shadow-cyan-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New App</span>
            </button>
          </div>
        </div>

        {/* Discovery & Endpoint Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Issuer URL</span>
              <p className="font-mono text-cyan-400 truncate text-[11px]">https://auth.floxdon.local/oauth</p>
            </div>
            <button
              onClick={() => copyToClipboard('https://auth.floxdon.local/oauth', 'Issuer URL')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
              title="Copy Issuer URL"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">OpenID Discovery</span>
              <p className="font-mono text-cyan-400 truncate text-[11px]">/.well-known/openid-configuration</p>
            </div>
            <button
              onClick={() => copyToClipboard('/api/forge-auth/oauth/.well-known/openid-configuration', 'Discovery URL')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
              title="Copy Discovery URL"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Active Client Grants</span>
              <p className="font-mono text-emerald-400 font-bold text-xs">
                {authorizedApps.filter((a) => a.status === 'active').length} Authorized Apps Active
              </p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSection('authorized')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeSection === 'authorized'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Authorized Applications</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
            {authorizedApps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSection('clients')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeSection === 'clients'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Registered OAuth2 Clients</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
            {clients.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSection('simulator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeSection === 'simulator'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>SSO Consent Verification</span>
        </button>
      </div>

      {/* SECTION 1: AUTHORIZED APPLICATIONS (SESSION MANAGEMENT) */}
      {activeSection === 'authorized' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Authorized Third-Party Applications</h3>
              <p className="text-xs text-slate-400">
                Manage sessions and permissions granted to external applications using your Floxdon Account identity.
              </p>
            </div>
            <span className="text-xs text-slate-400">
              Total Grants: <strong className="text-white">{authorizedApps.length}</strong>
            </span>
          </div>

          {authorizedApps.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No Third-Party Authorizations Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                When third-party apps request permission to sign in with your Floxdon identity, they will appear here where you can inspect scopes and revoke access at any time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {authorizedApps.map((app) => {
                const isRevoked = app.status === 'revoked';
                const isProcessing = revokingId === app.id || revokingId === app.clientId;

                return (
                  <div
                    key={app.id}
                    className={`bg-slate-900 border rounded-2xl p-5 space-y-4 transition ${
                      isRevoked ? 'border-red-900/40 opacity-60' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                          {app.logoUrl ? (
                            <img src={app.logoUrl} alt={app.clientName} className="w-full h-full object-cover" />
                          ) : (
                            <Globe className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">{app.clientName}</h4>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase ${
                                isRevoked
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                            Client ID: {app.clientId}
                          </p>
                        </div>
                      </div>

                      {!isRevoked && (
                        <button
                          onClick={() => handleRevokeApp(app.id, app.clientName)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition shrink-0 disabled:opacity-50"
                        >
                          {isProcessing ? 'Revoking...' : 'Revoke Access'}
                        </button>
                      )}
                    </div>

                    {/* Granted Scopes */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                        Authorized Permissions (Scopes)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {app.grantedScopes.map((scope) => (
                          <span
                            key={scope}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Metadata Timestamps */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Authorized: {new Date(app.authorizedAt).toLocaleDateString()}</span>
                      <span>Last Used: {new Date(app.lastAccessedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: REGISTERED DEVELOPER OAUTH CLIENTS */}
      {activeSection === 'clients' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Registered Developer OAuth2 Applications</h3>
              <p className="text-xs text-slate-400">
                Register your own external websites and tools to allow users to sign in with Floxdon identity.
              </p>
            </div>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Client</span>
            </button>
          </div>

          <div className="space-y-3">
            {clients.map((client) => {
              const isSecretShown = revealedSecrets[client.clientId];
              const isRegenerating = regeneratingId === client.clientId;

              return (
                <div
                  key={client.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{client.appName}</h4>
                          {client.isFirstParty && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              First-Party App
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{client.description || 'No description provided.'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRegenerateSecret(client.clientId)}
                        disabled={isRegenerating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                        <span>Regenerate Secret</span>
                      </button>
                      {!client.isFirstParty && (
                        <button
                          onClick={() => handleDeleteClient(client.clientId, client.appName)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
                          title="Delete OAuth Client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Credentials Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Client ID</span>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-xs font-mono text-cyan-300 truncate">{client.clientId}</code>
                        <button
                          onClick={() => copyToClipboard(client.clientId, 'Client ID')}
                          className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
                          title="Copy Client ID"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Client Secret</span>
                        <button
                          onClick={() =>
                            setRevealedSecrets((prev) => ({
                              ...prev,
                              [client.clientId]: !prev[client.clientId],
                            }))
                          }
                          className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          {isSecretShown ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{isSecretShown ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-xs font-mono text-cyan-300 truncate">
                          {isSecretShown ? client.clientSecret : '••••••••••••••••••••••••••••••••••••'}
                        </code>
                        <button
                          onClick={() => copyToClipboard(client.clientSecret, 'Client Secret')}
                          className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
                          title="Copy Client Secret"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Redirect URIs & Scopes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block mb-1">
                        Whitelisted Callback URLs
                      </span>
                      <div className="space-y-1">
                        {client.redirectUris.map((uri) => (
                          <div key={uri} className="font-mono text-slate-300 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800/80 truncate">
                            {uri}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block mb-1">
                        Allowed Scopes
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {client.allowedScopes.map((scope) => (
                          <span
                            key={scope}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: SSO CONSENT SCREEN VERIFICATION */}
      {activeSection === 'simulator' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">OAuth2 Consent Screen Verification</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Verify how client applications prompt users for Floxdon identity authorization. Test and validate Allow and Deny token responses.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Verification Controls */}
            <div className="space-y-4 bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                1. Authorization Parameters
              </h4>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold">Target Client App</label>
                <select
                  value={simClientId}
                  onChange={(e) => setSimClientId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-cyan-500"
                >
                  {clients.map((c) => (
                    <option key={c.clientId} value={c.clientId}>
                      {c.appName} ({c.clientId.slice(0, 16)}...)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold">Requested Scopes</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {availableScopes.map((scope) => (
                    <label
                      key={scope.id}
                      className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={simScopes.includes(scope.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSimScopes([...simScopes, scope.id]);
                          } else {
                            setSimScopes(simScopes.filter((s) => s !== scope.id));
                          }
                        }}
                        className="mt-0.5 rounded text-cyan-500 focus:ring-cyan-500"
                      />
                      <div>
                        <span className="font-mono text-cyan-300 font-bold">{scope.id}</span>
                        <p className="text-[11px] text-slate-400">{scope.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {simConsentResult && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Callback Result</span>
                    <span className={simConsentResult.success ? 'text-emerald-400' : 'text-red-400'}>
                      {simConsentResult.success ? 'Granted' : 'Denied'}
                    </span>
                  </div>
                  {simConsentResult.authorizationCode && (
                    <div className="p-2 rounded bg-slate-950 text-cyan-300 text-[11px] break-all">
                      code: {simConsentResult.authorizationCode}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 truncate">
                    Redirected to: {simConsentResult.redirectUrl}
                  </p>
                </div>
              )}
            </div>

            {/* Live Consent Dialog Preview */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5">
              <div className="text-center space-y-2 border-b border-slate-800 pb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20 mx-auto">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Sign in with Floxdon Account</h4>
                <p className="text-xs text-slate-400">
                  <strong className="text-cyan-400">
                    {clients.find((c) => c.clientId === simClientId)?.appName || 'Third-Party App'}
                  </strong>{' '}
                  is requesting permission to access your identity
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Requested Permissions:
                </span>
                <div className="space-y-2">
                  {simScopes.map((scopeId) => {
                    const sc = availableScopes.find((s) => s.id === scopeId);
                    return (
                      <div key={scopeId} className="flex items-start gap-3 text-xs bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-200">{sc?.label || scopeId}</span>
                          <p className="text-[11px] text-slate-400">{sc?.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <button
                  onClick={() => handleSimulateConsent(false)}
                  disabled={isSimulatingConsent}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Deny
                </button>
                <button
                  onClick={() => handleSimulateConsent(true)}
                  disabled={isSimulatingConsent}
                  className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-md shadow-cyan-500/20"
                >
                  {isSimulatingConsent ? 'Authorizing...' : 'Allow & Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW OAUTH2 CLIENT */}
      {showRegisterModal && (
        <div 
          id="modal-register-oauth-client"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Register Developer OAuth2 Client</h3>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterClient} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Application Name *</label>
                <input
                  type="text"
                  required
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="e.g. My Next.js Dashboard"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Description</label>
                <input
                  type="text"
                  value={newAppDesc}
                  onChange={(e) => setNewAppDesc(e.target.value)}
                  placeholder="Production inventory sync manager"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Homepage URL</label>
                <input
                  type="url"
                  value={newHomepageUrl}
                  onChange={(e) => setNewHomepageUrl(e.target.value)}
                  placeholder="https://myapp.dev"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Redirect URIs (one per line) *</label>
                <textarea
                  required
                  rows={2}
                  value={newRedirectUris}
                  onChange={(e) => setNewRedirectUris(e.target.value)}
                  placeholder="https://myapp.dev/auth/callback"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Allowed Scopes</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableScopes.map((scope) => (
                    <label
                      key={scope.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(scope.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedScopes([...selectedScopes, scope.id]);
                          } else {
                            setSelectedScopes(selectedScopes.filter((s) => s !== scope.id));
                          }
                        }}
                        className="rounded text-cyan-500 focus:ring-cyan-500"
                      />
                      <span className="font-mono text-slate-300">{scope.id}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRegisteringClient}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow-xs shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isRegisteringClient ? 'Registering...' : 'Register Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
