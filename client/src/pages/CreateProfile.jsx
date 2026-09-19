import { useState } from 'react';
import api from '../api';

export default function CreateProfile() {
  const [form, setForm] = useState({
    fullName: '', age: '', bloodGroup: '', allergies: '', conditions: '',
    medications: '', surgeries: '',
    emergencyContacts: [{ name: '', relation: '', phone: '' }]
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setContact = (key) => (e) => setForm({
    ...form,
    emergencyContacts: [{ ...form.emergencyContacts[0], [key]: e.target.value }]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toList = (s) => s.split(',').map(x => x.trim()).filter(Boolean);
    try {
      const res = await api.post('/profiles', {
        ...form,
        allergies: toList(form.allergies),
        conditions: toList(form.conditions),
        medications: toList(form.medications),
        surgeries: toList(form.surgeries),
      });
      setResult(res.data);
    } catch (err) {
      alert('Could not create profile. Is the server running?');
    }
    setLoading(false);
  };

    const emergencyLink = result?.emergencyUrl || '';

  return (
    <div className="page">
      <div className="brand">
        <div className="brand-mark">✚</div>
        <div>
          <div className="brand-name">MEDBRIDGE</div>
          <div className="brand-tag">Emergency Medical Context</div>
        </div>
      </div>

      {!result ? (
        <div className="card">
          <h1>Create your emergency profile</h1>
          <p className="subtitle">
            This generates a QR code that lets responders access your critical
            medical information in an emergency.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full name</label>
              <input placeholder="e.g. Anjali Nair" onChange={set('fullName')} required />
            </div>

            <div className="row">
              <div className="field">
                <label>Age</label>
                <input placeholder="24" onChange={set('age')} />
              </div>
              <div className="field">
                <label>Blood group</label>
                <input placeholder="O+" onChange={set('bloodGroup')} />
              </div>
            </div>

            <div className="field">
              <label>Allergies</label>
              <input placeholder="Penicillin, Peanuts" onChange={set('allergies')} />
              <div className="hint">Separate multiple entries with commas</div>
            </div>

            <div className="field">
              <label>Medical conditions</label>
              <input placeholder="Type 1 Diabetes, Asthma" onChange={set('conditions')} />
            </div>

            <div className="field">
              <label>Current medications</label>
              <input placeholder="Insulin, Salbutamol inhaler" onChange={set('medications')} />
            </div>

            <div className="field">
              <label>Previous surgeries</label>
              <input placeholder="Appendectomy 2019" onChange={set('surgeries')} />
              <div className="hint">Only shown to verified responders</div>
            </div>

            <h3>Emergency contact</h3>

            <div className="field">
              <label>Name</label>
              <input placeholder="e.g. Ravi Nair" onChange={setContact('name')} />
            </div>

            <div className="row">
              <div className="field">
                <label>Relationship</label>
                <input placeholder="Father" onChange={setContact('relation')} />
              </div>
              <div className="field">
                <label>Phone</label>
                <input placeholder="+91 98765 43210" onChange={setContact('phone')} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
              {loading ? 'Generating…' : 'Generate emergency QR code'}
            </button>
          </form>
        </div>
      ) : (
        <>
                    <div className="card">
            <h2>Your QR code is ready</h2>
            <p className="subtitle">
              Print this and keep it in your wallet, on your ID card, helmet, or bracelet.
            </p>
            <div className="qr-box">
              <img src={result.qrDataUrl} alt="Emergency QR code" />
            </div>
            <div className="alert" style={{ marginTop: 16, marginBottom: 0 }}>
              <strong>⚡ Works without internet</strong>
              Blood group, allergies and conditions are embedded directly in
              this code — any scanner shows them instantly, even with zero
              signal. The link opens automatically for full details when
              connected.
            </div>
          </div>
          
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Emergency link</h3>
            <p className="subtitle" style={{ marginBottom: 8 }}>
              Anyone who scans the code above opens this page:
            </p>
            <div className="code-box">{emergencyLink}</div>
            <a href={emergencyLink}>
              <button className="secondary" style={{ marginTop: 14 }}>
                Preview emergency view
              </button>
            </a>
          </div>

          <div className="footer-note">
            MEDBRIDGE is a supplemental information layer. It does not replace
            professional medical assessment or emergency services.
          </div>
        </>
      )}
    </div>
  );
}