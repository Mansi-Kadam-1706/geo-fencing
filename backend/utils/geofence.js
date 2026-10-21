// Haversine formula
// Calculates distance between two GPS points in meters

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000 // Earth radius in meters

  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return distance // in meters
}

// Check which zone student is in
const checkGeofenceStatus = (
    studentLat,studentLng,
    hallLat,hallLng,
    radius
)=>{
    const distance = calculateDistance(
        studentLat, studentLng,
    hallLat, hallLng
    )

  // Zone detection
  if (distance <= radius * 0.70) {
    return {
      allowed: true,
      zone: 'INSIDE',
      message: 'Attendance marked successfully ✅',
      distance: Math.round(distance)
    }
  }

  else if (distance <= radius * 0.90) {
    return {
      allowed: true,
      zone: 'BORDER',
      message: ' You are on the border of the hall. Attendance marked.',
      distance: Math.round(distance)
    }
  }

  else if (distance <= radius) {
    return {
      allowed: true,
      zone: 'EDGE',
      message: ' You are at the edge. Please move inside the hall.',
      distance: Math.round(distance)
    }
  }

  else {
    return {
      allowed: false,
      zone: 'OUTSIDE',
      message: ' You are outside the seminar hall.',
      distance: Math.round(distance)
    }
  }
}

module.exports = { calculateDistance, checkGeofenceStatus }