import express, { Request, Response } from 'express';
import { 
  LiveDeploymentMetrics, 
  ApiLatencyPoint, 
  RequestRatePoint, 
  ErrorLogItem 
} from '../src/types.js';

export const metricsRouter = express.Router();

// Generate dynamic realistic time-series points based on current time
function generateMetricsSeries(projectSlug: string): LiveDeploymentMetrics {
  const now = Date.now();
  const latencyHistory: ApiLatencyPoint[] = [];
  const requestRateHistory: RequestRatePoint[] = [];

  // Generate 24 points (e.g. past 2 hours in 5-minute increments)
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now - i * 5 * 60 * 1000);
    const timeLabel = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Deterministic realistic variance based on time and index
    const baseLatency = projectSlug.includes('hospital') ? 12 : 16;
    const wave = Math.sin(i * 0.4) * 4;
    const p50 = Math.max(6, Math.round(baseLatency + wave));
    const p95 = Math.round(p50 * 1.6 + (i % 3));
    const p99 = Math.round(p95 * 1.5 + (i % 4));

    latencyHistory.push({
      timestamp: timeLabel,
      p50,
      p95,
      p99,
    });

    const baseRps = 24 + Math.round(Math.cos(i * 0.5) * 8);
    const s2xx = Math.max(18, baseRps);
    const s4xx = Math.floor(Math.random() * 2);
    const s5xx = i === 4 ? 1 : 0; // occasional isolated error spike

    requestRateHistory.push({
      timestamp: timeLabel,
      reqPerSec: s2xx + s4xx + s5xx,
      status2xx: s2xx,
      status4xx: s4xx,
      status5xx: s5xx,
    });
  }

  const liveErrorLogs: ErrorLogItem[] = [
    {
      id: 'err_log_01',
      timestamp: new Date(now - 120000).toLocaleTimeString(),
      level: 'ERROR',
      method: 'POST',
      path: '/api/v2/telemetry/ingest',
      statusCode: 502,
      latencyMs: 342,
      message: 'Bad Gateway: Upstream socket closed prematurely by worker container node-03',
      stackTrace: `Error: Upstream socket closed prematurely\n    at Socket.onStreamError (server/ingress.ts:184:22)\n    at emitErrorNT (node:internal/streams/destroy:169:8)\n    at emitErrorCloseNT (node:internal/streams/destroy:128:3)`,
      clientIp: '192.168.1.188',
    },
    {
      id: 'err_log_02',
      timestamp: new Date(now - 450000).toLocaleTimeString(),
      level: 'WARN',
      method: 'GET',
      path: '/api/auth/saml/metadata.xml',
      statusCode: 404,
      latencyMs: 14,
      message: 'Resource Not Found: SAML Identity Provider entity descriptor not configured on this host',
      stackTrace: `HttpError: 404 Not Found\n    at router.get (/server/forgeAuthEngine.ts:312:15)\n    at Layer.handle [as handle_request] (express/lib/router/layer.js:95:5)`,
      clientIp: '10.0.4.12',
    },
    {
      id: 'err_log_03',
      timestamp: new Date(now - 980000).toLocaleTimeString(),
      level: 'CRITICAL',
      method: 'POST',
      path: '/api/db/pool/checkout',
      statusCode: 500,
      latencyMs: 1250,
      message: 'PoolExhaustionError: Max PostgreSQL client pool limit (50 connections) reached under peak ingestion burst',
      stackTrace: `PoolExhaustionError: timeout exceeded waiting for connection pool slot (50/50 active)\n    at Pool.acquire (node_modules/pg-pool/index.js:342:19)\n    at DatabaseStudio.query (server/dbStudio.ts:89:12)`,
      clientIp: '127.0.0.1',
    },
    {
      id: 'err_log_04',
      timestamp: new Date(now - 1840000).toLocaleTimeString(),
      level: 'WARN',
      method: 'POST',
      path: '/api/auth/login',
      statusCode: 429,
      latencyMs: 8,
      message: 'Rate Limit Exceeded: Client exceeded 10 login attempts within 60s sliding window',
      stackTrace: `RateLimitError: 429 Too Many Requests\n    at rateLimitMiddleware (server/security.ts:44:11)`,
      clientIp: '192.168.1.45',
    },
  ];

  const currentRps = requestRateHistory[requestRateHistory.length - 1]?.reqPerSec || 28;
  const avgLatency = Math.round(latencyHistory.reduce((sum, p) => sum + p.p50, 0) / latencyHistory.length);
  const p99 = latencyHistory[latencyHistory.length - 1]?.p99 || 24;

  return {
    projectId: projectSlug,
    projectSlug,
    currentRps,
    avgLatencyMs: avgLatency,
    p99LatencyMs: p99,
    errorRatePercentage: 0.28,
    totalRequestsToday: 184920,
    latencyHistory,
    requestRateHistory,
    liveErrorLogs,
    uptimePercentage: 99.98,
  };
}

// -------------------------------------------------------------
// GET /api/deployments/:id/metrics - Live metrics for deployment
// -------------------------------------------------------------
metricsRouter.get('/deployments/:id/metrics', (req: Request, res: Response) => {
  const deploymentId = req.params.id;
  const metrics = generateMetricsSeries(deploymentId);

  res.json({
    success: true,
    deploymentId,
    metrics,
  });
});

// -------------------------------------------------------------
// GET /api/metrics/:projectSlug - Live metrics by project slug
// -------------------------------------------------------------
metricsRouter.get('/:projectSlug', (req: Request, res: Response) => {
  const projectSlug = req.params.projectSlug;
  const metrics = generateMetricsSeries(projectSlug);

  res.json({
    success: true,
    projectSlug,
    metrics,
  });
});
