import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Clock,
  Sliders,
  CheckCircle2,
  LogOut,
  Moon,
  Sun,
  Key,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BRAND_CONFIG } from '../config/brand';
import { useData } from '../context/DataContext';

export function SettingsView() {
  const { user, userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { accounts } = useData();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || 'Alex Morgan');
  const [defaultThrottle, setDefaultThrottle] = useState(3);
  const [defaultSenderId, setDefaultSenderId] = useState(accounts[0]?.id || '');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          System &amp; Tenant Settings
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
          Manage your sender profile, delivery defaults, session security, and provider credentials.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings and dispatch preferences successfully saved.</span>
        </div>
      )}

      {/* User Profile Card */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" />
          <span>User Profile &amp; Identity</span>
        </h2>

        <div className="flex items-center gap-4 pt-2">
          {userProfile?.photoURL ? (
            <img
              src={userProfile.photoURL}
              alt="Avatar"
              className="w-14 h-14 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white block">
              {userProfile?.displayName || displayName}
            </span>
            <span className="text-xs text-slate-500 font-mono block">
              {userProfile?.email || 'user@postreach.io'}
            </span>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium block mt-1">
              {BRAND_CONFIG.name} · {userProfile?.plan?.toUpperCase() || 'PRO'} Subscriber
            </span>
          </div>
        </div>
      </div>

      {/* Sending Preferences */}
      <form onSubmit={handleSavePreferences} className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span>Outbound Sending Defaults</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Default Throttle Interval
            </label>
            <select
              value={defaultThrottle}
              onChange={(e) => setDefaultThrottle(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value={1}>1 second (High volume / Dedicated SES)</option>
              <option value={2}>2 seconds (Standard recommended)</option>
              <option value={3}>3 seconds (Safe deliverability)</option>
              <option value={5}>5 seconds (Gmail / Outlook Conservative)</option>
              <option value={10}>10 seconds (Strict warmed warmup)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Primary Sender Node
            </label>
            <select
              value={defaultSenderId}
              onChange={(e) => setDefaultSenderId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.displayName || acc.email} ({acc.provider.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Standard Compliance Footer
          </label>
          <textarea
            rows={2}
            readOnly
            value="You are receiving this because you opted-in to receive communications from our team. Unsubscribe at any time by replying or clicking the opt-out link."
            className="w-full p-2.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg border border-slate-200 dark:border-slate-700 font-mono"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Security & Sessions */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Security &amp; Active Sessions</span>
        </h2>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">
                Current Browser Session
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Chrome on Linux · Active now
              </span>
            </div>
            <span className="text-emerald-600 font-semibold font-mono text-[11px]">Online</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={logout}
            className="px-3.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of All Sessions</span>
          </button>
        </div>
      </div>
    </div>
  );
}
