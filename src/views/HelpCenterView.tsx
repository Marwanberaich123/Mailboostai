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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Help Center &amp; Integration Guides
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
          Complete step-by-step setup documentation for Google Cloud Console, Microsoft Azure, and SMTP providers.
        </p>
      </div>

      {/* Guide Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'gmail', label: 'Google Gmail API Setup' },
          { id: 'microsoft', label: 'Microsoft 365 / Graph' },
          { id: 'smtp', label: 'SMTP App Passwords' },
          { id: 'deliverability', label: 'Deliverability & DNS (SPF/DKIM)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveGuide(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeGuide === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gmail Guide */}
      {activeGuide === 'gmail' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Configuring Google Cloud Console for Gmail Sending
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            PostReach follows least-privilege security. We only request permission to send messages on your behalf (<code>https://www.googleapis.com/auth/gmail.send</code>). We never request broad inbox read access.
          </p>

          <ol className="list-decimal pl-4 space-y-2 text-slate-700 dark:text-slate-300">
            <li>
              Navigate to the <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-medium">Google Cloud Console</a> and create or select your project.
            </li>
            <li>
              Enable the <strong>Gmail API</strong> under <em>APIs &amp; Services → Library</em>.
            </li>
            <li>
              Go to <em>APIs &amp; Services → OAuth consent screen</em>. Configure your app as <strong>External</strong> or <strong>Internal</strong> (for Google Workspace organizations).
            </li>
            <li>
              Under <strong>Scopes</strong>, add: <code>https://www.googleapis.com/auth/gmail.send</code>.
            </li>
            <li>
              Create OAuth 2.0 Credentials: Under <em>APIs &amp; Services → Credentials</em>, click <strong>Create Credentials → OAuth Client ID</strong>. Select <strong>Web Application</strong>.
            </li>
            <li>
              Set the <strong>Authorized JavaScript Origins</strong> to your application URL, and click <strong>Create</strong>.
            </li>
          </ol>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-300">
            <strong>Critical Distinction:</strong> Google Sign-In into PostReach is solely for authenticating your user identity. Connecting a Gmail sender account is an independent consent step inside <em>Email Accounts → Connect Gmail</em>.
          </div>
        </div>
      )}

      {/* Microsoft Guide */}
      {activeGuide === 'microsoft' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Configuring Microsoft Azure &amp; Microsoft 365 Graph API
          </h2>

          <ol className="list-decimal pl-4 space-y-2 text-slate-700 dark:text-slate-300">
            <li>
              Log into the <a href="https://portal.azure.com" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-medium">Microsoft Azure Portal</a> and open <strong>Microsoft Entra ID</strong> (formerly Azure AD).
            </li>
            <li>
              Go to <strong>App registrations → New registration</strong>. Name your app <em>PostReach Outbound</em> and choose <em>Accounts in any organizational directory and personal Microsoft accounts</em>.
            </li>
            <li>
              Under <strong>API permissions</strong>, click <em>Add a permission → Microsoft Graph → Delegated permissions</em>. Add <code>Mail.Send</code>.
            </li>
            <li>
              Under <strong>Authentication</strong>, add a Web platform redirect URI or Single Page App URI matching your application domain.
            </li>
          </ol>
        </div>
      )}

      {/* SMTP App Passwords */}
      {activeGuide === 'smtp' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Using App Passwords for Yahoo, Zoho, and 2FA Accounts
          </h2>

          <div className="space-y-3 text-slate-700 dark:text-slate-300">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="font-semibold block text-slate-900 dark:text-white">Yahoo Mail</span>
              <p className="mt-1">
                Go to Yahoo Account Security → Generate App Password → Select "Other App" and enter "PostReach". Use host <code>smtp.mail.yahoo.com</code> on port <code>465</code> (SSL).
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="font-semibold block text-slate-900 dark:text-white">Zoho Mail</span>
              <p className="mt-1">
                Go to Zoho Accounts → Security → Application-Specific Passwords. Use host <code>smtppro.zoho.com</code> on port <code>465</code> (SSL).
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="font-semibold block text-slate-900 dark:text-white">Amazon SES / SendGrid / Postmark</span>
              <p className="mt-1">
                Generate SMTP API credentials from your provider dashboard. Use port <code>587</code> with TLS encryption.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Deliverability Guide */}
      {activeGuide === 'deliverability' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Deliverability Checklist: SPF, DKIM, and DMARC
          </h2>

          <p className="text-slate-700 dark:text-slate-300">
            For maximum deliverability into the primary inbox:
          </p>

          <ul className="list-disc pl-4 space-y-2 text-slate-700 dark:text-slate-300">
            <li>
              <strong>SPF (Sender Policy Framework):</strong> Ensure your sending server IP or include statement is present in your domain's TXT record (e.g. <code>v=spf1 include:_spf.google.com ~all</code>).
            </li>
            <li>
              <strong>DKIM (DomainKeys Identified Mail):</strong> Enable cryptographic signing in your mail provider so messages cannot be forged in transit.
            </li>
            <li>
              <strong>DMARC:</strong> Publish a DMARC policy (e.g. <code>v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com</code>).
            </li>
            <li>
              <strong>Respect Throttling:</strong> Set a conservative interval (2–5 seconds per message) in the Campaign Wizard to avoid sudden spam filter triggers.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
