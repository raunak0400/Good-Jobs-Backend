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

// ── POST /api/contact/resume (Upload to Cloudinary + Email) ──
router.post('/resume', async (req, res) => {
  const required = ['applicantName', 'applicantEmail', 'jobId', 'jobTitle', 'fileName', 'fileBase64'];
  const missing  = requireFields(req.body, required);
  if (missing.length) {
    return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
  }

  const base64Len = (req.body.fileBase64 || '').length;
  if (base64Len > 11_000_000) {
    return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5 MB.' });
  }

  let fileUrl = null;

  // ── Step 1: Upload to Cloudinary ────────────────────────────
  try {
    console.log('[RESUME] Starting Cloudinary upload for:', req.body.fileName);
    console.log('[RESUME] cloud_name:', process.env.CLOUDINARY_CLOUD_NAME, '| api_key set:', !!process.env.CLOUDINARY_API_KEY);

    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const uploadResult = await cloudinary.uploader.upload(req.body.fileBase64, {
      resource_type: 'raw',
      folder:        'goodjob-resumes',
      public_id:     `${Date.now()}_${req.body.applicantName.replace(/\s+/g,'_')}_${req.body.fileName.replace(/\.[^/.]+$/, '')}`,
      format:        req.body.fileName.split('.').pop().toLowerCase(),
    });

    fileUrl = uploadResult.secure_url;
    console.log('[RESUME] Cloudinary OK. URL:', fileUrl);

  } catch (cloudErr) {
    console.error('[RESUME] Cloudinary FAILED:', cloudErr.message || cloudErr);
    return res.status(500).json({ success: false, message: 'Failed to upload resume. Please try again.' });
  }

  // ── Step 2: Send Email ────────────────────────────────────
  try {
    const smtpReady = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    console.log('[RESUME] SMTP ready:', !!smtpReady, '| host:', process.env.SMTP_HOST, '| user:', process.env.SMTP_USER);

    if (smtpReady) {
      const nodemailer  = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      const toEmail = process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER;
      await transporter.sendMail({
        from:    `"GoodJob Applications" <${process.env.SMTP_USER}>`,
        to:      toEmail,
        subject: `New Application: ${req.body.jobTitle} — ${req.body.applicantName}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:32px;border-radius:12px;">
            <h2 style="color:#0d9488;">New Job Application</h2>
            <hr style="border:1px solid #e5e7eb;margin:16px 0"/>
            <p><strong>Job:</strong> ${req.body.jobTitle} (ID #${req.body.jobId})</p>
            <p><strong>Applicant:</strong> ${req.body.applicantName}</p>
            <p><strong>Email:</strong> <a href="mailto:${req.body.applicantEmail}">${req.body.applicantEmail}</a></p>
            <p><strong>Phone:</strong> ${req.body.applicantPhone || 'N/A'}</p>
            <p><strong>Cover Note:</strong><br/>${req.body.coverNote ? req.body.coverNote.replace(/\n/g, '<br/>') : '<em>None</em>'}</p>
            <br/>
            <div style="padding:20px;background:#f0fdf4;border-left:4px solid #0d9488;border-radius:8px;">
              <strong style="color:#0d9488;">Resume Link:</strong><br/>
              <a href="${fileUrl}" target="_blank" style="color:#0d9488;font-weight:bold;">${fileUrl}</a>
            </div>
            <p style="margin-top:24px;font-size:12px;color:#9ca3af;">GoodJob Platform · ${new Date().toUTCString()}</p>
          </div>
        `,
      });
      console.log('[RESUME] Email sent to:', toEmail);
    } else {
      console.warn('[RESUME] SMTP not configured — skipping email.');
    }
  } catch (mailErr) {
    // CV already uploaded — don't fail the user because of email
    console.error('[RESUME] Email FAILED (CV uploaded OK):', mailErr.message || mailErr);
  }

  res.status(201).json({
    success: true,
    message: `Application submitted! We have received your resume for "${req.body.jobTitle}".`,
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
