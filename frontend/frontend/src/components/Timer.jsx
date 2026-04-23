import { useState, useEffect } from 'react'

function Timer({ expiresAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(120)

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(expiresAt) - new Date()) / 1000)
      )
      setTimeLeft(remaining)

      if (remaining === 0) {
        clearInterval(interval)
        if (onExpire) onExpire()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt,onExpire])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const color = timeLeft > 60 ? 'green' 
              : timeLeft > 30 ? 'orange' 
              : 'red'

  return (
    <div style={{ textAlign: 'center', margin: '10px 0' }}>
      <p style={{ color, fontSize: '24px', fontWeight: 'bold' }}>
        ⏱ {minutes}:{seconds.toString().padStart(2, '0')}
      </p>
      <p style={{ color: '#888', fontSize: '12px' }}>
        QR expires in {timeLeft} seconds
      </p>
    </div>
  )
}

export default Timer