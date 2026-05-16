/* ============================================================
   Good Jobs — Contact / Form Submission Routes
   POST  /api/contact/job       - Post a job vacancy
   POST  /api/contact/room      - List accommodation
   POST  /api/contact/general   - General enquiry
   POST  /api/newsletter        - Newsletter subscribe
   POST  /api/contact/apply     - Quick apply to a job
   POST  /api/contact/enquire   - Enquire about accommodation
   POST  /api/contact/resume    - Submit CV (emailed as attachment via Resend)
   ============================================================ */

const express = require('express');
const router  = express.Router();
const {
  addJobPosting,
  addRoomListing,
  addGeneralEnquiry,
  addNewsletterEmail,
} = require('../data/submissions');

// ── Helper: validate required fields ─────────────────────────
function requireFields(body, fields) {
  const missing = fields.filter(f => !body[f] || String(body[f]).trim() === '');
  return missing;
}

// ── POST /api/contact/job ─────────────────────────────────────
router.post('/job', (req, res) => {
  const required = ['companyName', 'companyEmail', 'jobTitle', 'jobCity', 'jobIndustry', 'jobType', 'jobDesc'];
  const missing  = requireFields(req.body, required);
  if (missing.length) {
    return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
  }
  const entry = addJobPosting(req.body);
  res.status(201).json({
    success: true,
    message: 'Job listing submitted! Our team will review and publish it within 24 hours.',
    data: { id: entry.id, createdAt: entry.createdAt },
  });
});

// ── POST /api/contact/room ────────────────────────────────────
router.post('/room', (req, res) => {
  const required = ['propName', 'ownerName', 'ownerPhone', 'propType', 'propGender', 'propCity', 'propPrice', 'propAddress'];
  const missing  = requireFields(req.body, required);
  if (missing.length) {
    return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
  }
  const entry = addRoomListing(req.body);
  res.status(201).json({
    success: true,
    message: 'Accommodation listing submitted! We\'ll verify and publish within 48 hours.',
    data: { id: entry.id, createdAt: entry.createdAt },
  });
});

// ── POST /api/contact/general ─────────────────────────────────
router.post('/general', (req, res) => {
  const required = ['genName', 'genEmail', 'genSubject', 'genMessage'];
  const missing  = requireFields(req.body, required);
  if (missing.length) {
    return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
  }
  const entry = addGeneralEnquiry(req.body);
  res.status(201).json({
    success: true,
    message: 'Your message has been received. We\'ll get back to you within 24 hours.',
    data: { id: entry.id, createdAt: entry.createdAt },
  });
});

// ── POST /api/contact/apply (quick apply from job modal) ──────
router.post('/apply', (req, res) => {
  const required = ['applicantName', 'applicantEmail', 'jobId', 'jobTitle'];
  const missing  = requireFields(req.body, required);
  if (missing.length) {
    return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
  }
  const entry = addGeneralEnquiry({
    genName:    req.body.applicantName,
    genEmail:   req.body.applicantEmail,
    genSubject: `Job Application: ${req.body.jobTitle} (#${req.body.jobId})`,
    genMessage: req.body.coverNote || 'Application submitted via Good Jobs platform.',
    phone:      req.body.applicantPhone || '',
    jobId:      req.body.jobId,
    type:       'job_application',
  });
  res.status(201).json({
    success: true,
    message: `Application for "${req.body.jobTitle}" submitted successfully! The employer will contact you soon.`,
    data: { id: entry.id, createdAt: entry.createdAt },
  });
});

// ── POST /api/contact/enquire (enquire about accommodation) ───
router.post('/enquire', (req, res) => {
  const required = ['enquirerName', 'enquirerEmail', 'accId', 'accName'];
  const missing  = requireFields(req.body, required);
  if (missing.length) {
    return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
  }
  const entry = addGeneralEnquiry({
    genName:    req.body.enquirerName,
    genEmail:   req.body.enquirerEmail,
    genSubject: `Accommodation Enquiry: ${req.body.accName} (#${req.body.accId})`,
    genMessage: req.body.message || 'Enquiry submitted via Good Jobs platform.',
    phone:      req.body.enquirerPhone || '',
    accId:      req.body.accId,
    type:       'accommodation_enquiry',
  });
  res.status(201).json({
    success: true,
    message: `Enquiry for "${req.body.accName}" sent! The owner will contact you within 24 hours.`,
    data: { id: entry.id, createdAt: entry.createdAt },
  });
});

// ── POST /api/contact/resume ──────────────────────────────────
// Receives the CV as base64, emails it directly as an attachment via Resend.
// No file storage service — simple and reliable.
router.post('/resume', async (req, res) => {
  const required = ['applicantName', 'applicantEmail', 'jobId', 'jobTitle', 'fileName', 'fileBase64'];
  const missing  = requireFields(req.body, required);
  if (missing.length) {
    return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
  }

  // Reject files over 5 MB (base64 of 5 MB ≈ 6.7 M chars)
  if ((req.body.fileBase64 || '').length > 7_000_000) {
    return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5 MB.' });
  }

  const { applicantName, applicantEmail, applicantPhone, coverNote,
          jobId, jobTitle, fileName, fileSize, fileBase64 } = req.body;

  console.log(`[RESUME] New application — Job: "${jobTitle}" | Applicant: ${applicantName} | File: ${fileName} (${fileSize || '?'})`);

  try {
    const RESEND_KEY = process.env.RESEND_API_KEY;
    const toEmail    = process.env.NOTIFICATION_EMAIL || 'good.jobs.resume@gmail.com';

    if (!RESEND_KEY) {
      console.warn('[RESUME] RESEND_API_KEY not configured — email skipped.');
    } else {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_KEY}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          from:    'GoodJob Applications <onboarding@resend.dev>',
          to:      [toEmail],
          subject: `New Application: ${jobTitle} — ${applicantName}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:32px;border-radius:12px;">
              <h2 style="color:#0d9488;margin-top:0;">📄 New Job Application</h2>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
              <p><strong>Job:</strong> ${jobTitle} (ID #${jobId})</p>
              <p><strong>Applicant:</strong> ${applicantName}</p>
              <p><strong>Email:</strong> <a href="mailto:${applicantEmail}" style="color:#0d9488;">${applicantEmail}</a></p>
              <p><strong>Phone:</strong> ${applicantPhone || 'N/A'}</p>
              <p><strong>Resume:</strong> ${fileName}${fileSize ? ` (${fileSize})` : ''} — <em>attached to this email</em> 📎</p>
              <p><strong>Cover Note:</strong><br/>${coverNote ? coverNote.replace(/\n/g, '<br/>') : '<em>None provided</em>'}</p>
              <p style="margin-top:24px;font-size:12px;color:#9ca3af;">GoodJob Platform · ${new Date().toUTCString()}</p>
            </div>
          `,
          attachments: [{
            filename: fileName,
            content:  fileBase64,   // Resend accepts plain base64 string
          }],
        }),
      });

      const emailData = await emailRes.json();
      if (!emailRes.ok) {
        console.error('[RESUME] Resend error:', JSON.stringify(emailData));
        return res.status(500).json({ success: false, message: 'Failed to send application. Please try again.' });
      }
      console.log('[RESUME] ✅ Email + CV attachment sent via Resend. ID:', emailData.id, '| to:', toEmail);
    }
  } catch (err) {
    console.error('[RESUME] Unexpected error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to process application. Please try again.' });
  }

  res.status(201).json({
    success: true,
    message: `Application submitted! We have received your resume for "${jobTitle}". We will be in touch soon.`,
  });
});

// ── POST /api/newsletter ──────────────────────────────────────
router.post('/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }
  const result = addNewsletterEmail(email.trim().toLowerCase());
  if (result.alreadySubscribed) {
    return res.json({ success: true, message: 'You\'re already subscribed! We\'ll keep sending you great opportunities.' });
  }
  res.status(201).json({
    success: true,
    message: 'Subscribed successfully! You\'ll receive the latest job alerts and accommodation updates.',
  });
});

module.exports = router;
