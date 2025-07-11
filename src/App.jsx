import { useState } from 'react'
import './App.css'

import LandingEditor from './LandingEditor'

export default function App() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResponse(null)

    const loginUrl = 'https://painel-admin-backend-leonardosilvas2.replit.app/api/auth/login'

    console.log('🚀 Iniciando login...')
    console.log('📝 URL:', loginUrl)
    console.log('📝 Credentials:', credentials)

    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      console.log('📡 Response status:', res.status)
      console.log('📡 Response headers:', Object.fromEntries(res.headers.entries()))

      const data = await res.json()
      console.log('📡 Response data:', data)

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token)
        setResponse(data)
      } else {
        setResponse(data)
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error)
      setResponse({ error: 'Erro de conexão: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setResponse({ error: 'Nenhum token encontrado' })
      return
    }

    try {
      const res = await fetch('https://painel-admin-backend-leonardosilvas2.replit.app/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await res.json()
      setResponse(data)
    } catch (error) {
      setResponse({ error: 'Erro de conexão: ' + error.message })
    }
  }

  return (
    <main style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Teste de Login - Painel Admin</h1>

      <form onSubmit={handleLogin} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Username (admin)"
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            style={{ padding: '10px', width: '200px', marginRight: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Password (admin123)"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            style={{ padding: '10px', width: '200px', marginRight: '10px' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Fazendo Login...' : 'Login'}
        </button>
      </form>

      <button 
        onClick={handleVerify}
        style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', marginRight: '10px' }}
      >
        Verificar Token
      </button>

      <button 
        onClick={() => {
          localStorage.removeItem('token')
          setResponse(null)
        }}
        style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        Logout
      </button>

      {response && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: response.error ? '#f8d7da' : '#d4edda',
          border: `1px solid ${response.error ? '#f5c6cb' : '#c3e6cb'}`,
          borderRadius: '5px'
        }}>
          <h3>Resposta da API:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {response && response.token && (
        <div style={{ marginTop: '20px' }}>
          <LandingEditor />
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', background: '#e9ecef', borderRadius: '5px' }}>
        <h3>Credenciais de Teste:</h3>
        <p><strong>Username:</strong> admin</p>
        <p><strong>Password:</strong> admin123</p>
        <p><strong>Current Backend:</strong> https://painel-admin-backend-leonardosilvas2.replit.app/api</p>
        <p><strong>Local URL:</strong> http://localhost:5000/api (quando rodando localmente)</p>
      </div>
    </main>
  )
}