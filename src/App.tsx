import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Shell } from './components/layout/Shell';
import { AuthModal } from './components/auth/AuthModal';
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
import { BillingView } from './views/BillingView';
import { SettingsView } from './views/SettingsView';
import { HelpCenterView } from './views/HelpCenterView';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, isDemoMode, loading } = useAuth();

  // Test Firestore connection on boot
  useEffect(() => {
    testConnection().then((success) => {
      if (success) {
        console.log('✅ Connected to Cloud Firestore.');
      }
    });
  }, []);

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
      case 'billing':
        return <BillingView />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <HelpCenterView />;
      default:
        return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm animate-pulse">
            PR
          </div>
          <span className="text-xs font-mono">Initializing PostReach engine...</span>
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
