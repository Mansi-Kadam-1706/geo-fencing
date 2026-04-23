import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ProfessorDashboard from './pages/ProfessorDashboard'
import StudentDashboard from './pages/StudentDashboard'

// Protected route component
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (!token) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/login" />

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/professor" element={
          <ProtectedRoute role="professor">
            <ProfessorDashboard />
          </ProtectedRoute>
        } />

        <Route path="/student" element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App