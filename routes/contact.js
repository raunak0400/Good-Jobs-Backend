/* ============================================================
   Good Jobs — Contact / Form Submission Routes
   POST  /api/contact/job       - Post a job vacancy
   POST  /api/contact/room      - List accommodation
   POST  /api/contact/general   - General enquiry
   POST  /api/newsletter        - Newsletter subscribe
   POST  /api/contact/apply     - Quick apply to a job
   POST  /api/contact/enquire   - Enquire about accommodation
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
  // Store as a general enquiry type
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

// ── POST /api/contact/resume ─────────────────────────────────
// The frontend uploads the CV directly to Cloudinary and sends us the URL.
// We just send a notification email via Resend (HTTPS — never blocked by Render).
router.post('/resume', async (req, res) => {
  const required = ['applicantName', 'applicantEmail', 'jobId', 'jobTitle', 'fileName', 'resumeUrl'];
  const missing  = requireFields(req.body, required);
  if (missing.length) {
    return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
  }

  const { applicantName, applicantEmail, applicantPhone, coverNote,
          jobId, jobTitle, fileName, fileSize, resumeUrl } = req.body;

  // ── Generate a signed Cloudinary download URL ─────────────────
  // This bypasses the 401 access restriction and forces a download.
  // Valid for 7 days.
  let downloadUrl = resumeUrl; // fallback to raw URL
  try {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Extract public_id from URL (everything after /upload/, strip version prefix)
    const uploadIdx = resumeUrl.indexOf('/upload/');
    if (uploadIdx !== -1) {
      const ext      = fileName.split('.').pop().toLowerCase();
      let publicId   = resumeUrl.substring(uploadIdx + 8).replace(/^v\d+\//, '');
      publicId       = publicId.replace(new RegExp(`\\.${ext}$`), ''); // strip extension
      const expiresAt = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days

      downloadUrl = cloudinary.utils.private_download_url(publicId, ext, {
        resource_type: 'raw',
        attachment:    true,
        expires_at:    expiresAt,
      });
      console.log('[RESUME] Signed download URL generated:', downloadUrl.substring(0, 80) + '...');
    }
  } catch (signErr) {
    console.error('[RESUME] Failed to sign URL, using raw URL:', signErr.message);
  }

  console.log(`[RESUME] Application — Job: "${jobTitle}" | Applicant: ${applicantName}`);

  // ── Send email via Resend (HTTPS — works on Render free tier) ──
  try {
    const RESEND_KEY = process.env.RESEND_API_KEY;
    const toEmail    = process.env.NOTIFICATION_EMAIL || 'good.jobs.resume@gmail.com';

    if (!RESEND_KEY) {
      console.warn('[RESUME] RESEND_API_KEY not set — email skipped. URL:', resumeUrl);
    } else {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
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
              <p><strong>File:</strong> ${fileName}${fileSize ? ` (${fileSize})` : ''}</p>
              <p><strong>Cover Note:</strong><br/>${coverNote ? coverNote.replace(/\n/g, '<br/>') : '<em>None provided</em>'}</p>
              <br/>
              <div style="padding:20px;background:#f0fdf4;border-left:4px solid #0d9488;border-radius:8px;">
                <strong style="color:#0d9488;font-size:15px;">📎 Download Resume</strong><br/><br/>
                <a href="${downloadUrl}"
                   style="display:inline-block;padding:12px 24px;background:#0d9488;color:#fff;border-radius:8px;font-weight:bold;text-decoration:none;">
                  ⬇ Download Resume
                </a>
                <br/><br/>
                <span style="font-size:12px;color:#6b7280;word-break:break-all;">Direct URL: ${resumeUrl}</span>
              </div>
              <p style="margin-top:24px;font-size:12px;color:#9ca3af;">GoodJob Platform · ${new Date().toUTCString()}</p>
            </div>
          `,
        }),
      });

      const emailData = await emailRes.json();
      if (!emailRes.ok) {
        console.error('[RESUME] Resend error:', JSON.stringify(emailData));
      } else {
        console.log('[RESUME] Email sent via Resend. ID:', emailData.id, '| to:', toEmail);
      }
    }
  } catch (mailErr) {
    console.error('[RESUME] Email failed:', mailErr.message);
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

// ── GET /api/contact/download — proxy Cloudinary file as forced download ─
router.get('/download', (req, res) => {
  const { url, name } = req.query;
  if (!url) return res.status(400).send('Missing url parameter');

  let decodedUrl;
  try {
    decodedUrl = decodeURIComponent(url);
    new URL(decodedUrl); // validate it's a real URL
  } catch {
    return res.status(400).send('Invalid url parameter');
  }

  const safeFileName = name ? decodeURIComponent(name) : 'resume.pdf';
  console.log('[DOWNLOAD] Proxying:', decodedUrl);

  const https = require('https');
  const request = https.get(decodedUrl, (fileRes) => {
    console.log('[DOWNLOAD] Cloudinary status:', fileRes.statusCode);

    if (fileRes.statusCode === 301 || fileRes.statusCode === 302) {
      // Follow redirect
      const redirectUrl = fileRes.headers.location;
      console.log('[DOWNLOAD] Redirecting to:', redirectUrl);
      return res.redirect(redirectUrl);
    }

    if (fileRes.statusCode !== 200) {
      console.error('[DOWNLOAD] Non-200 from Cloudinary:', fileRes.statusCode);
      return res.status(502).send('Could not fetch file from storage. Status: ' + fileRes.statusCode);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    res.setHeader('Content-Type', fileRes.headers['content-type'] || 'application/octet-stream');
    if (fileRes.headers['content-length']) {
      res.setHeader('Content-Length', fileRes.headers['content-length']);
    }

    fileRes.pipe(res); // Stream directly to client
  });

  request.on('error', (err) => {
    console.error('[DOWNLOAD] HTTPS request error:', err.message);
    if (!res.headersSent) res.status(500).send('Download failed');
  });
});

module.exports = router;
