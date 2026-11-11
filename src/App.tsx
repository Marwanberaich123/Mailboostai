import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Shell } from './components/layout/Shell';
import { AuthModal } from './components/auth/AuthModal';
import { PlatformLockScreen } from './components/security/PlatformLockScreen';
import { NavigationTab } from './types';
import { testConnection } from './lib/firebase';

// Views
import { DashboardView } from './views/DashboardView';
import { EmailAccountsView } from './views/EmailAccountsView';
import { ContactsView } from './views/ContactsView';
import { ContactListsView } from './views/ContactListsView';
import { CampaignsListView } from './views/CampaignsListView';
import { CampaignWizardView } from './views/CampaignWizardView';
import { TemplatesView } from './views/TemplatesView';
import { ScheduledQueueView } from './views/ScheduledQueueView';
import { RepliesInboxView } from './views/RepliesInboxView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { HelpCenterView } from './views/HelpCenterView';

function AppContent() {
  // حالة قفل المنصة - مقفلة افتراضياً حتى إدخال الكود 112113114
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('postreach_access_unlocked') === 'true';
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, isDemoMode, loading } = useAuth();

  // فحص الاتصال بقاعدة البيانات عند بدء التشغيل
  useEffect(() => {
    testConnection().then((success) => {
      if (success) {
        console.log('✅ تم الاتصال بقاعدة بيانات Cloud Firestore بنجاح.');
      }
    });
  }, []);

  const handleLockPlatform = () => {
    localStorage.removeItem('postreach_access_unlocked');
    setIsUnlocked(false);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveTab} />;
      case 'accounts':
        return <EmailAccountsView />;
      case 'contacts':
        return <ContactsView />;
      case 'lists':
        return <ContactListsView />;
      case 'campaigns':
        return <CampaignsListView onNavigate={setActiveTab} />;
      case 'create-campaign':
        return <CampaignWizardView onNavigate={setActiveTab} />;
      case 'templates':
        return <TemplatesView />;
      case 'scheduled':
        return <ScheduledQueueView />;
      case 'replies':
        return <RepliesInboxView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <HelpCenterView />;
      default:
        return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  // شاشة القفل المحمية برمز الأمان
  if (!isUnlocked) {
    return <PlatformLockScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-sans" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm animate-pulse">
            PR
          </div>
          <span className="text-xs font-semibold">جاري تهيئة منصة بوست ريتش...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Shell
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLockPlatform={handleLockPlatform}
      >
        {renderActiveView()}
      </Shell>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
