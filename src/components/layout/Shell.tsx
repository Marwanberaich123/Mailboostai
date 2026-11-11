import React, { useState } from 'react';
import {
  LayoutDashboard,
  MailCheck,
  Users,
  FolderKanban,
  Send,
  PlusCircle,
  FileText,
  Clock,
  Inbox,
  BarChart3,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  LogOut,
  LogIn,
  Menu,
  X,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BRAND_CONFIG } from '../../config/brand';
import { NavigationTab } from '../../types';

interface ShellProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAuthModal: () => void;
  onLockPlatform?: () => void;
  children: React.ReactNode;
}

export function Shell({ activeTab, onSelectTab, onOpenAuthModal, onLockPlatform, children }: ShellProps) {
  const { user, userProfile, isDemoMode, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // قائمة التنقل باللغة العربية
  const navigationItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'accounts', label: 'حسابات الإرسال (API / الدخول)', icon: MailCheck },
    { id: 'contacts', label: 'المشتركون والمستلمون', icon: Users },
    { id: 'lists', label: 'قوائم الجمهور', icon: FolderKanban },
    { id: 'campaigns', label: 'الحملات البريدية', icon: Send },
    { id: 'create-campaign', label: 'إنشاء حملة جديدة', icon: PlusCircle, isAction: true },
    { id: 'templates', label: 'قوالب الرسائل', icon: FileText },
    { id: 'scheduled', label: 'سجل وطابور الإرسال', icon: Clock },
    { id: 'replies', label: 'الردود والوارد', icon: Inbox },
    { id: 'analytics', label: 'التحليلات والوصول', icon: BarChart3 },
    { id: 'settings', label: 'الإعدادات الشخصية', icon: Settings },
    { id: 'help', label: 'دليل ربط الحسابات و API', icon: HelpCircle },
  ] as const;

  const handleNavClick = (tabId: NavigationTab) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans" dir="rtl">
      {/* القائمة الجانبية للشاشات الكبيرة */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 select-none">
        {/* شعار المنصة */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 gap-3">
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 text-right group w-full"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
              PR
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block leading-tight truncate">
                {BRAND_CONFIG.name}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                منصة الإرسال الموحدة
              </span>
            </div>
          </button>
        </div>

        {/* شارة الاستخدام الشخصي المفتوح */}
        <div className="mx-3 mt-3 p-2 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 rounded-md text-[11px] text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="truncate">نسخة شخصية كاملة مجانية</span>
        </div>

        {/* عناصر القائمة الجانبية */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as NavigationTab)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors text-right ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate flex-1">{item.label}</span>
                {item.id === 'create-campaign' && (
                  <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-mono font-normal">
                    جديد
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* بطاقة المستخدم والتحكم في المظهر وزر القفل */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName}
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                  {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'أ'}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                  {userProfile?.displayName || 'المالك'}
                </span>
                <span className="text-[10px] text-slate-500 truncate block">
                  وصول محمي بالكود
                </span>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              title="تبديل المظهر الليلي/النهاري"
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {onLockPlatform && (
              <button
                onClick={onLockPlatform}
                title="قفل المنصة برمز الأمان"
                className="py-1.5 px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                <span>قفل</span>
              </button>
            )}

            {user || isDemoMode ? (
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>دخول</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* منطقة المحتوى الرئيسية */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* الشريط العلوي */}
        <header className="h-16 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="font-bold text-slate-900 dark:text-white">
                {navigationItems.find(n => n.id === activeTab)?.label || 'لوحة التحكم'}
              </span>
              <span className="text-slate-400">/</span>
              <span className="text-xs text-slate-500 font-mono">
                {BRAND_CONFIG.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {onLockPlatform && (
              <button
                onClick={onLockPlatform}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap"
                title="إعادة قفل المنصة"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">قفل المنصة</span>
              </button>
            )}

            {activeTab !== 'create-campaign' && (
              <button
                onClick={() => handleNavClick('create-campaign')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>حملة جديدة</span>
              </button>
            )}

            {!user && !isDemoMode && (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
              >
                دخول
              </button>
            )}
          </div>
        </header>

        {/* القائمة المنسدلة للشاشات الصغيرة */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-xs bg-white dark:bg-slate-900 h-full flex flex-col p-4 shadow-xl z-10 border-l border-slate-200 dark:border-slate-800 text-right">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {BRAND_CONFIG.name}
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1">
                {navigationItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id as NavigationTab)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md text-right ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {onLockPlatform && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 mt-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLockPlatform();
                    }}
                    className="w-full py-2 px-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>قفل المنصة برمز الأمان</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* محتوى الشاشة */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
