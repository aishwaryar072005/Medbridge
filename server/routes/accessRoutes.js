const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { findProfile } = require('../models/Profile');
const { createLog, getLogs } = require('../models/AccessLog');

router.post('/:qrId/responder', (req, res) => {
  const { responderName, responderRole, organisation } = req.body;

  if (!responderName || !responderName.trim()) {
    return res.status(400).json({ error: 'Responder identity is required' });
  }

  const profile = findProfile(req.params.qrId);
  if (!profile) return res.status(404).json({ error: 'Not found' });

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  createLog({
    qrId: profile.qrId,
    accessedBy: responderName,
    responderRole: responderRole || 'Unspecified',
    organisation: organisation || '—',
    accessType: 'responder_view',
    expiresAt
  });

  const token = jwt.sign(
    { qrId: profile.qrId, expiresAt },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Emergency Contact Notification (demo stub)
  const notified = profile.emergencyContacts
    .filter(c => c.phone)
    .map(c => c.name || 'Contact');
  console.log(`[NOTIFY] ${responderName} accessed profile ${profile.qrId}. Alerting: ${notified.join(', ') || 'none'}`);

  res.json({
    token,
    expiresAt,
    profile,
    notifiedContacts: notified,
    accessLog: getLogs(profile.qrId)
  });
});

router.get('/:qrId/logs', (req, res) => {
  res.json(getLogs(req.params.qrId));
});

module.exports = router;