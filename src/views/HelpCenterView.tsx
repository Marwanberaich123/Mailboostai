import React, { useState } from 'react';
import {
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Key,
  Globe,
  Terminal,
  Server,
  BookOpen,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';

export function HelpCenterView() {
  const [activeGuide, setActiveGuide] = useState<'gmail' | 'microsoft' | 'smtp' | 'deliverability'>('gmail');

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-right">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          دليل ربط الحسابات وواجهات برمجة التطبيقات (API)
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
          شروحات كاملة خطوة بخطوة باللغة العربية لربط Google Cloud، Microsoft Azure، وخوادم SMTP.
        </p>
      </div>

      {/* تبويبات الشروحات */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'gmail', label: 'ربط Gmail و Google API' },
          { id: 'microsoft', label: 'ربط Microsoft 365 و Graph API' },
          { id: 'smtp', label: 'كلمات مرور التطبيقات (Yahoo / Zoho)' },
          { id: 'deliverability', label: 'إعدادات الوصول و DNS (SPF / DKIM)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveGuide(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeGuide === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* دليل Gmail */}
      {activeGuide === 'gmail' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            خطوات ربط حساب Google Gmail / Workspace عبر API الرسمي
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            تطلب المنصة فقط أضيق صلاحية إرسال مخصصة (<code>https://www.googleapis.com/auth/gmail.send</code>) دون طلب أي صلاحيات قراءة لرسائلك الخاصة لحماية خصوصيتك التامة.
          </p>

          <ol className="list-decimal pr-4 space-y-2 text-slate-700 dark:text-slate-300">
            <li>
              ادخل إلى <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold underline">Google Cloud Console</a> وأنشئ مشروعاً جديداً.
            </li>
            <li>
              من القائمة الجانبية، اذهب إلى <strong>APIs &amp; Services → Library</strong>، وابحث عن <strong>Gmail API</strong> ثم انقر <strong>Enable (تفعيل)</strong>.
            </li>
            <li>
              انتقل إلى <strong>OAuth consent screen (شاشة الموافقة)</strong>، وحدد نوع التطبيق (External أو Internal لمؤسستك).
            </li>
            <li>
              في خطوة النطاقات (Scopes)، أضف النطاق: <code dir="ltr">https://www.googleapis.com/auth/gmail.send</code>.
            </li>
            <li>
              اذهب إلى <strong>Credentials (بيانات الاعتماد)</strong>، وانقر <strong>Create Credentials → OAuth Client ID</strong> واختر <strong>Web Application</strong>.
            </li>
            <li>
              انسخ معرف العميل (Client ID) والسر (Client Secret) أو استخدم تسجيل الدخول المباشر في المنصة.
            </li>
          </ol>
        </div>
      )}

      {/* دليل Microsoft */}
      {activeGuide === 'microsoft' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            خطوات ربط Microsoft 365 و Outlook عبر Microsoft Graph API
          </h2>

          <ol className="list-decimal pr-4 space-y-2 text-slate-700 dark:text-slate-300">
            <li>
              ادخل إلى <a href="https://portal.azure.com" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold underline">بوابة Microsoft Azure</a> وافتح <strong>Microsoft Entra ID</strong>.
            </li>
            <li>
              انتقل إلى <strong>App registrations → New registration</strong> وسم التطبيق باسم <em>PostReach Outbound</em>.
            </li>
            <li>
              من صفحة التطبيق، ادخل إلى <strong>API permissions</strong> ثم انقر <em>Add a permission → Microsoft Graph → Delegated permissions</em> وأضف إذن <code>Mail.Send</code>.
            </li>
            <li>
              يمكنك ربط الحساب إما عبر إدخال بيانات التطبيق في نموذج API أو تسجيل الدخول الرسمي.
            </li>
          </ol>
        </div>
      )}

      {/* دليل كلمات مرور التطبيقات */}
      {activeGuide === 'smtp' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            استخراج كلمات مرور التطبيقات (App Password) لحسابات Yahoo و Zoho
          </h2>

          <div className="space-y-3 text-slate-700 dark:text-slate-300">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="font-bold block text-slate-900 dark:text-white">بريد Yahoo Mail</span>
              <p className="mt-1">
                ادخل إلى إعدادات أمان حساب ياهو (Account Security) → انقر على <strong>Generate app password</strong> → اختر Other واكتب PostReach. استخدم الخادم <code>smtp.mail.yahoo.com</code> والمنفذ <code>465</code> (SSL).
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="font-bold block text-slate-900 dark:text-white">بريد Zoho Mail</span>
              <p className="mt-1">
                ادخل إلى حساب Zoho → الأمان (Security) → كلمات المرور الخاصة بالتطبيقات (Application-Specific Passwords). استخدم الخادم <code>smtppro.zoho.com</code> والمنفذ <code>465</code> (SSL).
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="font-bold block text-slate-900 dark:text-white">المزودات السحابية (SendGrid / Mailgun / Amazon SES / Postmark)</span>
              <p className="mt-1">
                أنشئ مفتاح API Key من لوحة تحكم المزود السحابي الخاص بك وضعه في حقل كلمة المرور أو مفتاح API مع المنفذ <code>587</code> وتشفير TLS.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* دليل قابلية الوصول */}
      {activeGuide === 'deliverability' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            قائمة التحقق الذهبية لضمان وصول الرسائل للبريد الوارد (Inbox) وتجنب الـ Spam
          </h2>

          <ul className="list-disc pr-4 space-y-2 text-slate-700 dark:text-slate-300">
            <li>
              <strong>سجل SPF (Sender Policy Framework):</strong> تأكد من إضافة سجل TXT في إعدادات DNS لنطاقك يعرّف الخوادم المعتمدة لإرسال بريدك (مثل: <code dir="ltr">v=spf1 include:_spf.google.com ~all</code>).
            </li>
            <li>
              <strong>توقيع DKIM:</strong> فعّل تشفير DKIM لدى مزود البريد لتوقيع الرسائل رقمياً ومنع التلاعب بها أثناء الإرسال.
            </li>
            <li>
              <strong>سياسة DMARC:</strong> انشر سجل DMARC في نطاقك لإعطاء ثقة قصوى لخوادم الاستقبال مثل Gmail و Yahoo (مثل: <code dir="ltr">v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com</code>).
            </li>
            <li>
              <strong>الفاصل الزمني المتوازن (Throttling):</strong> احرص دائماً على ضبط فاصل زمني (من 2 إلى 5 ثوانٍ) في معالج الحملة لتفادي كشف الإرسال المكثف والحفاظ على سمعة النطاق.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
