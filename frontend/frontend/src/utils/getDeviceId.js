const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id')

  if (!deviceId) {
    deviceId = 'device_' +
      Math.random().toString(36).substr(2, 9) +
      '_' + Date.now()
    localStorage.setItem('device_id', deviceId)
    console.log('New device_id created:', deviceId)
  } else {
    console.log('Existing device_id found:', deviceId)
  }

  return deviceId
}

export default getDeviceId