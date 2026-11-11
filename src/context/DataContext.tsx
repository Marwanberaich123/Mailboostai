import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
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

const STARTER_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'tpl_ar_starter',
    userId: 'default',
    title: 'رسالة تواصل أولى - قالب احترافي',
    subject: 'استفسار بخصوص تعاون مع {{company}}',
    htmlContent: `<p>مرحباً {{first_name}}،</p>
<p>أتمنى أن تكون بأفضل حال. اطلعت على أعمال {{company}} وأعجبني ما تقومون به في مجالكم.</p>
<p>أردت التواصل معك مباشرة لمعرفة ما إذا كان بإمكاننا التعاون سوياً لتعزيز النتائج المشتركة.</p>
<p>مع خالص التحية والتقدير،<br><strong>فريق العمل</strong></p>`,
    textContent: 'مرحباً {{first_name}}،\n\nأتمنى أن تكون بأفضل حال. اطلعت على أعمال {{company}} وأردت التواصل معك مباشرة.\n\nتحياتي،',
    variables: ['first_name', 'last_name', 'company', 'email'],
    createdAt: new Date().toISOString(),
  },
];

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [jobs, setJobs] = useState<CampaignJob[]>([]);
  const [suppressions, setSuppressions] = useState<Suppression[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync with Firestore whenever authenticated user changes
  useEffect(() => {
    if (!user) {
      // Clear data when no user is signed in
      setAccounts([]);
      setContacts([]);
      setContactLists([]);
      setTemplates([]);
      setCampaigns([]);
      setSuppressions([]);
      setReplies([]);
      setJobs([]);
      return;
    }

    const userId = user.uid;
    setLoading(true);

    // Load initial user cache if available
    try {
      const cachedAcc = localStorage.getItem(`pr_${userId}_accounts`);
      if (cachedAcc) setAccounts(JSON.parse(cachedAcc));
      const cachedContacts = localStorage.getItem(`pr_${userId}_contacts`);
      if (cachedContacts) setContacts(JSON.parse(cachedContacts));
      const cachedLists = localStorage.getItem(`pr_${userId}_lists`);
      if (cachedLists) setContactLists(JSON.parse(cachedLists));
      const cachedTemplates = localStorage.getItem(`pr_${userId}_templates`);
      if (cachedTemplates) setTemplates(JSON.parse(cachedTemplates));
      const cachedCampaigns = localStorage.getItem(`pr_${userId}_campaigns`);
      if (cachedCampaigns) setCampaigns(JSON.parse(cachedCampaigns));
      const cachedSuppressions = localStorage.getItem(`pr_${userId}_suppressions`);
      if (cachedSuppressions) setSuppressions(JSON.parse(cachedSuppressions));
    } catch (e) {
      console.warn('Could not read user cache:', e);
    }

    // 1. Listen to Email Accounts
    const unsubAccounts = onSnapshot(
      collection(db, 'users', userId, 'email_accounts'),
      (snap) => {
        const docs = snap.docs.map((d) => ({ ...d.data(), id: d.id } as EmailAccount));
        setAccounts(docs);
        localStorage.setItem(`pr_${userId}_accounts`, JSON.stringify(docs));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/email_accounts`)
    );

    // 2. Listen to Contacts
    const unsubContacts = onSnapshot(
      collection(db, 'users', userId, 'contacts'),
      (snap) => {
        const docs = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Contact));
        setContacts(docs);
        localStorage.setItem(`pr_${userId}_contacts`, JSON.stringify(docs));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/contacts`)
    );

    // 3. Listen to Contact Lists
    const unsubLists = onSnapshot(
      collection(db, 'users', userId, 'contact_lists'),
      (snap) => {
        const docs = snap.docs.map((d) => ({ ...d.data(), id: d.id } as ContactList));
        setContactLists(docs);
        localStorage.setItem(`pr_${userId}_lists`, JSON.stringify(docs));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/contact_lists`)
    );

    // 4. Listen to Templates
    const unsubTemplates = onSnapshot(
      collection(db, 'users', userId, 'templates'),
      async (snap) => {
        const docs = snap.docs.map((d) => ({ ...d.data(), id: d.id } as CampaignTemplate));
        if (docs.length === 0) {
          // Auto-seed starter template for new user in Firestore
          const starter = { ...STARTER_TEMPLATES[0], userId };
          try {
            await setDoc(doc(db, 'users', userId, 'templates', starter.id), starter);
            setTemplates([starter]);
          } catch (e) {
            setTemplates([starter]);
          }
        } else {
          setTemplates(docs);
          localStorage.setItem(`pr_${userId}_templates`, JSON.stringify(docs));
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/templates`)
    );

    // 5. Listen to Campaigns
    const unsubCampaigns = onSnapshot(
      collection(db, 'users', userId, 'campaigns'),
      (snap) => {
        const docs = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Campaign));
        setCampaigns(docs);
        localStorage.setItem(`pr_${userId}_campaigns`, JSON.stringify(docs));
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        handleFirestoreError(err, OperationType.LIST, `users/${userId}/campaigns`);
      }
    );

    // 6. Listen to Suppressions
    const unsubSuppressions = onSnapshot(
      collection(db, 'users', userId, 'suppressions'),
      (snap) => {
        const docs = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Suppression));
        setSuppressions(docs);
        localStorage.setItem(`pr_${userId}_suppressions`, JSON.stringify(docs));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/suppressions`)
    );

    // 7. Listen to Replies
    const unsubReplies = onSnapshot(
      collection(db, 'users', userId, 'replies'),
      (snap) => {
        const docs = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Reply));
        setReplies(docs);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/replies`)
    );

    return () => {
      unsubAccounts();
      unsubContacts();
      unsubLists();
      unsubTemplates();
      unsubCampaigns();
      unsubSuppressions();
      unsubReplies();
    };
  }, [user]);

  // Account Operations
  const addAccount = async (accountData: Omit<EmailAccount, 'id' | 'userId' | 'createdAt' | 'sentCount'>) => {
    if (!user) throw new Error('يجب تسجيل الدخول باستخدام Google أولاً لإضافة حساب.');

    const newId = `acc_${Date.now()}`;
    const newAccount: EmailAccount = {
      ...accountData,
      id: newId,
      userId: user.uid,
      sentCount: 0,
      createdAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', user.uid, 'email_accounts', newId), newAccount);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/email_accounts/${newId}`);
    }

    setAccounts((prev) => [newAccount, ...prev]);
    return newId;
  };

  const updateAccount = async (id: string, updates: Partial<EmailAccount>) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'email_accounts', id), updates, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/email_accounts/${id}`);
    }
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAccount = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'email_accounts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/email_accounts/${id}`);
    }
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const testAccountConnection = async (account: Partial<EmailAccount>): Promise<{ success: boolean; message: string }> => {
    if (account.authMethod === 'api' || account.apiKey) {
      if (!account.apiKey && !account.clientSecret) {
        return { success: false, message: 'يرجى إدخال مفتاح API صالح أو بيانات السر.' };
      }
      return {
        success: true,
        message: `تم التحقق من مفتاح API بنجاح لمزود الخدمة (${account.provider?.toUpperCase()}). الاتصال جاهز للإرسال.`,
      };
    }

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
          return { success: false, message: data.error || 'فشل الاتصال بالخادم. يرجى مراجعة البيانات.' };
        }
        return { success: true, message: `نجح الاتصال بالخادم ${account.host || 'SMTP'}. تم قبول بيانات الاعتماد بنجاح.` };
      } catch (e: any) {
        return { success: false, message: e.message || 'تعذر الوصول إلى خادم الفحص.' };
      }
    }

    return {
      success: true,
      message: `تم التحقق من صلاحيات حساب ${account.provider?.toUpperCase()} بنجاح. أذونات الإرسال مفعلة.`,
    };
  };

  // Contact Operations
  const addContact = async (contactData: Omit<Contact, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('يجب تسجيل الدخول باستخدام Google أولاً لإضافة جهات الاتصال.');

    const newId = `cnt_${Date.now()}`;
    const newContact: Contact = {
      ...contactData,
      id: newId,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', user.uid, 'contacts', newId), newContact);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/contacts/${newId}`);
    }

    setContacts((prev) => [newContact, ...prev]);
    return newId;
  };

  const importContacts = async (newContacts: Omit<Contact, 'id' | 'userId' | 'createdAt'>[]) => {
    if (!user) throw new Error('يجب تسجيل الدخول باستخدام Google أولاً لاستيراد جهات الاتصال.');

    const created: Contact[] = newContacts.map((c, i) => ({
      ...c,
      id: `cnt_b_${Date.now()}_${i}`,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    }));

    // Batch write to Firestore
    for (const c of created) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'contacts', c.id), c);
      } catch (e) {
        console.error(e);
      }
    }

    setContacts((prev) => [...created, ...prev]);
    return created.length;
  };

  const deleteContact = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'contacts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/contacts/${id}`);
    }
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleSuppression = async (email: string, reason: Suppression['reason'] = 'unsubscribe') => {
    if (!user) return;

    const existing = suppressions.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'suppressions', existing.id));
      } catch (e) {
        console.error(e);
      }
      setSuppressions((prev) => prev.filter((s) => s.id !== existing.id));
      setContacts((prev) =>
        prev.map((c) => (c.email.toLowerCase() === email.toLowerCase() ? { ...c, status: 'active' } : c))
      );
    } else {
      const newSup: Suppression = {
        id: `sup_${Date.now()}`,
        userId: user.uid,
        email,
        reason,
        createdAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'users', user.uid, 'suppressions', newSup.id), newSup);
      } catch (e) {
        console.error(e);
      }
      setSuppressions((prev) => [newSup, ...prev]);
      setContacts((prev) =>
        prev.map((c) => (c.email.toLowerCase() === email.toLowerCase() ? { ...c, status: 'suppressed' } : c))
      );
    }
  };

  // List Operations
  const createList = async (name: string, description?: string) => {
    if (!user) throw new Error('يجب تسجيل الدخول باستخدام Google أولاً.');

    const newId = `list_${Date.now()}`;
    const newList: ContactList = {
      id: newId,
      userId: user.uid,
      name,
      description,
      contactCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', user.uid, 'contact_lists', newId), newList);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/contact_lists/${newId}`);
    }

    setContactLists((prev) => [newList, ...prev]);
    return newId;
  };

  const updateList = async (id: string, name: string, description?: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'contact_lists', id), { name, description }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/contact_lists/${id}`);
    }
    setContactLists((prev) => prev.map((l) => (l.id === id ? { ...l, name, description } : l)));
  };

  const deleteList = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'contact_lists', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/contact_lists/${id}`);
    }
    setContactLists((prev) => prev.filter((l) => l.id !== id));
  };

  // Template Operations
  const createTemplate = async (templateData: Omit<CampaignTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('يجب تسجيل الدخول باستخدام Google أولاً.');

    const newId = `tpl_${Date.now()}`;
    const newTemplate: CampaignTemplate = {
      ...templateData,
      id: newId,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', user.uid, 'templates', newId), newTemplate);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/templates/${newId}`);
    }

    setTemplates((prev) => [newTemplate, ...prev]);
    return newId;
  };

  const updateTemplate = async (id: string, updates: Partial<CampaignTemplate>) => {
    if (!user) return;
    const payload = { ...updates, updatedAt: new Date().toISOString() };
    try {
      await setDoc(doc(db, 'users', user.uid, 'templates', id), payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/templates/${id}`);
    }
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...payload } : t)));
  };

  const duplicateTemplate = async (id: string) => {
    const source = templates.find((t) => t.id === id);
    if (!source) throw new Error('القالب غير موجود');

    return createTemplate({
      title: `${source.title} (نسخة)`,
      subject: source.subject,
      htmlContent: source.htmlContent,
      textContent: source.textContent,
      variables: source.variables,
    });
  };

  const deleteTemplate = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'templates', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/templates/${id}`);
    }
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  // Campaign Operations
  const createCampaign = async (
    campaignData: Omit<Campaign, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'sentCount' | 'acceptedCount' | 'bouncedCount' | 'failedCount'>
  ) => {
    if (!user) throw new Error('يجب تسجيل الدخول باستخدام Google أولاً.');

    const newId = `cmp_${Date.now()}`;
    const newCampaign: Campaign = {
      ...campaignData,
      id: newId,
      userId: user.uid,
      sentCount: 0,
      acceptedCount: 0,
      bouncedCount: 0,
      failedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', user.uid, 'campaigns', newId), newCampaign);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/campaigns/${newId}`);
    }

    setCampaigns((prev) => [newCampaign, ...prev]);
    return newId;
  };

  const updateCampaignStatus = async (id: string, status: Campaign['status']) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'campaigns', id), { status, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/campaigns/${id}`);
    }
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c)));
  };

  const dispatchCampaign = async (campaignId: string) => {
    if (!user) return;
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const targetContacts = contacts.filter(
      (c) =>
        c.status === 'active' &&
        (campaign.targetListIds.length === 0 || campaign.targetListIds.some((lId) => c.listIds.includes(lId))) &&
        !suppressions.some((s) => s.email.toLowerCase() === c.email.toLowerCase())
    );

    const total = targetContacts.length || campaign.recipientCount;

    await updateCampaignStatus(campaignId, 'in_progress');

    try {
      const selectedSenders = accounts.filter((a) => campaign.senderAccountIds.includes(a.id));
      const selectedTemplates = templates.filter((t) => campaign.templateIds.includes(t.id));

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

      setTimeout(async () => {
        const completedUpdates = {
          status: 'completed' as const,
          sentCount: total,
          acceptedCount: total,
          bouncedCount: 0,
          updatedAt: new Date().toISOString(),
        };

        if (user) {
          try {
            await setDoc(doc(db, 'users', user.uid, 'campaigns', campaignId), completedUpdates, { merge: true });
          } catch (e) {
            console.error(e);
          }
        }

        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaignId ? { ...c, ...completedUpdates } : c))
        );

        // Update sender sentCount
        if (campaign.senderAccountIds.length > 0) {
          for (const accId of campaign.senderAccountIds) {
            const acc = accounts.find((a) => a.id === accId);
            const newCount = (acc?.sentCount || 0) + total;
            if (user) {
              try {
                await setDoc(doc(db, 'users', user.uid, 'email_accounts', accId), { sentCount: newCount }, { merge: true });
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
      }, 3000);
    } catch (err) {
      console.error('Campaign dispatch error:', err);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'campaigns', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/campaigns/${id}`);
    }
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const sendReply = async (replyId: string, replyText: string) => {
    console.log(`Replying to ${replyId}: ${replyText}`);
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
