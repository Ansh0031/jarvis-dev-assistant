export default function ChatPage() {
  const name = localStorage.getItem('user_name')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_name')
    window.location.href = '/login'
  }

  return (
    <div style={{padding:'32px',maxWidth:'800px',margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'24px'}}>
        <h1>JARVIS</h1>
        <div>
          <span style={{marginRight:'12px',color:'#64748b'}}>Hello, {name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
      <p style={{color:'#64748b'}}>
        JARVIS is online. AI chat coming in Phase 5!
      </p>
    </div>
  )
}