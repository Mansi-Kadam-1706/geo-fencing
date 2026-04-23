import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../utils/api'
import Timer from '../components/Timer'
import QRDisplay from '../components/QRDisplay'
import '../styles/ProfessorDashboard.css'

function ProfessorDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // ── States ──
  const [venues, setVenues] = useState([])
  const [showAddVenue, setShowAddVenue] = useState(false)
  const [venueForm, setVenueForm] = useState({
    name: '', latitude: '', longitude: '', radius: 100
  })
  const [venueLoading, setVenueLoading] = useState(false)
  const [venueSuccess, setVenueSuccess] = useState('')
  const [selectedVenue, setSelectedVenue] = useState('')
  const [subject, setSubject] = useState('')
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [qrExpired, setQrExpired] = useState(false)
  const [attendanceCount, setAttendanceCount] = useState(0)
  const [totalStudents, setTotalStudents] = useState(0)
  const [report, setReport] = useState([])
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('session')

  useEffect(() => { fetchVenues() }, [])

  useEffect(() => {
    if (!session) return
    const interval = setInterval(() => {
      fetchReport(session.session_id)
    }, 5000)
    return () => clearInterval(interval)
  }, [session])

  // ── API Calls ──
  const fetchVenues = async () => {
    try {
      const res = await API.get('/venue/all')
      setVenues(res.data)
    } catch {
      setError('Error loading venues')
    }
  }

  const addVenue = async () => {
    if (!venueForm.name || !venueForm.latitude || !venueForm.longitude) {
      setError('Please fill all venue details')
      return
    }
    setVenueLoading(true)
    setError('')
    try {
      await API.post('/venue/add', {
        name: venueForm.name,
        latitude: parseFloat(venueForm.latitude),
        longitude: parseFloat(venueForm.longitude),
        radius: parseInt(venueForm.radius)
      })
      setVenueSuccess('Venue added successfully ✅')
      setVenueForm({ name: '', latitude: '', longitude: '', radius: 100 })
      await fetchVenues()
      setTimeout(() => {
        setVenueSuccess('')
        setShowAddVenue(false)
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding venue')
    } finally {
      setVenueLoading(false)
    }
  }

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setVenueForm({
        ...venueForm,
        latitude: pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6)
      }),
      () => setError('Location access denied')
    )
  }

  const createSession = async () => {
    if (!selectedVenue || !subject) {
      setError('Please select venue and enter subject')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await API.post('/session/create', {
        venue_id: selectedVenue, subject
      })
      setSession(res.data)
      setQrExpired(false)
      setActiveTab('session')
      fetchReport(res.data.session_id)
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating session')
    } finally {
      setLoading(false)
    }
  }

  const regenerateQR = async () => {
    try {
      setQrExpired(false)
      const res = await API.put(
        `/session/regenerate/${session.session_id}`
      )
      setSession(prev => ({ ...prev, ...res.data }))
    } catch {
      setError('Error regenerating QR')
    }
  }

  const fetchReport = async (session_id) => {
    try {
      const res = await API.get(`/reports/${session_id}`)
      setAttendanceCount(res.data.summary.present)
      setTotalStudents(res.data.summary.total)
      setSummary(res.data.summary)
      setReport(res.data.students)
    } catch {
      console.error('Error fetching report')
    }
  }

  const manualMark = async (student_id) => {
    try {
      await API.post('/reports/manual-mark', {
        session_id: session.session_id,
        student_id
      })
      fetchReport(session.session_id)
    } catch (err) {
      alert(err.response?.data?.message || 'Error')
    }
  }

  const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  // device_id stays in localStorage
  navigate('/login')
}

  const getZoneLabel = (zone) => {
    const labels = {
      INSIDE: '✅ Inside',
      BORDER: '⚠️ Border',
      EDGE: '🔶 Edge',
      MANUAL: '📝 Manual'
    }
    return labels[zone] || '❌ Absent'
  }

  const getZoneStyle = (zone) => {
    const styles = {
      INSIDE: { color: '#2e7d32', backgroundColor: '#e8f5e9' },
      BORDER: { color: '#e65100', backgroundColor: '#fff3e0' },
      EDGE:   { color: '#b71c1c', backgroundColor: '#ffebee' },
      MANUAL: { color: '#1565c0', backgroundColor: '#e3f2fd' }
    }
    return styles[zone] || { color: '#555', backgroundColor: '#f5f5f5' }
  }

  return (
    <div className="page">

      {/* ── HEADER ── */}
      <div className="header">
        <div className="header-left">
          <span className="logo">🎓</span>
          <div>
            <div className="header-title">Professor Dashboard</div>
            <div className="header-sub">Attendance Management System</div>
          </div>
        </div>
        <div className="header-right">
          <div className="user-badge">👤 {user.name}</div>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="content">

        {/* ── ERROR ── */}
        {error && (
          <div className="error-box">
            <span>⚠️ {error}</span>
            <button className="close-btn" onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* ── TABS ── */}
        <div className="tab-bar">
          {['session', 'venues', 'report'].map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'session' ? '📋 Session' :
               tab === 'venues'  ? '📍 Venues'  :
               '📊 Report'}
            </button>
          ))}
        </div>

        {/* ══════════════════
            TAB 1 — SESSION
        ══════════════════ */}
        {activeTab === 'session' && (
          <div>
            {!session && (
              <div className="card">
                <h3 className="card-title">📋 Create Session</h3>
                <p className="card-sub">Select venue and subject to generate QR</p>

                <div className="form-group select-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="label">Seminar Hall</label>
                    <select
                      className="select"
                      value={selectedVenue}
                      onChange={(e) => setSelectedVenue(e.target.value)}
                    >
                      <option value="">-- Select Venue --</option>
                      {venues.map(v => (
                        <option key={v._id} value={v._id}>
                          {v.name} ({v.radius}m)
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="refresh-btn"
                    onClick={fetchVenues}
                    title="Refresh venues"
                  >🔄</button>
                </div>

                <div className="form-group">
                  <label className="label">Subject</label>
                  <input
                    className="input"
                    placeholder="e.g. DBMS, OS, CN"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                {venues.length === 0 && (
                  <div className="warning-box">
                    ⚠️ No venues found. Go to Venues tab to add one first.
                  </div>
                )}

                <button
                  className="primary-btn"
                  onClick={createSession}
                  disabled={loading}
                >
                  {loading ? '⏳ Generating...' : '📱 Generate QR Code'}
                </button>
              </div>
            )}

            {session && (
              <div>
                <div className="counter-row">
                  <div className="counter-card">
                    <div className="counter-number">{attendanceCount}</div>
                    <div className="counter-label">Present</div>
                  </div>
                  <div className="counter-card absent">
                    <div className="counter-number absent">
                      {totalStudents - attendanceCount}
                    </div>
                    <div className="counter-label">Absent</div>
                  </div>
                  <div className="counter-card total">
                    <div className="counter-number total">{totalStudents}</div>
                    <div className="counter-label">Total</div>
                  </div>
                </div>

                <div className="card">
                  <div className="session-info">
                    <div>
                      <h3 className="session-subject">{session.subject}</h3>
                      <p className="session-venue">📍 {session.venue}</p>
                    </div>
                    <span className="active-badge">🟢 Active</span>
                  </div>

                  {!qrExpired ? (
                    <Timer
                      expiresAt={session.expires_at}
                      onExpire={() => setQrExpired(true)}
                    />
                  ) : (
                    <div className="expired-box">
                      <p className="expired-text">❌ QR Code Expired</p>
                      <button className="regen-btn" onClick={regenerateQR}>
                        🔄 Regenerate QR
                      </button>
                    </div>
                  )}

                  {!qrExpired && (
                    <QRDisplay
                      qrImage={session.qrImage}
                      sessionToken={session.qr_token}
                      subject={session.subject}
                      venue={session.venue}
                    />
                  )}

                  <div className="action-row">
                    {!qrExpired && (
                      <button className="regen-btn" onClick={regenerateQR}>
                        🔄 Regenerate QR
                      </button>
                    )}
                    <button
                      className="report-btn"
                      onClick={() => setActiveTab('report')}
                    >
                      📊 View Report
                    </button>
                    <button
                      className="new-session-btn"
                      onClick={() => {
                        setSession(null)
                        setReport([])
                        setAttendanceCount(0)
                        setTotalStudents(0)
                        setQrExpired(false)
                        setSubject('')
                        setSelectedVenue('')
                      }}
                    >
                      ➕ New Session
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════
            TAB 2 — VENUES
        ══════════════════ */}
        {activeTab === 'venues' && (
          <div className="card">
            <div className="venue-header">
              <div>
                <h3 className="card-title">📍 Classroom </h3>
                <p className="card-sub">{venues.length} venue(s) configured</p>
              </div>
              <button
                className="add-venue-btn"
                onClick={() => setShowAddVenue(!showAddVenue)}
              >
                {showAddVenue ? '✕ Cancel' : '+ Add Venue'}
              </button>
            </div>

            {showAddVenue && (
              <div className="venue-form">
                <h4 className="form-title">Add New Venue</h4>

                <div className="form-row">
                  <div style={{ flex: 2 }}>
                    <label className="label">Classroom name</label>
                    <input
                      className="input"
                      placeholder="e.g. Classroom A"
                      value={venueForm.name}
                      onChange={(e) => setVenueForm({
                        ...venueForm, name: e.target.value
                      })}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="label">Radius (m)</label>
                    <input
                      className="input"
                      type="number"
                      value={venueForm.radius}
                      onChange={(e) => setVenueForm({
                        ...venueForm, radius: e.target.value
                      })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div style={{ flex: 1 }}>
                    <label className="label">Latitude</label>
                    <input
                      className="input"
                      type="number"
                      step="any"
                      placeholder="19.076000"
                      value={venueForm.latitude}
                      onChange={(e) => setVenueForm({
                        ...venueForm, latitude: e.target.value
                      })}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="label">Longitude</label>
                    <input
                      className="input"
                      type="number"
                      step="any"
                      placeholder="72.877700"
                      value={venueForm.longitude}
                      onChange={(e) => setVenueForm({
                        ...venueForm, longitude: e.target.value
                      })}
                    />
                  </div>
                </div>

                <button
                  className="location-btn"
                  onClick={getCurrentLocation}
                >
                  📍 Use My Current Location
                </button>

                {venueSuccess && (
                  <div className="success-box">{venueSuccess}</div>
                )}

                <button
                  className="primary-btn"
                  onClick={addVenue}
                  disabled={venueLoading}
                >
                  {venueLoading ? 'Adding...' : '✅ Add Venue'}
                </button>
              </div>
            )}

            {venues.length > 0 && (
              <div className="venue-list">
                {venues.map(v => (
                  <div key={v._id} className="venue-item">
                    <span className="venue-icon">🏛️</span>
                    <div className="venue-info">
                      <p className="venue-name">{v.name}</p>
                      <p className="venue-coords">
                        Lat: {v.latitude} | Lng: {v.longitude}
                      </p>
                    </div>
                    <span className="venue-badge">{v.radius}m</span>
                  </div>
                ))}
              </div>
            )}

            {venues.length === 0 && !showAddVenue && (
              <div className="empty-state">
                <p className="empty-icon">🏛️</p>
                <p className="empty-text">No venues added yet</p>
                <p className="empty-sub">Click "+ Add Venue" to add a seminar hall</p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════
            TAB 3 — REPORT
        ══════════════════ */}
        {activeTab === 'report' && (
          <div className="card">
            <h3 className="card-title">📊 Attendance Report</h3>

            {!session ? (
              <div className="empty-state">
                <p className="empty-icon">📋</p>
                <p className="empty-text">No active session</p>
                <p className="empty-sub">Create a session first</p>
              </div>
            ) : (
              <div>
                {summary && (
                  <div className="summary-row">
                    {[
                      { label: 'Present', value: summary.present, border: '#4caf50' },
                      { label: 'Absent',  value: summary.absent,  border: '#f44336' },
                      { label: 'Border',  value: summary.on_border || 0, border: '#ff9800' },
                      { label: 'Edge',    value: summary.on_edge || 0,   border: '#f44336' }
                    ].map(s => (
                      <div
                        key={s.label}
                        className="summary-card"
                        style={{ borderLeft: `4px solid ${s.border}` }}
                      >
                        <div className="summary-num">{s.value}</div>
                        <div className="summary-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Roll No</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Zone</th>
                        <th>Distance</th>
                        <th>Time</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.map((s, i) => (
                        <tr key={i} style={{
                          backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa'
                        }}>
                          <td>{s.roll_no}</td>
                          <td>{s.name}</td>
                          <td>
                            <span
                              className="status-badge"
                              style={{
                                backgroundColor: s.status === 'PRESENT'
                                  ? '#e8f5e9' : '#ffebee',
                                color: s.status === 'PRESENT'
                                  ? '#2e7d32' : '#c62828'
                              }}
                            >
                              {s.status === 'PRESENT' ? '✅ Present' : '❌ Absent'}
                            </span>
                          </td>
                          <td>
                            {s.zone ? (
                              <span
                                className="zone-badge"
                                style={getZoneStyle(s.zone)}
                              >
                                {getZoneLabel(s.zone)}
                              </span>
                            ) : '—'}
                          </td>
                          <td>{s.distance ? `${s.distance}m` : '—'}</td>
                          <td>
                            {s.marked_at
                              ? new Date(s.marked_at).toLocaleTimeString()
                              : '—'}
                          </td>
                          <td>
                            {s.status === 'ABSENT' && (
                              <button
                                className="manual-btn"
                                onClick={() => manualMark(s.student_id)}
                              >
                                Mark Present
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default ProfessorDashboard