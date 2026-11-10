# PostReach — Unified Multi-Provider Email SaaS Platform

A production-grade, multi-tenant email management and campaign delivery platform enabling users to connect multiple email accounts across Gmail, Microsoft Outlook / M365, Yahoo, Zoho, and Custom SMTP to compose personalized messages, execute scheduled marketing campaigns, manage suppression lists, and inspect live deliverability analytics from a unified dashboard.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices from Phase 1:**
> - **Product Brand & Identity**: **PostReach — Unified Outbound & Inbox Platform**.
> - **Backend Persistence Strategy**: **Firebase Authentication & Cloud Firestore** for real-time client state, user profiles, and row-level access control, complemented by a full-stack Node.js/Express server process for live SMTP handshake verification, Google Workspace API proxying, and background queue workers.
> - **Visual Aesthetics & Theme**: **Deep Navy & Electric Indigo** palette with full Dual-Theme (Light/Dark mode) support, strict zero-pill metadata discipline, single-elevation surfaces, and tabular figure metrics (`tabular-nums`).
>
> **Implementation Sequence Decision Gate:**
> When the plan is approved, we will immediately initiate the Firebase provision handshake (`show_aistudio_ui` with `firebase_setup`) and configure the full-stack server architecture to handle both client-side Firestore state and backend email delivery.

---

### 1. Overview & Core Concept

- **What It Does**: PostReach eliminates multi-inbox fragmentation. Users authenticate with Google or email/password, connect multiple legitimate email sending accounts (with isolated OAuth scopes and encrypted SMTP credentials), import and clean contact lists via intelligent CSV mapping, compose multi-variation personalized campaigns with merge tags (`{{first_name}}`, `{{company}}`), schedule message queues with respectful throttling intervals, and monitor provider acceptance, bounces, and incoming replies.
- **Target Audience / Persona**: Growth teams, agency operators, customer success managers, and business founders managing outbound communication and opt-in newsletters across diverse domain infrastructures.
- **Key Value**: Unified delivery management, zero credential cross-contamination, strict compliance enforcement (automatic suppression filtering, one-click unsubscribe links), and honest deliverability metrics (clearly distinguishing provider acceptance from confirmed delivery).

---

### 2. User Experience & Visual Design

#### Key User Flows

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             USER JOURNEY MAP                                │
└─────────────────────────────────────────────────────────────────────────────┘

  [1. Auth & Onboarding]
       │  • Google Sign-In or Email/Password Signup
       │  • Auto-provisions free tier quota & tenant profile
       ▼
  [2. Connect Senders (Email Accounts)]
       │  • Connect Gmail (OAuth `gmail.send` scope)
       │  • Connect Outlook / M365 (Microsoft Graph)
       │  • Add Custom SMTP (Host, Port, SSL/TLS, Port handshake test)
       ▼
  [3. Audience Management (Contacts & Lists)]
       │  • CSV/Excel upload with intelligent column mapper
       │  • Syntax validator & duplicate detection
       │  • Suppression list guard (Unsubscribed / Bounced / Blocked)
       ▼
  [4. Campaign Wizard (6 Stages)]
       │  1. Details & Goals
       │  2. Target Lists & Suppression Scrubbing
       │  3. Multi-Variation Templates (A/B/C/D) & Merge Tags
       │  4. Account Selection & Hourly Quota Inspection
       │  5. Delivery Throttling & Schedule Window (Timezone-aware)
       │  6. Final Pre-flight Review & Confirmation
       ▼
  [5. Dispatch & Delivery Engine]
       │  • Priority job queue with rate limiters
       │  • Provider dispatch with backoff retry
       ▼
  [6. Analytics & Unified Inbox]
          • Provider 250 OK vs Bounce vs Delivery breakdowns
          • Unified conversation viewer for replies
```

#### Visual Identity & Theme Tokens

- **Palette**:
  - Neutral Canvas: Crisp white (`#FFFFFF`) / Deep Charcoal Navy (`#090D16` in dark mode).
  - Structural Surfaces: Soft slate (`#F8FAFC` / `#111827`) with 1px hairline borders (`#E2E8F0` / `#1F2937`).
  - Brand Accent: Electric Indigo (`#4F46E5` / `#6366F1`) for primary calls to action, focus rings, and active tab indicators.
  - Semantic Status: Emerald (`#10B981` active/delivered), Amber (`#F59E0B` scheduled/processing), Rose (`#EF4444` bounced/failed).
- **Typography**:
  - Display & Headings: `Plus Jakarta Sans` for clean, contemporary architectural presence.
  - Body Prose: `Plus Jakarta Sans` / `DM Sans` (14px–16px, 1.5 line height).
  - Metrics, Timestamps & Identifiers: `JetBrains Mono` / `font-mono tabular-nums` for rock-solid tabular vertical alignment.
- **Anti-Slop Discipline**:
  - Zero pill containers for static metadata (dates, categories, and IDs render as clean unboxed text with `·` separators).
  - No decorative pulsing dots or pseudo-code comment headers.
  - Single-elevation card depth without nested cards within cards.

---

### 3. Key Product Decisions & Trade-Offs

1. **Authentication vs. Gmail Authorization Separation**:
   - *Decision*: SaaS sign-in (identifying the user in PostReach) is strictly separated from Gmail account connection. Signing into PostReach only requests basic profile info. Connecting a Gmail account triggers an independent OAuth consent asking specifically for `https://www.googleapis.com/auth/gmail.send`.
   - *Why*: Eliminates security over-permissioning and complies strictly with Google OAuth verification rules and user privacy expectations.

2. **Full-Stack Persistence (Firestore + Node Express Service)**:
   - *Decision*: Cloud Firestore manages tenant data, contact lists, campaign blueprints, templates, and analytics with real-time UI synchronization and Row-Level Security rules. Express server handles live SMTP TCP socket testing (`verifyConnection`), Gmail API send proxying, and background delivery queue processing.
   - *Why*: Browsers cannot open raw TCP sockets to port 465/587 for SMTP; a server-side proxy route is mandatory for real SMTP verification and delivery while keeping secrets safe.

3. **Consent & Suppression List Hardening**:
   - *Decision*: The campaign pre-flight engine cross-checks all recipient emails against the tenant's suppression list (unsubscribes, permanent bounces, manual opt-outs) before creating jobs. Suppressed recipients are automatically pruned from the batch with explicit accounting shown to the user.
   - *Why*: Protects domain reputation, guarantees legal compliance (CAN-SPAM / GDPR), and prevents wasted provider quotas.

4. **Multi-Variation Template Personalization**:
   - *Decision*: Allow users to define up to 4 message variations (Template A, B, C, D) within a campaign. Recipient variables like `{{first_name}}`, `{{last_name}}`, `{{company}}` are dynamically populated with preview toggles for mobile and desktop.
   - *Why*: Enables legitimate A/B testing and recipient personalization without deceptive evasion techniques.

---

### 4. Technical Architecture & Data Strategy

#### System & Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            POSTREACH ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────────┘

  CLIENT APPLICATION (React 19 + TypeScript + Tailwind CSS v4)
  ├── Providers: AuthProvider, ThemeProvider, ToastProvider
  ├── Shell: Collapsible Navigation Sidebar (13 Modules) + Top Bar Contract
  ├── Views:
  │   ├── Dashboard (KPI Cards, Volume Charts, Recent Dispatches)
  │   ├── EmailAccountsView (Connect Gmail, Outlook, Yahoo, Zoho, SMTP)
  │   ├── ContactsView & ContactListsView (CSV Importer, Mapping, Duplicate Scrub)
  │   ├── CampaignWizard (6-step guided wizard with live recipient audit)
  │   ├── TemplatesView (WYSIWYG/HTML Editor, Variable Chips, Preview Modal)
  │   ├── ScheduledQueueView (Pause/Resume, Job Inspect, Priority)
  │   ├── RepliesInboxView (Threaded conversation viewer & manual response)
  │   ├── AnalyticsView (Deliverability vs Provider Acceptance, Bounce log)
  │   ├── BillingView (Tier quotas, Plan upgrade matrix)
  │   └── SettingsView (Profile, Active Sessions, Security, SMTP Defaults)
  │
  ▼ REST API & FIREBASE CLIENT SDK
  ├── Firestore: `users`, `email_accounts`, `contacts`, `campaigns`, `sending_jobs`
  └── Express Proxy Backend (`/server.ts` on Port 3000):
      ├── POST /api/smtp/test-connection (Socket handshake & TLS validation)
      ├── POST /api/smtp/send (Nodemailer dispatch via authenticated sender)
      ├── POST /api/gmail/send (Google Workspace Gmail API dispatch)
      ├── POST /api/campaigns/:id/dispatch (Queue runner & rate-limit throttling)
      └── GET  /api/health (Service status)
```

#### Firestore Data Model

- `/users/{userId}`: User profile, subscription tier (`free` | `starter` | `pro` | `business`), account limits, sender defaults.
- `/users/{userId}/email_accounts/{accountId}`: Provider (`gmail`, `outlook`, `yahoo`, `zoho`, `smtp`), email, host, port, encryption, status (`connected`, `reconnect_required`, `rate_limited`), sentCount, lastCheckedAt.
- `/users/{userId}/contacts/{contactId}`: Email, firstName, lastName, company, customFields, status (`active`, `suppressed`), consentSource, createdAt.
- `/users/{userId}/contact_lists/{listId}`: Name, description, memberCount, createdAt.
- `/users/{userId}/suppressions/{emailHash}`: Email, reason (`unsubscribe`, `hard_bounce`, `spam_complaint`), suppressedAt.
- `/users/{userId}/templates/{templateId}`: Title, subject, htmlBody, textBody, variables, updatedAt.
- `/users/{userId}/campaigns/{campaignId}`: Name, status (`draft`, `scheduled`, `in_progress`, `paused`, `completed`), recipientCount, senderAccountIds, templateIds, scheduledAt, throttleIntervalSeconds, stats (sent, accepted, bounced, failed).
- `/users/{userId}/campaigns/{campaignId}/jobs/{jobId}`: RecipientEmail, senderAccountId, templateId, status (`pending`, `processing`, `accepted`, `bounced`, `failed`), retryCount, errorLog, sentAt.
- `/users/{userId}/replies/{replyId}`: SenderEmail, recipientAccount, subject, snippet, body, receivedAt, campaignId.

---

### Implementation Phasing

- **Phase 1: Foundation, UI Shell & Authentication**
  - Project branding (`PostReach`), typography, and Tailwind v4 dual-theme styling.
  - Complete navigation sidebar and top header bar meeting the 3-zone contract.
  - Firebase Authentication + Google Sign-In with email/password fallback, password recovery, and persistent session state.
  - Executive Analytics Dashboard with live Firestore metrics and meaningful zero-states.

- **Phase 2: Email Accounts & Provider Handshake**
  - Dedicated multi-provider connection interface for Gmail, Outlook, Yahoo, Zoho, and Custom SMTP.
  - Express server-side test connection handler (`/api/smtp/test-connection`) with real socket validation.
  - Account health monitoring, sending eligibility, and test dispatch triggers.

- **Phase 3: Contacts, CSV Import & Suppression Guard**
  - Full recipient database with contact list segmentation.
  - CSV/Excel file parser with interactive column mapping, duplicate detection, and invalid email download.
  - Automated suppression list enforcement preventing sends to opted-out or bounced recipients.

- **Phase 4: Email Composer, Templates & Campaign Wizard**
  - Reusable template manager with 4+ variation slots, preview renderer, and personalization tag injection.
  - 6-stage wizard with pre-flight quota verification, sending interval throttle, and explicit final confirmation.

- **Phase 5: Sending Queue, Dispatch Engine & Replies**
  - Server-backed queue processing with exponential retry backoff and rate-limit preservation.
  - Unified replies inbox displaying incoming responses with quick reply affordances.
  - Deliverability breakdown distinguishing provider acceptance from confirmed delivery.

- **Phase 6: Billing, Settings & Hardened Security Rules**
  - Subscription tier configuration matrix (Free, Starter, Pro, Business) with dynamic quota meters.
  - Comprehensive Firestore security rules (`firestore.rules`) enforcing user data isolation and ABAC controls.
  - Detailed environment setup documentation for Google Cloud Console and SMTP providers.
