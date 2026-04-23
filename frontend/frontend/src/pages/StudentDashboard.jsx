
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import API from '../utils/api'
import getLocation from '../utils/getLocation'
import getDeviceId from '../utils/getDeviceId'
import '../styles/StudentDashboard.css'

function StudentDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [inputMethod, setInputMethod] = useState('scan')
  const [sessionId, setSessionId] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [myAttendance, setMyAttendance] = useState(null)
  const [activeTab, setActiveTab] = useState('mark')

  const scannerRef = useRef(null)

  // ── Cleanup scanner on unmount ──
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
      }
    }
  }, [])

  // ── Start Scanner ──
  useEffect(() => {
    if (!showScanner) return

    const timer = setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true
        },
        false
      )

      scanner.render(
        async (decodedText) => {
          console.log('Raw QR scan:', decodedText)

          await scanner.clear()
          setShowScanner(false)

          let token = decodedText
          try {
            const parsed = JSON.parse(decodedText)
            token = parsed.token || decodedText
            console.log('Extracted token:', token)
          } catch {
            token = decodedText
          }

          await markAttendance(token)
        },
        () => {}
      )

      scannerRef.current = scanner
    }, 500)

    return () => {
      clearTimeout(timer)
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
    }
  }, [showScanner])

  // ── Mark Attendance ──
  const markAttendance = async (token) => {
    setLoading(true)
    setStatus(null)

    try {
      const location = await getLocation()
      const device_id = getDeviceId()

      console.log('Token:', token)
      console.log('Location:', location)
      console.log('Device:', device_id)

      const res = await API.post('/attendance/mark', {
        qr_token: token,
        latitude: location.latitude,
        longitude: location.longitude,
        device_id
      })

      setStatus({
        success: true,
        message: res.data.message,
        zone: res.data.zone,
        distance: res.data.distance
      })

    } catch (err) {
      console.log('Error:', err.response?.data)
      setStatus({
        success: false,
        message: err.response?.data?.message 
               || err.message 
               || 'Error marking attendance'
      })
    } finally {
      setLoading(false)
    }
  }

  // ── Manual Submit ──
  const handleManualSubmit = async () => {
    if (!sessionId.trim()) {
      alert('Please enter Session ID')
      return
    }
    await markAttendance(sessionId.trim())
    setSessionId('')
  }

  // ── Fetch My Attendance ──
  const fetchMyAttendance = async () => {
    try {
      const res = await API.get('/attendance/my')
      setMyAttendance(res.data)
    } catch (err) {
      console.error('Error fetching attendance')
    }
  }

  useEffect(() => {
    if (activeTab === 'history') {
      fetchMyAttendance()
    }
  }, [activeTab])

  // ── Logout ──
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const getZoneDisplay = (zone) => {
    switch (zone) {
      case 'INSIDE': return '✅ Inside Hall'
      case 'BORDER': return '⚠️ On Border'
      case 'EDGE':   return '🔶 At Edge'
      case 'MANUAL': return '📝 Manual'
      default:       return ''
    }
  }

  return (
    <div className="s-page">

      {/* ── HEADER ── */}
      <div className="s-header">
        <div className="s-header-left">
          <span className="s-logo">👨‍🎓</span>
          <div>
            <div className="s-header-title">Student Dashboard</div>
            <div className="s-header-sub">
              {user.name} | {user.roll_no}
            </div>
          </div>
        </div>
        <button className="s-logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="s-content">

        {/* ── TABS ── */}
        <div className="s-tab-bar">
          <button
            className={`s-tab ${activeTab === 'mark' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('mark')
              setShowScanner(false)
              setStatus(null)
            }}
          >
            📷 Mark Attendance
          </button>
          <button
            className={`s-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📊 My History
          </button>
        </div>

        {/* ══════════════════
            TAB 1 — MARK
        ══════════════════ */}
        {activeTab === 'mark' && (
          <div className="s-card">
            <h3 className="s-card-title">Mark Attendance</h3>

            {/* Method Toggle */}
            <div className="s-toggle-box">
              <button
                className={`s-toggle-btn ${inputMethod === 'scan' ? 'active' : ''}`}
                onClick={() => {
                  setInputMethod('scan')
                  setShowScanner(false)
                  setStatus(null)
                }}
              >
                📷 Scan QR
              </button>
              <button
                className={`s-toggle-btn ${inputMethod === 'type' ? 'active' : ''}`}
                onClick={() => {
                  setInputMethod('type')
                  setShowScanner(false)
                  setStatus(null)
                }}
              >
                ⌨️ Enter Code
              </button>
            </div>

            {/* ── SCAN METHOD ── */}
            {inputMethod === 'scan' && !status && (
              <div>
                {!showScanner && !loading && (
                  <div className="s-scan-box">
                    <div className="s-scan-icon">📷</div>
                    <p className="s-hint">
                      Point your camera at the QR code on projector
                    </p>
                    <button
                      className="s-primary-btn"
                      onClick={() => setShowScanner(true)}
                    >
                      Open Camera
                    </button>
                  </div>
                )}

                {showScanner && (
                  <div className="s-scanner-box">
                    <div id="qr-reader" style={{ width: '100%' }} />
                    <button
                      className="s-cancel-btn"
                      onClick={() => {
                        if (scannerRef.current) {
                          scannerRef.current.clear().catch(() => {})
                          scannerRef.current = null
                        }
                        setShowScanner(false)
                      }}
                    >
                      ✕ Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── TYPE METHOD ── */}
            {inputMethod === 'type' && !status && (
              <div className="s-type-box">
                <p className="s-hint">
                  Enter the Session Code given by your professor
                </p>
                <input
                  className="s-input"
                  placeholder="Enter Session Code here"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                />
                <button
                  className="s-primary-btn"
                  onClick={handleManualSubmit}
                  disabled={loading}
                >
                  {loading ? '📍 Getting location...' : '✅ Mark Attendance'}
                </button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="s-loading-box">
                <div className="s-spinner">⏳</div>
                <p>Getting your GPS location...</p>
                <p className="s-hint">Please allow location access</p>
              </div>
            )}

            {/* Status Result */}
            {status && (
              <div className={`s-status-box ${status.success ? 'success' : 'error'}`}>
                <div className="s-status-icon">
                  {status.success ? '✅' : '❌'}
                </div>
                <h3 className="s-status-message">
                  {status.message}
                </h3>
                {status.zone && (
                  <p className="s-status-detail">
                    Zone: {getZoneDisplay(status.zone)}
                  </p>
                )}
                {status.distance !== undefined && 
                 status.distance !== null && (
                  <p className="s-status-detail">
                    Distance from hall: {status.distance}m
                  </p>
                )}
                <button
                  className="s-back-btn"
                  onClick={() => {
                    setStatus(null)
                    setShowScanner(false)
                    setSessionId('')
                  }}
                >
                  ← Back
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════
            TAB 2 — HISTORY
        ══════════════════ */}
        {activeTab === 'history' && (
          <div className="s-card">
            <h3 className="s-card-title">📊 My Attendance History</h3>

            {!myAttendance && (
              <div className="s-loading-box">
                <p>Loading...</p>
              </div>
            )}

            {myAttendance && (
              <div>
                <div className="s-summary-row">
                  <div className="s-summary-card">
                    <div className="s-summary-num">
                      {myAttendance.total_sessions}
                    </div>
                    <div className="s-summary-label">Total</div>
                  </div>
                  <div className="s-summary-card present">
                    <div className="s-summary-num">
                      {myAttendance.present}
                    </div>
                    <div className="s-summary-label">Present</div>
                  </div>
                  <div className="s-summary-card percent">
                    <div className="s-summary-num">
                      {myAttendance.percentage}
                    </div>
                    <div className="s-summary-label">Attendance</div>
                  </div>
                </div>

                {myAttendance.records.length > 0 ? (
                  <div className="s-table-wrapper">
                    <table className="s-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Venue</th>
                          <th>Zone</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myAttendance.records.map((r, i) => (
                          <tr key={i}>
                            <td>{r.subject || '—'}</td>
                            <td>{r.venue || '—'}</td>
                            <td>{r.zone_display}</td>
                            <td>
                              {r.marked_at
                                ? new Date(r.marked_at).toLocaleString()
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="s-empty">
                    <p>No attendance records yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default StudentDashboard