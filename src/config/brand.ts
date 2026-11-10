/**
 * Central Brand and Subscription Configuration for PostReach
 * Easily configurable from this single source of truth.
 */

export interface SubscriptionPlan {
  id: 'free' | 'starter' | 'pro' | 'business';
  name: string;
  badge?: string;
  tagline: string;
  priceMonthly: number;
  maxAccounts: number;
  monthlyEmailLimit: number;
  maxTemplates: number;
  maxContactLists: number;
  features: string[];
  recommended?: boolean;
}

export const BRAND_CONFIG = {
  name: 'PostReach',
  tagline: 'Unified Outbound & Inbox Platform',
  description: 'Connect multiple sending accounts across Gmail, Outlook, Yahoo, Zoho, and SMTP to orchestrate high-deliverability email campaigns from a unified cockpit.',
  version: '1.0.0',
  supportEmail: 'support@postreach.io',
  docsUrl: 'https://docs.postreach.io',
  colors: {
    primary: '#4F46E5', // Electric Indigo
    primaryHover: '#4338CA',
    navyCanvas: '#0A1128',
    navyCard: '#111827',
  },
  plans: [
    {
      id: 'free',
      name: 'Free Starter',
      tagline: 'For individual founders exploring multi-inbox sending',
      priceMonthly: 0,
      maxAccounts: 2,
      monthlyEmailLimit: 500,
      maxTemplates: 3,
      maxContactLists: 3,
      features: [
        'Up to 2 connected email accounts',
        '500 messages per month',
        'Basic CSV contact import & duplicate scrub',
        'Standard HTML & text email composer',
        'Suppression list & unsubscribe link',
        '48-hour activity log history',
      ],
    },
    {
      id: 'starter',
      name: 'Professional',
      tagline: 'For growing sales reps & consultancies scaling outreach',
      priceMonthly: 29,
      maxAccounts: 5,
      monthlyEmailLimit: 5000,
      maxTemplates: 10,
      maxContactLists: 10,
      features: [
        'Up to 5 connected accounts (Gmail, Outlook, SMTP)',
        '5,000 messages per month',
        'Scheduled delivery & throttle interval controls',
        'Multi-template variations (A/B testing)',
        'Detailed bounce & provider acceptance analytics',
        'Priority email verification',
      ],
      recommended: true,
    },
    {
      id: 'pro',
      name: 'Growth Team',
      tagline: 'For agencies and multi-brand outbound operations',
      priceMonthly: 79,
      maxAccounts: 15,
      monthlyEmailLimit: 25000,
      maxTemplates: 50,
      maxContactLists: 50,
      features: [
        'Up to 15 connected accounts across all providers',
        '25,000 messages per month',
        'Unified Replies Inbox with thread reader',
        'Custom sending rate limits per account',
        'Automated bounce classification & auto-suppression',
        'CSV export of delivery reports & logs',
      ],
    },
    {
      id: 'business',
      name: 'Enterprise Scale',
      tagline: 'For high-throughput organizations needing custom limits',
      priceMonthly: 199,
      maxAccounts: 50,
      monthlyEmailLimit: 100000,
      maxTemplates: 200,
      maxContactLists: 200,
      features: [
        'Up to 50 connected accounts (custom quota upgrades)',
        '100,000+ messages per month',
        'Custom SMTP cluster support',
        'Team role-based access & audit logs',
        'Dedicated deliverability IP consultation',
        'Webhook delivery event notifications',
      ],
    },
  ] as SubscriptionPlan[],
  providers: [
    {
      id: 'gmail',
      name: 'Google Gmail / Workspace',
      badge: 'Official API',
      icon: 'Mail',
      description: 'Official Google OAuth sending via Gmail API (https://www.googleapis.com/auth/gmail.send).',
      dailyQuotaHint: '500 msgs/day (free Gmail) or 2,000 msgs/day (Google Workspace)',
      authType: 'oauth',
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook / 365',
      badge: 'Graph API',
      icon: 'Send',
      description: 'Microsoft 365 & Outlook.com using Microsoft Graph API with Mail.Send permission.',
      dailyQuotaHint: 'Up to 10,000 recipients/day (M365 Enterprise) or 300 msgs/day (personal)',
      authType: 'oauth',
    },
    {
      id: 'yahoo',
      name: 'Yahoo Mail',
      badge: 'App Password',
      icon: 'Globe',
      description: 'Connect via Yahoo secure SMTP using an authorized Yahoo Account App Password.',
      dailyQuotaHint: '500 msgs/day standard limit',
      authType: 'smtp',
      defaultHost: 'smtp.mail.yahoo.com',
      defaultPort: 465,
      defaultEncryption: 'ssl',
    },
    {
      id: 'zoho',
      name: 'Zoho Mail',
      badge: 'Secure SMTP / API',
      icon: 'Server',
      description: 'Connect your professional Zoho Mail account via Zoho SMTP or App Password.',
      dailyQuotaHint: 'Up to 1,000 msgs/day depending on Zoho plan',
      authType: 'smtp',
      defaultHost: 'smtppro.zoho.com',
      defaultPort: 465,
      defaultEncryption: 'ssl',
    },
    {
      id: 'smtp',
      name: 'Custom SMTP Server',
      badge: 'Universal',
      icon: 'Terminal',
      description: 'Connect Amazon SES, SendGrid, Mailgun, Postmark, or your own dedicated Postfix server.',
      dailyQuotaHint: 'Governed by your server / provider reputation',
      authType: 'smtp',
      defaultHost: '',
      defaultPort: 587,
      defaultEncryption: 'tls',
    },
  ],
};
