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
  Sparkles,
  Info,
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

  // Step 3: Message Templates
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

  // Step 4: Sender Accounts
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  // Step 5: Scheduling & Throttling
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [throttleSeconds, setThrottleSeconds] = useState(3);

  // Step 6 / Launch
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [launchedCampaignId, setLaunchedCampaignId] = useState<string | null>(null);

  // Computations
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
  const totalDailyCapacity = selectedAccounts.reduce((sum, a) => sum + (a.dailyLimit || 1000), 0);

  const estimatedDurationMinutes = Math.ceil((eligibleRecipients.length * throttleSeconds) / 60);

  const handleNext = () => {
    if (currentStep === 1 && !name.trim()) {
      alert('Please enter a campaign name.');
      return;
    }
    if (currentStep === 2 && selectedListIds.length === 0) {
      alert('Please select at least one contact list.');
      return;
    }
    if (currentStep === 3 && selectedTemplateIds.length === 0) {
      alert('Please select at least one message template.');
      return;
    }
    if (currentStep === 4 && selectedAccountIds.length === 0) {
      alert('Please select at least one sending account.');
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

      setLaunchedCampaignId(campaignId);
      setCurrentStep(7); // Final confirmation view
    } catch (err: any) {
      alert('Failed to launch campaign: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Wizard Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Create &amp; Dispatch Campaign
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
          Permission-based outbound sequence with multi-account rotation and deliverability guards.
        </p>
      </div>

      {/* Progress Step Bar */}
      {currentStep <= 6 && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-6 gap-2 text-center text-xs">
            {[
              { num: 1, label: 'Details' },
              { num: 2, label: 'Audience' },
              { num: 3, label: 'Message' },
              { num: 4, label: 'Senders' },
              { num: 5, label: 'Schedule' },
              { num: 6, label: 'Review' },
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
                      ? 'font-semibold text-indigo-600 dark:text-indigo-400'
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

      {/* Step 1: Details */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Step 1 — Campaign Details</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Campaign Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q4 Executive Tech Outreach"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Campaign Purpose / Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Targeting verified founders and technical directors who opted-in during product webinar"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Recipients */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Step 2 — Target Audience &amp; Suppression Scrubbing</h2>

          <div className="space-y-3">
            <span className="text-xs text-slate-600 dark:text-slate-300 block">
              Select one or more contact lists to target:
            </span>

            <div className="space-y-2">
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
                        <span className="text-[11px] text-slate-600 dark:text-slate-300">
                          {list.description || 'Opt-in list'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {count} contacts
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Suppression Breakdown Banner */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Eligible Outbound Targets: {eligibleRecipients.length}
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300">
                  {suppressedCount} unsubscribed or bounced contacts automatically excluded
                </span>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Templates */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Step 3 — Message Variations (A/B Variations)</h2>
            <span className="text-xs text-slate-500">You may select up to 4 variations</span>
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
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-mono block mt-0.5">
                        Subject: {tpl.subject}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 4: Senders */}
      {currentStep === 4 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Step 4 — Select Sending Sockets</h2>
            <span className="text-xs text-slate-500">Rotate across authorized nodes</span>
          </div>

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
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-mono block">
                        {acc.email} · {acc.provider.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    Cap: {acc.dailyLimit.toLocaleString()} msgs/day
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 5: Scheduling */}
      {currentStep === 5 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Step 5 — Delivery Scheduling &amp; Throttling</h2>

          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setScheduleType('immediate')}
                className={`flex-1 p-3 rounded-lg border text-left text-xs transition-colors ${
                  scheduleType === 'immediate'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 font-semibold text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Send Immediately
                <span className="text-[11px] font-normal block text-slate-500 mt-1">
                  Start dispatch queue right away after review
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScheduleType('scheduled')}
                className={`flex-1 p-3 rounded-lg border text-left text-xs transition-colors ${
                  scheduleType === 'scheduled'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 font-semibold text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Schedule Specific Window
                <span className="text-[11px] font-normal block text-slate-500 mt-1">
                  Queue for a specific date, time, and timezone
                </span>
              </button>
            </div>

            {scheduleType === 'scheduled' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Send Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Send Time
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
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Interval Throttle Between Messages ({throttleSeconds} seconds)
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
                Staggering prevents sudden provider rate limits and protects domain reputation.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Review & Pre-Flight */}
      {currentStep === 6 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Step 6 — Final Pre-Flight Review &amp; Confirmation</h2>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-500">Campaign Name:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{name}</span>
            </div>

            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-500">Eligible Recipients:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {eligibleRecipients.length} addresses
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-500">Excluded (Suppressed/Opt-out):</span>
              <span className="font-mono text-slate-500">{suppressedCount} addresses</span>
            </div>

            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-500">Selected Sending Accounts:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{selectedAccounts.length} nodes</span>
            </div>

            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-500">Throttle Interval:</span>
              <span className="font-mono">{throttleSeconds}s per message (~{estimatedDurationMinutes} mins total)</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Delivery Schedule:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                {scheduleType === 'immediate' ? 'Immediate Execution' : `Scheduled for ${scheduledDate} at ${scheduledTime}`}
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              By launching, you confirm that all recipients have explicitly provided opt-in consent to receive emails from your organization. Unsubscribe headers will be attached automatically.
            </span>
          </div>
        </div>
      )}

      {/* Step 7: Completed Confirmation Screen */}
      {currentStep === 7 && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Campaign Dispatched Successfully!
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {scheduleType === 'immediate'
              ? 'Your campaign has been queued and is actively delivering through your connected sender nodes.'
              : 'Your campaign has been scheduled and will trigger automatically at the specified window.'}
          </p>

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => onNavigate('campaigns')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              Monitor Dispatches
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {currentStep <= 6 && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={handleBack}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleLaunchCampaign}
              className="px-6 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Queueing Jobs...' : 'Confirm & Launch Dispatch'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
