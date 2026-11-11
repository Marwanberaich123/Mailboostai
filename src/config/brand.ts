/**
 * إعدادات الهوية والمزودين لمنصة بوست ريتش (PostReach)
 * مهيأة بالكامل باللغة العربية للاستخدام الشخصي المستقل وبدون أي قيود أو اشتراكات مدفوعة.
 */

export interface ProviderDefinition {
  id: 'gmail' | 'outlook' | 'yahoo' | 'zoho' | 'smtp';
  name: string;
  badge: string;
  description: string;
  dailyQuotaHint: string;
  authMethods: ('api' | 'oauth' | 'smtp')[];
  defaultHost?: string;
  defaultPort?: number;
  defaultEncryption?: 'ssl' | 'tls' | 'none';
}

export const BRAND_CONFIG = {
  name: 'بوست ريتش',
  englishName: 'PostReach',
  tagline: 'المنصة الموحدة لإدارة وإرسال البريد الإلكتروني',
  description: 'اربط حسابات البريد الإلكتروني المتعددة (Gmail, Outlook, Yahoo, Zoho, SMTP/API) وأطلق حملاتك البريدية وتابع وصول الرسائل من لوحة تحكم واحدة متكاملة.',
  version: '1.0.0',
  supportEmail: 'admin@postreach.io',
  colors: {
    primary: '#4F46E5', // Electric Indigo
    primaryHover: '#4338CA',
  },
  // حساب المالك الشخصي الكامل (مجاني وغير محدود بالكامل)
  userTier: {
    name: 'الوصول الكامل واللامحدود',
    isUnlimited: true,
    maxAccounts: 999,
    monthlyEmailLimit: 9999999,
    features: [
      'ربط عدد غير محدود من حسابات البريد عبر API أو تسجيل الدخول',
      'إرسال غير محدود وفق حدود مزودي الخدمة الرسمية',
      'منشئ حملات وقوالب رسائل متعددة غير محدودة',
      'فاحص الاتصال المباشر وخوارزمية تجنب الإزعاج',
      'صندوق الردود والوارد الموحد',
      'قوائم استبعاد المشتركين وإلغاء الاشتراك التلقائي',
    ],
  },
  providers: [
    {
      id: 'gmail',
      name: 'Google Gmail / Workspace',
      badge: 'واجهة API أو OAuth',
      description: 'الربط المباشر عبر Google OAuth أو إدخال مفاتيح Gmail API (نطاق gmail.send).',
      dailyQuotaHint: '500 رسالة/يوم للبريد المجاني أو 2,000 رسالة/يوم لحسابات Workspace',
      authMethods: ['oauth', 'api'],
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook / 365',
      badge: 'Graph API أو تسجيل دخول',
      description: 'الربط عبر Microsoft Graph API باستخدام إذن Mail.Send أو تسجيل الدخول.',
      dailyQuotaHint: 'حتى 10,000 مستلم/يوم لحسابات Microsoft 365 Enterprise',
      authMethods: ['oauth', 'api'],
    },
    {
      id: 'yahoo',
      name: 'Yahoo Mail',
      badge: 'كلمة مرور التطبيق / SMTP',
      description: 'الربط الآمن عبر خادم Yahoo SMTP باستخدام كلمة مرور التطبيق (App Password).',
      dailyQuotaHint: '500 رسالة/يوم كحد قياسي',
      authMethods: ['smtp'],
      defaultHost: 'smtp.mail.yahoo.com',
      defaultPort: 465,
      defaultEncryption: 'ssl',
    },
    {
      id: 'zoho',
      name: 'Zoho Mail',
      badge: 'Zoho API / SMTP',
      description: 'الربط عبر Zoho Mail API أو خادم SMTP مع كلمة مرور التطبيق.',
      dailyQuotaHint: 'حتى 1,000 رسالة/يوم حسب إعدادات النطاق',
      authMethods: ['api', 'smtp'],
      defaultHost: 'smtppro.zoho.com',
      defaultPort: 465,
      defaultEncryption: 'ssl',
    },
    {
      id: 'smtp',
      name: 'خادم SMTP مخصص أو API',
      badge: 'SES / SendGrid / Postmark',
      description: 'ربط أي مزود سحابي (Amazon SES, SendGrid, Mailgun, Postmark) عبر SMTP أو مفتاح API.',
      dailyQuotaHint: 'يخضع لحدود سمعة الخادم أو المزود السحابي',
      authMethods: ['smtp', 'api'],
      defaultHost: '',
      defaultPort: 587,
      defaultEncryption: 'tls',
    },
  ] as ProviderDefinition[],
};
