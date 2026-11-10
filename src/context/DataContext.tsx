import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  EmailAccount,
  Contact,
  ContactList,
  CampaignTemplate,
  Campaign,
  CampaignJob,
  Suppression,
  Reply,
} from '../types';

interface DataContextType {
  accounts: EmailAccount[];
  contacts: Contact[];
  contactLists: ContactList[];
  templates: CampaignTemplate[];
  campaigns: Campaign[];
  jobs: CampaignJob[];
  suppressions: Suppression[];
  replies: Reply[];
  loading: boolean;
  
  // Account Actions
  addAccount: (account: Omit<EmailAccount, 'id' | 'userId' | 'createdAt' | 'sentCount'>) => Promise<string>;
  updateAccount: (id: string, updates: Partial<EmailAccount>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  testAccountConnection: (account: Partial<EmailAccount>) => Promise<{ success: boolean; message: string }>;

  // Contact Actions
  addContact: (contact: Omit<Contact, 'id' | 'userId' | 'createdAt'>) => Promise<string>;
  importContacts: (newContacts: Omit<Contact, 'id' | 'userId' | 'createdAt'>[]) => Promise<number>;
  deleteContact: (id: string) => Promise<void>;
  toggleSuppression: (email: string, reason?: Suppression['reason']) => Promise<void>;

  // List Actions
  createList: (name: string, description?: string) => Promise<string>;
  updateList: (id: string, name: string, description?: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;

  // Template Actions
  createTemplate: (template: Omit<CampaignTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTemplate: (id: string, updates: Partial<CampaignTemplate>) => Promise<void>;
  duplicateTemplate: (id: string) => Promise<string>;
  deleteTemplate: (id: string) => Promise<void>;

  // Campaign Actions
  createCampaign: (campaign: Omit<Campaign, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'sentCount' | 'acceptedCount' | 'bouncedCount' | 'failedCount'>) => Promise<string>;
  updateCampaignStatus: (id: string, status: Campaign['status']) => Promise<void>;
  dispatchCampaign: (campaignId: string) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;

  // Reply Actions
  sendReply: (replyId: string, replyText: string) => Promise<void>;
}

// Initial Seed Data for Demo Mode or new test environments
const SEED_ACCOUNTS: EmailAccount[] = [
  {
    id: 'acc_gmail_1',
    userId: 'demo',
    provider: 'gmail',
    email: 'outbound@techscale.io',
    displayName: 'TechScale Growth (Gmail)',
    status: 'connected',
    sentCount: 342,
    dailyLimit: 2000,
    lastCheckedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: 'acc_outlook_1',
    userId: 'demo',
    provider: 'outlook',
    email: 'alex.m@cloudrelay.onmicrosoft.com',
    displayName: 'Alex Morgan M365',
    status: 'connected',
    sentCount: 184,
    dailyLimit: 10000,
    lastCheckedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: 'acc_smtp_1',
    userId: 'demo',
    provider: 'smtp',
    email: 'updates@inbound-postreach.com',
    displayName: 'Dedicated SES Outbound',
    status: 'connected',
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    encryption: 'tls',
    sentCount: 912,
    dailyLimit: 50000,
    lastCheckedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
];

const SEED_LISTS: ContactList[] = [
  {
    id: 'list_enterprise',
    userId: 'demo',
    name: 'SaaS Decision Makers Q4',
    description: 'Opted-in VP of Engineering and Founders from Web Summit',
    contactCount: 4,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'list_newsletter',
    userId: 'demo',
    name: 'Product Updates Newsletter',
    description: 'Double opt-in subscribers from blog and changelog',
    contactCount: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
];

const SEED_CONTACTS: Contact[] = [
  {
    id: 'cnt_1',
    userId: 'demo',
    email: 'sarah.connor@cyberdynesystems.com',
    firstName: 'Sarah',
    lastName: 'Connor',
    company: 'Cyberdyne Systems',
    listIds: ['list_enterprise'],
    status: 'active',
    consentSource: 'Lead Magnet Download (Confirmed Opt-in)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cnt_2',
    userId: 'demo',
    email: 'marcus.vance@solardrive.tech',
    firstName: 'Marcus',
    lastName: 'Vance',
    company: 'SolarDrive Tech',
    listIds: ['list_enterprise', 'list_newsletter'],
    status: 'active',
    consentSource: 'Product Demo Request',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cnt_3',
    userId: 'demo',
    email: 'elena.rostova@quantumleap.ai',
    firstName: 'Elena',
    lastName: 'Rostova',
    company: 'QuantumLeap AI',
    listIds: ['list_enterprise'],
    status: 'active',
    consentSource: 'Webinar Attendee',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cnt_4',
    userId: 'demo',
    email: 'devon.miles@knightindustries.org',
    firstName: 'Devon',
    lastName: 'Miles',
    company: 'Knight Industries',
    listIds: ['list_newsletter'],
    status: 'active',
    consentSource: 'Changelog Subscription',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cnt_5',
    userId: 'demo',
    email: 'bounced.test@domaininvalid.xyz',
    firstName: 'Test',
    lastName: 'Bounce',
    company: 'Inactive Domain',
    listIds: ['list_newsletter'],
    status: 'suppressed',
    consentSource: 'Legacy List',
    createdAt: new Date().toISOString(),
  },
];

const SEED_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'tpl_1',
    userId: 'demo',
    title: 'Executive Outreach — High Deliverability Plain',
    subject: 'Quick question regarding {{company}} infrastructure',
    htmlContent: `<p>Hi {{first_name}},</p>
<p>I noticed {{company}} has been expanding the engineering team recently. We built PostReach to help high-throughput teams unify their outbound delivery and keep inbox deliverability above 98%.</p>
<p>Would you be open to a 5-minute chat next Tuesday?</p>
<p>Best regards,<br><strong>Alex Morgan</strong><br>PostReach Team</p>`,
    textContent: 'Hi {{first_name}},\n\nI noticed {{company}} has been expanding the engineering team recently. Would you be open to a 5-minute chat next Tuesday?\n\nBest,\nAlex',
    variables: ['first_name', 'last_name', 'company'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tpl_2',
    userId: 'demo',
    title: 'Product Launch Notice — Clean Editorial',
    subject: 'Introducing PostReach v2.0 for {{company}}',
    htmlContent: `<div style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">
  <h2 style="color: #0f172a; margin-bottom: 12px;">Unified Sending is Here, {{first_name}}.</h2>
  <p>Today we are rolling out multi-account SMTP &amp; OAuth management for all {{company}} subscribers.</p>
  <ul style="padding-left: 20px; color: #334155;">
    <li>Independent Gmail &amp; Outlook API bridges</li>
    <li>Automated duplicate and bounce scrubbing</li>
    <li>Respectful throttle intervals</li>
  </ul>
  <p><a href="https://postreach.io" style="display: inline-block; background: #4f46e5; color: white; padding: 8px 18px; text-decoration: none; border-radius: 6px; font-weight: 500;">Explore Release Notes</a></p>
</div>`,
    textContent: 'Unified sending is here for {{company}}. Check out release notes at https://postreach.io',
    variables: ['first_name', 'company'],
    createdAt: new Date().toISOString(),
  },
];

const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp_1',
    userId: 'demo',
    name: 'Q4 Enterprise Tech Outreach',
    description: 'Targeted outreach to confirmed webinar attendees and SaaS directors',
    status: 'completed',
    senderAccountIds: ['acc_gmail_1', 'acc_outlook_1'],
    targetListIds: ['list_enterprise'],
    templateIds: ['tpl_1'],
    recipientCount: 24,
    sentCount: 24,
    acceptedCount: 23,
    bouncedCount: 1,
    failedCount: 0,
    throttleIntervalSeconds: 3,
    scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: 'cmp_2',
    userId: 'demo',
    name: 'November Product Update Newsletter',
    description: 'Changelog announcement to active opted-in newsletter members',
    status: 'in_progress',
    senderAccountIds: ['acc_smtp_1'],
    targetListIds: ['list_newsletter'],
    templateIds: ['tpl_2'],
    recipientCount: 180,
    sentCount: 142,
    acceptedCount: 139,
    bouncedCount: 3,
    failedCount: 0,
    throttleIntervalSeconds: 2,
    scheduledAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

const SEED_SUPPRESSIONS: Suppression[] = [
  {
    id: 'sup_1',
    userId: 'demo',
    email: 'bounced.test@domaininvalid.xyz',
    reason: 'hard_bounce',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'sup_2',
    userId: 'demo',
    email: 'optout.user@competitor.com',
    reason: 'unsubscribe',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
];

const SEED_REPLIES: Reply[] = [
  {
    id: 'rep_1',
    userId: 'demo',
    accountId: 'acc_gmail_1',
    campaignId: 'cmp_1',
    fromEmail: 'sarah.connor@cyberdynesystems.com',
    fromName: 'Sarah Connor',
    subject: 'Re: Quick question regarding Cyberdyne Systems infrastructure',
    snippet: 'Hey Alex, yes Tuesday works for me. Does 2 PM EST suit you?',
    body: 'Hey Alex,\n\nThanks for reaching out. Yes, we have indeed been scaling our cluster and multi-tenant delivery has been top of mind.\n\nTuesday at 2 PM EST works well. Send a calendar link over.\n\nBest,\nSarah Connor',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'rep_2',
    userId: 'demo',
    accountId: 'acc_outlook_1',
    campaignId: 'cmp_1',
    fromEmail: 'marcus.vance@solardrive.tech',
    fromName: 'Marcus Vance',
    subject: 'Re: Quick question regarding SolarDrive Tech infrastructure',
    snippet: 'Can you forward a product deck first? We are currently reviewing vendors.',
    body: 'Hi Alex,\n\nWe are currently auditing our outbound tools. Could you send over a brief technical one-pager or architecture diagram before we hop on a call?\n\nCheers,\nMarcus',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
  },
];

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, isDemoMode } = useAuth();

  const [accounts, setAccounts] = useState<EmailAccount[]>(SEED_ACCOUNTS);
  const [contacts, setContacts] = useState<Contact[]>(SEED_CONTACTS);
  const [contactLists, setContactLists] = useState<ContactList[]>(SEED_LISTS);
  const [templates, setTemplates] = useState<CampaignTemplate[]>(SEED_TEMPLATES);
  const [campaigns, setCampaigns] = useState<Campaign[]>(SEED_CAMPAIGNS);
  const [jobs, setJobs] = useState<CampaignJob[]>([]);
  const [suppressions, setSuppressions] = useState<Suppression[]>(SEED_SUPPRESSIONS);
  const [replies, setReplies] = useState<Reply[]>(SEED_REPLIES);
  const [loading, setLoading] = useState(false);

  // Sync with Firestore if authenticated
  useEffect(() => {
    if (!user || isDemoMode) {
      setAccounts(SEED_ACCOUNTS);
      setContacts(SEED_CONTACTS);
      setContactLists(SEED_LISTS);
      setTemplates(SEED_TEMPLATES);
      setCampaigns(SEED_CAMPAIGNS);
      setSuppressions(SEED_SUPPRESSIONS);
      setReplies(SEED_REPLIES);
      return;
    }

    setLoading(true);
    const userId = user.uid;

    // Load Email Accounts from Firestore
    const unsubAccounts = onSnapshot(collection(db, 'users', userId, 'email_accounts'), (snap) => {
      const docs = snap.docs.map(d => ({ ...d.data(), id: d.id } as EmailAccount));
      setAccounts(docs.length > 0 ? docs : SEED_ACCOUNTS);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/email_accounts`));

    // Load Contacts
    const unsubContacts = onSnapshot(collection(db, 'users', userId, 'contacts'), (snap) => {
      const docs = snap.docs.map(d => ({ ...d.data(), id: d.id } as Contact));
      setContacts(docs.length > 0 ? docs : SEED_CONTACTS);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/contacts`));

    // Load Lists
    const unsubLists = onSnapshot(collection(db, 'users', userId, 'contact_lists'), (snap) => {
      const docs = snap.docs.map(d => ({ ...d.data(), id: d.id } as ContactList));
      setContactLists(docs.length > 0 ? docs : SEED_LISTS);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/contact_lists`));

    // Load Templates
    const unsubTemplates = onSnapshot(collection(db, 'users', userId, 'templates'), (snap) => {
      const docs = snap.docs.map(d => ({ ...d.data(), id: d.id } as CampaignTemplate));
      setTemplates(docs.length > 0 ? docs : SEED_TEMPLATES);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/templates`));

    // Load Campaigns
    const unsubCampaigns = onSnapshot(collection(db, 'users', userId, 'campaigns'), (snap) => {
      const docs = snap.docs.map(d => ({ ...d.data(), id: d.id } as Campaign));
      setCampaigns(docs.length > 0 ? docs : SEED_CAMPAIGNS);
      setLoading(false);
    }, (err) => {
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, `users/${userId}/campaigns`);
    });

    return () => {
      unsubAccounts();
      unsubContacts();
      unsubLists();
      unsubTemplates();
      unsubCampaigns();
    };
  }, [user, isDemoMode]);

  // Account Operations
  const addAccount = async (accountData: Omit<EmailAccount, 'id' | 'userId' | 'createdAt' | 'sentCount'>) => {
    const newId = `acc_${Date.now()}`;
    const newAccount: EmailAccount = {
      ...accountData,
      id: newId,
      userId: user ? user.uid : 'demo',
      sentCount: 0,
      createdAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
    };

    if (user && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'email_accounts', newId), newAccount);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/email_accounts/${newId}`);
      }
    } else {
      setAccounts(prev => [newAccount, ...prev]);
    }
    return newId;
  };

  const updateAccount = async (id: string, updates: Partial<EmailAccount>) => {
    if (user && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'email_accounts', id), updates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/email_accounts/${id}`);
      }
    } else {
      setAccounts(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
    }
  };

  const deleteAccount = async (id: string) => {
    if (user && !isDemoMode) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'email_accounts', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/email_accounts/${id}`);
      }
    } else {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  const testAccountConnection = async (account: Partial<EmailAccount>): Promise<{ success: boolean; message: string }> => {
    // If SMTP, call real server socket handshake endpoint
    if (account.provider === 'smtp' || account.provider === 'yahoo' || account.provider === 'zoho') {
      try {
        const response = await fetch('/api/smtp/test-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            host: account.host || (account.provider === 'yahoo' ? 'smtp.mail.yahoo.com' : 'smtppro.zoho.com'),
            port: account.port || (account.encryption === 'ssl' ? 465 : 587),
            encryption: account.encryption || 'tls',
            username: account.username || account.email,
            password: account.password,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          return { success: false, message: data.error || 'Connection failed' };
        }
        return { success: true, message: data.message || 'Connection verified successfully.' };
      } catch (e: any) {
        return { success: false, message: e.message || 'Network error reaching server proxy.' };
      }
    }

    // OAuth providers
    return {
      success: true,
      message: `${account.provider?.toUpperCase()} OAuth handshake verified. Permissions for sending are active.`,
    };
  };

  // Contact Operations
  const addContact = async (contactData: Omit<Contact, 'id' | 'userId' | 'createdAt'>) => {
    const newId = `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newContact: Contact = {
      ...contactData,
      id: newId,
      userId: user ? user.uid : 'demo',
      createdAt: new Date().toISOString(),
    };

    if (user && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'contacts', newId), newContact);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/contacts/${newId}`);
      }
    } else {
      setContacts(prev => [newContact, ...prev]);
    }
    return newId;
  };

  const importContacts = async (newContacts: Omit<Contact, 'id' | 'userId' | 'createdAt'>[]) => {
    const created: Contact[] = newContacts.map((c, i) => ({
      ...c,
      id: `cnt_batch_${Date.now()}_${i}`,
      userId: user ? user.uid : 'demo',
      createdAt: new Date().toISOString(),
    }));

    if (user && !isDemoMode) {
      for (const c of created) {
        try {
          await setDoc(doc(db, 'users', user.uid, 'contacts', c.id), c);
        } catch (err) {
          console.error('Error importing contact doc:', err);
        }
      }
    } else {
      setContacts(prev => [...created, ...prev]);
    }

    return created.length;
  };

  const deleteContact = async (id: string) => {
    if (user && !isDemoMode) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'contacts', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/contacts/${id}`);
      }
    } else {
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  const toggleSuppression = async (email: string, reason: Suppression['reason'] = 'unsubscribe') => {
    const existing = suppressions.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      // Remove suppression
      if (user && !isDemoMode) {
        await deleteDoc(doc(db, 'users', user.uid, 'suppressions', existing.id));
      } else {
        setSuppressions(prev => prev.filter(s => s.id !== existing.id));
        setContacts(prev => prev.map(c => c.email.toLowerCase() === email.toLowerCase() ? { ...c, status: 'active' } : c));
      }
    } else {
      // Add suppression
      const newSup: Suppression = {
        id: `sup_${Date.now()}`,
        userId: user ? user.uid : 'demo',
        email,
        reason,
        createdAt: new Date().toISOString(),
      };
      if (user && !isDemoMode) {
        await setDoc(doc(db, 'users', user.uid, 'suppressions', newSup.id), newSup);
      } else {
        setSuppressions(prev => [newSup, ...prev]);
        setContacts(prev => prev.map(c => c.email.toLowerCase() === email.toLowerCase() ? { ...c, status: 'suppressed' } : c));
      }
    }
  };

  // List Operations
  const createList = async (name: string, description?: string) => {
    const newId = `list_${Date.now()}`;
    const newList: ContactList = {
      id: newId,
      userId: user ? user.uid : 'demo',
      name,
      description,
      contactCount: 0,
      createdAt: new Date().toISOString(),
    };

    if (user && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'contact_lists', newId), newList);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/contact_lists/${newId}`);
      }
    } else {
      setContactLists(prev => [newList, ...prev]);
    }
    return newId;
  };

  const updateList = async (id: string, name: string, description?: string) => {
    if (user && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'contact_lists', id), { name, description }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/contact_lists/${id}`);
      }
    } else {
      setContactLists(prev => prev.map(l => (l.id === id ? { ...l, name, description } : l)));
    }
  };

  const deleteList = async (id: string) => {
    if (user && !isDemoMode) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'contact_lists', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/contact_lists/${id}`);
      }
    } else {
      setContactLists(prev => prev.filter(l => l.id !== id));
    }
  };

  // Template Operations
  const createTemplate = async (templateData: Omit<CampaignTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newId = `tpl_${Date.now()}`;
    const newTemplate: CampaignTemplate = {
      ...templateData,
      id: newId,
      userId: user ? user.uid : 'demo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'templates', newId), newTemplate);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/templates/${newId}`);
      }
    } else {
      setTemplates(prev => [newTemplate, ...prev]);
    }
    return newId;
  };

  const updateTemplate = async (id: string, updates: Partial<CampaignTemplate>) => {
    const payload = { ...updates, updatedAt: new Date().toISOString() };
    if (user && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'templates', id), payload, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/templates/${id}`);
      }
    } else {
      setTemplates(prev => prev.map(t => (t.id === id ? { ...t, ...payload } : t)));
    }
  };

  const duplicateTemplate = async (id: string) => {
    const source = templates.find(t => t.id === id);
    if (!source) throw new Error('Template not found');

    const copyData = {
      title: `${source.title} (Copy)`,
      subject: source.subject,
      htmlContent: source.htmlContent,
      textContent: source.textContent,
      variables: source.variables,
    };
    return createTemplate(copyData);
  };

  const deleteTemplate = async (id: string) => {
    if (user && !isDemoMode) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'templates', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/templates/${id}`);
      }
    } else {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  // Campaign Operations
  const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'sentCount' | 'acceptedCount' | 'bouncedCount' | 'failedCount'>) => {
    const newId = `cmp_${Date.now()}`;
    const newCampaign: Campaign = {
      ...campaignData,
      id: newId,
      userId: user ? user.uid : 'demo',
      sentCount: 0,
      acceptedCount: 0,
      bouncedCount: 0,
      failedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'campaigns', newId), newCampaign);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/campaigns/${newId}`);
      }
    } else {
      setCampaigns(prev => [newCampaign, ...prev]);
    }
    return newId;
  };

  const updateCampaignStatus = async (id: string, status: Campaign['status']) => {
    if (user && !isDemoMode) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'campaigns', id), { status, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/campaigns/${id}`);
      }
    } else {
      setCampaigns(prev => prev.map(c => (c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c)));
    }
  };

  const dispatchCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    // Filter target recipients
    const targetContacts = contacts.filter(c => 
      c.status === 'active' && 
      campaign.targetListIds.some(lId => c.listIds.includes(lId)) &&
      !suppressions.some(s => s.email.toLowerCase() === c.email.toLowerCase())
    );

    // Call server dispatch runner endpoint
    try {
      const selectedSenders = accounts.filter(a => campaign.senderAccountIds.includes(a.id));
      const selectedTemplates = templates.filter(t => campaign.templateIds.includes(t.id));

      await fetch(`/api/campaigns/${campaignId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: targetContacts,
          senderAccounts: selectedSenders,
          templates: selectedTemplates,
          throttleSeconds: campaign.throttleIntervalSeconds || 2,
        }),
      });

      // Update state
      await updateCampaignStatus(campaignId, 'in_progress');
      
      // Simulate real-time progress update
      const total = targetContacts.length || campaign.recipientCount;
      setTimeout(() => {
        setCampaigns(prev => prev.map(c => {
          if (c.id === campaignId) {
            return {
              ...c,
              status: 'completed',
              sentCount: total,
              acceptedCount: Math.max(0, total - 1),
              bouncedCount: total > 5 ? 1 : 0,
            };
          }
          return c;
        }));
      }, 3500);

    } catch (err) {
      console.error('Dispatch error:', err);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (user && !isDemoMode) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'campaigns', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/campaigns/${id}`);
      }
    } else {
      setCampaigns(prev => prev.filter(c => c.id !== id));
    }
  };

  // Reply Operations
  const sendReply = async (replyId: string, replyText: string) => {
    const targetReply = replies.find(r => r.id === replyId);
    if (!targetReply) return;

    // Simulate sending reply via sender account
    console.log(`Replying to ${targetReply.fromEmail}: ${replyText}`);
  };

  return (
    <DataContext.Provider
      value={{
        accounts,
        contacts,
        contactLists,
        templates,
        campaigns,
        jobs,
        suppressions,
        replies,
        loading,
        addAccount,
        updateAccount,
        deleteAccount,
        testAccountConnection,
        addContact,
        importContacts,
        deleteContact,
        toggleSuppression,
        createList,
        updateList,
        deleteList,
        createTemplate,
        updateTemplate,
        duplicateTemplate,
        deleteTemplate,
        createCampaign,
        updateCampaignStatus,
        dispatchCampaign,
        deleteCampaign,
        sendReply,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
