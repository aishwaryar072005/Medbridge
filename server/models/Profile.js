const { v4: uuidv4 } = require('uuid');

// This array IS our "database" — it only exists while the server is running
let profiles = [];

function createProfile(data) {
  const profile = {
    qrId: uuidv4(),
    fullName: data.fullName || '',
    age: data.age || '',
    bloodGroup: data.bloodGroup || '',
    allergies: data.allergies || [],
    conditions: data.conditions || [],
    medications: data.medications || [],
    surgeries: data.surgeries || [],
    emergencyContacts: data.emergencyContacts || [],
    aiSummary: data.aiSummary || '',
    lastConfirmedAt: new Date(),
    createdAt: new Date()
  };
  profiles.push(profile);
  return profile;
}

function findProfile(qrId) {
  return profiles.find(p => p.qrId === qrId);
}

function updateProfile(qrId, data) {
  const profile = findProfile(qrId);
  if (!profile) return null;
  Object.assign(profile, data, { lastConfirmedAt: new Date() });
  return profile;
}

module.exports = { createProfile, findProfile, updateProfile };