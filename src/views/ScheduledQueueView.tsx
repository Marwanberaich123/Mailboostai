import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
} from 'lucide-react';
import { useData } from '../context/DataContext';

export function ScheduledQueueView() {
  const { campaigns } = useData();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Generate simulated jobs representation based on existing campaigns
  const sampleJobs = [
    {
      id: 'job_88921',
      recipientEmail: 'marcus.vance@solardrive.tech',
      senderEmail: 'alex.m@cloudrelay.onmicrosoft.com',
      campaignName: 'November Product Update Newsletter',
      status: 'accepted',
      retryCount: 0,
      timestamp: '2 mins ago',
      responseCode: '250 2.0.0 OK (queued for delivery)',
    },
    {
      id: 'job_88922',
      recipientEmail: 'elena.rostova@quantumleap.ai',
      senderEmail: 'alex.m@cloudrelay.onmicrosoft.com',
      campaignName: 'November Product Update Newsletter',
      status: 'processing',
      retryCount: 0,
      timestamp: 'Just now',
      responseCode: 'TLS socket connected; sending DATA command',
    },
    {
      id: 'job_88923',
      recipientEmail: 'sarah.connor@cyberdynesystems.com',
      senderEmail: 'outbound@techscale.io',
      campaignName: 'Q4 Enterprise Tech Outreach',
      status: 'delivered',
      retryCount: 0,
      timestamp: '3 hours ago',
      responseCode: '250 2.1.5 Destination server confirmed delivery',
    },
    {
      id: 'job_88924',
      recipientEmail: 'bounced.test@domaininvalid.xyz',
      senderEmail: 'outbound@techscale.io',
      campaignName: 'Q4 Enterprise Tech Outreach',
      status: 'bounced',
      retryCount: 1,
      timestamp: '3 hours ago',
      responseCode: '550 5.1.1 User unknown / Host unreachable',
    },
    {
      id: 'job_88925',
      recipientEmail: 'optout.user@competitor.com',
      senderEmail: 'updates@inbound-postreach.com',
      campaignName: 'Q4 Enterprise Tech Outreach',
      status: 'suppressed',
      retryCount: 0,
      timestamp: '3 hours ago',
      responseCode: 'Pre-flight suppressed: recipient is in opt-out list',
    },
  ];

  const filteredJobs = sampleJobs.filter(j => {
    const matchesFilter = filter === 'all' || j.status === filter;
    const matchesSearch =
      j.recipientEmail.toLowerCase().includes(search.toLowerCase()) ||
      j.campaignName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Scheduled &amp; Background Dispatch Queue
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
          Individual job state inspector, rate-limit preservation, and provider protocol responses.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs by recipient or campaign..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'processing', 'accepted', 'delivered', 'bounced', 'suppressed'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium capitalize transition-colors whitespace-nowrap ${
                filter === s
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">Job ID</th>
                <th className="py-3 px-4 font-medium">Recipient &amp; Sender</th>
                <th className="py-3 px-4 font-medium">Campaign</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Server Protocol Response</th>
                <th className="py-3 px-4 font-medium text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredJobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {j.id}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 dark:text-white block font-mono">
                      {j.recipientEmail}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-mono block">
                      via {j.senderEmail}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {j.campaignName}
                  </td>

                  <td className="py-3 px-4">
                    {j.status === 'delivered' && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">Delivered</span>
                    )}
                    {j.status === 'accepted' && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">Accepted (250)</span>
                    )}
                    {j.status === 'processing' && (
                      <span className="text-sky-600 dark:text-sky-400 font-medium animate-pulse">Processing</span>
                    )}
                    {j.status === 'bounced' && (
                      <span className="text-rose-600 dark:text-rose-400 font-medium">Bounced</span>
                    )}
                    {j.status === 'suppressed' && (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Suppressed</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {j.responseCode}
                  </td>

                  <td className="py-3 px-4 font-mono text-right text-slate-600 dark:text-slate-300 text-[11px]">
                    {j.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
