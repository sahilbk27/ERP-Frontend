import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(username, password);
        navigate('/');
      } else {
        await register(username, password, role);
        setInfo('Account created. Sign in below.');
        setMode('login');
        setPassword('');
      }
    } catch (err) {
      const msg = err.response?.data || 'Something went wrong. Check your details and try again.';
      setError(typeof msg === 'string' ? msg : 'Unable to complete request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark" />
          <div className="login-title">ERP Console</div>
          <div className="login-sub">{mode === 'login' ? 'Sign in' : 'Create account'}</div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {info && <div className="alert alert-success">{info}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="field">
              <label htmlFor="role">Role</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="login-toggle">
          {mode === 'login' ? (
            <>No account yet? <button onClick={() => { setMode('register'); setError(''); }}>Register</button></>
          ) : (
            <>Already have one? <button onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
}
