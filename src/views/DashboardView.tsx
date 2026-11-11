import React from 'react';
import {
  MailCheck,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  PlusCircle,
  FolderPlus,
  Play,
  Pause,
  Layers,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { NavigationTab } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const { accounts, campaigns, contacts, suppressions, updateCampaignStatus } = useData();

  // إحصائيات حقيقية بالكامل تبدأ من الصفر
  const totalSent = campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
  const totalAccepted = campaigns.reduce((acc, c) => acc + (c.acceptedCount || 0), 0);
  const totalBounced = campaigns.reduce((acc, c) => acc + (c.bouncedCount || 0), 0);
  const activeAccounts = accounts.filter(a => a.status === 'connected');

  const acceptanceRate = totalSent > 0 ? ((totalAccepted / totalSent) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* عنوان الصفحة والإجراءات السريعة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            لوحة المتابعة وقابلية الوصول
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            متابعة حالة الإرسال الفعلي لجميع حساباتك، والحملات النشطة، وقوائم المشتركين لحظياً.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('accounts')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
          >
            إدارة الحسابات ({accounts.length})
          </button>
          <button
            onClick={() => onNavigate('create-campaign')}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>إطلاق حملة</span>
          </button>
        </div>
      </div>

      {/* بطاقات الإحصائيات الأربع (صفرية نقية حتى تبدأ الحملات فعلياً) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* الحسابات المتصلة */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 text-xs font-medium">
            <span>حسابات الإرسال النشطة</span>
            <MailCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {activeAccounts.length}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              / {accounts.length} حساب
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {accounts.length === 0 ? 'لم يتم ربط أي حساب بعد' : 'جاهزة للإرسال المتوازن'}
          </div>
        </div>

        {/* إجمالي الرسائل المرسلة فعلياً */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 text-xs font-medium">
            <span>إجمالي الرسائل المرسلة</span>
            <Send className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {totalSent}
            </span>
            <span className="text-xs text-slate-500">رسالة</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>عبر {campaigns.length} حملة</span>
          </div>
        </div>

        {/* قبول الخوادم 250 OK */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 text-xs font-medium">
            <span>القبول من الخوادم (250 OK)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {acceptanceRate}%
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              ({totalAccepted})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>الردود الإيجابية المؤكدة</span>
          </div>
        </div>

        {/* الارتدادات والاستبعاد */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 text-xs font-medium">
            <span>المستبعدين والارتدادات</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {suppressions.length}
            </span>
            <span className="text-xs text-slate-500">عنوان</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>{totalBounced} ارتداد تم حظره تلقائياً</span>
          </div>
        </div>
      </div>

      {/* دليل البدء السريع عندما تكون الحسابات فارغة */}
      {accounts.length === 0 && (
        <div className="p-6 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 rounded-2xl border border-indigo-200/70 dark:border-indigo-900/60 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                ابدأ تشغيل منصتك الشخصية بخطوات بسيطة
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                منصتك جاهزة للاستخدام اللامحدود، اتبع الخطوات التالية لبدء الإرسال الفعلي:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div
              onClick={() => onNavigate('accounts')}
              className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition-colors group"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>1. ربط حساب إرسال</span>
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:-translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                اربط بريد Gmail عبر API أو Outlook أو خادم SMTP أو مفتاح سحابي.
              </p>
            </div>

            <div
              onClick={() => onNavigate('contacts')}
              className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition-colors group"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>2. إضافة المستلمين أو CSV</span>
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:-translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                استورد جهات اتصالك المصرح بها مع تنظيف العناوين المكررة تلقائياً.
              </p>
            </div>

            <div
              onClick={() => onNavigate('create-campaign')}
              className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition-colors group"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>3. إطلاق الحملة البريدية</span>
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:-translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                خصص المحتوى وحدد الفاصل الزمني بين الرسائل لحماية سمعة الإرسال.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* جدول الحملات الحديثة */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              الحملات البريدية المنفذة
            </h2>
            <p className="text-xs text-slate-500">
              متابعة الإرسال الفعلي، الاستجابات، وحالات التسليم
            </p>
          </div>
          {campaigns.length > 0 && (
            <button
              onClick={() => onNavigate('campaigns')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              عرض الكل ({campaigns.length})
            </button>
          )}
        </div>

        {campaigns.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Send className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              لا توجد حملات منشأة حتى الآن
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              أنشئ حملتك الأولى وخصص الرسائل للمستلمين لتظهر نتائج الإرسال الفعلية هنا.
            </p>
            <button
              onClick={() => onNavigate('create-campaign')}
              className="mt-2 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg inline-flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>إنشاء حملة الآن</span>
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
                  <th className="py-3 px-4 font-semibold text-left">التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {campaigns.slice(0, 5).map((cmp) => (
                  <tr key={cmp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {cmp.name}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                        {cmp.description || 'حملة بريدية مباشرة'}
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
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">متوقفة مؤقتاً</span>
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
                      {cmp.status === 'in_progress' ? (
                        <button
                          onClick={() => updateCampaignStatus(cmp.id, 'paused')}
                          className="px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded inline-flex items-center gap-1"
                        >
                          <Pause className="w-3 h-3" />
                          <span>إيقاف</span>
                        </button>
                      ) : cmp.status === 'paused' ? (
                        <button
                          onClick={() => updateCampaignStatus(cmp.id, 'in_progress')}
                          className="px-2 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded inline-flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>استئناف</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate('analytics')}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          التقرير
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
