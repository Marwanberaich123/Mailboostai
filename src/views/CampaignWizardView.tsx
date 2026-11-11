import React, { useState } from 'react';
import {
  Send,
  Users,
  FileText,
  MailCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { NavigationTab } from '../types';

interface CampaignWizardViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export function CampaignWizardView({ onNavigate }: CampaignWizardViewProps) {
  const { accounts, contactLists, contacts, templates, suppressions, createCampaign, dispatchCampaign } = useData();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Details
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Step 2: Recipients
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);

  // Step 3: Templates
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

  // Step 4: Senders
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  // Step 5: Scheduling
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [throttleSeconds, setThrottleSeconds] = useState(3);

  // Launch state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حساب المستهدفين
  const candidateContacts = contacts.filter(c =>
    selectedListIds.length === 0 || selectedListIds.some(lId => c.listIds.includes(lId))
  );

  const suppressedCount = candidateContacts.filter(c =>
    c.status === 'suppressed' || suppressions.some(s => s.email.toLowerCase() === c.email.toLowerCase())
  ).length;

  const eligibleRecipients = candidateContacts.filter(c =>
    c.status === 'active' && !suppressions.some(s => s.email.toLowerCase() === c.email.toLowerCase())
  );

  const selectedAccounts = accounts.filter(a => selectedAccountIds.includes(a.id));
  const estimatedDurationMinutes = Math.ceil((eligibleRecipients.length * throttleSeconds) / 60);

  const handleNext = () => {
    if (currentStep === 1 && !name.trim()) {
      alert('يرجى إدخال اسم الحملة البريدية.');
      return;
    }
    if (currentStep === 2 && contacts.length === 0) {
      alert('لا توجد أي جهات اتصال مضافة حتى الآن. يرجى إضافة مستلمين أولاً من قسم المشتركين.');
      return;
    }
    if (currentStep === 3 && selectedTemplateIds.length === 0) {
      alert('يرجى تحديد قالب رسالة واحد على الأقل.');
      return;
    }
    if (currentStep === 4 && selectedAccountIds.length === 0) {
      alert('يرجى اختيار حساب بريد واحد على الأقل لإرسال الحملة من خلاله.');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleLaunchCampaign = async () => {
    setIsSubmitting(true);
    try {
      const scheduledAtIso = scheduleType === 'scheduled' && scheduledDate
        ? new Date(`${scheduledDate}T${scheduledTime || '09:00:00'}`).toISOString()
        : undefined;

      const campaignId = await createCampaign({
        name,
        description,
        status: scheduleType === 'scheduled' ? 'scheduled' : 'draft',
        senderAccountIds: selectedAccountIds,
        targetListIds: selectedListIds,
        templateIds: selectedTemplateIds,
        recipientCount: eligibleRecipients.length,
        throttleIntervalSeconds: throttleSeconds,
        scheduledAt: scheduledAtIso,
      });

      if (scheduleType === 'immediate') {
        await dispatchCampaign(campaignId);
      }

      setCurrentStep(7); // صفحة النجاح
    } catch (err: any) {
      alert('فشل إطلاق الحملة: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-right">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          إنشاء وإطلاق حملة بريدية
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
          تسلسل إرسال منظم مع تدوير الحسابات، وفواصل زمنية ذكية لتجنب تصنيف الرسائل كإزعاج.
        </p>
      </div>

      {/* شريط خطوات المعالج */}
      {currentStep <= 6 && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-6 gap-2 text-center text-xs">
            {[
              { num: 1, label: 'التفاصيل' },
              { num: 2, label: 'الجمهور' },
              { num: 3, label: 'الرسالة' },
              { num: 4, label: 'المرسل' },
              { num: 5, label: 'الجدولة' },
              { num: 6, label: 'التأكيد' },
            ].map(step => (
              <div key={step.num} className="space-y-1">
                <div
                  className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold text-xs font-mono transition-colors ${
                    currentStep === step.num
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-200 dark:ring-indigo-950'
                      : currentStep > step.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {currentStep > step.num ? '✓' : step.num}
                </div>
                <span
                  className={`text-[11px] block truncate ${
                    currentStep === step.num
                      ? 'font-bold text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* الخطوة 1: تفاصيل الحملة */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">الخطوة 1 — تفاصيل الحملة والغرض منها</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                اسم الحملة البريدية *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: رسائل التواصل مع الشركاء، النشرة الإخبارية الأولى"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                وصف أو هدف الحملة
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ملاحظات توضيحية حول أهداف الرسائل المستهدفة"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* الخطوة 2: الجمهور والمستلمون */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">الخطوة 2 — تحديد الجمهور المستهدف وتصفية المستبعدين</h2>

          <div className="space-y-3">
            {contactLists.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  لا توجد قوائم مخصصة، سيتم استهداف كافة جهات الاتصال النشطة:
                </span>
                <span className="text-slate-500 block">
                  إجمالي جهات الاتصال المؤهلة: {eligibleRecipients.length} مستلم.
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                  اختر القوائم المراد إرسال الحملة إليها:
                </span>
                {contactLists.map(list => {
                  const count = contacts.filter(c => c.listIds.includes(list.id)).length;
                  const isSelected = selectedListIds.includes(list.id);

                  return (
                    <div
                      key={list.id}
                      onClick={() => {
                        if (isSelected) setSelectedListIds(prev => prev.filter(id => id !== list.id));
                        else setSelectedListIds(prev => [...prev, list.id]);
                      }}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">
                            {list.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {list.description || 'قائمة المشتركين'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                        {count} مستلم
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  المستلمون الفعليون للحملة: {eligibleRecipients.length} عنوان
                </span>
                <span className="text-[11px] text-slate-500">
                  {suppressedCount} عنوان مستبعد تلقائياً لمنع إزعاج المشتركين الملغين
                </span>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>
      )}

      {/* الخطوة 3: القوالب والرسائل */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">الخطوة 3 — اختيار قالب الرسالة ونموذج العرض</h2>
            <span className="text-xs text-slate-500">يمكنك اختيار أكثر من قالب لتنويع المحتوى</span>
          </div>

          <div className="space-y-2">
            {templates.map(tpl => {
              const isSelected = selectedTemplateIds.includes(tpl.id);
              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    if (isSelected) setSelectedTemplateIds(prev => prev.filter(id => id !== tpl.id));
                    else setSelectedTemplateIds(prev => [...prev, tpl.id]);
                  }}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-colors flex items-start justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {tpl.title}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        الموضوع: {tpl.subject}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* الخطوة 4: حسابات الإرسال */}
      {currentStep === 4 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">الخطوة 4 — اختيار حسابات الإرسال (توزيع الحملة)</h2>
            <span className="text-xs text-slate-500">اختر حساباً أو أكثر للتوزيع المتوازن</span>
          </div>

          {accounts.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-lg">
              يرجى ربط حساب بريد أولاً من صفحة حسابات الإرسال قبل إطلاق الحملة.
            </div>
          ) : (
            <div className="space-y-2">
              {accounts.map(acc => {
                const isSelected = selectedAccountIds.includes(acc.id);
                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      if (isSelected) setSelectedAccountIds(prev => prev.filter(id => id !== acc.id));
                      else setSelectedAccountIds(prev => [...prev, acc.id]);
                    }}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {acc.displayName || acc.email}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono block" dir="ltr">
                          {acc.email} · {acc.provider.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      الحد اليومي: {acc.dailyLimit.toLocaleString()} رسالة
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* الخطوة 5: الجدولة والفاصل الزمني */}
      {currentStep === 5 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">الخطوة 5 — وقت الإرسال والفاصل الزمني</h2>

          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setScheduleType('immediate')}
                className={`flex-1 p-3 rounded-lg border text-right text-xs transition-colors ${
                  scheduleType === 'immediate'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 font-bold text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                بدء الإرسال فوراً
                <span className="text-[11px] font-normal block text-slate-500 mt-1">
                  معالجة طابور الإرسال مباشرة بعد التأكيد
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScheduleType('scheduled')}
                className={`flex-1 p-3 rounded-lg border text-right text-xs transition-colors ${
                  scheduleType === 'scheduled'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 font-bold text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                جدولة لتاريخ ووقت محدد
                <span className="text-[11px] font-normal block text-slate-500 mt-1">
                  تحديد موعد مسبق للإرسال التلقائي
                </span>
              </button>
            </div>

            {scheduleType === 'scheduled' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ الإرسال
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    وقت الإرسال
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                الفاصل الزمني بين كل رسالة وأخرى ({throttleSeconds} ثوانٍ)
              </label>
              <input
                type="range"
                min={1}
                max={30}
                value={throttleSeconds}
                onChange={(e) => setThrottleSeconds(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                الفواصل الزمنية الذكية تمنع الخوادم من حظر الرسائل وتضمن وصولها إلى صندوق الوارد الرئيسي.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* الخطوة 6: المراجعة والتأكيد */}
      {currentStep === 6 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">الخطوة 6 — المراجعة النهائية قبل الإرسال</h2>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-500">اسم الحملة:</span>
              <span className="font-bold text-slate-900 dark:text-white">{name}</span>
            </div>

            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-500">المستلمون الفعليون:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {eligibleRecipients.length} عنوان بريد
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-500">المستبعدون (الملغون):</span>
              <span className="font-mono text-slate-500">{suppressedCount} مستلم</span>
            </div>

            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-500">حسابات الإرسال المحددة:</span>
              <span className="font-bold text-slate-900 dark:text-white">{selectedAccounts.length} حساب</span>
            </div>

            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-500">الفاصل الزمني:</span>
              <span className="font-mono">{throttleSeconds} ثانية بين الرسائل (~{estimatedDurationMinutes} دقيقة إجمالاً)</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">موعد الإطلاق:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {scheduleType === 'immediate' ? 'إرسال فوري مباشر' : `مجدولة لتاريخ ${scheduledDate} الساعة ${scheduledTime}`}
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              بالنقر على تأكيد الإطلاق، سيتم تسجيل المهام وبدء المعالجة عبر حساباتك المعتمدة مباشرة.
            </span>
          </div>
        </div>
      )}

      {/* شاشة اكتمال الإطلاق بنجاح */}
      {currentStep === 7 && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            تم إطلاق الحملة البريدية بنجاح!
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {scheduleType === 'immediate'
              ? 'تم جدولة جميع المهام وإرسال الرسائل عبر خوادم حساباتك المحددة وفق الفاصل الزمني.'
              : 'تم حفظ الحملة وسيتم إطلاقها تلقائياً في الموعد المحدد.'}
          </p>

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
            >
              العودة للوحة التحكم
            </button>
            <button
              onClick={() => onNavigate('campaigns')}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              متابعة حالة الإرسال
            </button>
          </div>
        </div>
      )}

      {/* أزرار التنقل */}
      {currentStep <= 6 && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={handleBack}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>السابق</span>
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <span>المتابعة</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleLaunchCampaign}
              className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'جاري تجهيز الطابور...' : 'تأكيد وإطلاق الحملة الآن'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
