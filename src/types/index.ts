export type PlanTier = 'free' | 'starter' | 'pro' | 'business';

export type ProviderType = 'gmail' | 'outlook' | 'yahoo' | 'zoho' | 'smtp';

export type AccountStatus = 'connected' | 'reconnect_required' | 'rate_limited' | 'disconnected';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  plan: PlanTier;
  createdAt: string;
  updatedAt?: string;
}

export interface EmailAccount {
  id: string;
  userId: string;
  provider: ProviderType;
  email: string;
  displayName?: string;
  status: AccountStatus;
  host?: string;
  port?: number;
  encryption?: 'tls' | 'ssl' | 'none';
  username?: string;
  password?: string;
  sentCount: number;
  dailyLimit: number;
  lastCheckedAt?: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  listIds: string[];
  status: 'active' | 'suppressed' | 'unsubscribed' | 'bounced';
  consentSource?: string;
  createdAt: string;
}

export interface ContactList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  contactCount: number;
  createdAt: string;
}

export interface CampaignTemplate {
  id: string;
  userId: string;
  title: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  createdAt: string;
  updatedAt?: string;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  senderAccountIds: string[];
  targetListIds: string[];
  templateIds: string[];
  recipientCount: number;
  sentCount: number;
  acceptedCount: number;
  bouncedCount: number;
  failedCount: number;
  throttleIntervalSeconds: number;
  scheduledAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CampaignJob {
  id: string;
  userId: string;
  campaignId: string;
  recipientEmail: string;
  recipientName?: string;
  senderAccountId: string;
  templateId?: string;
  status: 'pending' | 'scheduled' | 'processing' | 'accepted' | 'delivered' | 'failed' | 'bounced' | 'suppressed';
  errorLog?: string;
  retryCount: number;
  sentAt?: string;
  createdAt: string;
}

export interface Suppression {
  id: string;
  userId: string;
  email: string;
  reason: 'unsubscribe' | 'hard_bounce' | 'spam_complaint' | 'manual_block';
  createdAt: string;
}

export interface Reply {
  id: string;
  userId: string;
  accountId: string;
  campaignId?: string;
  fromEmail: string;
  fromName?: string;
  subject: string;
  snippet: string;
  body: string;
  receivedAt: string;
}

export type NavigationTab =
  | 'dashboard'
  | 'accounts'
  | 'contacts'
  | 'lists'
  | 'campaigns'
  | 'create-campaign'
  | 'templates'
  | 'scheduled'
  | 'replies'
  | 'analytics'
  | 'billing'
  | 'settings'
  | 'help';
