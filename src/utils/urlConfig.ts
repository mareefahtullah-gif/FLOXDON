// Floxdon Studio Central Platform & Deployment URL Engine
// Manages configurable platform branding, domains, deployment URLs, and proxy routes.

export interface PlatformUrlConfig {
  platformName: string;
  baseDomain: string;
  urlFormat: 'subdomain' | 'path';
  protocol: 'https' | 'http';
  customProxyHeader?: string;
  updatedAt: string;
}

const STORAGE_KEY = 'floxdon_platform_url_config';

const DEFAULT_CONFIG: PlatformUrlConfig = {
  platformName: 'FLOXDON STUDIO',
  baseDomain: 'floxdon.studio',
  urlFormat: 'subdomain',
  protocol: 'https',
  updatedAt: new Date().toISOString(),
};

/**
 * Retrieves the current platform URL configuration from local state, falling back to defaults.
 */
export function getPlatformUrlConfig(): PlatformUrlConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch {
    // fallback to default
  }
  return DEFAULT_CONFIG;
}

/**
 * Saves and propagates updated platform configuration across the studio.
 */
export function setPlatformUrlConfig(config: Partial<PlatformUrlConfig>): PlatformUrlConfig {
  const current = getPlatformUrlConfig();
  const updated: PlatformUrlConfig = {
    ...current,
    ...config,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('floxdon-url-config-changed', { detail: updated }));
    } catch {
      // ignore localstorage write error
    }

    // Also persist asynchronously to server settings backend
    fetch('/api/settings/platform-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {
      // non-blocking
    });
  }

  return updated;
}

/**
 * Strips any cloud hosting or AI Studio internal hostnames (e.g. ais-dev-*.run.app)
 * and replaces with the authoritative Floxdon Studio platform domain.
 */
export function sanitizePlatformUrl(rawUrl: string, slug?: string): string {
  if (!rawUrl) return getDeploymentUrl(slug);
  
  // If the URL contains ais-dev, ais-pre, or google-related staging domains, remap to Floxdon
  if (/ais-dev|ais-pre|run\.app|localhost:3000|127\.0\.0\.1/i.test(rawUrl)) {
    return getDeploymentUrl(slug);
  }

  return rawUrl;
}

/**
 * Generates the clean, production deployment URL for an application or project.
 */
export function getDeploymentUrl(slug?: string): string {
  const config = getPlatformUrlConfig();
  const cleanSlug = (slug || 'app').toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const base = config.baseDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const proto = config.protocol || 'https';

  if (config.urlFormat === 'path') {
    return `${proto}://${base}/apps/${cleanSlug}`;
  }
  return `${proto}://${cleanSlug}.${base}`;
}

/**
 * Generates project sharing and collaboration link.
 */
export function getShareUrl(slug: string): string {
  const config = getPlatformUrlConfig();
  const cleanSlug = (slug || 'project').toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const base = config.baseDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const proto = config.protocol || 'https';
  return `${proto}://${base}/share/${cleanSlug}`;
}

/**
 * Generates live preview sandbox URL.
 */
export function getPreviewUrl(slug: string): string {
  const config = getPlatformUrlConfig();
  const cleanSlug = (slug || 'app').toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const base = config.baseDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const proto = config.protocol || 'https';
  return `${proto}://${base}/preview/${cleanSlug}`;
}

/**
 * Generates OAuth2 / OpenID Connect Issuer URL.
 */
export function getOidcIssuerUrl(): string {
  const config = getPlatformUrlConfig();
  const base = config.baseDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const proto = config.protocol || 'https';
  return `${proto}://auth.${base}/oauth`;
}

/**
 * Generates Floxdon Store marketplace catalog URL.
 */
export function getStoreCatalogUrl(): string {
  const config = getPlatformUrlConfig();
  const base = config.baseDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const proto = config.protocol || 'https';
  return `${proto}://store.${base}`;
}

/**
 * Hook or subscriber for React components to respond dynamically to URL config changes.
 */
export function subscribeToPlatformUrlConfig(callback: (config: PlatformUrlConfig) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<PlatformUrlConfig>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback(getPlatformUrlConfig());
    }
  };

  window.addEventListener('floxdon-url-config-changed', handler);
  return () => window.removeEventListener('floxdon-url-config-changed', handler);
}
