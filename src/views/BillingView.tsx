import React from 'react';
import {
  CreditCard,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { BRAND_CONFIG, SubscriptionPlan } from '../config/brand';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export function BillingView() {
  const { userProfile, updatePlan } = useAuth();
  const { accounts, campaigns, contactLists, templates } = useData();

  const currentPlan = BRAND_CONFIG.plans.find(p => p.id === userProfile?.plan) || BRAND_CONFIG.plans[0];

  const totalSentThisMonth = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan.id === currentPlan.id) return;
    if (confirm(`Switch your subscription to the ${plan.name} ($${plan.priceMonthly}/mo)?`)) {
      await updatePlan(plan.id);
      alert(`Your plan has been updated to ${plan.name}. New capacity is immediately available.`);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Subscription &amp; Capacity Quotas
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
          Scale your multi-provider accounts and campaign throughput without artificial bottlenecks.
        </p>
      </div>

      {/* Current Quota Consumption Meters */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs text-slate-500 uppercase font-mono">Active Subscription</span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {currentPlan.name} Tier (${currentPlan.priceMonthly}/month)
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md self-start sm:self-auto">
            Status: Active &amp; Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connected Senders */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-slate-600 dark:text-slate-400">Connected Accounts</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {accounts.length} / {currentPlan.maxAccounts}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (accounts.length / currentPlan.maxAccounts) * 100)}%` }}
              />
            </div>
          </div>

          {/* Monthly Email Quota */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-slate-600 dark:text-slate-400">Monthly Volume</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {totalSentThisMonth.toLocaleString()} / {currentPlan.monthlyEmailLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (totalSentThisMonth / currentPlan.monthlyEmailLimit) * 100)}%` }}
              />
            </div>
          </div>

          {/* Contact Lists */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-slate-600 dark:text-slate-400">Contact Lists</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {contactLists.length} / {currentPlan.maxContactLists}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (contactLists.length / currentPlan.maxContactLists) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plans Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {BRAND_CONFIG.plans.map((plan) => {
          const isCurrent = plan.id === currentPlan.id;

          return (
            <div
              key={plan.id}
              className={`p-5 rounded-xl flex flex-col justify-between transition-all ${
                plan.recommended
                  ? 'bg-white dark:bg-slate-900 border-2 border-indigo-600 shadow-md relative'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider py-0.5 px-2.5 rounded-full">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                  {plan.tagline}
                </p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                    ${plan.priceMonthly}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">/month</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    <span>Sender Accounts:</span>
                    <span className="font-bold">{plan.maxAccounts} max</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    <span>Monthly Dispatch:</span>
                    <span className="font-bold">{plan.monthlyEmailLimit.toLocaleString()}</span>
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrent}
                  className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                      : plan.recommended
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                      : 'bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
