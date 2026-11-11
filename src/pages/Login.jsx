import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, register, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate(
        location.state?.from || (['seller', 'admin'].includes(user.role) ? '/admin' : '/'),
        { replace: true },
      )
    }
  }, [location.state?.from, navigate, user])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const authenticate = isLogin ? login : register
      const sessionUser = await authenticate({
        name: form.name,
        email: form.email,
        password: form.password,
      })
      const destination = location.state?.from || (
        ['seller', 'admin'].includes(sessionUser.role) ? '/admin' : '/'
      )
      navigate(destination, { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container section-block auth-wrapper">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        {error && <p className="form-error" role="alert">{error}</p>}

        {!isLogin && (
          <label>
            Full name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
        )}

        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            minLength={isLogin ? undefined : 8}
            required
          />
        </label>

        <button type="submit" className="primary-btn" disabled={submitting}>
          {submitting ? 'Please wait...' : isLogin ? 'Login' : 'Create account'}
        </button>

        <button
          type="button"
          className="secondary-btn toggle-button"
          onClick={() => { setIsLogin(!isLogin); setError('') }}
        >
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </form>
    </div>
  )
}

export default Login
