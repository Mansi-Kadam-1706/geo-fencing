import { useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

function QRScanner({ onScan, onError }) {
  const scannerRef = useRef(null)

  useEffect(() => {
    // Create scanner instance
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,          // scans per second
        qrbox: 250,       // scan box size
        aspectRatio: 1.0
      },
      false
    )

    // Start scanning
    scanner.render(
      (decodedText) => {
        // QR scanned successfully
        try {
          // QR contains JSON with token
          const data = JSON.parse(decodedText)
          onScan(data.token)
        } catch {
          // QR contains plain token
          onScan(decodedText)
        }
        scanner.clear() // stop scanner after scan
      },
      (error) => {
        // Scanning error - ignore minor errors
        console.log('Scan error:', error)
      }
    )

    scannerRef.current = scanner

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
      }
    }
  }, [])

  return (
    <div>
      <div id="qr-reader" style={styles.scanner} />
      <p style={styles.hint}>
        Point camera at QR code on projector
      </p>
    </div>
  )
}

const styles = {
  scanner: {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto'
  },
  hint: {
    textAlign: 'center',
    color: '#888',
    marginTop: '10px'
  }
}

export default QRScanner