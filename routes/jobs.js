/* ============================================================
   Good Jobs — Jobs Routes
   GET  /api/jobs          - list all jobs (with optional filters)
   GET  /api/jobs/:id      - get single job by id
   ============================================================ */

const express = require('express');
const router  = express.Router();
const JOBS    = require('../data/jobs');

// ── GET /api/jobs ─────────────────────────────────────────────
// Query params: q, city, industry, type, salary (min salary)
router.get('/', (req, res) => {
  const { q, city, industry, type, salary } = req.query;
  let results = [...JOBS];

  if (city)     results = results.filter(j => j.city.toLowerCase() === city.toLowerCase());
  if (industry) results = results.filter(j => j.industry.toLowerCase() === industry.toLowerCase());
  if (type)     results = results.filter(j => j.type.toLowerCase() === type.toLowerCase());
  if (salary)   results = results.filter(j => j.salaryMin >= parseInt(salary, 10));
  if (q) {
    const query = q.toLowerCase();
    results = results.filter(j =>
      j.title.toLowerCase().includes(query) ||
      j.company.toLowerCase().includes(query) ||
      j.area.toLowerCase().includes(query) ||
      j.skills.some(s => s.toLowerCase().includes(query))
    );
  }

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
});

// ── GET /api/jobs/:id ─────────────────────────────────────────
router.get('/:id', (req, res) => {
  const job = JOBS.find(j => j.id === parseInt(req.params.id, 10));
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }
  res.json({ success: true, data: job });
});

module.exports = router;
