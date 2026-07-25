import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Fingerprint, 
  ShieldCheck, 
  Mail, 
  Smartphone, 
  Sparkles, 
  CheckCircle2,
  Lock
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isDarkMode
}) => {
  const [activeMethod, setActiveMethod] = useState<'passkey' | 'google' | 'apple' | 'github' | 'email' | 'biometric'>('passkey');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateAuth = (methodName: string) => {
    setSuccessMsg(`Successfully authenticated via ${methodName}! Security tokens generated on Municryptrix Auth Engine.`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-5 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 flex items-center justify-center border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base">MuniSocial Security Auth</h2>
              <p className="text-[11px] text-slate-400">Passkeys, OAuth 2.0 & Biometric Verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        ) : (
          <div className="space-y-3">
            
            {/* Primary Passkey / Biometric Option */}
            <button
              onClick={() => handleSimulateAuth('Passkey / WebAuthn')}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:scale-[1.01] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Fingerprint className="w-6 h-6 text-indigo-200" />
                <div className="text-left">
                  <span>Sign in with Passkey (Touch ID / Face ID)</span>
                  <span className="block text-[10px] text-indigo-200 font-normal">Fast, passwordless cryptographic security</span>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-indigo-200" />
            </button>

            <div className="relative my-3 text-center text-[10px] font-mono text-slate-500 uppercase">
              <span className="px-2 bg-slate-900">Or OAuth & Single Sign-On</span>
            </div>

            {/* Social Providers */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { name: 'Google Login', icon: '🌐' },
                { name: 'Apple ID', icon: '🍏' },
                { name: 'GitHub Login', icon: '🐙' },
                { name: 'Microsoft Login', icon: '🪟' },
                { name: 'Facebook Login', icon: '📘' },
                { name: 'X / Twitter Login', icon: '🐦' },
              ].map((provider, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSimulateAuth(provider.name)}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 text-slate-200 text-left font-semibold flex items-center gap-2 transition-colors"
                >
                  <span>{provider.icon}</span>
                  <span>{provider.name}</span>
                </button>
              ))}
            </div>

            {/* Magic Link */}
            <button
              onClick={() => handleSimulateAuth('Passwordless Magic Link')}
              className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-indigo-300 flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Send Passwordless Magic Link Email</span>
            </button>

          </div>
        )}

        <p className="text-[10px] text-slate-500 text-center font-mono">
          Municryptrix Security Engine v3.5 • OAuth2 + WebAuthn Standard
        </p>

      </div>
    </div>
  );
};
