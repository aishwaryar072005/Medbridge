const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { createProfile, findProfile, updateProfile } = require('../models/Profile');
const { createLog } = require('../models/AccessLog');

// Mask a phone number: keep last 4 digits only
function maskPhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length <= 4) return '••••';
  return '•••• ••• ' + digits.slice(-4);
}

// Create profile
// Builds the text embedded directly in the QR pattern (works with zero internet)
function buildOfflinePayload(profile, url) {
  const lines = [
    'MEDBRIDGE EMERGENCY ID',
    `Name: ${profile.fullName || 'Unknown'}`,
    `Blood Group: ${profile.bloodGroup || 'Unknown'}`,
    `Allergies: ${profile.allergies?.length ? profile.allergies.join(', ') : 'None reported'}`,
    `Conditions: ${profile.conditions?.length ? profile.conditions.join(', ') : 'None reported'}`,
    `Medications: ${profile.medications?.length ? profile.medications.join(', ') : 'None reported'}`,
    'Emergency contact + full record (needs internet):',
    url
  ];
  return lines.join('\n');
}

router.post('/', async (req, res) => {
  try {
    const profile = createProfile(req.body);
    const url = `${process.env.CLIENT_URL}/emergency/${profile.qrId}`;
    const offlinePayload = buildOfflinePayload(profile, url);

    const qrDataUrl = await QRCode.toDataURL(offlinePayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320
    });

    res.status(201).json({ profile, qrDataUrl, emergencyUrl: url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public Emergency View — NO full phone numbers, NO surgery history
router.get('/emergency/:qrId', (req, res) => {
  const profile = findProfile(req.params.qrId);
  if (!profile) return res.status(404).json({ error: 'Not found' });

  createLog({ qrId: profile.qrId, accessType: 'emergency_view' });

  const daysSinceConfirmed = (Date.now() - new Date(profile.lastConfirmedAt)) / 86400000;
  const isStale = daysSinceConfirmed > 90;

  res.json({
    fullName: profile.fullName,
    bloodGroup: profile.bloodGroup,
    allergies: profile.allergies,
    conditions: profile.conditions,
    medications: profile.medications,
    aiSummary: profile.aiSummary,
    // masked — full numbers require responder access
    emergencyContacts: profile.emergencyContacts.map(c => ({
      name: c.name,
      relation: c.relation,
      maskedPhone: maskPhone(c.phone)
    })),
    isStale,
    lastConfirmedAt: profile.lastConfirmedAt
  });
});

// Confirm/refresh profile freshness
router.patch('/:qrId/confirm', (req, res) => {
  const profile = updateProfile(req.params.qrId, {});
  if (!profile) return res.status(404).json({ error: 'Not found' });
  res.json(profile);
});

// Update profile
router.put('/:qrId', (req, res) => {
  const profile = updateProfile(req.params.qrId, req.body);
  if (!profile) return res.status(404).json({ error: 'Not found' });
  res.json(profile);
});

module.exports = router;