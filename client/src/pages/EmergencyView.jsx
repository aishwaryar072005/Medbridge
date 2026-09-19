import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function EmergencyView() {
  const { qrId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/profiles/emergency/${qrId}`)
      .then(res => setData(res.data))
      .catch(() => setError(true));
  }, [qrId]);

  if (error) return (
    <div className="page">
      <div className="card">
        <h2>Profile not found</h2>
        <p className="subtitle">This QR code doesn't match any active profile.</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="page">
      <div className="card"><p className="subtitle">Loading emergency information…</p></div>
    </div>
  );

  const list = (arr) => (arr && arr.length ? arr.join(' · ') : 'None reported');
  const confirmedDate = new Date(data.lastConfirmedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className="page">
      <div className="emergency-header">
        <h1>Emergency Medical Info</h1>
        <p>Critical details only — scanned {new Date().toLocaleTimeString()}</p>
      </div>

      {data.isStale && (
        <div className="alert">
          <strong>⚠️ Information may be outdated</strong>
          This profile was last confirmed on {confirmedDate}. Verify with the
          patient or their contact where possible.
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>{data.fullName || 'Unnamed patient'}</h2>
            <p className="subtitle" style={{ margin: 0 }}>
              Confirmed {confirmedDate}{' '}
              <span className={data.isStale ? 'badge-stale' : 'badge-ok'}>
                {data.isStale ? 'Outdated' : 'Current'}
              </span>
            </p>
          </div>
          {data.bloodGroup && <span className="blood-badge">{data.bloodGroup}</span>}
        </div>

        {data.aiSummary && (
          <div className="summary" style={{ marginTop: 18 }}>
            <strong>Quick summary</strong><br />{data.aiSummary}
          </div>
        )}

        <div className="critical" style={{ marginTop: 18 }}>
          <div className="k">Allergies</div>
          <div className="v">{list(data.allergies)}</div>
        </div>

        <div className="critical">
          <div className="k">Medical conditions</div>
          <div className="v">{list(data.conditions)}</div>
        </div>

        <div className="critical">
          <div className="k">Current medications</div>
          <div className="v">{list(data.medications)}</div>
        </div>
      </div>

            <div className="card">
        <h3 style={{ marginTop: 0 }}>Emergency contacts</h3>
        {data.emergencyContacts?.length ? data.emergencyContacts.map((c, i) => (
          <div className="contact" key={i}>
            <div>
              <div className="name">{c.name || 'Contact'}</div>
              {c.relation && <div className="rel">{c.relation}</div>}
            </div>
            <span style={{ fontFamily: 'ui-monospace, monospace', color: '#64748b', fontSize: 14 }}>
              {c.maskedPhone}
            </span>
          </div>
        )) : <p className="subtitle">No contacts listed.</p>}

        <div className="alert" style={{ marginTop: 14, marginBottom: 0 }}>
          <strong>🔒 Numbers hidden for privacy</strong>
          Full contact numbers are released only to verified responders, for 15
          minutes, and every release is logged.
        </div>
      </div>

      <Link to={`/emergency/${qrId}/responder`}>
        <button className="secondary">
          I'm a healthcare responder — request full access
        </button>
      </Link>

      <div className="footer-note">
        Supplemental information only. Always follow professional clinical
        judgement and call emergency services.
      </div>
    </div>
  );
}