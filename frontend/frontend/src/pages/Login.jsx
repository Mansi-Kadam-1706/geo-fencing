import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../utils/api'
import getDeviceId from '../utils/getDeviceId'

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const device_id = getDeviceId()

      const res = await API.post('/auth/login', {
        ...form,
        device_id
      })

      // Save token and user to localStorage
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))

      // Redirect based on role
      if (res.data.user.role === 'professor') {
        navigate('/professor')
      } else {
        navigate('/student')
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🎓 Attendance System</h2>
        <h3 style={styles.subtitle}>Login</h3>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            style={styles.button}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.link}>
          Don't have an account?{' '}
          <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
    container :{
        display:"flex",
        justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5'
    },

    card:{
       backgroundColor: 'white',
       padding: "40px",
       borderRadius:"12px",
       boxShadow:" 0 2px 10px rgba(0,0,0,0.1)",
       width: "100%",
       maxWidth:"400px"
    },
    title: {
    textAlign: 'center',
    color: '#1a73e8',
    marginBottom: '5px'
  },
  subtitle: {
    textAlign: 'center',
    color: '#555',
  },
  input:{
    width:"100%",
    padding:"12px",
    marginBottom:"15px",
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '10px'
  },
  link: {
    textAlign: 'center',
    marginTop: '15px',
    color: '#555'
  }

}
export default Login