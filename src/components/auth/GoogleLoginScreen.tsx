import React, { useState } from 'react';
import { ShieldCheck, Database, Mail, Lock, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BRAND_CONFIG } from '../../config/brand';

interface GoogleLoginScreenProps {
  onLockPlatform?: () => void;
}

export function GoogleLoginScreen({ onLockPlatform }: GoogleLoginScreenProps) {
  const { signInWithGoogle, error, clearError } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    clearError();
    try {
      await signInWithGoogle();
    } catch (e) {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-4 sm:p-6 transition-colors"
      dir="rtl"
    >
      {/* الشريط العلوي */}
      <header className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            PR
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block leading-tight">
              {BRAND_CONFIG.name}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              منصة الإرسال الموحدة وحفظ السحابي
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onLockPlatform && (
            <button
              onClick={onLockPlatform}
              title="قفل المنصة برمز الأمان"
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">قفل المنصة</span>
            </button>
          )}
          <button
            onClick={toggleTheme}
            title="تبديل المظهر"
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* بطاقة تسجيل الدخول المركزية */}
      <main className="flex-1 flex items-center justify-center my-8">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-right space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 mx-auto flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 shadow-xs">
              <Database className="w-6 h-6" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              تسجيل الدخول إلى {BRAND_CONFIG.name}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              سجّل دخولك بواسطة حساب Google للوصول إلى قاعدة بياناتك وحفظ حساباتك وحملاتك السحابية.
            </p>
          </div>

          {error && (
            <div className="p-3.5 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl leading-relaxed">
              {error}
            </div>
          )}

          {/* زر Google الرسمي المخصص */}
          <button
            type="button"
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 shadow-sm hover:shadow transition-all hover:border-indigo-400 group cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>جاري تسجيل الدخول عبر Google...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-sm font-bold">المتابعة وتسجيل الدخول عبر Google</span>
              </>
            )}
          </button>

          {/* مزايا الربط السحابي مع Firebase */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <Database className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>مزامنة سحابية حية مع Cloud Firestore</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>عزل تام ومحمي للبيانات لكل مستخدم على حدة</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <Mail className="w-4 h-4 text-amber-500 shrink-0" />
              <span>إرسال غير مقيد بدون أي اشتراكات أو مدفوعات</span>
            </div>
          </div>
        </div>
      </main>

      {/* التذييل */}
      <footer className="text-center text-[11px] text-slate-500 dark:text-slate-400 py-2">
        <span>المنصة محمية وموثوقة • اتصال مشفر • رمز المنصة: 112113114</span>
      </footer>
    </div>
  );
}
