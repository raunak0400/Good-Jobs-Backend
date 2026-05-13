/* ============================================================
   Good Jobs — Express Server Entry Point
   ============================================================ */

require('dotenv').config();

const express        = require('express');
const cors           = require('cors');
const jobsRouter     = require('./routes/jobs');
const accRouter      = require('./routes/accommodation');
const contactRouter  = require('./routes/contact');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: '*',   // Allow all origins (frontend on Vercel, local dev, etc.)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' })); // Increased for base64 file uploads
app.use(express.urlencoded({ extended: true }));

// ── Request logging (simple) ──────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/jobs',            jobsRouter);
app.use('/api/accommodation',   accRouter);
app.use('/api/contact',         contactRouter);
// Newsletter is exposed at both /api/contact/newsletter AND /api/newsletter
app.post('/api/newsletter', (req, res, next) => { req.url = '/newsletter'; contactRouter(req, res, next); });

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Good Jobs API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── Root ──────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    message: '👋 Welcome to the Good Jobs API',
    docs: {
      health:        'GET  /api/health',
      jobs:          'GET  /api/jobs',
      jobById:       'GET  /api/jobs/:id',
      accommodation: 'GET  /api/accommodation',
      accById:       'GET  /api/accommodation/:id',
      postJob:       'POST /api/contact/job',
      listRoom:      'POST /api/contact/room',
      general:       'POST /api/contact/general',
      apply:         'POST /api/contact/apply',
      enquire:       'POST /api/contact/enquire',
      newsletter:    'POST /api/newsletter',
    },
  });
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Good Jobs API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Jobs:         http://localhost:${PORT}/api/jobs`);
  console.log(`   Accommodation:http://localhost:${PORT}/api/accommodation\n`);
});

module.exports = app;
