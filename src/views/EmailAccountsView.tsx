import React, { useState } from 'react';
import {
  MailCheck,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Server,
  Key,
  Globe,
  Send,
  Terminal,
  Search,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { BRAND_CONFIG } from '../config/brand';
import { EmailAccount, ProviderType } from '../types';

export function EmailAccountsView() {
  const { accounts, addAccount, updateAccount, deleteAccount, testAccountConnection } = useData();

  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>('smtp');

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState(587);
  const [encryption, setEncryption] = useState<'tls' | 'ssl' | 'none'>('tls');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch =
      acc.email.toLowerCase().includes(search.toLowerCase()) ||
      (acc.displayName && acc.displayName.toLowerCase().includes(search.toLowerCase()));
    const matchesProvider = providerFilter === 'all' || acc.provider === providerFilter;
    return matchesSearch && matchesProvider;
  });

  const handleOpenConnectModal = (providerId: ProviderType) => {
    setSelectedProvider(providerId);
    setTestResult(null);

    const providerConfig = BRAND_CONFIG.providers.find(p => p.id === providerId);
    if (providerConfig?.defaultHost) {
      setHost(providerConfig.defaultHost);
      setPort(providerConfig.defaultPort || 465);
      setEncryption(providerConfig.defaultEncryption as any || 'ssl');
    } else {
      setHost('');
      setPort(587);
      setEncryption('tls');
    }

    setDisplayName('');
    setEmail('');
    setUsername('');
    setPassword('');
    setModalOpen(true);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testAccountConnection({
        provider: selectedProvider,
        host,
        port,
        encryption,
        username: username || email,
        password,
        email,
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection test failed' });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    await addAccount({
      provider: selectedProvider,
      email,
      displayName: displayName || email,
      status: 'connected',
      host: host || undefined,
      port: port || undefined,
      encryption: encryption || undefined,
      username: username || undefined,
      password: password ? '••••••••' : undefined,
      dailyLimit: selectedProvider === 'gmail' ? 2000 : selectedProvider === 'outlook' ? 10000 : 5000,
    });

    setModalOpen(false);
  };

  const handleReconnect = async (acc: EmailAccount) => {
    const res = await testAccountConnection(acc);
    alert(res.message);
    if (res.success) {
      await updateAccount(acc.id, {
        status: 'connected',
        lastCheckedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Connected Email Accounts
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Connect and balance outbound sending across Gmail, Outlook, Yahoo, Zoho, and Custom SMTP nodes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenConnectModal('smtp')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Email Account</span>
          </button>
        </div>
      </div>

      {/* Provider Quick Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {BRAND_CONFIG.providers.map(p => (
          <button
            key={p.id}
            onClick={() => handleOpenConnectModal(p.id as ProviderType)}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {p.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                {p.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
              {p.dailyQuotaHint}
            </p>
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts by email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['all', 'gmail', 'outlook', 'yahoo', 'zoho', 'smtp'].map((p) => (
            <button
              key={p}
              onClick={() => setProviderFilter(p)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap capitalize ${
                providerFilter === p
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {p === 'all' ? 'All Providers' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((acc) => (
          <div
            key={acc.id}
            className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {acc.displayName || acc.email}
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 font-mono block mt-0.5">
                    {acc.email}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {acc.provider}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Connection Status</span>
                  {acc.status === 'connected' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Authorized</span>
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-medium inline-flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Re-auth Needed</span>
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Sending Capacity</span>
                  <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                    {acc.sentCount} / {acc.dailyLimit.toLocaleString()} msgs/day
                  </span>
                </div>

                {acc.host && (
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>Host &amp; Port</span>
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {acc.host}:{acc.port} ({acc.encryption?.toUpperCase()})
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 text-[11px]">
                  <span>Last Handshake</span>
                  <span>{new Date(acc.lastCheckedAt || acc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handleReconnect(acc)}
                className="flex-1 py-1.5 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Test Connection</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Disconnect and remove ${acc.email}?`)) {
                    deleteAccount(acc.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Disconnect account"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Connect Account Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                  Connect {selectedProvider} Account
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Configure credentials or authorized sending permissions
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-5 space-y-4">
              {/* Provider Info Banner */}
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-lg text-xs text-indigo-900 dark:text-indigo-300">
                {selectedProvider === 'gmail' && (
                  <div>
                    <span className="font-semibold block mb-0.5">Google Workspace / Gmail OAuth</span>
                    <span>Requires Google Cloud Console OAuth 2.0 Client credentials with scope <code>https://www.googleapis.com/auth/gmail.send</code>.</span>
                  </div>
                )}
                {selectedProvider === 'outlook' && (
                  <div>
                    <span className="font-semibold block mb-0.5">Microsoft 365 / Outlook</span>
                    <span>Requires Azure App Registration with Microsoft Graph <code>Mail.Send</code> delegated permission.</span>
                  </div>
                )}
                {(selectedProvider === 'smtp' || selectedProvider === 'yahoo' || selectedProvider === 'zoho') && (
                  <div>
                    <span className="font-semibold block mb-0.5">Secure SMTP Dispatch</span>
                    <span>Our backend connects directly via TLS/SSL socket to test and send your authorized emails.</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Account Label / Sender Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Inbound Growth (Alex)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  From Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@techscale.io"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {(selectedProvider === 'smtp' || selectedProvider === 'yahoo' || selectedProvider === 'zoho') && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        required
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="smtp.mailgun.org"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Port
                      </label>
                      <input
                        type="number"
                        required
                        value={port}
                        onChange={(e) => setPort(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        SMTP Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Usually same as email"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Password / App Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Encryption Mode
                    </label>
                    <div className="flex gap-2">
                      {(['tls', 'ssl', 'none'] as const).map((enc) => (
                        <button
                          key={enc}
                          type="button"
                          onClick={() => setEncryption(enc)}
                          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg uppercase transition-colors ${
                            encryption === enc
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {enc}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Test Connection Result */}
              {testResult && (
                <div
                  className={`p-3 text-xs rounded-lg border ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <span className="font-semibold block mb-0.5">
                    {testResult.success ? 'Handshake Succeeded' : 'Handshake Failed'}
                  </span>
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  disabled={testingConnection}
                  onClick={handleTestConnection}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                  <span>{testingConnection ? 'Testing Socket...' : 'Test Connection'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                  >
                    Save Account
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
