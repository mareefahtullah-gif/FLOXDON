import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  Circle,
  Square,
  Wifi,
  Battery,
  Signal,
  Bell,
  Volume2,
  Search,
  Lock,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Share2,
  Bookmark,
  Keyboard,
  Check,
  Music,
  ExternalLink,
  Layers,
  Sparkles,
  Sliders,
  X,
  Apple
} from 'lucide-react';
import { Project, DeviceView } from '../types';
import { DynamicAppRuntime } from './DynamicAppRuntime';

export type PreviewPlatform = 'android' | 'ios' | 'tablet' | 'desktop' | 'web';

interface DevicePreviewFrameProps {
  project: Project;
  onShowNotification: (message: string) => void;
  onOpenWorkspace?: () => void;
}

export const DevicePreviewFrame: React.FC<DevicePreviewFrameProps> = ({
  project,
  onShowNotification,
  onOpenWorkspace,
}) => {
  // Device mode
  const [platform, setPlatform] = useState<PreviewPlatform>('android');
  const [isLandscape, setIsLandscape] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [androidNavMode, setAndroidNavMode] = useState<'3-button' | 'gesture'>('3-button');
  const [scale, setScale] = useState<number>(1);
  const [isReloading, setIsReloading] = useState(false);
  const [keyCounter, setKeyCounter] = useState(0);

  // Android Recent Apps overlay state
  const [showAndroidRecents, setShowAndroidRecents] = useState(false);

  // Dynamic Island interactive expanded state
  const [dynamicIslandExpanded, setDynamicIslandExpanded] = useState(false);

  // Live time for status bar
  const [currentTime, setCurrentTime] = useState('9:41');

  // Input simulation in keyboard
  const [keyboardInput, setKeyboardInput] = useState('');

  // Scroll container ref for home button reset
  const runtimeScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      const formattedMins = minutes < 10 ? `0${minutes}` : minutes;
      setCurrentTime(`${formattedHours}:${formattedMins}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRestart = () => {
    setIsReloading(true);
    setTimeout(() => {
      setKeyCounter((k) => k + 1);
      setIsReloading(false);
      onShowNotification('Device preview reloaded.');
    }, 450);
  };

  // Android 3-Button actions
  const handleAndroidBack = () => {
    if (showAndroidRecents) {
      setShowAndroidRecents(false);
      return;
    }
    if (showKeyboard) {
      setShowKeyboard(false);
      return;
    }
    onShowNotification('Android: Back action executed');
  };

  const handleAndroidHome = () => {
    if (showAndroidRecents) {
      setShowAndroidRecents(false);
    }
    if (runtimeScrollRef.current) {
      runtimeScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    onShowNotification('Android: Returned to Home');
  };

  const handleAndroidRecent = () => {
    setShowAndroidRecents((prev) => !prev);
  };

  // Map to runtime's deviceView
  const runtimeDeviceView: DeviceView =
    platform === 'android' || platform === 'ios'
      ? 'mobile'
      : platform === 'tablet'
      ? 'tablet'
      : 'desktop';

  // Responsive frame dimensions based on platform and orientation
  // Max-width: Desktop = 1200px, Tablet = 768px, Mobile/Android/Apple = 390px. Height = 80vh with object-contain.
  const getDimensions = () => {
    switch (platform) {
      case 'android':
        return isLandscape
          ? { maxWidth: '740px', height: '390px', radius: 'rounded-[32px]' }
          : { maxWidth: '390px', height: '80vh', radius: 'rounded-[38px]' };
      case 'ios':
        return isLandscape
          ? { maxWidth: '780px', height: '390px', radius: 'rounded-[36px]' }
          : { maxWidth: '390px', height: '80vh', radius: 'rounded-[44px]' };
      case 'tablet':
        return isLandscape
          ? { maxWidth: '880px', height: '80vh', radius: 'rounded-[28px]' }
          : { maxWidth: '768px', height: '80vh', radius: 'rounded-[28px]' };
      case 'desktop':
        return { maxWidth: '1200px', height: '80vh', radius: 'rounded-xl' };
      case 'web':
      default:
        return { maxWidth: '1200px', height: '80vh', radius: 'rounded-xl' };
    }
  };

  const dims = getDimensions();

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden relative select-none h-full min-h-0">
      {/* ========================================================================= */}
      {/* COMPACT DEVICE TOOLBAR (Single Slim Row - Sticky & Backdrop Blur)          */}
      {/* ========================================================================= */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-2 sm:px-3 py-1.5 flex items-center justify-between gap-1.5 shrink-0 shadow-2xs overflow-x-auto no-scrollbar">
        {/* Device Switcher: Desktop | Tablet | Android | Apple */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            {/* Desktop / macOS */}
            <button
              id="device-switch-desktop"
              onClick={() => {
                setPlatform('desktop');
                setShowKeyboard(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition shrink-0 ${
                platform === 'desktop' || platform === 'web'
                  ? 'bg-white text-purple-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Desktop (macOS / Windows)"
            >
              <Monitor className="w-3 h-3 text-purple-600" />
              <span>Desktop</span>
            </button>

            {/* Tablet */}
            <button
              id="device-switch-tablet"
              onClick={() => {
                setPlatform('tablet');
                setShowKeyboard(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition shrink-0 ${
                platform === 'tablet'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tablet (iPad / Galaxy Tab)"
            >
              <Tablet className="w-3 h-3 text-indigo-600" />
              <span>Tablet</span>
            </button>

            {/* Android Phone */}
            <button
              id="device-switch-android"
              onClick={() => {
                setPlatform('android');
                setShowKeyboard(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition shrink-0 ${
                platform === 'android'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Android Phone (Pixel / Samsung Galaxy)"
            >
              <Smartphone className="w-3 h-3 text-emerald-600" />
              <span>Android</span>
            </button>

            {/* Apple iPhone / iOS */}
            <button
              id="device-switch-apple"
              onClick={() => {
                setPlatform('ios');
                setShowKeyboard(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition shrink-0 ${
                platform === 'ios'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Apple iPhone (iOS 18)"
            >
              <Apple className="w-3 h-3 text-blue-600" />
              <span>Apple</span>
            </button>
          </div>

          {/* Desktop Sub-mode: Native Window vs Web Browser */}
          {(platform === 'desktop' || platform === 'web') && (
            <div className="hidden sm:flex items-center gap-0.5 bg-purple-50 p-0.5 rounded-md border border-purple-100 text-[10px] font-medium shrink-0">
              <button
                onClick={() => setPlatform('desktop')}
                className={`px-1.5 py-0.5 rounded transition ${
                  platform === 'desktop' ? 'bg-white text-purple-800 font-bold shadow-2xs' : 'text-purple-600 hover:text-purple-800'
                }`}
              >
                Window
              </button>
              <button
                onClick={() => setPlatform('web')}
                className={`px-1.5 py-0.5 rounded transition ${
                  platform === 'web' ? 'bg-white text-purple-800 font-bold shadow-2xs' : 'text-purple-600 hover:text-purple-800'
                }`}
              >
                Web
              </button>
            </div>
          )}
        </div>

        {/* Device Controls: Orientation, Keyboard, Android Nav Mode, Zoom, Reload */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-xs shrink-0">
          {/* Orientation (Only for Mobile and Tablet) */}
          {(platform === 'android' || platform === 'ios' || platform === 'tablet') && (
            <button
              onClick={() => setIsLandscape((prev) => !prev)}
              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition flex items-center gap-1 shrink-0"
              title="Rotate Screen Orientation"
            >
              <RotateCw className="w-3 h-3 text-slate-500" />
              <span className="hidden sm:inline">{isLandscape ? 'Landscape' : 'Portrait'}</span>
            </button>
          )}

          {/* Virtual Keyboard Toggle (for Mobile/Tablet) */}
          {(platform === 'android' || platform === 'ios') && (
            <button
              onClick={() => setShowKeyboard((prev) => !prev)}
              className={`px-2 py-1 rounded-md font-semibold text-[11px] transition flex items-center gap-1 shrink-0 ${
                showKeyboard
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Toggle Virtual Soft Keyboard Simulation"
            >
              <Keyboard className="w-3 h-3" />
              <span className="hidden sm:inline">Keyboard</span>
            </button>
          )}

          {/* Android Navigation Mode Switcher */}
          {platform === 'android' && (
            <button
              onClick={() => setAndroidNavMode((m) => (m === '3-button' ? 'gesture' : '3-button'))}
              className="hidden md:flex items-center gap-1 px-1.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono transition shrink-0"
              title="Switch Android Navigation Style"
            >
              <Sliders className="w-3 h-3 text-slate-500" />
              <span>{androidNavMode === '3-button' ? '3-Button' : 'Gesture'}</span>
            </button>
          )}

          {/* Scale Controller */}
          <div className="hidden lg:flex items-center gap-0.5 bg-slate-100 px-1.5 py-0.5 rounded-md text-[11px] font-mono text-slate-600 shrink-0">
            <button
              onClick={() => setScale((s) => Math.max(0.65, +(s - 0.1).toFixed(2)))}
              className="hover:text-blue-600 p-0.5"
              title="Zoom out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="w-8 text-center">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale((s) => Math.min(1.25, +(s + 0.1).toFixed(2)))}
              className="hover:text-blue-600 p-0.5"
              title="Zoom in"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            {scale !== 1 && (
              <button
                onClick={() => setScale(1)}
                className="text-[10px] text-blue-600 font-semibold ml-0.5 hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          {/* Reload Preview */}
          <button
            onClick={handleRestart}
            disabled={isReloading}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition shrink-0"
            title="Reload Runtime Preview"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PREVIEW CANVAS CONTAINER (Full height flex with overflow-y-auto & gradient) */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full h-full min-h-0 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start sm:justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div
          key={keyCounter}
          style={{
            maxWidth: dims.maxWidth,
            width: '100%',
            height: dims.height,
            maxHeight: dims.height === '80vh' ? '80vh' : dims.height,
            transform: scale !== 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'center center',
            transition: 'max-width 0.2s cubic-bezier(0.4, 0, 0.2, 1), height 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className={`relative flex flex-col shadow-2xl transition-all duration-200 overflow-hidden shrink-0 mx-auto my-auto object-contain ${
            platform === 'android'
              ? 'border-[10px] border-slate-900 bg-slate-950 ring-1 ring-slate-800'
              : platform === 'ios'
              ? 'border-[11px] border-slate-900 bg-black ring-1 ring-slate-800'
              : platform === 'tablet'
              ? 'border-[12px] border-slate-800 bg-slate-900 ring-1 ring-slate-700'
              : 'border border-slate-300 bg-white rounded-xl'
          } ${dims.radius}`}
        >
          {/* =================================================================== */}
          {/* PLATFORM 1: ANDROID FRAME & NATIVE BARS                             */}
          {/* =================================================================== */}
          {platform === 'android' && (
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
              {/* Speaker Slit & Center Camera Punch-Hole */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 pointer-events-none">
                <div className="w-10 h-1 rounded-full bg-slate-800/80" />
              </div>

              {/* Android Status Bar */}
              <div className="h-7 px-4 bg-slate-900 text-white flex items-center justify-between text-[11px] font-sans tracking-tight shrink-0 select-none z-20 relative">
                {/* Left: Time + Notification Icons */}
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{currentTime}</span>
                  <div className="flex items-center gap-1 opacity-80 text-[10px]">
                    <Bell className="w-2.5 h-2.5" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                </div>

                {/* Center: Punch-Hole Front Camera */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1 w-3.5 h-3.5 rounded-full bg-black border border-slate-800 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-950/80 ring-1 ring-slate-700/50" />
                </div>

                {/* Right: VoLTE / 5G, Wi-Fi, Battery Percentage + Meter */}
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="font-mono font-bold text-[9px] px-1 rounded bg-slate-800 text-slate-300">5G</span>
                  <Wifi className="w-3 h-3 text-slate-200" />
                  <span className="font-mono text-[10px] font-semibold text-slate-200">89%</span>
                  <div className="w-4 h-2 rounded-[2px] border border-slate-300 p-[1px] flex items-center">
                    <div className="w-[89%] h-full bg-emerald-400 rounded-[1px]" />
                  </div>
                </div>
              </div>

              {/* Android Runtime Viewport */}
              <div ref={runtimeScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden relative bg-slate-50">
                <DynamicAppRuntime project={project} deviceView="mobile" />

                {/* Android Recents Multitasking Modal Overlay */}
                {showAndroidRecents && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs z-50 p-4 flex flex-col justify-center items-center animate-in fade-in zoom-in-95 duration-200">
                    <div className="text-white text-xs font-semibold mb-3 flex items-center justify-between w-full max-w-xs">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        Recent Applications
                      </span>
                      <button
                        onClick={() => setShowAndroidRecents(false)}
                        className="p-1 rounded-full hover:bg-white/20"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Active App Snapshot Card */}
                    <div className="w-full max-w-xs bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/20 flex flex-col h-72">
                      <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="font-bold truncate">{project.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">ACTIVE</span>
                      </div>
                      <div className="flex-1 p-3 bg-slate-100 flex flex-col items-center justify-center text-center">
                        <Smartphone className="w-8 h-8 text-blue-600 mb-2" />
                        <span className="text-xs font-bold text-slate-800">{project.name}</span>
                        <span className="text-[11px] text-slate-500 mt-0.5">Live Interactive Instance</span>
                        <button
                          onClick={() => setShowAndroidRecents(false)}
                          className="mt-4 px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs"
                        >
                          Switch to App
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Android Soft Keyboard Simulation (Material Gboard) */}
              {showKeyboard && (
                <div className="bg-slate-900 border-t border-slate-800 p-2 text-white shrink-0 z-40 animate-in slide-in-from-bottom-5 duration-200">
                  {/* Suggestion Strip */}
                  <div className="flex items-center justify-between px-2 pb-1.5 border-b border-slate-800/80 text-[10px] text-slate-400 font-medium">
                    <span className="hover:text-white cursor-pointer">submit</span>
                    <span className="text-white font-bold cursor-pointer">confirm</span>
                    <span className="hover:text-white cursor-pointer">search</span>
                    <Search className="w-3 h-3 text-slate-500" />
                  </div>

                  {/* QWERTY Row 1 */}
                  <div className="flex justify-center gap-1 mt-1.5">
                    {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map((k) => (
                      <button
                        key={k}
                        onClick={() => setKeyboardInput((prev) => prev + k)}
                        className="w-7 h-8 rounded-md bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-xs font-semibold flex items-center justify-center shadow-xs"
                      >
                        {k}
                      </button>
                    ))}
                  </div>

                  {/* QWERTY Row 2 */}
                  <div className="flex justify-center gap-1 mt-1">
                    {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map((k) => (
                      <button
                        key={k}
                        onClick={() => setKeyboardInput((prev) => prev + k)}
                        className="w-7 h-8 rounded-md bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-xs font-semibold flex items-center justify-center shadow-xs"
                      >
                        {k}
                      </button>
                    ))}
                  </div>

                  {/* QWERTY Row 3 + Backspace */}
                  <div className="flex justify-center gap-1 mt-1">
                    <button className="px-2 h-8 rounded-md bg-slate-700 text-[10px] font-bold">⇧</button>
                    {['z', 'x', 'c', 'v', 'b', 'n', 'm'].map((k) => (
                      <button
                        key={k}
                        onClick={() => setKeyboardInput((prev) => prev + k)}
                        className="w-7 h-8 rounded-md bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-xs font-semibold flex items-center justify-center shadow-xs"
                      >
                        {k}
                      </button>
                    ))}
                    <button
                      onClick={() => setKeyboardInput((prev) => prev.slice(0, -1))}
                      className="px-2 h-8 rounded-md bg-slate-700 text-xs font-bold hover:bg-rose-900"
                    >
                      ⌫
                    </button>
                  </div>

                  {/* Bottom Row (Space, 123, Enter) */}
                  <div className="flex justify-between items-center gap-1 mt-1 px-1">
                    <button className="px-2.5 h-8 rounded-md bg-slate-800 text-[11px] font-semibold">?123</button>
                    <button className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-xs">😊</button>
                    <button
                      onClick={() => setKeyboardInput((prev) => prev + ' ')}
                      className="flex-1 h-8 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium"
                    >
                      English (US)
                    </button>
                    <button
                      onClick={() => {
                        setShowKeyboard(false);
                        onShowNotification('Keyboard Enter submitted');
                      }}
                      className="px-3 h-8 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                    >
                      ↵
                    </button>
                  </div>
                </div>
              )}

              {/* Android Navigation Bar */}
              {androidNavMode === '3-button' ? (
                <div className="h-10 bg-slate-950 flex items-center justify-around px-8 text-slate-400 shrink-0 z-30 select-none">
                  {/* Back Button (Triangle ◀) */}
                  <button
                    onClick={handleAndroidBack}
                    className="p-2 rounded-full hover:text-white active:scale-90 active:bg-white/10 transition"
                    title="Android Back Button"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  {/* Home Button (Circle ●) */}
                  <button
                    onClick={handleAndroidHome}
                    className="p-2 rounded-full hover:text-white active:scale-90 active:bg-white/10 transition"
                    title="Android Home Button"
                  >
                    <Circle className="w-4 h-4 fill-current" />
                  </button>

                  {/* Recents Button (Square ■) */}
                  <button
                    onClick={handleAndroidRecent}
                    className="p-2 rounded-full hover:text-white active:scale-90 active:bg-white/10 transition"
                    title="Android Recent Apps Task Switcher"
                  >
                    <Square className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              ) : (
                /* Gesture Navigation Bar */
                <div className="h-6 bg-slate-950 flex items-center justify-center shrink-0 z-30 select-none">
                  <div
                    onClick={handleAndroidHome}
                    className="w-32 h-1 bg-slate-400 hover:bg-white rounded-full cursor-pointer transition active:scale-95"
                    title="Swipe to go Home"
                  />
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* PLATFORM 2: iOS FRAME (iPhone 16 Pro Dynamic Island)                 */}
          {/* =================================================================== */}
          {platform === 'ios' && (
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
              {/* iOS Status Bar with Interactive Dynamic Island */}
              <div className="h-9 px-6 bg-black text-white flex items-center justify-between text-[11px] font-sans shrink-0 select-none z-30 relative">
                {/* Left: Time (Bold SF-style) */}
                <div className="w-16 font-semibold tracking-tight">{currentTime}</div>

                {/* Center: Dynamic Island (Pill) */}
                <div
                  onClick={() => setDynamicIslandExpanded((prev) => !prev)}
                  className={`cursor-pointer bg-black ring-1 ring-slate-800 rounded-full transition-all duration-300 flex items-center justify-between px-3 ${
                    dynamicIslandExpanded ? 'w-44 h-7' : 'w-24 h-5'
                  }`}
                  title="Dynamic Island (Click to expand)"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-blue-900" />
                  </div>
                  {dynamicIslandExpanded && (
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400">
                      <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                      <span>{project.name.slice(0, 12)}</span>
                    </div>
                  )}
                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                </div>

                {/* Right: Cellular Signal + Wi-Fi + Battery */}
                <div className="w-16 flex items-center justify-end gap-1.5">
                  <Signal className="w-3 h-3 text-slate-100" />
                  <Wifi className="w-3 h-3 text-slate-100" />
                  <div className="w-5 h-2.5 rounded-[3px] border border-slate-300 p-[1px] flex items-center relative">
                    <div className="w-[85%] h-full bg-white rounded-[1px]" />
                    <div className="w-0.5 h-1 bg-slate-400 absolute -right-1 top-0.5 rounded-r" />
                  </div>
                </div>
              </div>

              {/* iOS Viewport */}
              <div ref={runtimeScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden relative bg-slate-50">
                <DynamicAppRuntime project={project} deviceView="mobile" />
              </div>

              {/* iOS Soft Keyboard Simulation */}
              {showKeyboard && (
                <div className="bg-slate-200/90 backdrop-blur-md border-t border-slate-300 p-2 text-slate-900 shrink-0 z-40 animate-in slide-in-from-bottom-5 duration-200">
                  <div className="flex justify-center gap-1 mt-1">
                    {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((k) => (
                      <button
                        key={k}
                        onClick={() => setKeyboardInput((prev) => prev + k)}
                        className="w-7 h-9 rounded-md bg-white hover:bg-slate-100 active:bg-blue-500 active:text-white text-xs font-medium flex items-center justify-center shadow-xs"
                      >
                        {k}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-center gap-1 mt-1.5">
                    {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((k) => (
                      <button
                        key={k}
                        onClick={() => setKeyboardInput((prev) => prev + k)}
                        className="w-7 h-9 rounded-md bg-white hover:bg-slate-100 active:bg-blue-500 active:text-white text-xs font-medium flex items-center justify-center shadow-xs"
                      >
                        {k}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-center gap-1.5 mt-1.5">
                    <button className="px-2.5 h-9 rounded-md bg-slate-300 text-xs font-bold">⇧</button>
                    {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((k) => (
                      <button
                        key={k}
                        onClick={() => setKeyboardInput((prev) => prev + k)}
                        className="w-7 h-9 rounded-md bg-white hover:bg-slate-100 active:bg-blue-500 active:text-white text-xs font-medium flex items-center justify-center shadow-xs"
                      >
                        {k}
                      </button>
                    ))}
                    <button
                      onClick={() => setKeyboardInput((prev) => prev.slice(0, -1))}
                      className="px-2.5 h-9 rounded-md bg-slate-300 text-xs font-bold"
                    >
                      ⌫
                    </button>
                  </div>

                  <div className="flex justify-between items-center gap-1.5 mt-1.5 px-1">
                    <button className="px-3 h-9 rounded-md bg-slate-300 text-xs font-semibold">123</button>
                    <button className="w-9 h-9 rounded-md bg-slate-300 flex items-center justify-center text-sm">🌐</button>
                    <button
                      onClick={() => setKeyboardInput((prev) => prev + ' ')}
                      className="flex-1 h-9 rounded-md bg-white hover:bg-slate-100 text-xs font-medium shadow-xs"
                    >
                      space
                    </button>
                    <button
                      onClick={() => {
                        setShowKeyboard(false);
                        onShowNotification('iOS Return key pressed');
                      }}
                      className="px-3.5 h-9 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                    >
                      return
                    </button>
                  </div>
                </div>
              )}

              {/* iOS Home Indicator Bar */}
              <div className="h-5 bg-white flex items-center justify-center shrink-0 z-30 select-none">
                <div
                  onClick={() => {
                    if (runtimeScrollRef.current) {
                      runtimeScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="w-36 h-1 bg-slate-900 rounded-full cursor-pointer hover:bg-slate-600 transition"
                  title="iOS Home Swipe Bar"
                />
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* PLATFORM 3: TABLET FRAME (iPad / Galaxy Tab)                        */}
          {/* =================================================================== */}
          {platform === 'tablet' && (
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
              {/* Tablet Status Bar */}
              <div className="h-7 px-5 bg-slate-900 text-white flex items-center justify-between text-xs shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{currentTime}</span>
                  <span className="text-[10px] text-slate-400">Tue Sep 13</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-black border border-slate-700" />
                <div className="flex items-center gap-2 text-xs">
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="font-mono text-[11px]">94%</span>
                  <Battery className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              {/* Tablet Viewport */}
              <div ref={runtimeScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50">
                <DynamicAppRuntime project={project} deviceView="tablet" />
              </div>

              {/* Tablet Bottom Swipe Bar */}
              <div className="h-4 bg-slate-900 flex items-center justify-center shrink-0">
                <div className="w-44 h-1 bg-slate-400 rounded-full" />
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* PLATFORM 4: DESKTOP APPLICATION WINDOW (macOS Native Style)         */}
          {/* =================================================================== */}
          {platform === 'desktop' && (
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              {/* macOS Window Titlebar */}
              <div className="h-9 bg-slate-100 border-b border-slate-200 px-3 flex items-center justify-between shrink-0 select-none">
                {/* Traffic Lights */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 hover:opacity-80 transition cursor-pointer" title="Close" />
                  <div className="w-3 h-3 rounded-full bg-amber-500 hover:opacity-80 transition cursor-pointer" title="Minimize" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 hover:opacity-80 transition cursor-pointer" title="Zoom / Maximize" />
                </div>

                {/* Window Title */}
                <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                  <Monitor className="w-3.5 h-3.5 text-purple-600" />
                  <span>{project.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">v{project.version || '1.0.0'} (Desktop Electron)</span>
                </div>

                {/* Window Actions */}
                <div className="flex items-center gap-1 text-slate-500">
                  <button onClick={handleRestart} className="p-1 hover:text-slate-800 rounded">
                    <RotateCw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Desktop Runtime Viewport */}
              <div className="flex-1 overflow-y-auto bg-slate-50">
                <DynamicAppRuntime project={project} deviceView="desktop" />
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* PLATFORM 5: WEB BROWSER CHROME (Omnibox, Tabs, HTTPS)               */}
          {/* =================================================================== */}
          {platform === 'web' && (
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              {/* Browser Tab Bar */}
              <div className="bg-slate-200 px-3 pt-2 flex items-center gap-1 text-xs shrink-0 select-none">
                <div className="bg-white px-3 py-1.5 rounded-t-lg font-medium text-slate-800 flex items-center gap-2 shadow-xs border-t border-x border-slate-200 max-w-xs truncate">
                  <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{project.name}</span>
                  <button className="hover:bg-slate-100 rounded p-0.5 ml-1">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
                <button className="p-1 hover:bg-slate-300 rounded text-slate-600 ml-1">
                  +
                </button>
              </div>

              {/* Browser Navigation Toolbar */}
              <div className="bg-white border-b border-slate-200 px-3 py-1.5 flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 text-slate-500">
                  <button className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Back">
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Forward">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={handleRestart} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Refresh">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Omnibox URL Address Bar */}
                <div className="flex-1 flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 font-mono transition">
                  <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="text-emerald-700 font-medium">https://</span>
                  <span className="font-semibold text-slate-800 truncate">{project.slug}.floxdon.app</span>
                  <span className="text-slate-400 ml-auto hidden sm:inline">PWA Ready</span>
                  <Bookmark className="w-3 h-3 text-slate-400 hover:text-amber-500 cursor-pointer" />
                </div>
              </div>

              {/* Web Runtime Viewport */}
              <div className="flex-1 overflow-y-auto bg-slate-50">
                <DynamicAppRuntime project={project} deviceView="desktop" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
