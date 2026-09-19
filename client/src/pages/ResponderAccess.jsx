import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function ResponderAccess() {
  const { qrId } = useParams();
  const [form, setForm] = useState({ responderName: '', responderRole: '', organisation: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Live countdown
  useEffect(() => {
    if (!data?.expiresAt) return;
    const tick = () => {
      const left = Math.max(0, Math.floor((new Date(data.expiresAt) - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data]);

  const requestAccess = async () => {
    if (!form.responderName.trim()) return alert('Please enter your name or responder ID.');
    setLoading(true);
    try {
      const res = await api.post(`/access/${qrId}/responder`, form);
      setData(res.data);
    } catch {
      alert('Access request failed. Is the server running?');
    }
    setLoading(false);
  };

  const list = (arr) => (arr && arr.length ? arr.join(' · ') : 'None reported');
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const expired = secondsLeft === 0;

  return (
    <div className="page">
      <div className="brand">
        <div className="brand-mark">✚</div>
        <div>
          <div className="brand-name">Responder Access</div>
          <div className="brand-tag">Time-limited · Identity logged</div>
        </div>
      </div>

      {!data ? (
        <>
          <div className="card">
            <h2>Request extended access</h2>
            <p className="subtitle">
              Full contact numbers, surgical history and complete medical detail
              are restricted. Identify yourself to unlock them for 15 minutes.
            </p>

            <div className="field">
              <label>Name or responder ID *</label>
              <input placeholder="e.g. Dr. Meera S / KL-07-AMB-112"
                value={form.responderName} onChange={set('responderName')} />
            </div>

            <div className="field">
              <label>Role</label>
              <input placeholder="Paramedic / Nurse / Emergency Physician"
                value={form.responderRole} onChange={set('responderRole')} />
            </div>

            <div className="field">
              <label>Hospital or service</label>
              <input placeholder="e.g. Govt. Medical College, Thiruvananthapuram"
                value={form.organisation} onChange={set('organisation')} />
            </div>

            <button onClick={requestAccess} disabled={loading}>
              {loading ? 'Requesting…' : 'Unlock for 15 minutes'}
            </button>
          </div>

          <div className="alert">
            <strong>Before you continue</strong>
            Your name, role and timestamp are permanently recorded in this
            patient's access history, and their emergency contact is notified
            that their data was opened.
          </div>

          <Link to={`/emergency/${qrId}`} className="link">← Back to emergency view</Link>
        </>
      ) : (
        <>
          {/* Countdown */}
          <div className="card" style={{
            background: expired ? '#fef2f2' : '#f0fdf4',
            borderColor: expired ? '#fecaca' : '#bbf7d0'
          }}>
            <div className={expired ? 'badge-stale' : 'badge-ok'}>
              {expired ? 'Access expired' : 'Access granted'}
            </div>
            <div style={{
              fontSize: 34, fontWeight: 700, fontFamily: 'ui-monospace, monospace',
              marginTop: 8, color: expired ? '#991b1b' : '#166534'
            }}>
              {secondsLeft !== null ? mmss(secondsLeft) : '—'}
            </div>
            <p className="subtitle" style={{ margin: 0 }}>
              {expired
                ? 'This session has ended. Request access again if still required.'
                : `Remaining · logged as "${form.responderName}"`}
            </p>
          </div>

          {data.notifiedContacts?.length > 0 && (
            <div className="alert">
              <strong>📣 Emergency contact notified</strong>
              {data.notifiedContacts.join(', ')} {data.notifiedContacts.length > 1 ? 'have' : 'has'} been
              alerted that this profile was accessed.
            </div>
          )}

          {!expired && (
            <>
              {/* Full contacts — the gated part */}
              <div className="card">
                <h3 style={{ marginTop: 0 }}>Emergency contacts — full numbers</h3>
                {data.profile.emergencyContacts?.map((c, i) => (
                  <div className="contact" key={i}>
                    <div>
                      <div className="name">{c.name || 'Contact'}</div>
                      {c.relation && <div className="rel">{c.relation}</div>}
                    </div>
                    <a href={`tel:${c.phone}`}>{c.phone}</a>
                  </div>
                ))}
                <div className="hint" style={{ marginTop: 10 }}>
                  Tap a number to dial. These were hidden from the public emergency view.
                </div>
              </div>

              {/* Full clinical detail */}
              <div className="card">
                <h3 style={{ marginTop: 0 }}>Complete medical record</h3>
                <div className="info-row">
                  <span className="k">Patient</span>
                  <span className="v">{data.profile.fullName || '—'}</span>
                </div>
                <div className="info-row">
                  <span className="k">Age</span>
                  <span className="v">{data.profile.age || '—'}</span>
                </div>
                <div className="info-row">
                  <span className="k">Blood group</span>
                  <span className="v">{data.profile.bloodGroup || '—'}</span>
                </div>
                <div className="info-row">
                  <span className="k">Allergies</span>
                  <span className="v">{list(data.profile.allergies)}</span>
                </div>
                <div className="info-row">
                  <span className="k">Conditions</span>
                  <span className="v">{list(data.profile.conditions)}</span>
                </div>
                <div className="info-row">
                  <span className="k">Medications</span>
                  <span className="v">{list(data.profile.medications)}</span>
                </div>
                <div className="info-row">
                  <span className="k">Previous surgeries</span>
                  <span className="v">{list(data.profile.surgeries)}</span>
                </div>
                <div className="info-row">
                  <span className="k">Last confirmed</span>
                  <span className="v">
                    {new Date(data.profile.lastConfirmedAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Access history — transparency */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Access history</h3>
            <p className="subtitle" style={{ marginBottom: 12 }}>
              Every view of this profile is recorded and visible to the patient.
            </p>
            {data.accessLog?.slice(0, 8).map((log, i) => (
              <div className="info-row" key={i}>
                <span className="k">
                  {log.accessType === 'responder_view'
                    ? `${log.accessedBy} · ${log.responderRole}`
                    : 'Public scan (bystander)'}
                </span>
                <span className="v" style={{ fontWeight: 400, color: '#64748b' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>

          <Link to={`/emergency/${qrId}`} className="link">← Back to emergency view</Link>
        </>
      )}
    </div>
  );
}