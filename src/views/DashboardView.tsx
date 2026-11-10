import React from 'react';
import {
  MailCheck,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Inbox,
  Play,
  Pause,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { NavigationTab } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const { accounts, campaigns, contacts, suppressions, replies, updateCampaignStatus } = useData();

  const totalSent = campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
  const totalAccepted = campaigns.reduce((acc, c) => acc + (c.acceptedCount || 0), 0);
  const totalBounced = campaigns.reduce((acc, c) => acc + (c.bouncedCount || 0), 0);
  const activeAccounts = accounts.filter(a => a.status === 'connected');
  const campaignsInProgress = campaigns.filter(c => c.status === 'in_progress');

  const acceptanceRate = totalSent > 0 ? ((totalAccepted / totalSent) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Executive Deliverability Overview
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Real-time status across all connected providers, campaigns, and audience lists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('accounts')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
          >
            Manage Senders ({accounts.length})
          </button>
          <button
            onClick={() => onNavigate('create-campaign')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Launch Dispatch</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Connected Senders */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 text-xs font-medium">
            <span>Connected Senders</span>
            <MailCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {activeAccounts.length}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">
              / {accounts.length} Total
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span>All credentials active</span>
          </div>
        </div>

        {/* Total Sent */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 text-xs font-medium">
            <span>Dispatched Volume</span>
            <Send className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {totalSent.toLocaleString()}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300">msgs</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Across {campaigns.length} campaigns</span>
          </div>
        </div>

        {/* Provider 250 OK Accepted */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 text-xs font-medium">
            <span>Provider 250 OK</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {acceptanceRate}%
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-mono tabular-nums">
              ({totalAccepted})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300">
            <span>Confirmed server acceptance</span>
          </div>
        </div>

        {/* Suppressed & Bounces */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 text-xs font-medium">
            <span>Suppressed / Opt-outs</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {suppressions.length}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300">contacts</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400">
            <span>{totalBounced} hard bounces blocked</span>
          </div>
        </div>
      </div>

      {/* Account Performance Strip */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Connected Sending Nodes
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Live capacity and daily quotas by provider
            </p>
          </div>
          <button
            onClick={() => onNavigate('accounts')}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Configure Accounts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {accounts.map(acc => {
            const usagePct = Math.min(100, Math.round((acc.sentCount / (acc.dailyLimit || 1000)) * 100));
            return (
              <div
                key={acc.id}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {acc.displayName || acc.email}
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 uppercase">
                    {acc.provider}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                  {acc.email}
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-mono text-slate-600 dark:text-slate-300 mb-1">
                    <span>Daily Quota</span>
                    <span>{acc.sentCount} / {acc.dailyLimit.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Dispatches Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent Campaign Dispatches
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Live progress, acceptance, and delivery status
            </p>
          </div>
          <button
            onClick={() => onNavigate('campaigns')}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View all ({campaigns.length})
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-8 text-center">
            <Send className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">No campaigns launched yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create your first multi-variation email campaign using connected senders and opt-in recipient lists.
            </p>
            <button
              onClick={() => onNavigate('create-campaign')}
              className="mt-4 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Campaign</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">Campaign Name</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium font-mono text-right">Recipients</th>
                  <th className="py-3 px-4 font-medium font-mono text-right">Sent / Accepted</th>
                  <th className="py-3 px-4 font-medium font-mono text-right">Bounced</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {campaigns.slice(0, 5).map(cmp => (
                  <tr key={cmp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {cmp.name}
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 block truncate max-w-xs">
                        {cmp.description || 'Permission-based outreach'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {cmp.status === 'completed' && (
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                          Completed
                        </span>
                      )}
                      {cmp.status === 'in_progress' && (
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          In Progress
                        </span>
                      )}
                      {cmp.status === 'paused' && (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          Paused
                        </span>
                      )}
                      {cmp.status === 'draft' && (
                        <span className="text-slate-500 font-medium">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-700 dark:text-slate-300">
                      {cmp.recipientCount}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-700 dark:text-slate-300">
                      {cmp.sentCount} / {cmp.acceptedCount}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right text-rose-600 dark:text-rose-400">
                      {cmp.bouncedCount}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {cmp.status === 'in_progress' ? (
                        <button
                          onClick={() => updateCampaignStatus(cmp.id, 'paused')}
                          className="px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded inline-flex items-center gap-1"
                        >
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </button>
                      ) : cmp.status === 'paused' ? (
                        <button
                          onClick={() => updateCampaignStatus(cmp.id, 'in_progress')}
                          className="px-2 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded inline-flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Resume</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate('analytics')}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View Report
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
