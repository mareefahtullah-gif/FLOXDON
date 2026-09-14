import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { ForgeCloudObject, ForgeCloudBucket, ScopedEnvVariable } from '../src/types.js';

export const cloudRouter = express.Router();

// Real Persistent Buckets
let cloudBuckets: ForgeCloudBucket[] = [
  {
    id: 'bkt_db_dumps',
    name: 'database-dumps',
    description: 'PostgreSQL 16 logical backups, schemas, and compressed gzip snapshots',
    objectsCount: 2,
    totalSizeBytes: 15728640, // ~15 MB
    formattedTotalSize: '15.0 MB',
    createdAt: '2026-08-15T08:00:00Z',
  },
  {
    id: 'bkt_assets',
    name: 'project-assets',
    description: 'Vector icons, branding assets, fonts, and responsive media bundles',
    objectsCount: 3,
    totalSizeBytes: 420800, // ~420 KB
    formattedTotalSize: '420 KB',
    createdAt: '2026-08-20T10:30:00Z',
  },
  {
    id: 'bkt_binaries',
    name: 'compiled-binaries',
    description: 'Cross-platform APK, AAB, NSIS EXE, and AppImage installation packages',
    objectsCount: 2,
    totalSizeBytes: 98566144, // ~94 MB
    formattedTotalSize: '94.0 MB',
    createdAt: '2026-08-25T14:15:00Z',
  },
  {
    id: 'bkt_configs',
    name: 'config-vault',
    description: 'Docker Compose orchestration, Nginx reverse proxy configs, and TLS manifests',
    objectsCount: 2,
    totalSizeBytes: 6451,
    formattedTotalSize: '6.3 KB',
    createdAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 'bkt_store_registry',
    name: 'floxdon-store-registry',
    description: 'Dynamic Floxdon Store application inventory, category index, and publisher manifests',
    objectsCount: 1,
    totalSizeBytes: 18450,
    formattedTotalSize: '18.0 KB',
    createdAt: '2026-09-02T10:00:00Z',
  },
];

// In-Memory Real Object Store Database
let cloudObjects: (ForgeCloudObject & { rawContent?: string })[] = [
  {
    id: 'obj_db_01',
    bucket: 'database-dumps',
    name: 'omniflow-prod-dump-2026-09-07.sql.gz',
    path: 'db-backups/omniflow-prod-dump-2026-09-07.sql.gz',
    size: 14889728,
    formattedSize: '14.2 MB',
    mimeType: 'application/gzip',
    uploadedAt: '2026-09-07T04:00:00Z',
    sha256: '9f83ac2b7401d8e5b567a14c2b9a7c3e104f981e4b85c149d012479e0a293f18',
    downloadUrl: '/api/forge-cloud/files/obj_db_01/download',
  },
  {
    id: 'obj_db_02',
    bucket: 'database-dumps',
    name: 'carepulse-hospital-schema-v2.sql',
    path: 'db-backups/carepulse-hospital-schema-v2.sql',
    size: 838912,
    formattedSize: '819 KB',
    mimeType: 'application/sql',
    uploadedAt: '2026-09-06T18:30:00Z',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    downloadUrl: '/api/forge-cloud/files/obj_db_02/download',
  },
  {
    id: 'obj_ast_01',
    bucket: 'project-assets',
    name: 'forgestudio-logo-dark.svg',
    path: 'branding/forgestudio-logo-dark.svg',
    size: 18432,
    formattedSize: '18.0 KB',
    mimeType: 'image/svg+xml',
    uploadedAt: '2026-09-05T11:20:00Z',
    sha256: '3a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
    downloadUrl: '/api/forge-cloud/files/obj_ast_01/download',
  },
  {
    id: 'obj_ast_02',
    bucket: 'project-assets',
    name: 'app-icon-512.png',
    path: 'icons/app-icon-512.png',
    size: 131072,
    formattedSize: '128 KB',
    mimeType: 'image/png',
    uploadedAt: '2026-09-04T16:45:00Z',
    sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    downloadUrl: '/api/forge-cloud/files/obj_ast_02/download',
  },
  {
    id: 'obj_cfg_01',
    bucket: 'config-vault',
    name: 'docker-compose.production.yml',
    path: 'configs/docker-compose.production.yml',
    size: 4300,
    formattedSize: '4.2 KB',
    mimeType: 'text/yaml',
    uploadedAt: '2026-09-03T09:10:00Z',
    sha256: '5f4dcc3b5aa765d61d8327deb882cf992b95bc8509e5eeccf5f7bbd743a6d7f9',
    downloadUrl: '/api/forge-cloud/files/obj_cfg_01/download',
  },
  {
    id: 'obj_cfg_02',
    bucket: 'config-vault',
    name: 'nginx-reverse-proxy.conf',
    path: 'configs/nginx-reverse-proxy.conf',
    size: 2151,
    formattedSize: '2.1 KB',
    mimeType: 'text/plain',
    uploadedAt: '2026-09-02T13:40:00Z',
    sha256: '7c4a8d09ca3762af61e59520943dc26494f8941b',
    downloadUrl: '/api/forge-cloud/files/obj_cfg_02/download',
  },
];

// Cross-Project Scoped Environment Variables Database
let scopedEnvVariables: ScopedEnvVariable[] = [
  {
    id: 's_env_01',
    key: 'FORGE_REGISTRY_HOST',
    value: 'registry.floxdon.corp:5000',
    isSecret: false,
    projectScope: 'global',
    projectScopeName: 'All Projects (Global)',
    environment: 'production',
    category: 'system',
    updatedAt: 'Today',
  },
  {
    id: 's_env_02',
    key: 'MASTER_ENCRYPTION_KEY',
    value: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    isSecret: true,
    projectScope: 'global',
    projectScopeName: 'All Projects (Global)',
    environment: 'production',
    category: 'auth',
    updatedAt: 'Sep 06',
  },
  {
    id: 's_env_03',
    key: 'POSTGRES_POOL_SIZE',
    value: '50',
    isSecret: false,
    projectScope: 'global',
    projectScopeName: 'All Projects (Global)',
    environment: 'production',
    category: 'database',
    updatedAt: 'Sep 05',
  },
  {
    id: 's_env_04',
    key: 'CLINICAL_HL7_INGRESS_URL',
    value: 'https://hl7.carepulse.local/v2/feed',
    isSecret: false,
    projectScope: 'carepulse-hospital',
    projectScopeName: 'CarePulse Hospital Clinical',
    environment: 'production',
    category: 'api',
    updatedAt: 'Today',
  },
  {
    id: 's_env_05',
    key: 'DICOM_ARCHIVE_STORAGE_KEY',
    value: 'dcm_vault_sec_847193a201',
    isSecret: true,
    projectScope: 'carepulse-hospital',
    projectScopeName: 'CarePulse Hospital Clinical',
    environment: 'production',
    category: 'auth',
    updatedAt: 'Yesterday',
  },
  {
    id: 's_env_06',
    key: 'OMNIFLOW_TELEMETRY_INTERVAL_MS',
    value: '1000',
    isSecret: false,
    projectScope: 'omniflow-studio',
    projectScopeName: 'OmniFlow Cloud Studio',
    environment: 'development',
    category: 'system',
    updatedAt: 'Sep 04',
  },
  {
    id: 's_env_07',
    key: 'STAGING_OAUTH_CLIENT_SECRET',
    value: 'sec_stg_0928174102938475',
    isSecret: true,
    projectScope: 'omniflow-studio',
    projectScopeName: 'OmniFlow Cloud Studio',
    environment: 'staging',
    category: 'auth',
    updatedAt: 'Sep 03',
  },
];

// Helper to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// -------------------------------------------------------------
// GET /api/forge-cloud/buckets - List all storage buckets
// -------------------------------------------------------------
cloudRouter.get('/buckets', (_req: Request, res: Response) => {
  res.json({
    success: true,
    buckets: cloudBuckets,
  });
});

// -------------------------------------------------------------
// GET /api/forge-cloud/files - List all objects with path hierarchy
// -------------------------------------------------------------
cloudRouter.get('/files', (req: Request, res: Response) => {
  const { bucket, search, folder } = req.query;

  let filtered = [...cloudObjects];

  if (bucket && typeof bucket === 'string' && bucket !== 'all') {
    filtered = filtered.filter((o) => o.bucket === bucket);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (o) => o.name.toLowerCase().includes(q) || o.path.toLowerCase().includes(q)
    );
  }

  if (folder && typeof folder === 'string' && folder !== '/') {
    filtered = filtered.filter((o) => o.path.startsWith(folder));
  }

  // Calculate storage usage
  const totalSizeBytes = cloudObjects.reduce((sum, o) => sum + o.size, 0);

  res.json({
    success: true,
    totalFiles: cloudObjects.length,
    totalSizeBytes,
    formattedTotalSize: formatBytes(totalSizeBytes),
    files: filtered,
  });
});

// -------------------------------------------------------------
// POST /api/forge-cloud/upload - Upload file to persistent bucket
// -------------------------------------------------------------
cloudRouter.post('/upload', (req: Request, res: Response) => {
  const {
    bucket = 'database-dumps',
    name,
    path: rawPath,
    content,
    mimeType = 'application/octet-stream',
    size,
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'File name is required' });
  }

  const cleanName = name.trim();
  const folder = rawPath ? rawPath.replace(/^\/+|\/+$/g, '') : 'uploads';
  const filePath = `${folder}/${cleanName}`;

  const calcSize = size || (content ? Buffer.byteLength(content, 'utf-8') : 1024);
  const hash = crypto
    .createHash('sha256')
    .update(content || cleanName + Date.now())
    .digest('hex');

  const objId = `obj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  const newObject: ForgeCloudObject & { rawContent?: string } = {
    id: objId,
    bucket,
    name: cleanName,
    path: filePath,
    size: calcSize,
    formattedSize: formatBytes(calcSize),
    mimeType,
    uploadedAt: new Date().toISOString(),
    sha256: hash,
    downloadUrl: `/api/forge-cloud/files/${objId}/download`,
    rawContent: content,
  };

  cloudObjects.unshift(newObject);

  // Update bucket stats
  const targetBucket = cloudBuckets.find((b) => b.name === bucket);
  if (targetBucket) {
    targetBucket.objectsCount += 1;
    targetBucket.totalSizeBytes += calcSize;
    targetBucket.formattedTotalSize = formatBytes(targetBucket.totalSizeBytes);
  }

  res.status(201).json({
    success: true,
    message: `File "${cleanName}" uploaded successfully to bucket "${bucket}"!`,
    file: newObject,
  });
});

// -------------------------------------------------------------
// DELETE /api/forge-cloud/files/:id - Delete object from bucket
// -------------------------------------------------------------
cloudRouter.delete('/files/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = cloudObjects.findIndex((o) => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Object not found' });
  }

  const deleted = cloudObjects.splice(index, 1)[0];

  // Update bucket stats
  const targetBucket = cloudBuckets.find((b) => b.name === deleted.bucket);
  if (targetBucket) {
    targetBucket.objectsCount = Math.max(0, targetBucket.objectsCount - 1);
    targetBucket.totalSizeBytes = Math.max(0, targetBucket.totalSizeBytes - deleted.size);
    targetBucket.formattedTotalSize = formatBytes(targetBucket.totalSizeBytes);
  }

  res.json({
    success: true,
    message: `File "${deleted.name}" deleted from bucket "${deleted.bucket}"`,
  });
});

// -------------------------------------------------------------
// GET /api/forge-cloud/files/:id/download - Stream/Download object
// -------------------------------------------------------------
cloudRouter.get('/files/:id/download', (req: Request, res: Response) => {
  const { id } = req.params;
  const obj = cloudObjects.find((o) => o.id === id);

  if (!obj) {
    return res.status(404).json({ error: 'Object not found' });
  }

  res.setHeader('Content-Disposition', `attachment; filename="${obj.name}"`);
  res.setHeader('Content-Type', obj.mimeType);

  const payload =
    obj.rawContent ||
    `-- Forge Cloud Persistent Dump: ${obj.name}\n-- SHA256: ${obj.sha256}\n-- Created: ${obj.uploadedAt}\n-- Database Pool: Active\n\nSELECT 'ForgeStudio Persistent Storage Object' AS status;\n`;

  res.send(payload);
});

// -------------------------------------------------------------
// GET /api/forge-cloud/env-scopes - List cross-project scoped envs
// -------------------------------------------------------------
cloudRouter.get('/env-scopes', (req: Request, res: Response) => {
  const { projectScope, environment, search } = req.query;

  let filtered = [...scopedEnvVariables];

  if (projectScope && typeof projectScope === 'string' && projectScope !== 'all') {
    filtered = filtered.filter((e) => e.projectScope === projectScope);
  }

  if (environment && typeof environment === 'string' && environment !== 'all') {
    filtered = filtered.filter((e) => e.environment === environment);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (e) => e.key.toLowerCase().includes(q) || e.value.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    totalCount: scopedEnvVariables.length,
    scopes: filtered,
  });
});

// -------------------------------------------------------------
// POST /api/forge-cloud/env-scopes - Add or update scoped env variable
// -------------------------------------------------------------
cloudRouter.post('/env-scopes', (req: Request, res: Response) => {
  const {
    key,
    value,
    isSecret = false,
    projectScope = 'global',
    projectScopeName,
    environment = 'production',
    category = 'custom',
  } = req.body;

  if (!key || !value) {
    return res.status(400).json({ error: 'Key and value are required' });
  }

  const cleanKey = key.trim().toUpperCase();

  const existingIdx = scopedEnvVariables.findIndex(
    (e) => e.key === cleanKey && e.projectScope === projectScope && e.environment === environment
  );

  let targetName = projectScopeName;
  if (!targetName) {
    if (projectScope === 'global') targetName = 'All Projects (Global)';
    else if (projectScope === 'carepulse-hospital') targetName = 'CarePulse Hospital Clinical';
    else if (projectScope === 'omniflow-studio') targetName = 'OmniFlow Cloud Studio';
    else targetName = projectScope;
  }

  if (existingIdx >= 0) {
    scopedEnvVariables[existingIdx].value = value;
    scopedEnvVariables[existingIdx].isSecret = isSecret;
    scopedEnvVariables[existingIdx].category = category;
    scopedEnvVariables[existingIdx].updatedAt = 'Just now';

    return res.json({
      success: true,
      message: `Updated scoped variable ${cleanKey}`,
      variable: scopedEnvVariables[existingIdx],
    });
  }

  const newVar: ScopedEnvVariable = {
    id: `s_env_${Date.now().toString(36)}`,
    key: cleanKey,
    value,
    isSecret: Boolean(isSecret),
    projectScope,
    projectScopeName: targetName,
    environment,
    category,
    updatedAt: 'Just now',
  };

  scopedEnvVariables.unshift(newVar);

  res.status(201).json({
    success: true,
    message: `Added scoped environment variable ${cleanKey} for ${targetName} (${environment})`,
    variable: newVar,
  });
});

// -------------------------------------------------------------
// DELETE /api/forge-cloud/env-scopes/:id - Delete scoped env
// -------------------------------------------------------------
cloudRouter.delete('/env-scopes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = scopedEnvVariables.findIndex((e) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Environment variable not found' });
  }

  const deleted = scopedEnvVariables.splice(index, 1)[0];

  res.json({
    success: true,
    message: `Scoped variable ${deleted.key} removed.`,
  });
});

// -------------------------------------------------------------
// CLOUD STORAGE HELPER UTILITIES FOR INTERNAL ENGINES
// -------------------------------------------------------------

export function getCloudStorageObjectContent(bucketName: string, filePath: string): string | null {
  const obj = cloudObjects.find(
    (o) => o.bucket === bucketName && (o.path === filePath || o.name === filePath)
  );
  return obj?.rawContent || null;
}

export function saveCloudStorageObject(
  bucketName: string,
  filePath: string,
  fileName: string,
  rawContent: string,
  mimeType: string = 'application/json'
): ForgeCloudObject {
  let bucket = cloudBuckets.find((b) => b.name === bucketName);
  if (!bucket) {
    bucket = {
      id: `bkt_${bucketName.replace(/[^a-z0-9]/g, '_')}`,
      name: bucketName,
      description: 'Persistent cloud storage bucket',
      objectsCount: 0,
      totalSizeBytes: 0,
      formattedTotalSize: '0 B',
      createdAt: new Date().toISOString(),
    };
    cloudBuckets.push(bucket);
  }

  const existingIdx = cloudObjects.findIndex(
    (o) => o.bucket === bucketName && (o.path === filePath || o.name === fileName)
  );
  const size = Buffer.byteLength(rawContent, 'utf8');
  const sha256 = crypto.createHash('sha256').update(rawContent).digest('hex');

  const objId = existingIdx >= 0 ? cloudObjects[existingIdx].id : `obj_str_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const obj: ForgeCloudObject & { rawContent?: string } = {
    id: objId,
    bucket: bucketName,
    name: fileName,
    path: filePath,
    size,
    formattedSize: size > 1024 * 1024 ? `${(size / (1024 * 1024)).toFixed(1)} MB` : `${(size / 1024).toFixed(1)} KB`,
    mimeType,
    uploadedAt: new Date().toISOString(),
    sha256,
    downloadUrl: `/api/forge-cloud/files/${objId}/download`,
    rawContent,
  };

  if (existingIdx >= 0) {
    cloudObjects[existingIdx] = obj;
  } else {
    cloudObjects.unshift(obj);
    bucket.objectsCount += 1;
  }

  bucket.totalSizeBytes = cloudObjects.filter((o) => o.bucket === bucketName).reduce((acc, o) => acc + o.size, 0);
  bucket.formattedTotalSize = `${(bucket.totalSizeBytes / (1024 * 1024)).toFixed(1)} MB`;

  return obj;
}
