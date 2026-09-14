import { Project, DatabaseTable, Deployment } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-floxdon-app',
    name: 'Production Workspace',
    slug: 'production-app',
    description: 'Clean modern multi-platform workspace with automated AI code synthesis, native mobile preview, and full-stack cloud deployment.',
    platform: 'fullstack',
    createdAt: '2026-09-07T06:00:00.000Z',
    lastModified: '2026-09-07T07:10:00.000Z',
    activeFile: 'src/App.tsx',
    files: [
      {
        path: 'src/App.tsx',
        type: 'code',
        language: 'typescript',
        content: `import React, { useState } from 'react';
import { Sparkles, Rocket, CheckCircle2, Layers, Cpu, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'features'>('overview');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30">
      {/* Top Application Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white tracking-wide">Production Application</h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Ready</span>
            </div>
            <p className="text-[11px] text-slate-400">Clean Application Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-mono text-emerald-400 font-semibold">ONLINE</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-5 max-w-5xl mx-auto w-full flex flex-col justify-center items-center text-center space-y-6">
        <div className="p-8 max-w-lg w-full rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
            <Rocket className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Clean Application Canvas</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your application environment is clean and initialized. Start writing code or use Floxdon AI prompt engine to generate components and backend services.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Workspace initialized & ready to build</span>
          </div>
        </div>
      </main>
    </div>
  );
}
`,
      },
      {
        path: 'server/index.ts',
        type: 'code',
        language: 'typescript',
        content: `import express from 'express';
import { Pool } from 'pg';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://floxdon:secret@localhost:5432/app_db',
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(\`[Production Server] Listening on port \${port}\`);
});
`,
      },
      {
        path: 'db/schema.sql',
        type: 'db',
        language: 'sql',
        content: `-- PostgreSQL 16 Application Schema
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(128),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`,
      },
      {
        path: 'capacitor.config.json',
        type: 'config',
        language: 'json',
        content: JSON.stringify({
          appId: "com.floxdon.app",
          appName: "Floxdon App",
          webDir: "dist",
          bundledWebRuntime: false,
          server: {
            androidScheme: "https",
            cleartext: true
          }
        }, null, 2),
      },
      {
        path: 'android/AndroidManifest.xml',
        type: 'code',
        language: 'xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.floxdon.app">

    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Floxdon App"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="Floxdon App"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
      },
      {
        path: 'ios/Info.plist',
        type: 'code',
        language: 'xml',
        content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>en</string>
	<key>CFBundleDisplayName</key>
	<string>Floxdon App</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>com.floxdon.app</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0.0</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
</dict>
</plist>`,
      },
      {
        path: 'electron/main.js',
        type: 'code',
        language: 'javascript',
        content: `const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 800,
    minHeight: 600,
    title: "Floxdon App",
    backgroundColor: '#020617',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
`,
      },
      {
        path: 'docker-compose.yml',
        type: 'config',
        language: 'yaml',
        content: `version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./dist:/usr/share/nginx/html
    restart: always

  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://floxdon:secret@db:5432/app_db
      - NODE_ENV=production
    restart: always
`,
      },
      {
        path: '.env',
        type: 'config',
        language: 'properties',
        content: `# Production Configuration
APP_NAME=FloxdonApp
PORT=5000
DATABASE_URL=postgresql://floxdon:secret@localhost:5432/app_db
`,
      }
    ]
  }
];

export const INITIAL_DATABASE_TABLES: DatabaseTable[] = [
  {
    name: 'users',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true },
      { name: 'email', type: 'VARCHAR(255)' },
      { name: 'role', type: 'VARCHAR(50)' },
      { name: 'status', type: 'VARCHAR(32)' },
    ],
    rows: [
      { id: 'e48a1c90-9c2b-4fa8-a1c2-1234567890ab', email: 'admin@floxdon.corp', role: 'Administrator', status: 'Active' },
      { id: 'f72b9a14-8d1e-4cb7-b2e3-9876543210fe', email: 'user@floxdon.corp', role: 'Developer', status: 'Active' },
    ]
  }
];

export const INITIAL_DEPLOYMENT: Deployment = {
  id: 'dep_prod_app_01',
  appName: 'Production Web App',
  domain: 'app.floxdon.studio',
  status: 'active',
  ssl: {
    enabled: true,
    issuer: 'Floxdon Studio Automated CA (ACME)',
    expiresAt: '2026-12-07T00:00:00.000Z',
    tlsVersion: 'TLSv1.3'
  },
  containers: [
    { name: 'web-frontend', service: 'frontend', status: 'running', port: 443, memory: '32 MB / 512 MB', cpu: '0.2%', uptime: '5d 12h' },
    { name: 'api-backend', service: 'backend', status: 'running', port: 5000, memory: '64 MB / 1024 MB', cpu: '0.5%', uptime: '5d 12h' },
    { name: 'postgres-db', service: 'database', status: 'running', port: 5432, memory: '96 MB / 2048 MB', cpu: '0.4%', uptime: '5d 12h' },
  ],
  url: 'https://app.floxdon.studio',
  healthCheck: '200 OK (2.1ms latency)',
  createdAt: '2026-09-07T06:30:00.000Z',
  envVars: {
    PORT: '5000',
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://floxdon:secret@db:5432/app_db',
  },
  rollbackVersions: [
    { id: 'v1.0.0', version: 'v1.0.0 (Current)', timestamp: 'Today, 06:30 AM', author: 'Floxdon Studio Compiler', summary: 'Production workspace initialization' },
  ]
};
