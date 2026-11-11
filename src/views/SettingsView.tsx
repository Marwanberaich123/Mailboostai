import React, { useState } from 'react';
import {
  User,
  Shield,
  Sliders,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND_CONFIG } from '../config/brand';
import { useData } from '../context/DataContext';

export function SettingsView() {
  const { userProfile, logout } = useAuth();
  const { accounts } = useData();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || 'المالك');
  const [defaultThrottle, setDefaultThrottle] = useState(3);
  const [defaultSenderId, setDefaultSenderId] = useState(accounts[0]?.id || '');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-right">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          الإعدادات الشخصية والتهيئة
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
          إدارة الملف الشخصي، الفواصل الزمنية الافتراضية، والحساب الافتراضي للإرسال.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>تم حفظ تفضيلات الإرسال بنجاح.</span>
        </div>
      )}

      {/* بطاقة المالك */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" />
          <span>الملف الشخصي للمالك</span>
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
            <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white block">
              {userProfile?.displayName || displayName}
            </span>
            <span className="text-xs text-slate-500 font-mono block" dir="ltr">
              {userProfile?.email || 'admin@postreach.io'}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
              {BRAND_CONFIG.name} · وصول كامل ولامحدود (المالك الوحيد)
            </span>
          </div>
        </div>
      </div>

      {/* تفضيلات الإرسال */}
      <form onSubmit={handleSavePreferences} className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span>تفضيلات الإرسال التلقائي</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              الفاصل الزمني الافتراضي بين كل رسالة
            </label>
            <select
              value={defaultThrottle}
              onChange={(e) => setDefaultThrottle(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value={1}>ثانية واحدة (للخوادم المخصصة عالية السمعة)</option>
              <option value={2}>ثانيتان (المعدل القياسي الموصى به)</option>
              <option value={3}>3 ثوانٍ (آمن ومستقر جداً)</option>
              <option value={5}>5 ثوانٍ (لحسابات Gmail و Outlook المجانية)</option>
              <option value={10}>10 ثوانٍ (إحماء الحسابات الجديدة - Warmup)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              الحساب الافتراضي المفضل
            </label>
            <select
              value={defaultSenderId}
              onChange={(e) => setDefaultSenderId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              {accounts.length === 0 ? (
                <option value="">لا توجد حسابات متصلة حالياً</option>
              ) : (
                accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.displayName || acc.email} ({acc.provider.toUpperCase()})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            نص التذييل التلقائي لإلغاء الاشتراك
          </label>
          <textarea
            rows={2}
            readOnly
            value="لقد استلمت هذه الرسالة بموافقة سابقة. يمكنك إلغاء الاشتراك في أي وقت بالرد على هذه الرسالة بكلمة إلغاء."
            className="w-full p-2.5 text-xs bg-slate-100 dark:bg-slate-850 text-slate-500 rounded-lg border border-slate-200 dark:border-slate-700"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
          >
            حفظ التفضيلات
          </button>
        </div>
      </form>

      {/* جلسة العمل */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>أمان الجلسة الحالي</span>
        </h2>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">
              جلسة العمل النشطة
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              متصل الآن · جلسة آمنة
            </span>
          </div>
          <span className="text-emerald-600 font-bold font-mono text-[11px]">نشط الآن</span>
        </div>

        <div className="pt-2">
          <button
            onClick={logout}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج من المنصة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
