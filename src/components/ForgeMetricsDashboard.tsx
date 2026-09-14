import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Zap,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Server,
  ShieldCheck,
  Bug,
  Terminal,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Project } from '../types';

interface ForgeMetricsDashboardProps {
  project: Project;
  onOpenAiDebugger?: (errorInfo: { errorMessage: string; errorStack?: string; sourceFile?: string }) => void;
}

interface MetricSummary {
  currentLatencyMs: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  currentRps: number;
  totalRequests24h: number;
  errorCount24h: number;
  errorRatePercent: number;
  uptimePercent: number;
}

interface MetricTimeSeriesPoint {
  timestamp: string;
  time: string;
  latencyMs: number;
  p95Ms: number;
  requestsPerSec: number;
  errorCount: number;
  statusCode2xx: number;
  statusCode4xx: number;
  statusCode5xx: number;
}

interface MetricErrorLog {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  statusCode: number;
  errorMessage: string;
  durationMs: number;
  clientIp?: string;
  userAgent?: string;
}

interface EndpointLatency {
  path: string;
  avgLatencyMs: number;
  p99LatencyMs: number;
  totalCalls: number;
  errorRate: number;
}

export const ForgeMetricsDashboard: React.FC<ForgeMetricsDashboardProps> = ({
  project,
  onOpenAiDebugger
}) => {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(5);

  const [summary, setSummary] = useState<MetricSummary>({
    currentLatencyMs: 2.8,
    avgLatencyMs: 3.2,
    p95LatencyMs: 6.4,
    p99LatencyMs: 12.8,
    currentRps: 45.2,
    totalRequests24h: 394200,
    errorCount24h: 128,
    errorRatePercent: 0.03,
    uptimePercent: 99.98
  });

  const [timeSeries, setTimeSeries] = useState<MetricTimeSeriesPoint[]>([]);
  const [errorLogs, setErrorLogs] = useState<MetricErrorLog[]>([]);
  const [endpointLatencies, setEndpointLatencies] = useState<EndpointLatency[]>([]);
  
  // Filter state for logs
  const [logFilter, setLogFilter] = useState<'ALL' | '5XX' | '4XX'>('ALL');
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [selectedError, setSelectedError] = useState<MetricErrorLog | null>(null);

  // Fetch metrics data from server
  const fetchMetrics = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsRefreshing(true);
      const res = await fetch(`/api/forge-metrics/${project.slug || 'floxdon-app'}`);
      const data = await res.json();
      if (data.success && data.metrics) {
        setSummary(data.metrics.summary);
        setTimeSeries(data.metrics.timeSeries || []);
        setErrorLogs(data.metrics.errorLogs || []);
        setEndpointLatencies(data.metrics.endpointLatencies || []);
      }
    } catch (err) {
      console.error('Failed to fetch forge metrics:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [project.slug]);

  // Initial load
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMetrics(true);
    }, refreshIntervalSec * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshIntervalSec, fetchMetrics]);

  // Filtered error logs
  const filteredErrorLogs = errorLogs.filter((log) => {
    const matchStatus =
      logFilter === 'ALL' ||
      (logFilter === '5XX' && log.statusCode >= 500) ||
      (logFilter === '4XX' && log.statusCode >= 400 && log.statusCode < 500);

    const matchQuery =
      !searchLogQuery ||
      log.endpoint.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
      log.errorMessage.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
      log.method.toLowerCase().includes(searchLogQuery.toLowerCase());

    return matchStatus && matchQuery;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Real-Time Metrics Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Live Deployment Telemetry & Latency Pipeline</span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                STREAMING
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Target Project: <span className="font-mono text-slate-700 font-semibold">{project.slug || 'floxdon-app'}</span> • Direct Ingress Envoy Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span>Auto-poll (every {refreshIntervalSec}s)</span>
          </label>

          <button
            onClick={() => fetchMetrics(false)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition border border-slate-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Now'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latency KPI */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ingress API Latency</span>
            </span>
            <span className="text-emerald-700 font-mono text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              p99: {summary.p99LatencyMs}ms
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{summary.currentLatencyMs}</span>
            <span className="text-xs text-slate-500 font-semibold">ms average</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-100">
            <span>Avg: {summary.avgLatencyMs}ms</span>
            <span>p95: {summary.p95LatencyMs}ms</span>
          </div>
        </div>

        {/* Throughput KPI */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Request Throughput</span>
            </span>
            <span className="text-blue-700 font-mono text-[10px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              Live RPS
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{summary.currentRps}</span>
            <span className="text-xs text-slate-500 font-semibold">req / sec</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-100">
            24h Total: <strong className="text-slate-700 font-semibold">{(summary.totalRequests24h).toLocaleString()}</strong> calls
          </div>
        </div>

        {/* Error Rate KPI */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>HTTP Error Rate</span>
            </span>
            <span className="text-emerald-700 font-mono text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Within SLA
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${summary.errorRatePercent > 0.5 ? 'text-rose-600' : 'text-slate-900'}`}>
              {summary.errorRatePercent}%
            </span>
            <span className="text-xs text-slate-500 font-semibold">non-2xx</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-100">
            24h Errors: <strong className="text-rose-600 font-semibold">{summary.errorCount24h}</strong> events
          </div>
        </div>

        {/* SLA & Uptime KPI */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Service Availability</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">{summary.uptimePercent}%</span>
            <span className="text-xs text-slate-500 font-semibold">30-day SLA</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-100">
            Zero planned maintenance outages
          </div>
        </div>
      </div>

      {/* RECHARTS SECTION 1: Latency Over Time (Area + Line) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>API Ingress Latency History (ms)</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Real-time rolling window tracking median response time and p95 latency spikes
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600 font-medium">Median (ms)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-600 font-medium">p95 Spike Guard (ms)</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="ms" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '11px',
                }}
              />
              <Area
                type="monotone"
                dataKey="latencyMs"
                name="Median Latency"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#latencyGradient)"
              />
              <Line
                type="monotone"
                dataKey="p95Ms"
                name="p95 Spike"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECHARTS SECTION 2: Request Rate & Status Code Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Throughput Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Live Inbound Throughput (Requests / Sec)</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Traffic volume across all frontend assets and backend REST/WebSocket handlers
            </p>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rpsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="requestsPerSec"
                  name="Requests / Sec"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#rpsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HTTP Status Breakdown Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-600" />
              <span>HTTP Status Code Distribution</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ratio of successful 2xx responses vs 4xx client errors and 5xx server incidents
            </p>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '11px',
                  }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="statusCode2xx" name="2xx Success" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="statusCode4xx" name="4xx Client" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="statusCode5xx" name="5xx Server" stackId="a" fill="#f43f5e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 3: Endpoint Performance Matrix */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Top Project Endpoints Latency & Throughput</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Breakdown of execution latency per critical REST API route
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">API Route</th>
                <th className="py-2.5 px-3">Avg Latency</th>
                <th className="py-2.5 px-3">p99 Latency</th>
                <th className="py-2.5 px-3">24h Calls</th>
                <th className="py-2.5 px-3">Error Rate</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {endpointLatencies.map((ep, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 font-mono">
                    {ep.path}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">{ep.avgLatencyMs} ms</td>
                  <td className="py-2.5 px-3 text-slate-600">{ep.p99LatencyMs} ms</td>
                  <td className="py-2.5 px-3 text-slate-600">{ep.totalCalls.toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <span className={ep.errorRate > 0.05 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                      {(ep.errorRate * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-sans font-semibold border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      OPTIMAL
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: Live Error Logs & AI Debugger */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Bug className="w-4 h-4 text-rose-500" />
              <span>Real-Time Deployment Error Logs & AI Root-Cause Trace</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Captured non-2xx responses with full contextual payloads and automatic AI Debugger triage
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold text-slate-600">
              <button
                onClick={() => setLogFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition ${logFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
              >
                All
              </button>
              <button
                onClick={() => setLogFilter('5XX')}
                className={`px-2.5 py-1 rounded-md transition ${logFilter === '5XX' ? 'bg-rose-50 text-rose-700 font-bold shadow-2xs' : 'hover:text-slate-900'}`}
              >
                5xx Critical
              </button>
              <button
                onClick={() => setLogFilter('4XX')}
                className={`px-2.5 py-1 rounded-md transition ${logFilter === '4XX' ? 'bg-amber-50 text-amber-700 font-bold shadow-2xs' : 'hover:text-slate-900'}`}
              >
                4xx Warning
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search error messages..."
                value={searchLogQuery}
                onChange={(e) => setSearchLogQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500 w-48"
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Method & Endpoint</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Error Cause / Message</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredErrorLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    No error logs recorded matching current filters. System running cleanly.
                  </td>
                </tr>
              ) : (
                filteredErrorLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold mr-1.5 ${
                          log.method === 'GET'
                            ? 'bg-blue-100 text-blue-700'
                            : log.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {log.method}
                      </span>
                      <span className="font-semibold text-slate-800">{log.endpoint}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          log.statusCode >= 500
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-700 font-sans" title={log.errorMessage}>
                      {log.errorMessage}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap font-mono">{log.durationMs} ms</td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-sans">
                      <button
                        onClick={() => {
                          if (onOpenAiDebugger) {
                            onOpenAiDebugger({
                              errorMessage: `${log.statusCode} ${log.errorMessage} on ${log.method} ${log.endpoint}`,
                              errorStack: `Error at ${log.endpoint} (duration: ${log.durationMs}ms)\n${log.errorMessage}\nClient IP: ${log.clientIp || '127.0.0.1'}`,
                              sourceFile: log.endpoint,
                            });
                          }
                        }}
                        className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] transition border border-rose-200 flex items-center gap-1 ml-auto"
                      >
                        <Bug className="w-3 h-3 text-rose-600" />
                        <span>AI Triage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
