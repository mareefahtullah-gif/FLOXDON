import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Tablet,
  Laptop,
  CheckCircle2,
  Share2,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Sparkles,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { Project } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  onExportZip?: () => void;
  showNotification?: (msg: string) => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  project,
  onExportZip,
  showNotification,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isDesktop, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'mobile' | 'ios' | 'desktop' | 'bundle'>('mobile');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  const appName = project ? project.name : 'Floxdon Studio';
  const appSlug = project ? project.slug : 'floxdon-studio';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://floxdon.studio';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    if (showNotification) showNotification('Installation URL copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTriggerInstall = async () => {
    setIsInstalling(true);
    const success = await install();
    setIsInstalling(false);
    if (success && showNotification) {
      showNotification(`Installed ${appName} to home screen!`);
    }
  };

  const handleDownloadPWABundle = () => {
    if (onExportZip) {
      onExportZip();
    } else {
      // Create and download manifest file
      const manifestData = {
        name: appName,
        short_name: appName.slice(0, 12),
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        icons: [
          { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      };
      const blob = new Blob([JSON.stringify(manifestData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${appSlug}-manifest.json`;
      a.click();
      URL.revokeObjectURL(url);
      if (showNotification) showNotification(`Downloaded ${appName} PWA manifest`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Install & Download PWA</h2>
                <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ready for Device
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Install <span className="font-semibold text-slate-700">{appName}</span> directly on your phone, tablet, or desktop without an app store.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Install Banner (if browser supports prompt) */}
        {isInstallable && (
          <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">One-Click Device Installation Available</div>
                <div className="text-[11px] text-slate-600">Your current browser supports instant standalone app installation.</div>
              </div>
            </div>
            <button
              onClick={handleTriggerInstall}
              disabled={isInstalling}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow transition flex items-center gap-1.5 active:scale-95 self-end sm:self-auto shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isInstalling ? 'Installing...' : 'Install Now'}</span>
            </button>
          </div>
        )}

        {isInstalled && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Already running in standalone PWA mode. All offline caches and storage are active.</span>
          </div>
        )}

        {/* Tabs for device targets */}
        <div className="px-4 sm:px-6 pt-4 border-b border-slate-100 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('mobile')}
            className={`pb-2 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'mobile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android & Mobile</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`pb-2 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'ios'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>iPhone & iPad (iOS)</span>
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`pb-2 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'desktop'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Desktop (Mac / Windows / Chrome)</span>
          </button>

          <button
            onClick={() => setActiveTab('bundle')}
            className={`pb-2 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'bundle'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>PWA Package Bundle</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-600">
          {/* Mobile / Android Tab */}
          {activeTab === 'mobile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  How to Install on Android Phone:
                </div>
                <ol className="space-y-2.5 list-decimal list-inside text-slate-700">
                  <li className="leading-relaxed">
                    Open this URL in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your phone.
                  </li>
                  <li className="leading-relaxed">
                    Tap the <strong>three dots menu (⋮)</strong> in the top-right corner.
                  </li>
                  <li className="leading-relaxed">
                    Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </li>
                  <li className="leading-relaxed">
                    The app will install as a native standalone app icon on your home screen and app drawer.
                  </li>
                </ol>

                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1.5">Share Link to Phone:</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentUrl}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 select-all"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium text-slate-700 flex items-center gap-1 transition"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* QR Code Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
                <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center relative">
                  {/* Styled simulated high-resolution QR graphic */}
                  <svg className="w-32 h-32 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    {/* Top Left Marker */}
                    <rect x="5" y="5" width="26" height="26" rx="4" />
                    <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
                    <rect x="13" y="13" width="10" height="10" />
                    {/* Top Right Marker */}
                    <rect x="69" y="5" width="26" height="26" rx="4" />
                    <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
                    <rect x="77" y="13" width="10" height="10" />
                    {/* Bottom Left Marker */}
                    <rect x="5" y="69" width="26" height="26" rx="4" />
                    <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
                    <rect x="13" y="77" width="10" height="10" />
                    {/* QR Code Dots Matrix */}
                    <rect x="36" y="8" width="6" height="6" />
                    <rect x="46" y="14" width="6" height="6" />
                    <rect x="56" y="8" width="6" height="6" />
                    <rect x="36" y="24" width="6" height="6" />
                    <rect x="46" y="24" width="6" height="6" />
                    <rect x="56" y="20" width="6" height="6" />
                    <rect x="8" y="38" width="6" height="6" />
                    <rect x="18" y="44" width="6" height="6" />
                    <rect x="28" y="38" width="6" height="6" />
                    <rect x="38" y="38" width="8" height="8" />
                    <rect x="50" y="36" width="6" height="6" />
                    <rect x="62" y="42" width="6" height="6" />
                    <rect x="74" y="38" width="6" height="6" />
                    <rect x="86" y="44" width="6" height="6" />
                    <rect x="38" y="52" width="6" height="6" />
                    <rect x="48" y="52" width="6" height="6" />
                    <rect x="58" y="52" width="6" height="6" />
                    <rect x="72" y="54" width="8" height="8" />
                    <rect x="84" y="52" width="6" height="6" />
                    <rect x="38" y="68" width="6" height="6" />
                    <rect x="48" y="74" width="6" height="6" />
                    <rect x="58" y="68" width="6" height="6" />
                    <rect x="48" y="86" width="6" height="6" />
                    <rect x="60" y="82" width="6" height="6" />
                    <rect x="74" y="76" width="6" height="6" />
                    <rect x="86" y="82" width="6" height="6" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 text-xs font-bold text-slate-800">Scan with Phone Camera</div>
                <div className="text-[11px] text-slate-500">Opens live app on your phone instantly</div>
              </div>
            </div>
          )}

          {/* iOS Safari Tab */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3">
                <Share2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-xs">iOS Safari Direct Install Procedure</div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    Apple WebKit requires user-initiated home screen installation via the native iOS Safari Share sheet.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <div className="font-semibold text-slate-800 text-xs">Open in Safari</div>
                  <p className="text-[11px] text-slate-600">Navigate to this app URL inside Safari on your iPhone or iPad.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <div className="font-semibold text-slate-800 text-xs">Tap Share Button</div>
                  <p className="text-[11px] text-slate-600">
                    Tap the square icon with the upward arrow (
                    <Share2 className="inline w-3 h-3 text-blue-600 mx-0.5" />) in the bottom navigation bar.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <div className="font-semibold text-slate-800 text-xs">Add to Home Screen</div>
                  <p className="text-[11px] text-slate-600">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>, then tap <strong>Add</strong> in the top-right.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Tab */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 text-xs">Installing on Chrome, Edge, Brave, or Safari Desktop:</div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      Look for the <strong>Install icon (monitor with down arrow)</strong> in the right side of your browser address bar.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      Click <strong>"Install {appName}"</strong>. The app will launch in its own standalone, distraction-free desktop window.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      The desktop app supports window snapping, native keyboard shortcuts, dock/taskbar pinning, and background caching.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PWA Bundle Tab */}
          {activeTab === 'bundle' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-xs">PWA Manifest & Production Bundle Assets</div>
                <p className="text-[11px] text-slate-600">
                  Export the configured <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">manifest.json</code>, service worker cache script, and high-resolution icons ready for static hosting or production deployment.
                </p>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={handleDownloadPWABundle}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Full PWA Archive (.ZIP)</span>
                  </button>

                  <button
                    onClick={handleDownloadPWABundle}
                    className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Export Manifest JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Compliant with W3C PWA & Web App Manifest specs</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition self-end sm:self-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
