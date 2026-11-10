import React, { useState } from 'react';
import {
  Send,
  Plus,
  Play,
  Pause,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { NavigationTab, Campaign } from '../types';

interface CampaignsListViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export function CampaignsListView({ onNavigate }: CampaignsListViewProps) {
  const { campaigns, accounts, updateCampaignStatus, deleteCampaign, dispatchCampaign } = useData();

  const [filter, setFilter] = useState<string>('all');

  const filteredCampaigns = campaigns.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Campaign Dispatches
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Track active delivery runs, schedule triggers, and bounce metrics.
          </p>
        </div>

        <button
          onClick={() => onNavigate('create-campaign')}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 w-fit">
        {['all', 'in_progress', 'completed', 'scheduled', 'paused', 'draft'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
              filter === s
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">Campaign</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium font-mono text-right">Recipients</th>
                <th className="py-3 px-4 font-medium font-mono text-right">Sent / Accepted</th>
                <th className="py-3 px-4 font-medium font-mono text-right">Bounced</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No campaigns matching the selected status.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((cmp) => {
                  const senders = accounts
                    .filter(a => cmp.senderAccountIds.includes(a.id))
                    .map(a => a.displayName || a.email);

                  return (
                    <tr key={cmp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {cmp.name}
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 block mt-0.5">
                          Senders: {senders.join(', ') || 'Default node'}
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
                        {cmp.status === 'scheduled' && (
                          <span className="text-sky-600 dark:text-sky-400 font-medium">
                            Scheduled
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
                        <div className="flex items-center justify-end gap-1.5">
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
                          ) : cmp.status === 'draft' ? (
                            <button
                              onClick={() => dispatchCampaign(cmp.id)}
                              className="px-2 py-1 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded inline-flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Dispatch</span>
                            </button>
                          ) : null}

                          <button
                            onClick={() => {
                              if (confirm(`Delete campaign "${cmp.name}"?`)) {
                                deleteCampaign(cmp.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
