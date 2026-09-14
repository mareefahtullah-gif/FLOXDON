import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  Smartphone,
  Mail,
  Lock,
  UserPlus,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Code2,
  Sliders,
  LogOut,
  PhoneCall,
  ArrowRight,
  Search,
  Fingerprint,
  Check,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Laptop,
  Globe,
  Trash2,
  Plus,
  Radio,
  Github,
  Gitlab,
  Share2,
  Terminal,
  Save,
  KeyRound,
  QrCode,
  Download,
  Shield
} from 'lucide-react';
import { 
  ForgeAuthUser, 
  ForgeAuthSecuritySettings, 
  SocialAuthProviderConfig,
  AuthSession,
  AuthPasskey
} from '../types';
import { OAuthAppsManager } from './OAuthAppsManager';

interface ForgeAuthViewProps {
  showNotification: (msg: string) => void;
}

export const ForgeAuthView: React.FC<ForgeAuthViewProps> = ({ showNotification }) => {
  // Main Sub-Tab: 'account' | 'oauth_apps' | 'social_logins' | 'users_directory' | 'security_policies'
  const [activeSubTab, setActiveSubTab] = useState<'account' | 'oauth_apps' | 'social_logins' | 'users_directory' | 'security_policies'>('account');

  // Interactive Account State
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [emailMode, setEmailMode] = useState<'signin' | 'signup' | 'forgot_password' | 'reset_password'>('signin');
  const [email, setEmail] = useState('admin@forgestudio.local');
  const [password, setPassword] = useState('ForgeMaster2026!');
  const [displayName, setDisplayName] = useState('Lead Architect');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState<ForgeAuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // TOTP 2FA Interactive Registration State
  const [showTotpModal, setShowTotpModal] = useState(false);
  const [totpStep, setTotpStep] = useState<'qr' | 'success'>('qr');
  const [totpSecret, setTotpSecret] = useState('');
  const [totpFormattedSecret, setTotpFormattedSecret] = useState('');
  const [totpUri, setTotpUri] = useState('');
  const [totpInputCode, setTotpInputCode] = useState('');
  const [isSettingUpTotp, setIsSettingUpTotp] = useState(false);
  const [isVerifyingTotp, setIsVerifyingTotp] = useState(false);
  const [totpErrorMessage, setTotpErrorMessage] = useState<string | null>(null);

  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('+14155550199');
  const [otpStep, setOtpStep] = useState<'input_phone' | 'enter_otp'>('input_phone');
  const [otpCode, setOtpCode] = useState('');
  const [debugOtpCode, setDebugOtpCode] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Passkeys State
  const [passkeys, setPasskeys] = useState<AuthPasskey[]>([]);
  const [newPasskeyName, setNewPasskeyName] = useState('TouchID / MacBook Secure Enclave');
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Recovery Codes State
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [isGeneratingRecoveryCodes, setIsGeneratingRecoveryCodes] = useState(false);

  // Social Logins Configuration State
  const [socialProviders, setSocialProviders] = useState<SocialAuthProviderConfig[]>([]);
  const [selectedSocialId, setSelectedSocialId] = useState<string>('github');
  const [socialClientId, setSocialClientId] = useState('');
  const [socialClientSecret, setSocialClientSecret] = useState('');
  const [socialRedirectUri, setSocialRedirectUri] = useState('');
  const [socialInstanceUrl, setSocialInstanceUrl] = useState('');
  const [socialScopes, setSocialScopes] = useState('');
  const [isTestingSocial, setIsTestingSocial] = useState(false);
  const [socialTestResult, setSocialTestResult] = useState<any>(null);

  // Users Directory State
  const [users, setUsers] = useState<ForgeAuthUser[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchUser, setSearchUser] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'developer' | 'user'>('developer');

  // Copied feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Load Initial Data
  const fetchAllAuthData = async () => {
    try {
      const [uRes, sRes, socRes, sessRes, pkRes, recRes] = await Promise.all([
        fetch('/api/forge-auth/users'),
        fetch('/api/forge-auth/stats'),
        fetch('/api/forge-auth/social-providers'),
        fetch('/api/forge-auth/sessions'),
        fetch('/api/forge-auth/passkeys'),
        fetch('/api/forge-auth/recovery-codes'),
      ]);

      const uData = await uRes.json();
      const sData = await sRes.json();
      const socData = await socRes.json();
      const sessData = await sessRes.json();
      const pkData = await pkRes.json();
      const recData = await recRes.json();

      if (uData.success) {
        setUsers(uData.users);
        if (!authenticatedUser && uData.users.length > 0) {
          setAuthenticatedUser(uData.users[0]);
        }
      }
      if (sData.success) setStats(sData);
      if (socData.success) {
        setSocialProviders(socData.providers);
        const gh = socData.providers.find((p: any) => p.id === 'github') || socData.providers[0];
        if (gh) {
          setSelectedSocialId(gh.id);
          setSocialClientId(gh.clientId || '');
          setSocialRedirectUri(gh.redirectUri || '');
          setSocialInstanceUrl(gh.hostedInstanceUrl || '');
          setSocialScopes(gh.scopes?.join(', ') || '');
        }
      }
      if (sessData.success) setSessions(sessData.sessions);
      if (pkData.success) setPasskeys(pkData.passkeys);
      if (recData.success) setRecoveryCodes(recData.codes);
    } catch (err) {
      console.error('Failed to load ForgeAuth data:', err);
    }
  };

  useEffect(() => {
    fetchAllAuthData();
  }, []);

  // When selected social provider changes in dropdown
  const handleSelectSocialProvider = (id: string) => {
    setSelectedSocialId(id);
    const p = socialProviders.find((x) => x.id === id);
    if (p) {
      setSocialClientId(p.clientId || '');
      setSocialClientSecret('');
      setSocialRedirectUri(p.redirectUri || '');
      setSocialInstanceUrl(p.hostedInstanceUrl || '');
      setSocialScopes(p.scopes?.join(', ') || '');
      setSocialTestResult(null);
    }
  };

  // Save Social Login Config
  const handleSaveSocialConfig = async () => {
    try {
      const res = await fetch(`/api/forge-auth/social-providers/${selectedSocialId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: socialClientId,
          clientSecret: socialClientSecret || undefined,
          redirectUri: socialRedirectUri,
          hostedInstanceUrl: socialInstanceUrl || undefined,
          scopes: socialScopes.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`${data.provider.name} OAuth credentials saved successfully!`);
        setSocialProviders((prev) => prev.map((p) => (p.id === selectedSocialId ? data.provider : p)));
        setSocialClientSecret('');
      }
    } catch (err) {
      console.error('Save social config error:', err);
      showNotification('Failed to save social credentials');
    }
  };

  // Test Social Handshake
  const handleTestSocialHandshake = async () => {
    setIsTestingSocial(true);
    setSocialTestResult(null);
    try {
      const res = await fetch(`/api/forge-auth/social-providers/${selectedSocialId}/test`, {
        method: 'POST',
      });
      const data = await res.json();
      setSocialTestResult(data);
      if (data.success) {
        showNotification(`Handshake verified with ${data.provider} (${data.handshakeLatencyMs}ms)`);
      } else {
        showNotification(data.error || 'Handshake failed');
      }
    } catch (err) {
      console.error('Test handshake error:', err);
      setSocialTestResult({ success: false, error: 'Network timeout during provider handshake' });
    } finally {
      setIsTestingSocial(false);
    }
  };

  // Toggle Social Provider Enabled
  const handleToggleSocialEnabled = async (id: string, isEnabled: boolean) => {
    try {
      const res = await fetch(`/api/forge-auth/social-providers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        setSocialProviders((prev) => prev.map((p) => (p.id === id ? data.provider : p)));
        showNotification(`${data.provider.name} ${isEnabled ? 'enabled' : 'disabled'} for authentication.`);
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  // Register Passkey
  const handleRegisterPasskey = async () => {
    setIsRegisteringPasskey(true);
    try {
      const res = await fetch('/api/forge-auth/passkeys/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPasskeyName }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Hardware passkey "${data.passkey.name}" registered with WebAuthn!`);
        setPasskeys((prev) => [data.passkey, ...prev]);
        setNewPasskeyName('');
      }
    } catch (err) {
      console.error('Passkey register error:', err);
      showNotification('Passkey registration failed');
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  // Revoke Passkey
  const handleRevokePasskey = async (id: string) => {
    try {
      const res = await fetch(`/api/forge-auth/passkeys/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPasskeys((prev) => prev.filter((p) => p.id !== id));
        showNotification('Passkey credential revoked.');
      }
    } catch (err) {
      console.error('Revoke passkey error:', err);
    }
  };

  // Revoke Session
  const handleRevokeSession = async (id: string) => {
    try {
      const res = await fetch(`/api/forge-auth/sessions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        showNotification(data.message);
      } else {
        showNotification(data.error);
      }
    } catch (err) {
      console.error('Revoke session error:', err);
    }
  };

  // Revoke All Other Sessions
  const handleRevokeAllOtherSessions = async () => {
    try {
      const res = await fetch('/api/forge-auth/sessions/revoke-all-others', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSessions((prev) => prev.filter((s) => s.isCurrent));
        showNotification(data.message);
      }
    } catch (err) {
      console.error('Revoke all error:', err);
    }
  };

  // Generate Recovery Codes
  const handleGenerateRecoveryCodes = async () => {
    setIsGeneratingRecoveryCodes(true);
    try {
      const res = await fetch('/api/forge-auth/recovery-codes/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: authenticatedUser?.uid || 'usr_admin_01' }),
      });
      const data = await res.json();
      if (data.success) {
        setRecoveryCodes(data.codes);
        showNotification('10 new one-time backup recovery codes generated!');
      }
    } catch (err) {
      console.error('Recovery codes error:', err);
    } finally {
      setIsGeneratingRecoveryCodes(false);
    }
  };

  // TOTP 2FA Setup Flow
  const handleOpenTotpSetup = async () => {
    setIsSettingUpTotp(true);
    setTotpErrorMessage(null);
    setTotpInputCode('');
    setTotpStep('qr');
    try {
      const res = await fetch('/api/forge-auth/totp/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: authenticatedUser?.uid || 'usr_admin_01' }),
      });
      const data = await res.json();
      if (data.success) {
        setTotpSecret(data.secret);
        setTotpFormattedSecret(data.formattedSecret || data.secret);
        setTotpUri(data.otpauthUri);
        if (data.recoveryCodes) setRecoveryCodes(data.recoveryCodes);
        setShowTotpModal(true);
      } else {
        showNotification(data.error || 'Failed to initialize TOTP');
      }
    } catch (err) {
      console.error('TOTP setup error:', err);
      showNotification('Network error starting TOTP setup');
    } finally {
      setIsSettingUpTotp(false);
    }
  };

  const handleVerifyTotpCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(totpInputCode.trim())) {
      setTotpErrorMessage('Please enter a valid 6-digit TOTP code');
      return;
    }
    setIsVerifyingTotp(true);
    setTotpErrorMessage(null);
    try {
      const res = await fetch('/api/forge-auth/totp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: authenticatedUser?.uid || 'usr_admin_01',
          code: totpInputCode.trim(),
          recoveryCodes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.user) setAuthenticatedUser(data.user);
        if (data.recoveryCodes) setRecoveryCodes(data.recoveryCodes);
        setTotpStep('success');
        showNotification('Two-Factor Authentication (TOTP) successfully activated!');
      } else {
        setTotpErrorMessage(data.error || 'Verification code failed');
      }
    } catch (err) {
      console.error('TOTP verify error:', err);
      setTotpErrorMessage('Verification failed. Check code and try again.');
    } finally {
      setIsVerifyingTotp(false);
    }
  };

  const handleDisableTotp = async () => {
    if (!confirm('Are you sure you want to disable Two-Factor Authentication (TOTP)? Your account security will be reduced.')) return;
    try {
      const res = await fetch('/api/forge-auth/totp/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: authenticatedUser?.uid || 'usr_admin_01' }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.user) setAuthenticatedUser(data.user);
        showNotification('Two-Factor Authentication has been disabled.');
      }
    } catch (err) {
      console.error('Disable TOTP error:', err);
    }
  };

  const handleCopyAllRecoveryCodes = () => {
    const text = recoveryCodes.join('\n');
    navigator.clipboard.writeText(text);
    showNotification('All 10 backup recovery codes copied to clipboard');
  };

  const handleDownloadRecoveryCodes = () => {
    const text = 
      `FORGESTUDIO ACCOUNT BACKUP RECOVERY CODES\n` +
      `User: ${authenticatedUser?.email || 'admin@forgestudio.local'}\n` +
      `Generated: ${new Date().toISOString()}\n\n` +
      `Each code can be used once to sign in if you lose access to your authenticator app:\n\n` +
      recoveryCodes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
      `\n\nKeep this file offline in an encrypted password manager.`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forgestudio-recovery-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Recovery codes downloaded as text file');
  };

  // Email Sign-in
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch('/api/forge-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthenticatedUser(data.user);
        setAuthToken(data.token);
        showNotification(`Signed in as ${data.user.displayName}`);
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (err: any) {
      setAuthError('Connection error to auth engine');
    }
  };

  // Email Sign-up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch('/api/forge-auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthenticatedUser(data.user);
        setAuthToken(data.token);
        setUsers((prev) => [data.user, ...prev]);
        showNotification(`Account created for ${data.user.email}!`);
      } else {
        setAuthError(data.error || 'Sign-up failed');
      }
    } catch (err) {
      setAuthError('Sign-up error');
    }
  };

  // Phone Send OTP
  const handlePhoneSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingOtp(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/forge-auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpStep('enter_otp');
        setDebugOtpCode(data.debugOtpCode);
        showNotification(data.message);
      } else {
        setAuthError(data.error);
      }
    } catch (err) {
      setAuthError('Failed to dispatch SMS OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Phone Verify OTP
  const handlePhoneVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingOtp(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/forge-auth/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, code: otpCode }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthenticatedUser(data.user);
        setAuthToken(data.token);
        showNotification(`Phone verified! Logged in as ${data.user.displayName}`);
        setOtpStep('input_phone');
        setOtpCode('');
      } else {
        setAuthError(data.error);
      }
    } catch (err) {
      setAuthError('Verification error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/forge-auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setResetToken(data.debugResetToken || '');
        setEmailMode('reset_password');
        showNotification(data.message);
      }
    } catch (err) {
      showNotification('Reset error');
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/forge-auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailMode('signin');
        showNotification('Password updated! Please log in with your new password.');
      } else {
        setAuthError(data.error);
      }
    } catch (err) {
      showNotification('Reset password error');
    }
  };

  // Toggle 2FA TOTP
  const handleToggleMfa = async () => {
    if (!authenticatedUser) return;
    try {
      const res = await fetch('/api/forge-auth/users/toggle-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: authenticatedUser.uid }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthenticatedUser({ ...authenticatedUser, mfaEnabled: data.mfaEnabled });
        setUsers((prev) =>
          prev.map((u) => (u.uid === authenticatedUser.uid ? { ...u, mfaEnabled: data.mfaEnabled } : u))
        );
        showNotification(data.message);
      }
    } catch (err) {
      console.error('MFA toggle error:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
    showNotification('Copied to clipboard');
  };

  return (
    <div id="forge-auth-container" className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto min-h-screen">
      {/* Top Application Bar */}
      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-20 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">FLOXDON ACCOUNT</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                  Production IAM & Identity Grid
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full-featured authentication: Passkeys, 2FA, Sessions, Social Logins & Recovery
              </p>
            </div>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="bg-slate-950 border border-slate-800 p-1 rounded-xl flex items-center gap-1 overflow-x-auto max-w-full no-scrollbar">
            <button
              id="forge-auth-tab-account"
              onClick={() => setActiveSubTab('account')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeSubTab === 'account'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Floxdon Account</span>
            </button>

            <button
              id="forge-auth-tab-oauth"
              onClick={() => setActiveSubTab('oauth_apps')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeSubTab === 'oauth_apps'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>OAuth2 & Apps</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                SSO
              </span>
            </button>

            <button
              id="forge-auth-tab-social"
              onClick={() => setActiveSubTab('social_logins')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeSubTab === 'social_logins'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Social Logins</span>
            </button>

            <button
              id="forge-auth-tab-directory"
              onClick={() => setActiveSubTab('users_directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeSubTab === 'users_directory'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Directory ({users.length})</span>
            </button>

            <button
              id="forge-auth-tab-security"
              onClick={() => setActiveSubTab('security_policies')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeSubTab === 'security_policies'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Security & SDK</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: FLOXDON ACCOUNT PORTAL (Google Account equivalent) */}
      {activeSubTab === 'account' && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
          {/* Active Profile Header Card */}
          {authenticatedUser ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <img
                    src={authenticatedUser.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                    alt={authenticatedUser.displayName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-lg"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{authenticatedUser.displayName}</h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {authenticatedUser.role}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                      {authenticatedUser.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-500" />{authenticatedUser.email}</span>}
                      {authenticatedUser.phone && <span className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-slate-500" />{authenticatedUser.phone}</span>}
                      <span>•</span>
                      <span className="text-emerald-400">Active Identity</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleMfa}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      authenticatedUser.mfaEnabled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>2FA: {authenticatedUser.mfaEnabled ? 'Enabled (Enforced)' : 'Disabled (Enable)'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setAuthenticatedUser(null);
                      setAuthToken(null);
                      showNotification('Signed out of session');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Sign-in / Sign-up Card */
            <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-white">Sign In to Floxdon Account</h3>
                <p className="text-xs text-slate-400">Access your developer tools and deployment consoles</p>
              </div>

              {/* Method Switcher: Email vs Phone */}
              <div className="bg-slate-950 p-1 rounded-xl flex items-center border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authMethod === 'email' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Email & Password
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authMethod === 'phone' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Phone SMS OTP
                </button>
              </div>

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Email Form */}
              {authMethod === 'email' && (
                <form onSubmit={emailMode === 'signin' ? handleEmailSignIn : emailMode === 'signup' ? handleEmailSignUp : emailMode === 'forgot_password' ? handleForgotPassword : handleResetPassword} className="space-y-4">
                  {emailMode === 'signup' && (
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>

                  {emailMode !== 'forgot_password' && (
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        {emailMode === 'reset_password' ? 'New Password' : 'Password'}
                      </label>
                      <input
                        type="password"
                        value={emailMode === 'reset_password' ? newPassword : password}
                        onChange={(e) => emailMode === 'reset_password' ? setNewPassword(e.target.value) : setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  )}

                  {emailMode === 'reset_password' && (
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Reset Token</label>
                      <input
                        type="text"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
                  >
                    {emailMode === 'signin' && 'Sign In'}
                    {emailMode === 'signup' && 'Create Account'}
                    {emailMode === 'forgot_password' && 'Send Reset Link'}
                    {emailMode === 'reset_password' && 'Update Password'}
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    {emailMode === 'signin' ? (
                      <>
                        <button type="button" onClick={() => setEmailMode('forgot_password')} className="hover:text-cyan-400">
                          Forgot password?
                        </button>
                        <button type="button" onClick={() => setEmailMode('signup')} className="hover:text-cyan-400 font-semibold">
                          Create account
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => setEmailMode('signin')} className="hover:text-cyan-400">
                        Back to sign in
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Phone OTP Form */}
              {authMethod === 'phone' && (
                <div className="space-y-4">
                  {otpStep === 'input_phone' ? (
                    <form onSubmit={handlePhoneSendOtp} className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Mobile Phone Number (E.164)</label>
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+14155550199"
                          required
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSendingOtp}
                        className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow"
                      >
                        {isSendingOtp ? 'Dispatching OTP...' : 'Send SMS Verification Code'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handlePhoneVerifyOtp} className="space-y-4">
                      {debugOtpCode && (
                        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs space-y-1">
                          <span className="text-cyan-400 font-bold block">SMS Verification Code Received:</span>
                          <span className="font-mono text-base font-bold text-white tracking-widest">{debugOtpCode}</span>
                        </div>
                      )}
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Enter 6-Digit Code</label>
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                          required
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-center text-white font-mono tracking-widest"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setOtpStep('input_phone')}
                          className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isVerifyingOtp}
                          className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow"
                        >
                          {isVerifyingOtp ? 'Verifying...' : 'Confirm & Authenticate'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SECTION: TOTP TWO-FACTOR AUTHENTICATION (2FA) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Two-Factor Authentication (TOTP / Authenticator App)</h3>
                  {authenticatedUser?.mfaEnabled ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Active (Protected)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      Not Configured
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Protect your account with RFC 6238 standard TOTP authenticator apps including Google Authenticator, Authy, Microsoft Authenticator, and 1Password.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {authenticatedUser?.mfaEnabled ? (
                  <>
                    <button
                      onClick={handleOpenTotpSetup}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition"
                    >
                      Re-scan QR Code
                    </button>
                    <button
                      onClick={handleDisableTotp}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold rounded-lg text-xs transition"
                    >
                      Disable 2FA
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleOpenTotpSetup}
                    disabled={isSettingUpTotp}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs shadow transition"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{isSettingUpTotp ? 'Generating Secret...' : 'Set Up TOTP 2FA'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* TOTP Benefits & Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>RFC 6238 Standard</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Compatible with 100% of standard TOTP authenticator mobile & desktop clients.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Base32 Secret Key</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Secure 160-bit entropy cryptographic keys generated uniquely per account.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>10 Recovery Codes</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Emergency offline access codes if you ever replace or lose your smartphone.
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: PASSKEYS & WEBAUTHN */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-cyan-400" />
                  <span>Hardware Passkeys & WebAuthn / FIDO2</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sign in instantly using Touch ID, Face ID, Windows Hello, or YubiKey hardware tokens.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPasskeyName}
                  onChange={(e) => setNewPasskeyName(e.target.value)}
                  placeholder="Key Name (e.g. YubiKey 5C)"
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white w-48"
                />
                <button
                  onClick={handleRegisterPasskey}
                  disabled={isRegisteringPasskey || !newPasskeyName.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Passkey</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {passkeys.map((pk) => (
                <div key={pk.id} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{pk.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {pk.credentialId}</p>
                      <span className="text-[10px] text-slate-500 block">Registered: {new Date(pk.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevokePasskey(pk.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Revoke Passkey"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: ACTIVE SESSIONS & DEVICE MANAGEMENT */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-cyan-400" />
                  <span>Active Sessions & Device Management</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  View and terminate active authenticated devices, mobile apps, and developer CLI tokens.
                </p>
              </div>

              <button
                onClick={handleRevokeAllOtherSessions}
                className="px-3 py-1.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 font-medium rounded-lg text-xs transition-colors self-start"
              >
                Revoke All Other Devices
              </button>
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div key={sess.id} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300">
                      {sess.deviceName.toLowerCase().includes('android') || sess.deviceName.toLowerCase().includes('pixel') ? (
                        <Smartphone className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Laptop className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{sess.deviceName}</h4>
                        {sess.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Current Device
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span>{sess.browser} • {sess.os}</span>
                        <span>•</span>
                        <span className="font-mono text-cyan-400">{sess.ipAddress}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{sess.location}</span>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(sess.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-xs transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: ACCOUNT RECOVERY CODES */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Account Recovery & One-Time Emergency Codes</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Keep these backup codes offline. Each code can be used once to access your account if you lose your phone or 2FA token.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start">
                <button
                  onClick={handleCopyAllRecoveryCodes}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy All</span>
                </button>
                <button
                  onClick={handleDownloadRecoveryCodes}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download .txt</span>
                </button>
                <button
                  onClick={handleGenerateRecoveryCodes}
                  disabled={isGeneratingRecoveryCodes}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                >
                  {isGeneratingRecoveryCodes ? 'Generating...' : 'Regenerate 10 Codes'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              {recoveryCodes.map((code, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-center font-mono text-xs text-amber-300 font-bold">
                  {code}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW: OAUTH2 IDENTITY PROVIDER & APPLICATION SESSION MANAGEMENT */}
      {activeSubTab === 'oauth_apps' && (
        <OAuthAppsManager showNotification={showNotification} />
      )}

      {/* SUB-VIEW 2: SOCIAL LOGINS (GITHUB, GITLAB, BITBUCKET, GOOGLE) */}
      {activeSubTab === 'social_logins' && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Social Logins & OAuth Provider Configuration</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure OAuth client credentials, scopes, and callback URIs for GitHub, GitLab, Bitbucket, and Google Workspace.
              </p>
            </div>

            {/* Provider Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {socialProviders.map((prov) => (
                <div
                  key={prov.id}
                  onClick={() => handleSelectSocialProvider(prov.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedSocialId === prov.id
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{prov.name}</span>
                    <input
                      type="checkbox"
                      checked={prov.isEnabled}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleSocialEnabled(prov.id, e.target.checked);
                      }}
                      className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className={prov.isEnabled ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                      {prov.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {prov.clientSecretConfigured ? 'Secret Configured' : 'No Secret'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Provider Form */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Editing Configuration: {socialProviders.find((p) => p.id === selectedSocialId)?.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestSocialHandshake}
                    disabled={isTestingSocial}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingSocial ? 'animate-spin' : ''}`} />
                    <span>{isTestingSocial ? 'Testing...' : 'Test OAuth Handshake'}</span>
                  </button>

                  <button
                    onClick={handleSaveSocialConfig}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg shadow transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Credentials</span>
                  </button>
                </div>
              </div>

              {socialTestResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  socialTestResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  {socialTestResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{socialTestResult.message || socialTestResult.error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Client ID / App Key</label>
                  <input
                    type="text"
                    value={socialClientId}
                    onChange={(e) => setSocialClientId(e.target.value)}
                    placeholder="e.g. gh_client_89f0291ba4c9"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Client Secret {socialProviders.find((p) => p.id === selectedSocialId)?.maskedClientSecret && `(Currently: ${socialProviders.find((p) => p.id === selectedSocialId)?.maskedClientSecret})`}
                  </label>
                  <input
                    type="password"
                    value={socialClientSecret}
                    onChange={(e) => setSocialClientSecret(e.target.value)}
                    placeholder="Enter new secret to update..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">OAuth Redirect / Callback URI</label>
                  <input
                    type="text"
                    value={socialRedirectUri}
                    onChange={(e) => setSocialRedirectUri(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">OAuth Requested Scopes (comma separated)</label>
                  <input
                    type="text"
                    value={socialScopes}
                    onChange={(e) => setSocialScopes(e.target.value)}
                    placeholder="read:user, user:email"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>

                {(selectedSocialId === 'gitlab' || selectedSocialId === 'bitbucket') && (
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">
                      Enterprise Instance URL (Optional - Leave blank for official cloud)
                    </label>
                    <input
                      type="text"
                      value={socialInstanceUrl}
                      onChange={(e) => setSocialInstanceUrl(e.target.value)}
                      placeholder="https://gitlab.company.internal"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: USER DIRECTORY */}
      {activeSubTab === 'users_directory' && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>IAM User Directory</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage registered engineers, clinical operators, and tenant members.
                </p>
              </div>

              <button
                onClick={() => setShowCreateUserModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors self-start"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create User</span>
              </button>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Search user by email or name..."
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {['all', 'admin', 'developer', 'user'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium uppercase ${
                      roleFilter === r ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* User List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="py-3 px-2">User / Identity</th>
                    <th className="py-3 px-2">Role</th>
                    <th className="py-3 px-2">Providers</th>
                    <th className="py-3 px-2">2FA Status</th>
                    <th className="py-3 px-2">Last Sign In</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users
                    .filter((u) => {
                      const matchRole = roleFilter === 'all' || u.role === roleFilter;
                      const matchSearch = !searchUser || 
                        u.displayName?.toLowerCase().includes(searchUser.toLowerCase()) || 
                        u.email?.toLowerCase().includes(searchUser.toLowerCase());
                      return matchRole && matchSearch;
                    })
                    .map((user) => (
                      <tr key={user.uid} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                              alt={user.displayName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <span className="font-bold text-white block">{user.displayName}</span>
                              <span className="text-[11px] text-slate-400">{user.email || user.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            {user.providers.map((p) => (
                              <span key={p} className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-cyan-400 border border-slate-800">
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {user.mfaEnabled ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              2FA Active
                            </span>
                          ) : (
                            <span className="text-slate-500">Disabled</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-slate-400 font-mono text-[11px]">
                          {new Date(user.lastSignInAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: SECURITY POLICIES & SDK */}
      {activeSubTab === 'security_policies' && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Client SDK Integration</span>
            </h3>
            <p className="text-xs text-slate-400">
              Integrate ForgeAuth into your React, Android (Capacitor), or Desktop (Electron) applications.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-cyan-400">src/hooks/useForgeAuth.ts</span>
                <button
                  onClick={() => copyToClipboard(`import { useForgeAuth } from '@forge/auth-client';\nconst { user, signIn, passkeyAuth } = useForgeAuth();`)}
                  className="text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Snippet</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-3 bg-slate-900/80 rounded-lg">
{`import { useForgeAuth } from '@forge/auth-client';

export function Dashboard() {
  const { user, loginWithEmail, loginWithPasskey, sessions } = useForgeAuth();

  if (!user) {
    return <button onClick={loginWithPasskey}>Touch ID / FIDO2 Passkey</button>;
  }

  return <div>Welcome {user.displayName} (Role: {user.role})</div>;
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Create IAM User</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="engineer@floxdon.corp"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Role Assignment</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="developer">Developer</option>
                  <option value="admin">Administrator</option>
                  <option value="user">Standard User</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newUserEmail.trim()) return;
                  const res = await fetch('/api/forge-auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: newUserEmail, password: 'TempPassword2026!', role: newUserRole }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setUsers((prev) => [data.user, ...prev]);
                    setShowCreateUserModal(false);
                    setNewUserEmail('');
                    showNotification(`User ${data.user.email} created with temporary credentials!`);
                  }
                }}
                className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TOTP 2FA REGISTRATION & VERIFICATION */}
      {showTotpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {totpStep === 'qr' ? 'Set Up Authenticator App (TOTP)' : '2FA Enabled & Recovery Codes'}
                  </h3>
                  <p className="text-[11px] text-slate-400">RFC 6238 Time-based One-Time Password Security</p>
                </div>
              </div>
              <button
                onClick={() => setShowTotpModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {totpStep === 'qr' ? (
                <>
                  {/* Step 1: QR Code & Manual Key */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                        1
                      </span>
                      <span>Scan this QR code with Google Authenticator, Authy, or 1Password</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                      {/* Crisp Vector QR Code SVG */}
                      <div className="p-3 bg-white rounded-xl shadow-md shrink-0 flex items-center justify-center">
                        <svg
                          viewBox="0 0 100 100"
                          className="w-32 h-32 text-slate-950 fill-current"
                          shapeRendering="crispEdges"
                        >
                          {/* Corner Finder 1 (Top-Left) */}
                          <rect x="5" y="5" width="28" height="28" fill="black" />
                          <rect x="9" y="9" width="20" height="20" fill="white" />
                          <rect x="13" y="13" width="12" height="12" fill="black" />
                          {/* Corner Finder 2 (Top-Right) */}
                          <rect x="67" y="5" width="28" height="28" fill="black" />
                          <rect x="71" y="9" width="20" height="20" fill="white" />
                          <rect x="75" y="13" width="12" height="12" fill="black" />
                          {/* Corner Finder 3 (Bottom-Left) */}
                          <rect x="5" y="67" width="28" height="28" fill="black" />
                          <rect x="9" y="71" width="20" height="20" fill="white" />
                          <rect x="13" y="75" width="12" height="12" fill="black" />
                          {/* Timing Patterns */}
                          <rect x="37" y="17" width="4" height="4" fill="black" />
                          <rect x="45" y="17" width="4" height="4" fill="black" />
                          <rect x="53" y="17" width="4" height="4" fill="black" />
                          <rect x="17" y="37" width="4" height="4" fill="black" />
                          <rect x="17" y="45" width="4" height="4" fill="black" />
                          <rect x="17" y="53" width="4" height="4" fill="black" />
                          {/* Simulated Data Pattern Modules */}
                          <rect x="37" y="37" width="8" height="8" fill="black" />
                          <rect x="49" y="37" width="8" height="4" fill="black" />
                          <rect x="61" y="37" width="4" height="8" fill="black" />
                          <rect x="73" y="37" width="8" height="8" fill="black" />
                          <rect x="37" y="49" width="4" height="8" fill="black" />
                          <rect x="45" y="45" width="8" height="8" fill="black" />
                          <rect x="57" y="49" width="8" height="8" fill="black" />
                          <rect x="69" y="49" width="4" height="4" fill="black" />
                          <rect x="81" y="49" width="8" height="8" fill="black" />
                          <rect x="37" y="61" width="8" height="4" fill="black" />
                          <rect x="49" y="61" width="4" height="8" fill="black" />
                          <rect x="57" y="61" width="8" height="4" fill="black" />
                          <rect x="69" y="61" width="8" height="8" fill="black" />
                          <rect x="37" y="73" width="4" height="8" fill="black" />
                          <rect x="45" y="73" width="8" height="8" fill="black" />
                          <rect x="57" y="73" width="8" height="8" fill="black" />
                          <rect x="69" y="73" width="8" height="4" fill="black" />
                          <rect x="81" y="73" width="8" height="8" fill="black" />
                          <rect x="37" y="85" width="8" height="8" fill="black" />
                          <rect x="49" y="85" width="4" height="8" fill="black" />
                          <rect x="57" y="85" width="8" height="4" fill="black" />
                          <rect x="69" y="85" width="4" height="8" fill="black" />
                          <rect x="77" y="85" width="8" height="8" fill="black" />
                        </svg>
                      </div>

                      {/* Manual Entry Key */}
                      <div className="flex-1 space-y-2 text-xs">
                        <div className="text-slate-400">Can't scan the QR code? Enter this secret manually:</div>
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 flex items-center justify-between break-all">
                          <span>{totpFormattedSecret || totpSecret}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(totpSecret);
                              showNotification('Secret key copied to clipboard');
                            }}
                            className="p-1 text-slate-400 hover:text-white shrink-0 ml-2"
                            title="Copy secret"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Type: <span className="font-mono text-slate-400">TOTP</span> • Algorithm:{' '}
                          <span className="font-mono text-slate-400">SHA1</span> • Interval:{' '}
                          <span className="font-mono text-slate-400">30s</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Verification Code Form */}
                  <form onSubmit={handleVerifyTotpCode} className="space-y-3">
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                        2
                      </span>
                      <span>Enter the 6-digit code shown in your authenticator app</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={totpInputCode}
                        onChange={(e) => setTotpInputCode(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-center text-lg font-mono tracking-widest text-white focus:outline-hidden focus:border-cyan-500"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={isVerifyingTotp || totpInputCode.length !== 6}
                        className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
                      >
                        {isVerifyingTotp ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                        <span>{isVerifyingTotp ? 'Verifying...' : 'Verify & Enable'}</span>
                      </button>
                    </div>

                    {totpErrorMessage && (
                      <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{totpErrorMessage}</span>
                      </div>
                    )}
                  </form>
                </>
              ) : (
                /* Step 3: Success & Recovery Codes */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Two-Factor Authentication is Active!</div>
                      <div className="text-xs text-emerald-300 mt-0.5">
                        Your account is now protected with time-based one-time passwords.
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        One-Time Backup Recovery Codes
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyAllRecoveryCodes}
                          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy All</span>
                        </button>
                        <button
                          onClick={handleDownloadRecoveryCodes}
                          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download .txt</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Save these 10 backup codes offline. Each code can be used once to access your account if you lose your phone or authenticator app.
                    </p>

                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 font-bold">
                      {recoveryCodes.map((code, idx) => (
                        <div key={idx} className="p-2 rounded-md bg-slate-900/60 border border-slate-800/80 text-center">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setShowTotpModal(false)}
                      className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
