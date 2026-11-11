import React, { useState } from 'react';
import {
  Send,
  Plus,
  Play,
  Pause,
  Trash2,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { NavigationTab } from '../types';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            الحملات البريدية المنفذة
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            متابعة دورات الإرسال النشطة، التحكم بالإيقاف والاستئناف، ومراقبة نسب القبول والارتداد.
          </p>
        </div>

        <button
          onClick={() => onNavigate('create-campaign')}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>حملة جديدة</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 w-fit">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'in_progress', label: 'قيد الإرسال' },
          { id: 'completed', label: 'مكتملة' },
          { id: 'scheduled', label: 'مجدولة' },
          { id: 'paused', label: 'متوقفة' },
          { id: 'draft', label: 'مسودة' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filter === s.id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {filteredCampaigns.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Send className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              لا توجد حملات في هذا التصنيف
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              أنشئ حملتك البريدية وحدد الفئات المستهدفة وحسابات الإرسال.
            </p>
            <button
              onClick={() => onNavigate('create-campaign')}
              className="mt-2 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إنشاء حملة</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">اسم الحملة</th>
                  <th className="py-3 px-4 font-semibold">الحالة</th>
                  <th className="py-3 px-4 font-semibold font-mono text-left">المستلمين</th>
                  <th className="py-3 px-4 font-semibold font-mono text-left">المرسل / المقبول</th>
                  <th className="py-3 px-4 font-semibold font-mono text-left">الارتدادات</th>
                  <th className="py-3 px-4 font-semibold text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCampaigns.map((cmp) => {
                  const senders = accounts
                    .filter(a => cmp.senderAccountIds.includes(a.id))
                    .map(a => a.displayName || a.email);

                  return (
                    <tr key={cmp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {cmp.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          الحسابات المستخدمة: {senders.join(', ') || 'الحساب الافتراضي'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {cmp.status === 'completed' && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">مكتملة</span>
                        )}
                        {cmp.status === 'in_progress' && (
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse">قيد الإرسال...</span>
                        )}
                        {cmp.status === 'paused' && (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">متوقفة</span>
                        )}
                        {cmp.status === 'scheduled' && (
                          <span className="text-sky-600 dark:text-sky-400 font-semibold">مجدولة</span>
                        )}
                        {cmp.status === 'draft' && (
                          <span className="text-slate-500 font-semibold">مسودة</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums text-left text-slate-700 dark:text-slate-300">
                        {cmp.recipientCount}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums text-left text-slate-700 dark:text-slate-300">
                        {cmp.sentCount} / {cmp.acceptedCount}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums text-left text-rose-600 dark:text-rose-400">
                        {cmp.bouncedCount}
                      </td>

                      <td className="py-3 px-4 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          {cmp.status === 'in_progress' ? (
                            <button
                              onClick={() => updateCampaignStatus(cmp.id, 'paused')}
                              className="px-2 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded inline-flex items-center gap-1"
                            >
                              <Pause className="w-3 h-3" />
                              <span>إيقاف</span>
                            </button>
                          ) : cmp.status === 'paused' ? (
                            <button
                              onClick={() => updateCampaignStatus(cmp.id, 'in_progress')}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded inline-flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" />
                              <span>استئناف</span>
                            </button>
                          ) : cmp.status === 'draft' ? (
                            <button
                              onClick={() => dispatchCampaign(cmp.id)}
                              className="px-2 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded inline-flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>إرسال</span>
                            </button>
                          ) : null}

                          <button
                            onClick={() => {
                              if (confirm(`حذف الحملة "${cmp.name}"؟`)) {
                                deleteCampaign(cmp.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
