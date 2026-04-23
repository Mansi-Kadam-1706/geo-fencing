function QRDisplay({ qrImage, sessionToken, subject, venue }) {
  return (
    <div style={styles.container}>

      <h3 style={styles.subject}>{subject}</h3>
      <p style={styles.venue}>📍 {venue}</p>

      {/* QR Image */}
      <div style={styles.qrBox}>
        <img
          src={qrImage}
          alt="Attendance QR Code"
          style={styles.qrImage}
        />
      </div>

      <p style={styles.instruction}>
        Scan this QR code to mark attendance
      </p>

      {/* Session ID Backup */}
      <div style={styles.sessionIdBox}>
        <p style={styles.label}>
          📋 Session ID (if projector fails):
        </p>
        <h3 style={styles.sessionId}>
          {sessionToken}
        </h3>
        <button
          style={styles.copyBtn}
          onClick={() => {
            navigator.clipboard.writeText(sessionToken)
            alert('Session ID copied!')
          }}
        >
          Copy ID
        </button>
      </div>

    </div>
  )
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px'
  },
  subject: {
    fontSize: '22px',
    color: '#1a73e8',
    marginBottom: '5px'
  },
  venue: {
    color: '#888',
    marginBottom: '20px'
  },
  qrBox: {
    display: 'inline-block',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '15px'
  },
  qrImage: {
    width: '250px',
    height: '250px',
    display: 'block'
  },
  instruction: {
    color: '#555',
    marginBottom: '20px'
  },
  sessionIdBox: {
    backgroundColor: '#fff3e0',
    padding: '15px',
    borderRadius: '8px',
    display: 'inline-block',
    minWidth: '300px'
  },
  label: {
    color: '#888',
    marginBottom: '8px',
    fontSize: '13px'
  },
  sessionId: {
    fontSize: '16px',
    letterSpacing: '2px',
    color: '#e65100',
    wordBreak: 'break-all',
    marginBottom: '10px'
  },
  copyBtn: {
    padding: '8px 20px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }
}

export default QRDisplay