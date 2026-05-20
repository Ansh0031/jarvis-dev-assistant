import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../api/axios'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await registerUser(form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#f8fafc'}}>
      <div style={{width:'360px',padding:'32px',border:'1px solid #e2e8f0',borderRadius:'12px',background:'white'}}>
        <h1 style={{marginBottom:'8px',fontSize:'24px',fontWeight:'700'}}>Create account</h1>
        <p style={{color:'#64748b',marginBottom:'24px'}}>Join JARVIS</p>
        {error && <p style={{color:'red',marginBottom:'12px',fontSize:'14px'}}>{error}</p>}
        <form onSubmit={handle}>
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            style={{width:'100%',padding:'10px',marginBottom:'12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'14px',outline:'none'}}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            style={{width:'100%',padding:'10px',marginBottom:'12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'14px',outline:'none'}}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            style={{width:'100%',padding:'10px',marginBottom:'16px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'14px',outline:'none'}}
          />
          <button
            type="submit"
            disabled={loading}
            style={{width:'100%',padding:'10px',background:'#1a1a2e',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px',fontWeight:'500'}}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'16px',color:'#64748b',fontSize:'14px'}}>
          Already have account? <Link to="/login" style={{color:'#1a1a2e',fontWeight:'500'}}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}