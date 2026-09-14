export type DeviceView = 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'web';

export type PlatformTarget = 'web' | 'android' | 'ios' | 'desktop' | 'fullstack' | 'mobile';

export interface ProjectFile {
  path: string;
  name?: string;
  content: string;
  type?: 'code' | 'config' | 'doc' | 'asset' | 'db';
  language?: string;
  isModified?: boolean;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  platform: PlatformTarget;
  framework?: string;
  version?: string;
  files: ProjectFile[];
  createdAt: string;
  lastModified?: string;
  updatedAt?: string;
  activeFile?: string;
  status?: string;
}

export interface BuildArtifact {
  buildId: string;
  platform: 'android' | 'ios' | 'desktop' | 'web';
  filename: string;
  size: string;
  checksum: string;
  createdAt: string;
  type: string;
  downloadUrl?: string;
}

export interface BuildLog {
  timestamp: string;
  message: string;
  level?: 'info' | 'warn' | 'error' | 'success';
}

export interface BuildTask {
  id: string;
  platform: 'android' | 'ios' | 'desktop' | 'web';
  status: 'pending' | 'running' | 'success' | 'failed';
  progress: number;
  logs: string[];
  artifact?: BuildArtifact;
  targetOs?: 'windows' | 'macos' | 'linux';
}

export interface ContainerInfo {
  name: string;
  service: 'frontend' | 'backend' | 'database' | 'proxy';
  status: 'running' | 'starting' | 'stopped';
  port: number;
  memory: string;
  cpu: string;
  uptime: string;
}

export interface Deployment {
  id: string;
  appName: string;
  domain: string;
  status: 'active' | 'building' | 'stopped';
  ssl: {
    enabled: boolean;
    issuer: string;
    expiresAt: string;
    tlsVersion: string;
  };
  containers: ContainerInfo[];
  url: string;
  healthCheck: string;
  createdAt: string;
  envVars: Record<string, string>;
  rollbackVersions: {
    id: string;
    version: string;
    timestamp: string;
    author: string;
    summary: string;
  }[];
}

export interface DatabaseColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  isNullable?: boolean;
}

export interface DatabaseTable {
  name: string;
  columns: DatabaseColumn[];
  rows: Record<string, any>[];
}

export interface GitCommit {
  id: string;
  hash: string;
  message: string;
  author: string;
  timestamp: string;
  branch: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
  snapshot: Record<string, string>; // path -> content
}

export interface GitBranch {
  name: string;
  isDefault?: boolean;
  lastCommitHash: string;
  lastCommitMessage: string;
  updatedAt: string;
}

export interface GitFileDiff {
  path: string;
  status: 'modified' | 'added' | 'deleted';
  originalContent: string;
  currentContent: string;
  isStaged: boolean;
}

export interface GitRepoState {
  isInitialized: boolean;
  currentBranch: string;
  branches: GitBranch[];
  commits: GitCommit[];
  stagedFiles: string[];
}

export interface RefactorAnalysis {
  filePath: string;
  qualityScoreBefore: number;
  qualityScoreAfter: number;
  summary: string;
  improvements: {
    category: 'performance' | 'security' | 'redundancy' | 'algorithms' | 'clean_code' | 'platform' | 'boilerplate';
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    lineRange?: string;
  }[];
  metrics: {
    sizeDelta: string;
    renderSpeedGain: string;
    complexityScore: string;
    securityIssuesFixed?: number;
  };
  originalCode: string;
  refactoredCode: string;
}

export interface DebugAnalysis {
  id: string;
  errorTitle: string;
  errorMessage: string;
  errorStack?: string;
  sourceFile?: string;
  rootCause: string;
  explanation: string;
  suggestedSteps: string[];
  codePatch?: {
    filePath: string;
    before: string;
    after: string;
  };
  confidence: 'high' | 'medium' | 'low';
  status: 'analyzing' | 'resolved' | 'suggested';
}

export interface MetricDataPoint {
  time: string;
  cpu: number;
  memory: number;
  networkIn: number;
  networkOut: number;
  latency: number;
}

export interface SslCertInfo {
  enabled: boolean;
  issuer: string;
  commonName: string;
  sanDomains: string[];
  issuedDate: string;
  expiresAt: string;
  daysRemaining: number;
  fingerprint: string;
  tlsVersion: string;
  cipherSuite: string;
  autoRenew: boolean;
}

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  environment: 'production' | 'staging' | 'development';
  category?: 'database' | 'auth' | 'api' | 'system' | 'custom';
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    filePath?: string;
    replacementCode?: string;
  };
}

export interface TerminalEntry {
  id: string;
  type: 'command' | 'output' | 'error' | 'system';
  content: string;
  timestamp: string;
  sourceError?: {
    file?: string;
    line?: number;
    errorText: string;
  };
}

export type SidebarNavTab = 
  | 'landing'
  | 'dashboard'
  | 'projects'
  | 'templates'
  | 'design-engine'
  | 'ai-builder'
  | 'ai-refactor'
  | 'files'
  | 'deployments'
  | 'builds'
  | 'store'
  | 'auth'
  | 'cloud'
  | 'analytics'
  | 'updates'
  | 'servers'
  | 'databases'
  | 'domains'
  | 'settings';

export type AiAgentRole = 'planner' | 'architect' | 'coder' | 'tester' | 'debugger' | 'builder' | 'deployment';

export interface AiAgentStep {
  role: AiAgentRole;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  outputSnippet?: string;
  durationMs?: number;
  actionsTaken?: string[];
}

export interface AppTemplate {
  id: string;
  title: string;
  description: string;
  category: 'web' | 'mobile' | 'desktop' | 'fullstack';
  framework: string;
  stars: number;
  badge: string;
  features: string[];
  starterPrompt: string;
  architecture: string[];
}

export interface ServerNode {
  id: string;
  name: string;
  ip: string;
  role: 'master' | 'worker' | 'build-node' | 'db-node';
  status: 'online' | 'degraded' | 'offline';
  cpuUsage: number; // percentage
  cpuCores: number;
  memoryUsedGb: number;
  memoryTotalGb: number;
  diskUsedGb: number;
  diskTotalGb: number;
  containersCount: number;
  dockerVersion: string;
  os: string;
  uptime: string;
}

export interface DockerSandbox {
  containerId: string;
  projectId: string;
  name: string;
  image: string;
  serviceType: 'frontend' | 'backend' | 'ai-engine' | 'builder' | 'preview' | 'database' | 'deployment' | 'worker' | 'registry' | 'reverse-proxy';
  status: 'running' | 'stopped' | 'restarting';
  cpuLimit: string;
  memoryLimit: string;
  ports: string;
  created: string;
  networks: string;
  mounts: string[];
}

export interface ContainerRegistryImage {
  id: string;
  repository: string;
  tag: string;
  digest: string;
  size: string;
  pushedAt: string;
  layers: number;
  deployedTo?: string;
}

export interface DomainRecord {
  id: string;
  domain: string;
  subdomain?: string;
  projectId?: string;
  targetService: string;
  sslStatus: 'active' | 'provisioning' | 'expired' | 'error';
  sslIssuer?: string;
  sslProvider?: string;
  sslExpiresAt?: string;
  expiresAt?: string;
  dnsStatus?: 'verified' | 'pending' | 'unreachable';
  dnsRecords: {
    type: 'A' | 'CNAME' | 'TXT';
    host: string;
    value: string;
    status: 'verified' | 'pending';
  }[];
  autoRenew?: boolean;
  hstsEnabled?: boolean;
  httpRedirectToHttps?: boolean;
  createdAt?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  role: string;
  ipAddress: string;
  timestamp: string;
  status: 'success' | 'warning' | 'denied';
  details: string;
}

export interface OrgTeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Developer' | 'Viewer';
  team: string;
  avatarUrl?: string;
  lastActive: string;
  mfaEnabled: boolean;
}

export interface AndroidBuildConfig {
  appName: string;
  packageId: string;
  versionName: string;
  versionCode: number;
  targetSdk: number;
  minSdk: number;
  signingKeystore: string;
  keyAlias: string;
  buildType: 'apk' | 'aab';
}

export interface IosBuildConfig {
  appName: string;
  bundleId: string;
  version: string;
  buildNumber: number;
  teamId: string;
  provisioningProfile: string;
  signingIdentity: string;
  exportMethod: 'app-store' | 'ad-hoc' | 'development' | 'enterprise';
}

export interface DesktopBuildConfig {
  appName: string;
  targetPlatform: 'windows' | 'macos' | 'linux' | 'all';
  version: string;
  electronVersion: string;
  formats: ('nsis' | 'dmg' | 'appimage' | 'deb')[];
  author: string;
}

export type ProductArchetype =
  | 'fintech_banking'
  | 'healthcare_hospital'
  | 'ecommerce_retail'
  | 'developer_tool'
  | 'saas_b2b'
  | 'marketplace'
  | 'education'
  | 'social_community'
  | 'gaming'
  | 'custom';

export type DesignTone =
  | 'enterprise'
  | 'minimalist'
  | 'dark_luxury'
  | 'clinical_medical'
  | 'vibrant_playful'
  | 'cybernetic'
  | 'warm_editorial';

export interface DesignSystemTokens {
  tone: DesignTone;
  toneLabel: string;
  primaryColor: string;
  primaryHover: string;
  accentColor: string;
  bgCanvas: string;
  bgSurface: string;
  bgElevated: string;
  borderColor: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  fontDisplay: string;
  fontBody: string;
  fontScaleRatio: number;
  radiusBase: string;
  radiusLg: string;
  radiusPill: string;
  spacingScale: {
    compact: string;
    normal: string;
    generous: string;
    section: string;
  };
  shadowElevations: {
    sm: string;
    md: string;
    lg: string;
  };
  componentSpecs: {
    buttonRadius: string;
    buttonPadding: string;
    cardBorder: string;
    inputBg: string;
    tableDensity: 'compact' | 'normal' | 'relaxed';
  };
}

export interface ScreenPlan {
  id: string;
  name: string;
  path: string;
  domainPurpose: string;
  priority: 'core' | 'secondary' | 'admin' | 'modal';
  userGoals: string[];
  requiredData: string[];
  keyActions: string[];
  components: string[];
  platformAdaptations: {
    web: string;
    mobile: string;
    tablet: string;
    desktop: string;
  };
  states: {
    loading: string;
    empty: string;
    error: string;
    success: string;
  };
}

export interface UiWorkflowStep {
  id: string;
  title: string;
  description: string;
  targetScreen: string;
  actions: string[];
  backendApiNeeded: string;
  databaseImpact: string;
}

export interface UiWorkflow {
  id: string;
  title: string;
  trigger: string;
  steps: UiWorkflowStep[];
  successOutcome: string;
}

export interface UiValidationIssue {
  id: string;
  category: 'navigation' | 'layout_overflow' | 'touch_targets' | 'spacing' | 'hierarchy' | 'states' | 'accessibility' | 'anti_slop';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  screenId?: string;
  suggestedFix: string;
  isResolved: boolean;
}

export interface UiSpecification {
  id: string;
  productName: string;
  archetype: ProductArchetype;
  archetypeLabel: string;
  targetAudience: string;
  coreProblem: string;
  targetPlatforms: PlatformTarget[];
  accessibilityLevel: 'WCAG_AA' | 'WCAG_AAA';
  navigationPattern: 'sidebar_desktop_bottom_mobile' | 'header_tabs' | 'split_master_detail' | 'canvas_dock';
  designTokens: DesignSystemTokens;
  screens: ScreenPlan[];
  workflows: UiWorkflow[];
  antiSlopChecks: {
    bannedGenericDashboardChecked: boolean;
    bannedUnnecessaryCardsChecked: boolean;
    bannedFakeStatsChecked: boolean;
    bannedPlaceholderButtonsChecked: boolean;
    justification: string;
  };
  validationIssues: UiValidationIssue[];
  generatedAt: string;
}

export type RealBuildStage = 
  | 'QUEUED'
  | 'BUILDING'
  | 'COMPILING'
  | 'TESTING'
  | 'PACKAGING'
  | 'VALIDATING'
  | 'READY'
  | 'FAILED';

export interface RealBuildArtifact {
  id: string;
  projectId: string;
  projectName: string;
  platform: 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'web';
  format: 'apk' | 'aab' | 'ipa' | 'exe' | 'msi' | 'dmg' | 'app' | 'appimage' | 'deb' | 'rpm' | 'zip';
  architecture: 'arm64-v8a' | 'armeabi-v7a' | 'x86_64' | 'universal' | 'arm64';
  version: string;
  buildNumber: number;
  filename: string;
  fileSize: string;
  sizeBytes: number;
  checksumSha256: string;
  signatureStatus: 'signed_release' | 'signed_debug' | 'unsigned' | 'verified_v2_v3';
  storagePath: string;
  downloadUrl: string;
  validationStatus: 'verified' | 'environment_unavailable' | 'failed';
  verifiedAt: string;
  toolchainUsed: string;
  functionalTests: {
    name: string;
    passed: boolean;
    durationMs: number;
  }[];
  environmentStatus?: string;
  magicBytesVerified: boolean;
  targetFormat?: string;
  checksum?: string;
}

export type StoreReleaseTrack = 'production' | 'beta' | 'internal';

export interface ForgeStoreApp {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  iconUrl?: string;
  developer: string;
  developerId?: string;
  supportEmail?: string;
  supportWebsite?: string;
  category: 'Enterprise' | 'Healthcare' | 'FinTech' | 'Developer Tools' | 'E-Commerce' | 'Education' | 'Gaming' | 'Utilities' | 'Productivity' | 'Finance' | 'Health & Fitness' | 'Weather' | 'Music & Audio' | 'Social' | 'Lifestyle';
  platforms: ('android' | 'ios' | 'windows' | 'macos' | 'linux' | 'web')[];
  version: string;
  buildNumber?: string;
  releaseTrack: StoreReleaseTrack;
  downloadsCount: number;
  rating: number;
  reviewsCount: number;
  screenshots: string[];
  downloadArtifactId?: string;
  downloadUrl?: string;
  permissions: string[];
  whatsNew: string;
  contentRating?: string;
  privacyPolicyUrl?: string;
  termsUrl?: string;
  pricing?: string;
  price?: string;
  confirmedOwnership?: boolean;
  selectedArtifactIds?: string[];
  publishedAt: string;
  featured?: boolean;
}

export interface ForgeAuthUser {
  uid: string;
  email?: string;
  phone?: string;
  displayName: string;
  photoUrl?: string;
  providers: ('password' | 'phone' | 'google' | 'github' | 'gitlab' | 'bitbucket' | 'saml')[];
  mfaEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  lastSignInAt: string;
  status: 'active' | 'suspended' | 'pending';
  role: 'admin' | 'developer' | 'user';
}

export interface ForgeAuthSecuritySettings {
  passwordMinLength: number;
  requireSpecialChar: boolean;
  allowPhoneAuth: boolean;
  allowSocialAuth: boolean;
  mfaEnforced: boolean;
  sessionTtlHours: number;
  jwtSecretConfigured: boolean;
  smsGatewayProvider: 'twilio' | 'aws_sns' | 'self_hosted_gsm' | 'local_gsm_gateway';
}

export interface AppVersion {
  id: string;
  appId: string;
  version: string;
  releaseTrack: StoreReleaseTrack;
  createdAt: string;
  changelog: string;
  downloadUrl?: string;
  downloadArtifactId?: string;
  fileSize?: string;
  minOsVersion?: string;
  gitCommitHash?: string;
  downloadsCount: number;
}

export interface AppReview {
  id: string;
  appId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  sentiment: 'positive' | 'neutral' | 'critical';
  developerReply?: {
    reply: string;
    repliedAt: string;
  };
}

export interface DeveloperPortfolio {
  developerName: string;
  verified: boolean;
  avatarUrl?: string;
  bio: string;
  totalApps: number;
  totalDownloads: number;
  averageRating: number;
  publicContributionsCount: number;
  joinedAt: string;
  apps: ForgeStoreApp[];
}

export interface AppSentimentSummary {
  appId: string;
  overallScore: number; // 0 - 100
  overallVerdict: 'Overwhelmingly Positive' | 'Mostly Positive' | 'Mixed' | 'Needs Attention';
  positiveThemes: string[];
  criticismThemes: string[];
  featureRequests: string[];
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    critical: number;
  };
  aiGeneratedAnalysis: string;
  trend?: DailySentimentScore[];
}

export interface SocialAuthProviderConfig {
  id: 'github' | 'gitlab' | 'bitbucket' | 'google' | 'saml';
  name: string;
  icon: string;
  isEnabled: boolean;
  clientId: string;
  clientSecretConfigured: boolean;
  maskedClientSecret?: string;
  redirectUri: string;
  scopes: string[];
  hostedInstanceUrl?: string;
  updatedAt: string;
}

export interface AuthSession {
  id: string;
  uid: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface AuthPasskey {
  id: string;
  uid: string;
  name: string;
  credentialId: string;
  createdAt: string;
  lastUsedAt: string;
}

// Forge Cloud Object Storage & Scoped Envs
export interface ForgeCloudObject {
  id: string;
  bucket: string;
  name: string;
  path: string;
  size: number;
  formattedSize: string;
  mimeType: string;
  uploadedAt: string;
  sha256: string;
  downloadUrl: string;
  isFolder?: boolean;
}

export interface ForgeCloudBucket {
  id: string;
  name: string;
  description: string;
  objectsCount: number;
  totalSizeBytes: number;
  formattedTotalSize: string;
  createdAt: string;
}

export interface ScopedEnvVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  projectScope: string; // 'global' or project id / slug
  projectScopeName: string;
  environment: 'production' | 'staging' | 'development';
  category: 'database' | 'auth' | 'api' | 'system' | 'custom';
  updatedAt: string;
}

// TOTP MFA Types
export interface TotpSetupData {
  secret: string;
  otpauthUri: string;
  qrCodeSvgDataUri?: string;
  recoveryCodes: string[];
}

// Real-Time Metrics & Telemetry
export interface ApiLatencyPoint {
  timestamp: string;
  p50: number; // ms
  p95: number;
  p99: number;
}

export interface RequestRatePoint {
  timestamp: string;
  reqPerSec: number;
  status2xx: number;
  status4xx: number;
  status5xx: number;
}

export interface ErrorLogItem {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'CRITICAL' | 'WARN';
  method: string;
  path: string;
  statusCode: number;
  latencyMs: number;
  message: string;
  stackTrace?: string;
  clientIp?: string;
}

export interface LiveDeploymentMetrics {
  projectId: string;
  projectSlug: string;
  currentRps: number;
  avgLatencyMs: number;
  p99LatencyMs: number;
  errorRatePercentage: number;
  totalRequestsToday: number;
  latencyHistory: ApiLatencyPoint[];
  requestRateHistory: RequestRatePoint[];
  liveErrorLogs: ErrorLogItem[];
  uptimePercentage: number;
}

export interface DailySentimentScore {
  date: string;
  score: number; // 0 - 100
  reviewCount: number;
  positivePct: number;
}

// OAuth2 Provider Types
export interface OAuthClientApp {
  id: string;
  clientId: string;
  clientSecret: string;
  appName: string;
  description: string;
  homepageUrl: string;
  redirectUris: string[];
  allowedScopes: string[];
  logoUrl?: string;
  isFirstParty?: boolean;
  createdAt: string;
  lastUsedAt?: string;
  activeTokensCount: number;
}

export interface AuthorizedOAuthApp {
  id: string;
  clientId: string;
  clientName: string;
  logoUrl?: string;
  grantedScopes: string[];
  authorizedAt: string;
  lastAccessedAt: string;
  sessionCount: number;
  status: 'active' | 'revoked';
}

export interface OAuthScopeDefinition {
  id: string;
  label: string;
  description: string;
  isDefault?: boolean;
}

// Store Inventory & Category Indexing from Cloud Storage
export interface StoreCategoryIndex {
  name: string;
  slug: string;
  count: number;
  icon: string;
  description: string;
}

export interface StoreInventoryIndex {
  cloudBucket: string;
  totalApps: number;
  totalDownloads: number;
  lastSyncedAt: string;
  categories: StoreCategoryIndex[];
  featuredAppSlugs: string[];
}

