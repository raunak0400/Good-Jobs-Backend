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
