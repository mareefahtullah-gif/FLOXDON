import React, { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  ShieldCheck,
  RefreshCw,
  Play,
  RotateCw,
  Terminal,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  Boxes,
  Lock
} from 'lucide-react';
import { ServerNode, DockerSandbox } from '../types';

interface ServersViewProps {
  showNotification: (msg: string) => void;
}

export const ServersView: React.FC<ServersViewProps> = ({ showNotification }) => {
  const [nodes, setNodes] = useState<ServerNode[]>([]);
  const [sandboxes, setSandboxes] = useState<DockerSandbox[]>([]);
  const [clusterStats, setClusterStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'nodes' | 'sandboxes' | 'compose' | 'k8s'>('nodes');
  const [copiedManifest, setCopiedManifest] = useState(false);

  const fetchTelemetry = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/servers/telemetry');
      const data = await res.json();
      if (data.success) {
        setNodes(data.nodes || []);
        setSandboxes(data.sandboxes || []);
        setClusterStats(data.cluster || null);
      }
    } catch (e) {
      console.warn('Failed to load telemetry from server, using fallback', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const sampleDockerCompose = `version: '3.8'

services:
  reverse-proxy:
    image: traefik:v3.0
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
    networks:
      - floxdon-net-prod

  floxdon-backend:
    image: floxdon-registry.local/floxdon-api:v3.4.1
    environment:
      - DATABASE_URL=postgresql://floxdon:secret@floxdon-db:5432/floxdon_db
      - PORT=5000
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1024M
    networks:
      - floxdon-net-prod

  floxdon-db:
    image: postgres:16.3-alpine
    environment:
      - POSTGRES_USER=floxdon
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=floxdon_db
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - floxdon-net-prod

volumes:
  pgdata:

networks:
  floxdon-net-prod:
    driver: bridge
`;

  const sampleKubernetes = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: floxdon-stack
  namespace: floxdon-apps
spec:
  replicas: 2
  selector:
    matchLabels:
      app: floxdon
  template:
    metadata:
      labels:
        app: floxdon
    spec:
      containers:
      - name: frontend
        image: floxdon-registry.local/floxdon-app:v3.4.1
        resources:
          limits:
            cpu: "1000m"
            memory: "512Mi"
        ports:
        - containerPort: 80
      - name: backend
        image: floxdon-registry.local/floxdon-api:v3.4.1
        resources:
          limits:
            cpu: "2000m"
            memory: "1024Mi"
        ports:
        - containerPort: 5000
---
apiVersion: v1
kind: Service
metadata:
  name: floxdon-svc
  namespace: floxdon-apps
spec:
  selector:
    app: floxdon
  ports:
    - protocol: TCP
      port: 443
      targetPort: 80
`;

  const handleCopyManifest = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedManifest(true);
    showNotification('Manifest copied to clipboard!');
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  return (
    <div id="servers-view-root" className="h-full overflow-y-auto bg-slate-50 p-6 text-slate-800 font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 bg-white p-6 rounded-2xl border shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Infrastructure & Docker Sandboxes</h1>
            <span className="px-2 py-0.5 text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold">
              Cluster Healthy
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bare-metal container execution nodes, Docker Compose daemon, and isolated per-tenant process limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTelemetry}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>
        </div>
      </div>

      {/* Cluster Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Total Compute Capacity</span>
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">92 Cores</div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">AMD EPYC 9354P</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>ECC DDR5 Memory</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">288 GB</div>
          <div className="text-[11px] text-indigo-600 mt-0.5 font-mono font-medium">123.4 GB Allocated</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>NVMe Storage Quota</span>
            <HardDrive className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">5.50 TB</div>
          <div className="text-[11px] text-emerald-600 mt-0.5 font-mono font-medium">RAID-10 Protected</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Sandboxed Containers</span>
            <Boxes className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">46 Running</div>
          <div className="text-[11px] text-cyan-600 mt-0.5 font-mono font-medium">Process-Isolated</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('nodes')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'nodes'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Server Nodes ({nodes.length || 4})
        </button>

        <button
          onClick={() => setActiveTab('sandboxes')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'sandboxes'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Docker Sandboxes ({sandboxes.length || 4})
        </button>

        <button
          onClick={() => setActiveTab('compose')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'compose'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Docker Compose Spec
        </button>

        <button
          onClick={() => setActiveTab('k8s')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'k8s'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Kubernetes YAML
        </button>
      </div>

      {/* Nodes Tab */}
      {activeTab === 'nodes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(nodes.length > 0 ? nodes : [
            {
              id: 'node-master-01',
              name: 'forge-cluster-master-01',
              ip: '10.0.10.1',
              role: 'master' as const,
              status: 'online' as const,
              cpuUsage: 28,
              cpuCores: 16,
              memoryUsedGb: 18.4,
              memoryTotalGb: 64,
              diskUsedGb: 142.5,
              diskTotalGb: 1000,
              containersCount: 14,
              dockerVersion: '26.1.4-ce',
              os: 'Ubuntu 24.04 LTS (Kernel 6.8.0)',
              uptime: '42 days, 8 hours',
            },
            {
              id: 'node-worker-01',
              name: 'forge-worker-compute-01',
              ip: '10.0.10.2',
              role: 'worker' as const,
              status: 'online' as const,
              cpuUsage: 44,
              cpuCores: 32,
              memoryUsedGb: 41.2,
              memoryTotalGb: 128,
              diskUsedGb: 480,
              diskTotalGb: 2000,
              containersCount: 22,
              dockerVersion: '26.1.4-ce',
              os: 'Debian 12 Bookworm',
              uptime: '31 days, 14 hours',
            },
            {
              id: 'node-build-01',
              name: 'forge-builder-isolated-01',
              ip: '10.0.10.3',
              role: 'build-node' as const,
              status: 'online' as const,
              cpuUsage: 12,
              cpuCores: 32,
              memoryUsedGb: 24,
              memoryTotalGb: 64,
              diskUsedGb: 310,
              diskTotalGb: 1500,
              containersCount: 6,
              dockerVersion: '26.1.4-ce',
              os: 'Ubuntu 24.04 LTS (Android SDK 34 / Xcode Builder)',
              uptime: '19 days, 2 hours',
            },
            {
              id: 'node-db-01',
              name: 'forge-postgres-ha-01',
              ip: '10.0.10.4',
              role: 'db-node' as const,
              status: 'online' as const,
              cpuUsage: 18,
              cpuCores: 8,
              memoryUsedGb: 16.8,
              memoryTotalGb: 32,
              diskUsedGb: 215,
              diskTotalGb: 1000,
              containersCount: 4,
              dockerVersion: '26.1.4-ce',
              os: 'Ubuntu 24.04 LTS (PostgreSQL 16.3 / NVMe RAID-10)',
              uptime: '85 days, 11 hours',
            },
          ]).map((node) => (
            <div key={node.id} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-mono">{node.name}</div>
                    <div className="text-[10px] text-slate-500">{node.ip} • Role: {node.role.toUpperCase()}</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  {node.status.toUpperCase()}
                </span>
              </div>

              {/* Progress Bars */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-500 text-[11px] mb-1 font-mono">
                    <span>CPU Load ({node.cpuCores} Cores)</span>
                    <span className="text-slate-900 font-semibold">{node.cpuUsage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${node.cpuUsage}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-500 text-[11px] mb-1 font-mono">
                    <span>Memory ({node.memoryUsedGb}GB / {node.memoryTotalGb}GB)</span>
                    <span className="text-slate-900 font-semibold">{Math.round((node.memoryUsedGb / node.memoryTotalGb) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(node.memoryUsedGb / node.memoryTotalGb) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>{node.containersCount} Containers</span>
                <span>Uptime: {node.uptime}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sandboxes Tab */}
      {activeTab === 'sandboxes' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Active Isolated Project Sandboxes
          </div>

          <div className="divide-y divide-slate-100">
            {(sandboxes.length > 0 ? sandboxes : [
              {
                containerId: 'c_8f912a34',
                projectId: 'proj-floxdon-enterprise',
                name: 'floxdon-web-frontend',
                image: 'floxdon-registry.local/floxdon-app:v3.4.1',
                serviceType: 'frontend' as const,
                status: 'running' as const,
                cpuLimit: '1.0 Core (Max 2.0)',
                memoryLimit: '512 MB',
                ports: '8080:80/tcp',
                created: '2026-09-07T06:12:00Z',
                networks: 'floxdon-net-prod',
                mounts: ['/var/run/secrets/floxdon-web:ro'],
              },
              {
                containerId: 'c_9b456e71',
                projectId: 'proj-floxdon-enterprise',
                name: 'floxdon-api-backend',
                image: 'floxdon-registry.local/floxdon-api:v3.4.1',
                serviceType: 'backend' as const,
                status: 'running' as const,
                cpuLimit: '2.0 Cores (Max 4.0)',
                memoryLimit: '1024 MB',
                ports: '5000:5000/tcp',
                created: '2026-09-07T06:12:05Z',
                networks: 'floxdon-net-prod',
                mounts: ['/var/run/secrets/db_credentials:ro', 'floxdon_uploads:/app/uploads'],
              },
              {
                containerId: 'c_2e781c03',
                projectId: 'proj-floxdon-enterprise',
                name: 'floxdon-postgres-db',
                image: 'postgres:16.3-alpine',
                serviceType: 'database' as const,
                status: 'running' as const,
                cpuLimit: '4.0 Cores (Dedicated)',
                memoryLimit: '2048 MB',
                ports: '5432:5432/tcp (Internal)',
                created: '2026-09-07T06:11:50Z',
                networks: 'floxdon-net-prod',
                mounts: ['pgdata_floxdon:/var/lib/postgresql/data'],
              },
            ]).map((sb) => (
              <div key={sb.containerId} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-slate-900 font-mono">{sb.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {sb.serviceType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Image: {sb.image} • Ports: {sb.ports}
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono">
                  <div className="text-slate-800 font-semibold">Limit: {sb.cpuLimit} / {sb.memoryLimit}</div>
                  <div className="text-slate-400">{sb.networks}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compose & K8s Tabs */}
      {(activeTab === 'compose' || activeTab === 'k8s') && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {activeTab === 'compose' ? 'docker-compose.yml Manifest' : 'kubernetes-deployment.yaml Manifest'}
            </h2>
            <button
              onClick={() => handleCopyManifest(activeTab === 'compose' ? sampleDockerCompose : sampleKubernetes)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
            >
              {copiedManifest ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedManifest ? 'Copied' : 'Copy Manifest'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 overflow-x-auto">
            {activeTab === 'compose' ? sampleDockerCompose : sampleKubernetes}
          </pre>
        </div>
      )}
    </div>
  );
};
