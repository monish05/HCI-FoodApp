import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    try {
      await login(email, password)
      nav('/')
    } catch {
      setErr('Invalid email or password.')
    }
  }

  return (
    <PageContainer>
      <div className="page-content py-10">
        <div className="card p-6 sm:p-8 max-w-md mx-auto">
          <h1 className="text-xl font-bold text-ink">Log in</h1>
          <p className="mt-1 text-sm text-ink-muted">Use your account to sync fridge & recipes.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input className="input" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            {err && <p className="text-sm text-tomato-dark">{err}</p>}
            <button className="btn-primary w-full" type="submit">Log in</button>
          </form>

          <p className="mt-4 text-sm text-ink-muted">
            New here? <Link className="text-sage-dark font-medium hover:underline" to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </PageContainer>
  )
}