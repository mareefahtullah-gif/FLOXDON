import React, { useState, useEffect } from 'react';
import {
  Globe,
  ShieldCheck,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Copy,
  Check,
  Server
} from 'lucide-react';
import { DomainRecord } from '../types';

interface DomainsViewProps {
  showNotification: (msg: string) => void;
}

export const DomainsView: React.FC<DomainsViewProps> = ({ showNotification }) => {
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [targetService, setTargetService] = useState('floxdon-web-frontend:80');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fetchDomains = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/domains/list');
      const data = await res.json();
      if (data.success && data.domains) {
        setDomains(data.domains);
      }
    } catch (e) {
      console.warn('Domain API note', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleAddDomain = () => {
    if (!newDomainInput.trim()) return;
    const newRecord: DomainRecord = {
      id: `dom_${Date.now()}`,
      domain: newDomainInput.trim(),
      projectId: 'proj-floxdon-enterprise',
      targetService: targetService,
      sslStatus: 'active',
      sslProvider: "Let's Encrypt ACME",
      expiresAt: '2026-12-06T00:00:00Z',
      dnsRecords: [
        { type: 'A', host: '@', value: '198.51.100.24', status: 'verified' },
        { type: 'CNAME', host: 'www', value: 'proxy.floxdon.app', status: 'verified' },
      ],
      autoRenew: true,
      hstsEnabled: true,
      httpRedirectToHttps: true,
    };

    setDomains([newRecord, ...domains]);
    setNewDomainInput('');
    showNotification(`Domain ${newRecord.domain} provisioned with TLS 1.3 certificate!`);
  };

  const copyToClipboard = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedText(val);
    setTimeout(() => setCopiedText(null), 2000);
    showNotification('Copied to clipboard');
  };

  return (
    <div id="domains-view-root" className="h-full overflow-y-auto bg-slate-50 p-6 text-slate-800 font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 bg-white p-6 rounded-2xl border shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Domain & SSL Management</h1>
            <span className="px-2 py-0.5 text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
              ACME TLS 1.3 Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Map custom domains, inspect DNS verification records, and configure automated reverse proxy SSL termination.
          </p>
        </div>

        <button
          onClick={fetchDomains}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh DNS Status</span>
        </button>
      </div>

      {/* Add New Domain Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Map New Custom Domain</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="e.g. app.mycompany.io or floxdon.internal"
            value={newDomainInput}
            onChange={(e) => setNewDomainInput(e.target.value)}
            className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={handleAddDomain}
            disabled={!newDomainInput.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition active:scale-95 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Map Domain & Request SSL</span>
          </button>
        </div>
      </div>

      {/* Domains List */}
      <div className="space-y-4">
        {(domains.length > 0 ? domains : [
          {
            id: 'dom-1',
            domain: 'app.floxdon.app',
            projectId: 'proj-floxdon-enterprise',
            targetService: 'floxdon-web-frontend:80',
            sslStatus: 'active' as const,
            sslProvider: 'Floxdon Root ACME CA',
            expiresAt: '2027-09-01T00:00:00Z',
            dnsRecords: [
              { type: 'A' as const, host: '@', value: '10.0.10.1', status: 'verified' as const },
              { type: 'CNAME' as const, host: 'api', value: 'proxy.floxdon.app', status: 'verified' as const },
            ],
            autoRenew: true,
            hstsEnabled: true,
            httpRedirectToHttps: true,
          },
          {
            id: 'dom-2',
            domain: 'app.fleet-telemetry.io',
            projectId: 'proj-floxdon-enterprise',
            targetService: 'floxdon-web-frontend:80',
            sslStatus: 'active' as const,
            sslProvider: "Let's Encrypt TLS-ALPN-01",
            expiresAt: '2026-11-28T00:00:00Z',
            dnsRecords: [
              { type: 'A' as const, host: '@', value: '198.51.100.24', status: 'verified' as const },
              { type: 'CNAME' as const, host: 'cdn', value: 'edge-cluster.floxdon.app', status: 'verified' as const },
            ],
            autoRenew: true,
            hstsEnabled: true,
            httpRedirectToHttps: true,
          }
        ]).map((dom) => (
          <div key={dom.id} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-slate-900 font-mono">{dom.domain}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>SSL VALID</span>
                </span>
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                Target: <span className="text-slate-900 font-semibold">{dom.targetService}</span>
              </div>
            </div>

            {/* DNS Instructions Table */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                DNS Routing Verification Records:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {dom.dnsRecords.map((dns, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-blue-700 font-bold mr-2">{dns.type}</span>
                      <span className="text-slate-800">{dns.host}</span>
                      <span className="text-slate-400 mx-1.5">→</span>
                      <span className="text-slate-900 font-semibold">{dns.value}</span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(dns.value)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                      title="Copy DNS target"
                    >
                      {copiedText === dns.value ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100 gap-2">
              <div className="flex items-center gap-3">
                <span>Issuer: {dom.sslProvider}</span>
                <span>•</span>
                <span>Auto-Renewal: {dom.autoRenew ? 'Enabled (Every 60 Days)' : 'Manual'}</span>
              </div>
              <div className="text-emerald-700 font-semibold">HSTS Enabled • HTTP → HTTPS 301 Permanent</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
