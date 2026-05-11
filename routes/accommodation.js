/* ============================================================
   Good Jobs — Accommodation Routes
   GET  /api/accommodation          - list all (with filters)
   GET  /api/accommodation/:id      - single listing
   ============================================================ */

const express       = require('express');
const router        = express.Router();
const ACCOMMODATION = require('../data/accommodation');

// ── GET /api/accommodation ────────────────────────────────────
// Query params: q, city, type, gender, maxPrice
router.get('/', (req, res) => {
  const { q, city, type, gender, maxPrice } = req.query;
  let results = [...ACCOMMODATION];

  if (city)     results = results.filter(a => a.city.toLowerCase() === city.toLowerCase());
  if (type)     results = results.filter(a => a.type.toLowerCase() === type.toLowerCase());
  if (gender && gender !== 'Any') {
    results = results.filter(a => a.gender.toLowerCase() === gender.toLowerCase() || a.gender === 'Any');
  }
  if (maxPrice) results = results.filter(a => a.price <= parseInt(maxPrice, 10));
  if (q) {
    const query = q.toLowerCase();
    results = results.filter(a =>
      a.name.toLowerCase().includes(query) ||
      a.area.toLowerCase().includes(query) ||
      a.amenities.some(am => am.toLowerCase().includes(query))
    );
  }

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
});

// ── GET /api/accommodation/:id ────────────────────────────────
router.get('/:id', (req, res) => {
  const acc = ACCOMMODATION.find(a => a.id === parseInt(req.params.id, 10));
  if (!acc) {
    return res.status(404).json({ success: false, message: 'Accommodation not found' });
  }
  res.json({ success: true, data: acc });
});

module.exports = router;
