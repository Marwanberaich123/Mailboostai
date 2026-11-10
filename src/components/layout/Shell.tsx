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
  CreditCard,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  LogOut,
  LogIn,
  Menu,
  X,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BRAND_CONFIG } from '../../config/brand';
import { NavigationTab } from '../../types';

interface ShellProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAuthModal: () => void;
  children: React.ReactNode;
}

export function Shell({ activeTab, onSelectTab, onOpenAuthModal, children }: ShellProps) {
  const { user, userProfile, isDemoMode, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Email Accounts', icon: MailCheck },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'lists', label: 'Contact Lists', icon: FolderKanban },
    { id: 'campaigns', label: 'Campaigns', icon: Send },
    { id: 'create-campaign', label: 'Create Campaign', icon: PlusCircle, isAction: true },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'scheduled', label: 'Scheduled Queue', icon: Clock },
    { id: 'replies', label: 'Replies', icon: Inbox },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help Center', icon: HelpCircle },
  ] as const;

  const currentPlan = BRAND_CONFIG.plans.find(p => p.id === userProfile?.plan) || BRAND_CONFIG.plans[0];

  const handleNavClick = (tabId: NavigationTab) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 select-none">
        {/* Brand Lockup */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              PR
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white block leading-tight">
                {BRAND_CONFIG.name}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 block">
                Multi-Provider SaaS
              </span>
            </div>
          </button>
        </div>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="mx-4 mt-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-medium block">Interactive Demo Mode</span>
              <button
                onClick={onOpenAuthModal}
                className="underline text-[11px] hover:text-amber-800 dark:hover:text-amber-300 mt-0.5 inline-block"
              >
                Sign in with Google
              </button>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as NavigationTab)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors text-left ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.id === 'create-campaign' && (
                  <span className="ml-auto text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Footing */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-medium text-xs shrink-0">
                  {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-xs font-medium text-slate-900 dark:text-white truncate block">
                  {userProfile?.displayName || 'User'}
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate block">
                  {currentPlan.name}
                </span>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {user || isDemoMode ? (
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar Contract (3-Zone Header) */}
        <header className="h-16 flex items-center justify-between gap-8 px-4 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          {/* Zone 1: Brand wordmark or contextual breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                {activeTab.replace('-', ' ')}
              </span>
              <span className="text-slate-400">/</span>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                {BRAND_CONFIG.name}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => handleNavClick('accounts')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
            >
              Accounts
            </button>
            <button
              onClick={() => handleNavClick('contacts')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
            >
              Recipients
            </button>
            <button
              onClick={() => handleNavClick('campaigns')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
            >
              Dispatches
            </button>
            <button
              onClick={() => handleNavClick('analytics')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
            >
              Deliverability
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {activeTab !== 'create-campaign' && (
              <button
                onClick={() => handleNavClick('create-campaign')}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Campaign</span>
              </button>
            )}

            {!user && !isDemoMode && (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-xs bg-white dark:bg-slate-900 h-full flex flex-col p-4 shadow-xl z-10 border-r border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-2">
                <span className="font-bold text-base text-slate-900 dark:text-white">
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
                      className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md text-left ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
