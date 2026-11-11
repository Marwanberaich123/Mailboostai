import React, { useState, useEffect } from 'react';
import { Lock, ArrowLeft, ShieldCheck, KeyRound, Eye, EyeOff } from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brand';

interface PlatformLockScreenProps {
  onUnlock: () => void;
}

const SECRET_ACCESS_CODE = '112113114';

export function PlatformLockScreen({ onUnlock }: PlatformLockScreenProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCode, setShowCode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === SECRET_ACCESS_CODE) {
      setError(false);
      localStorage.setItem('postreach_access_unlocked', 'true');
      onUnlock();
    } else {
      setError(true);
      setErrorMessage('كود الأمان غير صحيح. الوصول مقصور على المالك المصرح له فقط.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100 font-sans select-none"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-slate-850/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-right">
        {/* أيقونة القفل والشعار */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              {BRAND_CONFIG.name} — الوصول محمي
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              المنصة مخصصة للمالك فقط. يرجى إدخال كود الأمان لفتح لوحة التحكم.
            </p>
          </div>
        </div>

        {/* نموذج إدخال الكود */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              كود الدخول السري للمنصة:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
              <input
                type={showCode ? 'text' : 'password'}
                autoFocus
                required
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="أدخل كود الأمان..."
                className={`w-full pr-9 pl-10 py-2.5 text-sm bg-slate-950 border rounded-xl text-white font-mono tracking-widest focus:outline-hidden focus:ring-2 transition-all ${
                  error
                    ? 'border-rose-500 focus:ring-rose-500/40 text-rose-300'
                    : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/30'
                }`}
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute left-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                title={showCode ? 'إخفاء الرمز' : 'إظهار الرمز'}
              >
                {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <span className="text-[11px] text-rose-400 font-semibold block mt-1.5">
                {errorMessage}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>فتح المنصة والدخول</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>منصة شخصية مؤمنة ومغلقة بالكامل</span>
        </div>
      </div>
    </div>
  );
}
