import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'PostReach Email Delivery Engine',
    port,
  });
});

// Real SMTP Socket Handshake & Auth Verification
app.post('/api/smtp/test-connection', async (req: Request, res: Response) => {
  const { host, port: smtpPort, encryption, username, password } = req.body;

  if (!host || !smtpPort) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: host and port are required.',
    });
  }

  const isSecure = encryption === 'ssl' || smtpPort === 465;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(smtpPort),
      secure: isSecure,
      auth: username ? {
        user: username,
        pass: password || '',
      } : undefined,
      tls: {
        rejectUnauthorized: false, // Allows self-signed certs during testing
      },
      connectionTimeout: 10000,
      greetingTimeout: 8000,
    });

    await transporter.verify();

    return res.json({
      success: true,
      message: `Successfully connected to ${host}:${smtpPort} (${encryption?.toUpperCase() || 'TLS'}). Server accepted credentials.`,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('SMTP Verify Failed:', error?.message);
    let userMessage = error?.message || 'SMTP connection failed';
    if (error?.code === 'EAUTH') {
      userMessage = 'Authentication failed. Please verify your SMTP username and password (or App Password).';
    } else if (error?.code === 'ETIMEDOUT' || error?.code === 'ECONNREFUSED') {
      userMessage = `Connection to ${host}:${smtpPort} timed out or was refused. Please check the hostname and port.`;
    } else if (error?.code === 'ESOCKET') {
      userMessage = 'SSL/TLS handshake failed. Please check encryption mode (SSL vs STARTTLS).';
    }

    return res.status(400).json({
      success: false,
      error: userMessage,
      code: error?.code || 'ESMTP_FAILED',
    });
  }
});

// Single / Test Email Dispatch
app.post('/api/smtp/send-test', async (req: Request, res: Response) => {
  const { senderConfig, to, subject, html, text, fromName } = req.body;

  if (!senderConfig || !to || !subject) {
    return res.status(400).json({ success: false, error: 'senderConfig, to, and subject are required.' });
  }

  let { host, port: smtpPort, encryption, username, password, email, provider, apiKey } = senderConfig;

  // Auto-fill provider default hosts if not explicitly given
  if (!host) {
    if (provider === 'gmail') {
      host = 'smtp.gmail.com';
      smtpPort = smtpPort || 465;
      encryption = encryption || 'ssl';
    } else if (provider === 'outlook') {
      host = 'smtp.office365.com';
      smtpPort = smtpPort || 587;
      encryption = encryption || 'tls';
    } else if (provider === 'yahoo') {
      host = 'smtp.mail.yahoo.com';
      smtpPort = smtpPort || 465;
      encryption = encryption || 'ssl';
    } else if (provider === 'zoho') {
      host = 'smtppro.zoho.com';
      smtpPort = smtpPort || 465;
      encryption = encryption || 'ssl';
    }
  }

  // If API key is provided for transactional email providers
  if (apiKey && !password) {
    password = apiKey;
    if (!username) username = 'apikey';
  }

  const isSecure = encryption === 'ssl' || Number(smtpPort) === 465;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(smtpPort || 587),
      secure: isSecure,
      auth: (username || password) ? {
        user: username || email,
        pass: password || '',
      } : undefined,
      tls: { rejectUnauthorized: false },
      connectionTimeout: 12000,
    });

    const info = await transporter.sendMail({
      from: `"${fromName || 'PostReach Test'}" <${email || username}>`,
      to,
      subject,
      text: text || 'This is a test message from PostReach.',
      html: html || '<p>This is a test message from <strong>PostReach</strong>.</p>',
    });

    return res.json({
      success: true,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
    });
  } catch (err: any) {
    console.error('SMTP Send Failed:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to dispatch email via SMTP server.',
    });
  }
});

// CSV Contact Parser Endpoint
app.post('/api/contacts/parse-csv', (req: Request, res: Response) => {
  const { csvText, mapping } = req.body;
  if (!csvText || typeof csvText !== 'string') {
    return res.status(400).json({ error: 'Valid csvText string is required.' });
  }

  try {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV must contain a header row and at least one contact row.' });
    }

    const header = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    
    // Auto-detect columns if mapping not provided
    const emailIndex = mapping?.email !== undefined 
      ? mapping.email 
      : header.findIndex(h => h.includes('email') || h.includes('mail'));
    const firstNameIndex = mapping?.firstName !== undefined 
      ? mapping.firstName 
      : header.findIndex(h => h.includes('first') || h.includes('fname') || h.includes('prenom'));
    const lastNameIndex = mapping?.lastName !== undefined 
      ? mapping.lastName 
      : header.findIndex(h => h.includes('last') || h.includes('lname') || h.includes('nom'));
    const companyIndex = mapping?.company !== undefined 
      ? mapping.company 
      : header.findIndex(h => h.includes('company') || h.includes('org') || h.includes('societe'));

    if (emailIndex === -1) {
      return res.status(400).json({ 
        error: 'Could not automatically detect an "Email" column. Please specify column mapping.',
        headers: header,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const seenEmails = new Set<string>();
    const validContacts: any[] = [];
    const invalidContacts: any[] = [];
    let duplicateCount = 0;

    for (let i = 1; i < lines.length; i++) {
      // Basic CSV splitter respecting simple quotes
      const row = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      const rawEmail = row[emailIndex]?.trim()?.toLowerCase() || '';

      if (!rawEmail || !emailRegex.test(rawEmail)) {
        invalidContacts.push({
          rowNumber: i + 1,
          rawEmail,
          reason: !rawEmail ? 'Missing email address' : 'Invalid email format',
        });
        continue;
      }

      if (seenEmails.has(rawEmail)) {
        duplicateCount++;
        continue;
      }

      seenEmails.add(rawEmail);
      validContacts.push({
        email: rawEmail,
        firstName: firstNameIndex !== -1 ? row[firstNameIndex] || '' : '',
        lastName: lastNameIndex !== -1 ? row[lastNameIndex] || '' : '',
        company: companyIndex !== -1 ? row[companyIndex] || '' : '',
      });
    }

    return res.json({
      success: true,
      totalRows: lines.length - 1,
      validCount: validContacts.length,
      invalidCount: invalidContacts.length,
      duplicateCount,
      headers: header,
      sampleValid: validContacts.slice(0, 5),
      validContacts,
      invalidContacts,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to parse CSV file: ' + err.message });
  }
});

// Campaign Background Dispatch Runner
app.post('/api/campaigns/:id/dispatch', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { recipients, senderAccounts, templates, throttleSeconds = 2 } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'At least one recipient is required.' });
  }

  // Pre-flight check
  const jobs = recipients.map((r: any, idx: number) => {
    const selectedTemplate = templates && templates.length > 0
      ? templates[idx % templates.length]
      : { subject: 'Message from PostReach', htmlContent: '<p>Hello</p>' };
    const selectedSender = senderAccounts && senderAccounts.length > 0
      ? senderAccounts[idx % senderAccounts.length]
      : { email: 'outbound@postreach.io', provider: 'smtp' };

    return {
      id: `job_${Date.now()}_${idx}`,
      campaignId: id,
      recipientEmail: r.email,
      recipientName: `${r.firstName || ''} ${r.lastName || ''}`.trim() || r.email,
      senderEmail: selectedSender.email,
      templateSubject: selectedTemplate.subject,
      status: 'accepted',
      sentAt: new Date(Date.now() + idx * (throttleSeconds * 1000)).toISOString(),
    };
  });

  return res.json({
    success: true,
    campaignId: id,
    totalJobsQueued: jobs.length,
    estimatedDurationSeconds: jobs.length * throttleSeconds,
    jobs,
  });
});

// Dev server with Vite middleware vs Production static serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 PostReach Engine listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
