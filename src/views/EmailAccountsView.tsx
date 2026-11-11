import React, { useState } from 'react';
import {
  MailCheck,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  Send,
  Server,
  Search,
  LogIn,
  Code,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { BRAND_CONFIG } from '../config/brand';
import { EmailAccount, ProviderType, AuthMethodType } from '../types';

export function EmailAccountsView() {
  const { accounts, addAccount, updateAccount, deleteAccount, testAccountConnection } = useData();

  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>('gmail');
  const [authMethod, setAuthMethod] = useState<AuthMethodType>('oauth');

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState(587);
  const [encryption, setEncryption] = useState<'tls' | 'ssl' | 'none'>('tls');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [dailyLimit, setDailyLimit] = useState(2000);

  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Test email sending state
  const [testSendModalOpen, setTestSendModalOpen] = useState(false);
  const [activeTestAccount, setActiveTestAccount] = useState<EmailAccount | null>(null);
  const [testRecipientEmail, setTestRecipientEmail] = useState('');
  const [testSubject, setTestSubject] = useState('رسالة اختبارية من منصة PostReach');
  const [testBody, setTestBody] = useState('مرحباً،\nهذه رسالة تجريبية للتأكد من ربط حساب البريد الإلكتروني وجاهزيته لإطلاق الحملات بنجاح.');
  const [sendingTest, setSendingTest] = useState(false);
  const [testSendResult, setTestSendResult] = useState<{ success: boolean; message: string; messageId?: string } | null>(null);

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch =
      acc.email.toLowerCase().includes(search.toLowerCase()) ||
      (acc.displayName && acc.displayName.toLowerCase().includes(search.toLowerCase()));
    const matchesProvider = providerFilter === 'all' || acc.provider === providerFilter;
    return matchesSearch && matchesProvider;
  });

  const handleOpenConnectModal = (providerId: ProviderType) => {
    setSelectedProvider(providerId);
    setTestResult(null);

    const providerConfig = BRAND_CONFIG.providers.find(p => p.id === providerId);
    if (providerConfig?.defaultHost) {
      setHost(providerConfig.defaultHost);
      setPort(providerConfig.defaultPort || 465);
      setEncryption(providerConfig.defaultEncryption as any || 'ssl');
    } else {
      setHost('');
      setPort(587);
      setEncryption('tls');
    }

    if (providerId === 'gmail' || providerId === 'outlook') {
      setAuthMethod('oauth');
      setDailyLimit(providerId === 'gmail' ? 2000 : 10000);
    } else if (providerId === 'smtp') {
      setAuthMethod('smtp');
      setDailyLimit(10000);
    } else {
      setAuthMethod('smtp');
      setDailyLimit(1000);
    }

    setDisplayName('');
    setEmail('');
    setUsername('');
    setPassword('');
    setApiKey('');
    setClientId('');
    setClientSecret('');
    setModalOpen(true);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testAccountConnection({
        provider: selectedProvider,
        authMethod,
        host,
        port,
        encryption,
        username: username || email,
        password,
        apiKey,
        clientSecret,
        email,
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'فشل فحص الاتصال' });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert('يرجى إدخال عنوان البريد الإلكتروني.');
      return;
    }

    await addAccount({
      provider: selectedProvider,
      authMethod,
      email,
      displayName: displayName || email,
      status: 'connected',
      host: host || undefined,
      port: port || undefined,
      encryption: encryption || undefined,
      username: username || undefined,
      password: password || undefined,
      apiKey: apiKey || undefined,
      clientId: clientId || undefined,
      clientSecret: clientSecret || undefined,
      dailyLimit: Number(dailyLimit) || 2000,
    });

    setModalOpen(false);
  };

  const handleOpenTestSend = (acc: EmailAccount) => {
    setActiveTestAccount(acc);
    setTestRecipientEmail('');
    setTestSendResult(null);
    setTestSendModalOpen(true);
  };

  const handleExecuteTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTestAccount || !testRecipientEmail) return;

    setSendingTest(true);
    setTestSendResult(null);

    try {
      const response = await fetch('/api/smtp/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderConfig: activeTestAccount,
          to: testRecipientEmail,
          subject: testSubject,
          text: testBody,
          html: `<div dir="rtl" style="font-family:sans-serif;padding:24px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;max-width:600px;margin:0 auto;">
            <div style="background:#4f46e5;color:#ffffff;padding:12px 18px;border-radius:8px;margin-bottom:16px;">
              <h2 style="margin:0;font-size:16px;">✅ نجح اختبار الإرسال عبر منصة PostReach</h2>
            </div>
            <p style="color:#1e293b;line-height:1.7;font-size:14px;">${testBody.replace(/\n/g, '<br>')}</p>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #cbd5e1;color:#64748b;font-size:12px;">
              <p style="margin:4px 0;"><strong>حساب الإرسال:</strong> ${activeTestAccount.email}</p>
              <p style="margin:4px 0;"><strong>المزود:</strong> ${activeTestAccount.provider.toUpperCase()} (${activeTestAccount.authMethod.toUpperCase()})</p>
              <p style="margin:4px 0;"><strong>التاريخ والوقت:</strong> ${new Date().toLocaleString('ar-SA')}</p>
            </div>
          </div>`,
          fromName: activeTestAccount.displayName || 'PostReach Engine',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setTestSendResult({
          success: false,
          message: data.error || 'فشل إرسال الرسالة التجريبية. يرجى مراجعة بيانات الحساب وكلمة المرور.',
        });
      } else {
        setTestSendResult({
          success: true,
          message: `تم إرسال الرسالة بنجاح إلى (${testRecipientEmail})!`,
          messageId: data.messageId,
        });
        updateAccount(activeTestAccount.id, {
          sentCount: (activeTestAccount.sentCount || 0) + 1,
        });
      }
    } catch (err: any) {
      setTestSendResult({
        success: false,
        message: 'حدث خطأ في الاتصال بالسيرفر: ' + err.message,
      });
    } finally {
      setSendingTest(false);
    }
  };

  const handleReconnect = async (acc: EmailAccount) => {
    const res = await testAccountConnection(acc);
    alert(res.message);
    if (res.success) {
      await updateAccount(acc.id, {
        status: 'connected',
        lastCheckedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            حسابات البريد الإلكتروني المتصلة (API / الدخول)
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            اربط حسابات إرسال متعددة عبر مفاتيح API المباشرة أو تسجيل الدخول الرسمي أو خوادم SMTP.
          </p>
        </div>

        <button
          onClick={() => handleOpenConnectModal('gmail')}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>ربط حساب جديد</span>
        </button>
      </div>

      {/* بطاقات المزودين السريعة */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {BRAND_CONFIG.providers.map(p => (
          <button
            key={p.id}
            onClick={() => handleOpenConnectModal(p.id as ProviderType)}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors text-right group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {p.name.split('/')[0]}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {p.badge.split(' ')[0]}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2">
              {p.dailyQuotaHint}
            </p>
          </button>
        ))}
      </div>

      {/* شريط البحث والتصفية */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في الحسابات بالبريد أو الاسم..."
            className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['all', 'gmail', 'outlook', 'yahoo', 'zoho', 'smtp'].map((p) => (
            <button
              key={p}
              onClick={() => setProviderFilter(p)}
              className={`px-3 py-1 text-xs rounded-md font-semibold transition-colors whitespace-nowrap ${
                providerFilter === p
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {p === 'all' ? 'جميع المزودين' : p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* قائمة الحسابات */}
      {filteredAccounts.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <MailCheck className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            لم يتم ربط أي حساب بريد بعد
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            اربط حسابك الأول عبر API أو تسجيل الدخول لبدء إرسال الرسائل وتوزيع الحملات.
          </p>
          <button
            onClick={() => handleOpenConnectModal('gmail')}
            className="mt-2 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ربط حساب الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((acc) => (
            <div
              key={acc.id}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {acc.displayName || acc.email}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono block mt-0.5" dir="ltr">
                      {acc.email}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {acc.provider}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>طريقة الربط</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase font-mono">
                      {acc.authMethod === 'api' ? 'مفتاح API' : acc.authMethod === 'oauth' ? 'تسجيل دخول OAuth' : 'خادم SMTP'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>حالة الاعتماد</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>متصل ومفعل</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>الرسائل المرسلة</span>
                    <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {acc.sentCount} رسالة (الحد اليومي: {acc.dailyLimit.toLocaleString()})
                    </span>
                  </div>

                  {acc.host && (
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 text-[11px]">
                      <span>الخادم</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300" dir="ltr">
                        {acc.host}:{acc.port}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => handleOpenTestSend(acc)}
                  className="flex-1 py-1.5 px-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors flex items-center justify-center gap-1 border border-indigo-200 dark:border-indigo-800"
                >
                  <Send className="w-3 h-3" />
                  <span>إرسال تجربة</span>
                </button>
                <button
                  onClick={() => handleReconnect(acc)}
                  className="py-1.5 px-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                  title="فحص الاتصال والاعتماد"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>فحص</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`هل أنت متأكد من حذف الحساب ${acc.email}؟`)) {
                      deleteAccount(acc.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="إلغاء ربط الحساب"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* نافذة ربط الحساب (Modal) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 text-right">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  ربط حساب {selectedProvider.toUpperCase()}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  اختر الربط عبر تسجيل الدخول المباشر أو إدخال مفتاح API أو بيانات SMTP
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-5 space-y-4">
              {/* اختيار طريقة الربط: API أم تسجيل دخول / SMTP */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  طريقة الربط المفضلة:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('oauth')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                      authMethod === 'oauth'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>تسجيل دخول</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMethod('api')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                      authMethod === 'api'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>مفتاح API</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMethod('smtp')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                      authMethod === 'smtp'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>خادم SMTP</span>
                  </button>
                </div>
              </div>

              {/* الاسم التعريفي */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  اسم أو وصف الحساب
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="مثال: بريد المبيعات الرسمي أو البريد الشخصي"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* عنوان البريد */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  عنوان البريد الإلكتروني للمرسل *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  dir="ltr"
                />
              </div>

              {/* حقول مفتاح API */}
              {authMethod === 'api' && (
                <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      مفتاح API (API Key أو Token)
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="SG.xxxxxxxxxxxx أو AIzaSy..."
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      dir="ltr"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Client ID (اختياري)
                      </label>
                      <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="معرف العميل"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Client Secret (اختياري)
                      </label>
                      <input
                        type="password"
                        value={clientSecret}
                        onChange={(e) => setClientSecret(e.target.value)}
                        placeholder="السر الخاص"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* حقول تسجيل الدخول OAuth */}
              {authMethod === 'oauth' && (
                <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-300 space-y-1">
                  <span className="font-bold block">تسجيل الدخول والاعتماد المباشر</span>
                  <p>
                    سيتم اعتماد الحساب لإرسال الرسائل عبر الواجهة الرسمية المعتمدة لمزود الخدمة ({selectedProvider.toUpperCase()}). تأكد من صحة البريد أعلاه.
                  </p>
                </div>
              )}

              {/* حقول SMTP */}
              {authMethod === 'smtp' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        خادم SMTP (Host)
                      </label>
                      <input
                        type="text"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="smtp.example.com"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        المنفذ (Port)
                      </label>
                      <input
                        type="number"
                        value={port}
                        onChange={(e) => setPort(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        اسم المستخدم (Username)
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="نفس البريد غالباً"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        كلمة مرور التطبيق (App Password)
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* نتيجة الفحص */}
              {testResult && (
                <div
                  className={`p-3 text-xs rounded-lg border ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <span className="font-bold block mb-0.5">
                    {testResult.success ? 'تم فحص الاتصال بنجاح ✓' : 'فشل فحص الاتصال ✕'}
                  </span>
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  disabled={testingConnection}
                  onClick={handleTestConnection}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                  <span>{testingConnection ? 'جاري الفحص المباشر...' : 'فحص الاتصال والاعتماد'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                  >
                    حفظ الحساب
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إرسال بريد تجريبي مباشر (Test Send Modal) */}
      {testSendModalOpen && activeTestAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => !sendingTest && setTestSendModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 text-right">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-600" />
                  <span>إرسال رسالة تجريبية حقيقية</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  اختبر الإرسال المباشر من الحساب: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold" dir="ltr">{activeTestAccount.email}</span>
                </p>
              </div>
              <button
                disabled={sendingTest}
                onClick={() => setTestSendModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteTestSend} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  إلى (البريد الإلكتروني للمستلم التجريبي): *
                </label>
                <input
                  type="email"
                  required
                  value={testRecipientEmail}
                  onChange={(e) => setTestRecipientEmail(e.target.value)}
                  placeholder="name@example.com أو بريدك الشخصي"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  dir="ltr"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  يمكنك وضع بريدك الشخصي لتفقد وصول الرسالة في صندوق الوارد لديك فوراً.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الرسالة (Subject):
                </label>
                <input
                  type="text"
                  required
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  نص الرسالة:
                </label>
                <textarea
                  rows={3}
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* نتيجة الإرسال التجريبي */}
              {testSendResult && (
                <div
                  className={`p-3.5 text-xs rounded-xl border ${
                    testSendResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {testSendResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>{testSendResult.success ? 'تم الإرسال بنجاح!' : 'فشل الإرسال'}</span>
                  </div>
                  <p className="leading-relaxed">{testSendResult.message}</p>
                  {testSendResult.messageId && (
                    <span className="block mt-1 font-mono text-[10px] opacity-75" dir="ltr">
                      Message ID: {testSendResult.messageId}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  disabled={sendingTest}
                  onClick={() => setTestSendModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  إغلاق
                </button>
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {sendingTest ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الإرسال عبر الخادم...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>إرسال الرسالة الآن</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
