import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am JARVIS 🤖 Your AI developer assistant. How can I help you write better code today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [convId, setConvId] = useState(null)
  const bottomRef = useRef(null)
  const name = localStorage.getItem('user_name')
  const token = localStorage.getItem('token')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const logout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }])
    const currentInput = input
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: currentInput, conversation_id: convId })
      })

      const newConvId = res.headers.get('X-Conversation-Id')
      if (newConvId) setConvId(parseInt(newConvId))

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk
          }
          return updated
        })
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1].content = 'Error: Could not reach JARVIS. Is the backend running?'
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#f8fafc',fontFamily:'system-ui,sans-serif'}}>

      {/* Navbar */}
      <div style={{padding:'14px 24px',background:'#0f172a',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 2px 10px rgba(0,0,0,0.3)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <span style={{fontSize:'22px'}}>🤖</span>
          <span style={{fontWeight:'700',fontSize:'20px',letterSpacing:'-0.5px'}}>JARVIS</span>
          <span style={{background:'#22c55e',color:'white',fontSize:'10px',padding:'2px 8px',borderRadius:'10px',fontWeight:'600'}}>ONLINE</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <span style={{color:'#94a3b8',fontSize:'14px'}}>Hello, <strong style={{color:'white'}}>{name}</strong></span>
          <button onClick={logout} style={{background:'transparent',border:'1px solid #334155',color:'#94a3b8',padding:'6px 14px',borderRadius:'8px',cursor:'pointer',fontSize:'13px',transition:'all 0.2s'}}>
            Logout
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:'1',overflow:'auto',padding:'24px 16px',maxWidth:'860px',width:'100%',margin:'0 auto'}}>
        {messages.map((msg, i) => (
          <div key={i} style={{display:'flex',justifyContent:msg.role==='user'?'flex-end':'flex-start',marginBottom:'20px',gap:'10px',alignItems:'flex-start'}}>

            {msg.role === 'assistant' && (
              <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',flexShrink:0,marginTop:'4px'}}>
                🤖
              </div>
            )}

            <div style={{
              maxWidth:'78%',
              padding: msg.role==='user' ? '12px 18px' : '16px 20px',
              borderRadius: msg.role==='user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
              background: msg.role==='user' ? '#0f172a' : 'white',
              color: msg.role==='user' ? 'white' : '#1e293b',
              border: msg.role==='user' ? 'none' : '1px solid #e2e8f0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              fontSize:'14px',
              lineHeight:'1.6',
            }}>
              {msg.role === 'user' ? (
                <span>{msg.content}</span>
              ) : msg.content ? (
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{borderRadius:'8px',fontSize:'13px',margin:'10px 0'}}
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code style={{background:'#f1f5f9',padding:'2px 6px',borderRadius:'4px',fontSize:'13px',fontFamily:'monospace'}} {...props}>
                          {children}
                        </code>
                      )
                    },
                    h3: ({children}) => <h3 style={{fontSize:'16px',fontWeight:'600',margin:'12px 0 6px',color:'#0f172a'}}>{children}</h3>,
                    h4: ({children}) => <h4 style={{fontSize:'14px',fontWeight:'600',margin:'10px 0 4px',color:'#334155'}}>{children}</h4>,
                    p: ({children}) => <p style={{margin:'6px 0',lineHeight:'1.7'}}>{children}</p>,
                    ul: ({children}) => <ul style={{paddingLeft:'20px',margin:'6px 0'}}>{children}</ul>,
                    ol: ({children}) => <ol style={{paddingLeft:'20px',margin:'6px 0'}}>{children}</ol>,
                    li: ({children}) => <li style={{margin:'3px 0'}}>{children}</li>,
                    strong: ({children}) => <strong style={{fontWeight:'600',color:'#0f172a'}}>{children}</strong>,
                    blockquote: ({children}) => <blockquote style={{borderLeft:'3px solid #6366f1',paddingLeft:'12px',margin:'8px 0',color:'#475569',fontStyle:'italic'}}>{children}</blockquote>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                loading && i === messages.length - 1 ? (
                  <span style={{animation:'pulse 1s infinite',opacity:0.7}}>▋</span>
                ) : ''
              )}
            </div>

            {msg.role === 'user' && (
              <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#6366f1',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700',color:'white',flexShrink:0,marginTop:'4px'}}>
                {name?.[0]?.toUpperCase() || 'A'}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{padding:'16px 24px 20px',background:'white',borderTop:'1px solid #e2e8f0',boxShadow:'0 -2px 10px rgba(0,0,0,0.04)'}}>
        <div style={{display:'flex',gap:'10px',maxWidth:'860px',margin:'0 auto',alignItems:'flex-end'}}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==='Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask JARVIS anything about code..."
            disabled={loading}
            style={{
              flex:'1',
              padding:'14px 18px',
              border:'1.5px solid #e2e8f0',
              borderRadius:'12px',
              fontSize:'14px',
              outline:'none',
              background: loading ? '#f8fafc' : 'white',
              transition:'border-color 0.2s',
              fontFamily:'inherit'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              padding:'14px 22px',
              background: loading || !input.trim() ? '#94a3b8' : '#0f172a',
              color:'white',
              border:'none',
              borderRadius:'12px',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              fontWeight:'600',
              fontSize:'14px',
              transition:'all 0.2s',
              whiteSpace:'nowrap'
            }}
          >
            {loading ? '...' : '➤ Send'}
          </button>
        </div>
        <p style={{textAlign:'center',fontSize:'11px',color:'#94a3b8',marginTop:'10px'}}>
          Press <kbd style={{background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:'4px',padding:'1px 5px',fontSize:'10px'}}>Enter</kbd> to send · JARVIS remembers your full conversation · Powered by Groq
        </p>
      </div>

    </div>
  )
}