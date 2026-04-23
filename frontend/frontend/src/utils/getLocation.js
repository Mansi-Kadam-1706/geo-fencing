const getLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported on this device")
      return
    }
    navigator.geolocation.getCurrentPosition(   // ✅ fix 1
      (position) => {
        resolve({
          latitude: position.coords.latitude,   // ✅ fix 2
          longitude: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0                           // ✅ fix 3
      }
    )
  })
}

export default getLocation