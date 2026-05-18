import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../api/axios'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await loginUser({ email, password })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user_name', res.data.user_name)
      navigate('/chat')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh'}}>
      <div style={{width:'360px',padding:'32px',border:'1px solid #e2e8f0',borderRadius:'12px'}}>
        <h1 style={{marginBottom:'8px'}}>JARVIS</h1>
        <p style={{color:'#64748b',marginBottom:'24px'}}>Sign in to your account</p>
        {error && <p style={{color:'red',marginBottom:'12px'}}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{width:'100%',padding:'10px',marginBottom:'12px',border:'1px solid #e2e8f0',borderRadius:'8px'}}
          />
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            style={{width:'100%',padding:'10px',marginBottom:'16px',border:'1px solid #e2e8f0',borderRadius:'8px'}}
          />
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:'10px',background:'#1a1a2e',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'16px',color:'#64748b'}}>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}