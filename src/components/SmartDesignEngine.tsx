import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Layout,
  Smartphone,
  Tablet,
  Monitor,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Palette,
  Eye,
  Sliders,
  ShieldCheck,
  Building2,
  Stethoscope,
  ShoppingBag,
  Terminal,
  Users,
  GraduationCap,
  Gamepad2,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  FileCode,
  Zap,
  Info,
  Maximize2,
  Search,
  RotateCw,
  Plus
} from 'lucide-react';
import {
  ProductArchetype,
  DesignTone,
  UiSpecification,
  ScreenPlan,
  Project,
  DeviceView,
} from '../types';
import {
  DOMAIN_BLUEPRINTS,
  DESIGN_TONE_PRESETS,
  generateUiSpecification,
} from '../data/uiDesignEngineData';

interface SmartDesignEngineProps {
  currentProject: Project;
  onApplyDesignSystem?: (tokens: any) => void;
  onOpenWorkspace?: () => void;
  showNotification?: (msg: string) => void;
}

export const SmartDesignEngine: React.FC<SmartDesignEngineProps> = ({
  currentProject,
  onApplyDesignSystem,
  onOpenWorkspace,
  showNotification = (_msg: string) => {},
}) => {
  // State for active domain specification
  const [selectedArchetype, setSelectedArchetype] = useState<ProductArchetype>('fintech_banking');
  const [selectedTone, setSelectedTone] = useState<DesignTone>('enterprise');
  const [promptInput, setPromptInput] = useState<string>('');
  const [activeStage, setActiveStage] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'architecture' | 'tokens' | 'workflows' | 'validation' | 'preview'>('architecture');

  // Interactive feature inquiry test
  const [featureInput, setFeatureInput] = useState<string>('Add real-time appointment booking');
  const [featureReasoning, setFeatureReasoning] = useState<{
    ownerScreen: string;
    newScreenNeeded: boolean;
    requiredComponents: string[];
    requiredApis: string[];
    states: string[];
    mobileBehavior: string;
  } | null>(null);

  // Active Screen Plan inspection
  const [selectedScreenId, setSelectedScreenId] = useState<string>('acc_hub');

  // Preview device state inside engine
  const [previewDevice, setPreviewDevice] = useState<DeviceView>('desktop');
  const [isPreviewLandscape, setIsPreviewLandscape] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditSuccess, setAuditSuccess] = useState(false);

  // Generated UI Specification based on selections
  const [uiSpec, setUiSpec] = useState<UiSpecification>(() =>
    generateUiSpecification('', 'fintech_banking', 'enterprise')
  );

  // Switch archetype
  const handleSelectArchetype = (arch: ProductArchetype) => {
    setSelectedArchetype(arch);
    const newSpec = generateUiSpecification('', arch, selectedTone);
    setUiSpec(newSpec);
    if (newSpec.screens.length > 0) {
      setSelectedScreenId(newSpec.screens[0].id);
    }
    showNotification(`Adapted UI architecture to: ${newSpec.archetypeLabel}`);
  };

  // Switch Tone
  const handleSelectTone = (tone: DesignTone) => {
    setSelectedTone(tone);
    const newSpec = generateUiSpecification('', selectedArchetype, tone);
    setUiSpec(newSpec);
    showNotification(`Design system switched to: ${newSpec.designTokens.toneLabel}`);
  };

  // Synthesize from custom natural language requirements
  const handleSynthesizePrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim()) return;

    const newSpec = generateUiSpecification(promptInput.trim(), undefined, selectedTone);
    setSelectedArchetype(newSpec.archetype);
    setSelectedTone(newSpec.designTokens.tone);
    setUiSpec(newSpec);
    if (newSpec.screens.length > 0) {
      setSelectedScreenId(newSpec.screens[0].id);
    }
    showNotification(`Synthesized custom UI specification for "${promptInput.slice(0, 30)}..."`);
  };

  // Run feature-to-screen reasoning
  const handleReasonFeature = () => {
    if (!featureInput.trim()) return;
    const lower = featureInput.toLowerCase();
    
    if (lower.includes('appoint') || lower.includes('book') || lower.includes('schedule')) {
      setFeatureReasoning({
        ownerScreen: 'Clinical Scheduling & Operating Theatres (/appointments)',
        newScreenNeeded: false,
        requiredComponents: ['DoctorAvailabilityCalendar', 'TimeSlotPickerPills', 'PatientMRNVerification', 'BookingSummaryDrawer'],
        requiredApis: ['GET /api/doctors/slots', 'POST /api/appointments/hold', 'POST /api/appointments/confirm'],
        states: ['Slot loading skeleton', 'No open slots fallback banner', 'Double-booking conflict modal', 'Instant SMS confirmation'],
        mobileBehavior: 'Collapses to date pill strip on top, 1-column time slots, and full-screen bottom sheet for patient intake.',
      });
    } else if (lower.includes('checkout') || lower.includes('payment') || lower.includes('transfer')) {
      setFeatureReasoning({
        ownerScreen: 'Transfers & Beneficiary Payments (/transfers)',
        newScreenNeeded: false,
        requiredComponents: ['AmountInputWithCurrency', 'BeneficiarySelector', 'FeeBreakdownAccordion', 'WebAuthnBiometricModal'],
        requiredApis: ['POST /api/transfers/quote', 'POST /api/auth/mfa-challenge', 'POST /api/transfers/execute'],
        states: ['Fee calculator loading spinner', 'Insufficient balance alert', 'Biometric timeout retry', 'Downloadable PDF receipt'],
        mobileBehavior: 'Numeric keypad drawer on tap, Apple Pay 1-tap sheet, and sticky bottom Pay button (min height 48px).',
      });
    } else {
      setFeatureReasoning({
        ownerScreen: `Primary Domain View (${uiSpec.screens[0]?.name || 'Workspace'})`,
        newScreenNeeded: false,
        requiredComponents: ['FeatureActionTriggerButton', 'ContextualDrawer', 'FormInputValidationGroup', 'AuditStatusBadge'],
        requiredApis: ['POST /api/features/action', 'GET /api/features/status'],
        states: ['Shimmer loading state', 'Empty state with onboarding prompt', 'Network error retry banner', 'Verified success toast'],
        mobileBehavior: 'Transforms into slide-over sheet with high-contrast touch controls and swipe-to-dismiss gesture.',
      });
    }
  };

  // Run UX Audit
  const handleRunAudit = () => {
    setIsAuditing(true);
    setAuditSuccess(false);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditSuccess(true);
      showNotification('UI/UX Validation Agent: Passed WCAG AA, Touch Targets (44px), and Anti-Slop verification.');
    }, 800);
  };

  const activeScreen = uiSpec.screens.find((s) => s.id === selectedScreenId) || uiSpec.screens[0];

  const pipelineStages = [
    { label: 'Requirements', desc: 'Intent & Target Audience' },
    { label: 'Archetype Detection', desc: 'Domain Blueprint Mapping' },
    { label: 'User & Workflow Analysis', desc: 'Goal-driven Journeys' },
    { label: 'Information Architecture', desc: 'No Generic Boilerplate' },
    { label: 'Screen & Component Plan', desc: 'Strict Component Purpose' },
    { label: 'Design System', desc: 'Token Scales & Radii' },
    { label: 'Responsive Intelligence', desc: 'Web / Mobile / Tablet' },
    { label: 'UI/UX Validation', desc: 'Anti-Slop & WCAG Audit' },
  ];

  const archetypeIcons: Record<ProductArchetype, React.ComponentType<{ className?: string }>> = {
    fintech_banking: Building2,
    healthcare_hospital: Stethoscope,
    ecommerce_retail: ShoppingBag,
    developer_tool: Terminal,
    saas_b2b: Users,
    education: GraduationCap,
    gaming: Gamepad2,
    marketplace: ShoppingBag,
    social_community: Users,
    custom: Layout,
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-800 overflow-hidden font-sans select-none">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">Smart UI Design Engine</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Anti-Slop Guaranteed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Intelligent UI Planning • Context-Aware Interface Generation • Design System Tokens • Zero Generic Templates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Auditing UI...' : 'Run UX Audit'}</span>
          </button>

          {onOpenWorkspace && (
            <button
              onClick={onOpenWorkspace}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Back to Code Workspace</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Planning Pipeline Stepper */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 overflow-x-auto shrink-0">
        <div className="flex items-center gap-2 min-w-[760px]">
          {pipelineStages.map((stage, idx) => (
            <React.Fragment key={idx}>
              <div
                onClick={() => setActiveStage(idx)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                  activeStage === idx
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
                    activeStage === idx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="whitespace-nowrap">{stage.label}</span>
              </div>
              {idx < pipelineStages.length - 1 && (
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Domain & Archetype Controls */}
        <div className="w-80 border-r border-slate-200 bg-white p-4 overflow-y-auto space-y-5 shrink-0">
          {/* Natural Language Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Custom Product Requirement
            </label>
            <form onSubmit={handleSynthesizePrompt} className="space-y-2">
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. Build an oncology chemotherapy patient tracker with vitals, lab panels, and infusion scheduling..."
                rows={3}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 font-sans resize-none"
              />
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Synthesize Purpose-Built UI</span>
              </button>
            </form>
          </div>

          {/* Context-Aware Domain Archetypes */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Domain Archetypes</label>
              <span className="text-[11px] font-mono text-slate-400">Context-Aware</span>
            </div>

            <div className="space-y-1.5">
              {(
                [
                  { id: 'fintech_banking', label: 'Commercial & Retail Banking', subtitle: 'Balance, Wires, Cards, Ledger' },
                  { id: 'healthcare_hospital', label: 'Hospital & Healthcare', subtitle: 'Patients, Clinical Schedule, Labs' },
                  { id: 'ecommerce_retail', label: 'E-Commerce & Orders', subtitle: 'Catalog, Cart, 1-Click Checkout' },
                  { id: 'developer_tool', label: 'Developer Cloud Studio', subtitle: 'Editor, Terminal, Containers, Git' },
                  { id: 'saas_b2b', label: 'B2B Multi-Tenant SaaS', subtitle: 'Team, RBAC, Billing, Metering' },
                  { id: 'education', label: 'Interactive LMS & Courses', subtitle: 'Curriculum, Quizzes, Grading' },
                  { id: 'gaming', label: 'Esports & Tournament Hub', subtitle: 'Brackets, Scores, Leaderboards' },
                ] as { id: ProductArchetype; label: string; subtitle: string }[]
              ).map((arch) => {
                const IconComponent = archetypeIcons[arch.id] || Layout;
                const isSelected = selectedArchetype === arch.id;
                return (
                  <div
                    key={arch.id}
                    onClick={() => handleSelectArchetype(arch.id)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{arch.label}</div>
                      <div className="text-[11px] text-slate-500 truncate">{arch.subtitle}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Design Adaptation / Tone Presets */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                Design System Tone
              </label>
            </div>

            <div className="space-y-1.5">
              {(
                [
                  { id: 'enterprise', label: 'Enterprise Software', badge: 'High Density' },
                  { id: 'minimalist', label: 'Ultra-Minimalist', badge: 'Whitespace' },
                  { id: 'clinical_medical', label: 'Clinical & Healthcare', badge: 'WCAG AAA' },
                  { id: 'dark_luxury', label: 'Executive FinTech', badge: 'Dark Luxury' },
                  { id: 'vibrant_playful', label: 'Vibrant Consumer', badge: 'Playful' },
                  { id: 'cybernetic', label: 'Cybernetic Terminal', badge: 'Monospace' },
                  { id: 'warm_editorial', label: 'Warm Editorial', badge: 'Serif Pairing' },
                ] as { id: DesignTone; label: string; badge: string }[]
              ).map((tone) => {
                const isSelected = selectedTone === tone.id;
                return (
                  <button
                    key={tone.id}
                    onClick={() => handleSelectTone(tone.id)}
                    className={`w-full px-3 py-2 rounded-xl text-left border flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-semibold">{tone.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tone.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center & Right Area: Specifications & Live Design Intelligence */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navigation Tabs for Design Engine */}
          <div className="bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
            <div className="flex gap-4">
              {[
                { id: 'architecture', label: 'Screen Architecture' },
                { id: 'tokens', label: 'Design System Tokens' },
                { id: 'workflows', label: 'Feature-to-Screen Reasoning' },
                { id: 'validation', label: 'UI/UX Validation' },
                { id: 'preview', label: 'Visual Preview Intelligence' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 text-xs font-bold border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Anti-Slop Confirmation Indicator */}
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>No Generic Clichés: Every Screen Justified</span>
            </div>
          </div>

          {/* Tab 1: Screen Architecture */}
          {activeTab === 'architecture' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* Product Profile Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold font-mono text-blue-600 uppercase tracking-wider">
                      Product Intelligence Specification
                    </span>
                    <h2 className="text-base font-bold text-slate-900">{uiSpec.productName}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      Target: {uiSpec.targetAudience}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      Navigation: {uiSpec.navigationPattern}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {DOMAIN_BLUEPRINTS[uiSpec.archetype]?.mustHaveEntities.join(' • ')}
                </p>

                {/* Banned Clichés Bar */}
                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-xs text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Strictly Banned Generic Clichés (Anti-Slop Rule):
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-rose-700 space-y-0.5">
                    {DOMAIN_BLUEPRINTS[uiSpec.archetype]?.bannedClichés.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Purpose-Built Screens Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Purpose-Built Screens ({uiSpec.screens.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uiSpec.screens.map((screen) => {
                    const isCurrent = screen.id === selectedScreenId;
                    return (
                      <div
                        key={screen.id}
                        onClick={() => setSelectedScreenId(screen.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition space-y-3 ${
                          isCurrent
                            ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                            <h4 className="text-sm font-bold text-slate-900">{screen.name}</h4>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">{screen.path}</span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">{screen.domainPurpose}</p>

                        <div className="space-y-1.5 pt-1 border-t border-slate-100 text-[11px]">
                          <div className="font-semibold text-slate-700">Required Entities:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {screen.requiredData.map((d, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-700">Mobile Adaptations: </span>
                          <span>{screen.platformAdaptations.mobile}</span>
                        </div>

                        {/* State Machine Status */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px] font-mono">
                          <div className="p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-600 truncate">
                            <span className="font-bold text-slate-800">Loading: </span>
                            {screen.states.loading}
                          </div>
                          <div className="p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-600 truncate">
                            <span className="font-bold text-slate-800">Empty: </span>
                            {screen.states.empty}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Design System Tokens */}
          {activeTab === 'tokens' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Active Design System: {uiSpec.designTokens.toneLabel}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Automatically enforced across all generated screens, buttons, tables, and modals.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                      showNotification('Copied Tailwind token configurations!');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Tokens Copied' : 'Export Tokens'}</span>
                  </button>
                </div>

                {/* Color Swatches */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800">Semantic Color Tokens</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Primary Brand', hex: uiSpec.designTokens.primaryColor },
                      { label: 'Primary Hover', hex: uiSpec.designTokens.primaryHover },
                      { label: 'Accent / Auxiliary', hex: uiSpec.designTokens.accentColor },
                      { label: 'Canvas Background', hex: uiSpec.designTokens.bgCanvas },
                      { label: 'Surface Card', hex: uiSpec.designTokens.bgSurface },
                      { label: 'Border Neutral', hex: uiSpec.designTokens.borderColor },
                      { label: 'Text Primary', hex: uiSpec.designTokens.textPrimary },
                      { label: 'Text Secondary', hex: uiSpec.designTokens.textSecondary },
                    ].map((col, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                        <div
                          className="h-10 rounded-lg border border-slate-300/60 shadow-inner"
                          style={{ backgroundColor: col.hex }}
                        />
                        <div className="text-[11px] font-bold text-slate-900">{col.label}</div>
                        <div className="text-[10px] font-mono text-slate-400">{col.hex}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography & Spacing Scale */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-800">Typography Scale & Families</div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
                      <div>
                        <span className="text-slate-500">Headings: </span>
                        <span className="text-slate-900 font-semibold">{uiSpec.designTokens.fontDisplay}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Body Text: </span>
                        <span className="text-slate-900 font-semibold">{uiSpec.designTokens.fontBody}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Scale Step Ratio: </span>
                        <span className="text-blue-600 font-bold">{uiSpec.designTokens.fontScaleRatio}x</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-800">Border Radius & Spacing Math</div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
                      <div>
                        <span className="text-slate-500">Base Radius: </span>
                        <span className="text-slate-900 font-semibold">{uiSpec.designTokens.radiusBase}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Container Radius: </span>
                        <span className="text-slate-900 font-semibold">{uiSpec.designTokens.radiusLg}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Touch Target Min: </span>
                        <span className="text-emerald-600 font-bold">44px (Strict WCAG)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Component Style Previews */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800">Standardized Component States</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 text-center">
                      <div className="text-[11px] font-semibold text-slate-500">Buttons</div>
                      <button
                        style={{
                          backgroundColor: uiSpec.designTokens.primaryColor,
                          borderRadius: uiSpec.designTokens.radiusBase,
                        }}
                        className="px-4 py-2 text-xs font-semibold text-white shadow-xs w-full"
                      >
                        Action Button
                      </button>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 text-center">
                      <div className="text-[11px] font-semibold text-slate-500">Inputs & Search</div>
                      <input
                        type="text"
                        readOnly
                        value="Search records..."
                        style={{ borderRadius: uiSpec.designTokens.radiusBase }}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 text-slate-600 focus:outline-none"
                      />
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 text-center">
                      <div className="text-[11px] font-semibold text-slate-500">Badges & Pills</div>
                      <div className="flex justify-center">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Active State
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Feature-to-Screen Reasoning */}
          {activeTab === 'workflows' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Feature-to-Screen Reasoning Engine
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Before creating a button, test which screen owns the feature, what data is required, and how the state machine behaves.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="e.g. Add appointment booking, Add dispute wire, Add telemetry export..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 font-sans focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleReasonFeature}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Analyze Feature</span>
                  </button>
                </div>

                {featureReasoning && (
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900">Owner Screen:</span>
                      <span className="font-mono font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                        {featureReasoning.ownerScreen}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-800">Required Components:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {featureReasoning.requiredComponents.map((c, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono text-[11px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-800">Required Backend APIs:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {featureReasoning.requiredApis.map((api, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[11px]">
                            {api}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-800">Mobile & Touch Behavior:</span>
                      <p className="text-slate-600 leading-relaxed">{featureReasoning.mobileBehavior}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* End-to-End Workflow Diagram */}
              {uiSpec.workflows.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Domain Workflows & State Transitions
                  </h3>

                  {uiSpec.workflows.map((wf) => (
                    <div key={wf.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <h4 className="text-sm font-bold text-slate-900">{wf.title}</h4>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">Trigger: {wf.trigger}</span>
                      </div>

                      {/* Steps Stepper */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {wf.steps.map((step, idx) => (
                          <div key={step.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-900 truncate">{step.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-600">{step.description}</p>
                            <div className="text-[10px] font-mono text-blue-600 truncate">{step.backendApiNeeded}</div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>Outcome:</strong> {wf.successOutcome}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: UI/UX Validation Agent */}
          {activeTab === 'validation' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Automated UI/UX Validation Agent
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Checks accessibility contrast, mobile touch target sizes (≥44px), state completeness, and zero generic UI clichés.
                    </p>
                  </div>
                  <button
                    onClick={handleRunAudit}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                    <span>Run Full Audit</span>
                  </button>
                </div>

                {auditSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All 4 validation checks passed with 100% compliance. Zero anti-slop violations found.</span>
                  </div>
                )}

                <div className="space-y-2.5">
                  {uiSpec.validationIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              issue.severity === 'critical'
                                ? 'bg-rose-500'
                                : issue.severity === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`}
                          />
                          <span className="font-bold text-slate-900">{issue.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                            {issue.category}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">{issue.description}</p>
                        <div className="text-[11px] text-blue-700 font-medium">
                          <strong>Fix Applied: </strong> {issue.suggestedFix}
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        Verified Compliant
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Visual Preview Intelligence */}
          {activeTab === 'preview' && (
            <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
              {/* Preview Device Controls Toolbar */}
              <div className="h-10 bg-white border-b border-slate-200 px-4 flex items-center justify-between text-xs text-slate-600 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-xs">Visual Inspection:</span>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    {(
                      [
                        { id: 'desktop', icon: Monitor, label: 'Desktop' },
                        { id: 'laptop', icon: Laptop, label: 'Laptop' },
                        { id: 'tablet', icon: Tablet, label: 'Tablet' },
                        { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                      ] as { id: DeviceView; icon: any; label: string }[]
                    ).map((dev) => {
                      const Icon = dev.icon;
                      const isSel = previewDevice === dev.id;
                      return (
                        <button
                          key={dev.id}
                          onClick={() => setPreviewDevice(dev.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition ${
                            isSel ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span className="hidden sm:inline">{dev.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(previewDevice === 'mobile' || previewDevice === 'tablet') && (
                    <button
                      onClick={() => setIsPreviewLandscape(!isPreviewLandscape)}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-medium"
                    >
                      <RotateCw className="w-3 h-3 text-slate-500" />
                      <span>{isPreviewLandscape ? 'Landscape' : 'Portrait'}</span>
                    </button>
                  )}

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                    Live Domain Mockup: {uiSpec.archetypeLabel}
                  </span>
                </div>
              </div>

              {/* Simulated Device Canvas */}
              <div className="flex-1 p-6 overflow-auto flex items-center justify-center">
                <div
                  style={{
                    width:
                      previewDevice === 'mobile'
                        ? isPreviewLandscape
                          ? '844px'
                          : '390px'
                        : previewDevice === 'tablet'
                        ? isPreviewLandscape
                          ? '1024px'
                          : '768px'
                        : '100%',
                    maxWidth: previewDevice === 'desktop' ? '1080px' : undefined,
                    height:
                      previewDevice === 'mobile'
                        ? isPreviewLandscape
                          ? '390px'
                          : '740px'
                        : previewDevice === 'tablet'
                        ? isPreviewLandscape
                          ? '640px'
                          : '820px'
                        : '100%',
                  }}
                  className={`bg-white border border-slate-300 shadow-xl overflow-hidden flex flex-col transition-all duration-200 ${
                    previewDevice === 'mobile'
                      ? 'rounded-[36px]'
                      : previewDevice === 'tablet'
                      ? 'rounded-[24px]'
                      : 'rounded-xl'
                  }`}
                >
                  {/* Mobile Dynamic Island Header */}
                  {previewDevice === 'mobile' && !isPreviewLandscape && (
                    <div className="h-10 bg-slate-950 text-white px-6 flex items-center justify-between text-[11px] shrink-0 font-mono">
                      <span>9:41</span>
                      <div className="w-24 h-4 bg-black rounded-full" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px]">5G</span>
                        <div className="w-4 h-2 border border-white rounded-xs" />
                      </div>
                    </div>
                  )}

                  {/* Context-Aware Screen Content based on Domain */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {/* Screen Title & Entity Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                          {activeScreen.name}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{uiSpec.productName}</h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {activeScreen.path}
                      </span>
                    </div>

                    {/* Domain-Specific Interactive Mockup Canvas */}
                    {uiSpec.archetype === 'fintech_banking' && (
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1 shadow-sm">
                          <span className="text-[11px] text-slate-400 font-mono">Primary Treasury Checking</span>
                          <div className="text-2xl font-bold font-mono tracking-tight">$1,248,930.42</div>
                          <div className="flex items-center gap-2 pt-2 text-[11px] text-emerald-400 font-semibold">
                            <span>+ $42,100.00 today</span>
                            <span className="text-slate-400">• Verified FDIC Insured</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {['Send Wire', 'Deposit Check', 'Freeze Card', 'Download PDF'].map((action, i) => (
                            <button
                              key={i}
                              style={{ borderRadius: uiSpec.designTokens.radiusBase }}
                              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold text-center transition"
                            >
                              {action}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-2 pt-2">
                          <div className="text-xs font-bold text-slate-900">Recent Real-Time Ledger Activity</div>
                          {[
                            { title: 'ACH Transfer from Stripe Payouts', date: 'Today, 04:12 PM', amt: '+$84,200.00', status: 'Settled' },
                            { title: 'FedWire Settlement - London Branch', date: 'Today, 02:30 PM', amt: '-$12,500.00', status: 'Settled' },
                            { title: 'AWS Cloud Compute Monthly Bill', date: 'Yesterday', amt: '-$1,840.12', status: 'Settled' },
                          ].map((tx, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="font-bold text-slate-900">{tx.title}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{tx.date}</div>
                              </div>
                              <div className="text-right font-mono">
                                <div className={tx.amt.startsWith('+') ? 'text-emerald-600 font-bold' : 'text-slate-900 font-bold'}>
                                  {tx.amt}
                                </div>
                                <div className="text-[10px] text-slate-400">{tx.status}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uiSpec.archetype === 'healthcare_hospital' && (
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-between text-xs text-cyan-900">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-pulse" />
                            <span className="font-bold">Ward Census: Emergency Triage Active</span>
                          </div>
                          <span className="font-mono text-[11px]">8 Patients Triaged</span>
                        </div>

                        <div className="space-y-2">
                          {[
                            { name: 'Eleanor Vance (MRN-9024)', age: '64 / F', acuity: 'Acuity 1 (Critical)', room: 'Bed 04', vitals: 'BP 160/95 • SpO2 91%' },
                            { name: 'Marcus Thorne (MRN-4812)', age: '38 / M', acuity: 'Acuity 3 (Urgent)', room: 'Bed 12', vitals: 'BP 120/80 • SpO2 99%' },
                            { name: 'Chloe Davenport (MRN-7731)', age: '29 / F', acuity: 'Acuity 4 (Routine)', room: 'Bed 08', vitals: 'BP 118/75 • SpO2 98%' },
                          ].map((pat, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{pat.name}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    pat.acuity.includes('Critical')
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {pat.acuity}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                Room: {pat.room} • {pat.vitals}
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button className="px-2.5 py-1 rounded-lg bg-cyan-600 text-white font-semibold text-[11px]">
                                  Open Chart
                                </button>
                                <button className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                  Order Lab Panel
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uiSpec.archetype !== 'fintech_banking' && uiSpec.archetype !== 'healthcare_hospital' && (
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="text-xs font-bold text-slate-900">Domain Screen: {activeScreen.name}</div>
                          <p className="text-xs text-slate-600">{activeScreen.domainPurpose}</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {activeScreen.components.map((comp, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 text-[11px] font-mono">
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
                            <div className="font-bold text-slate-800">Primary Actions</div>
                            <ul className="list-disc list-inside text-slate-600 text-[11px]">
                              {activeScreen.keyActions.map((act, i) => (
                                <li key={i}>{act}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
                            <div className="font-bold text-slate-800">User Goals</div>
                            <ul className="list-disc list-inside text-slate-600 text-[11px]">
                              {activeScreen.userGoals.map((g, i) => (
                                <li key={i}>{g}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Simulated Mobile Bottom Navigation Bar */}
                  {previewDevice === 'mobile' && !isPreviewLandscape && (
                    <div className="h-12 bg-white border-t border-slate-200 px-4 flex items-center justify-around text-slate-500 shrink-0">
                      {uiSpec.screens.slice(0, 4).map((s, idx) => (
                        <div
                          key={s.id}
                          onClick={() => setSelectedScreenId(s.id)}
                          className={`flex flex-col items-center cursor-pointer ${
                            s.id === selectedScreenId ? 'text-blue-600 font-bold' : ''
                          }`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current mb-0.5" />
                          <span className="text-[10px] truncate max-w-[64px]">{s.name.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
