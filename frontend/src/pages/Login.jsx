import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseError } from '../services/api';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function Login() {
  const { login } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.password) e.password = 'Password is required.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const clientErrors = validate();
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setLoading(true);
    setFormError('');
    try {
      await login(form);
      notify.success('Welcome back!');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      const parsed = parseError(err);
      setErrors(Object.fromEntries(Object.entries(parsed.errors).map(([k, v]) => [k, v[0]])));
      if (parsed.status !== 422) setFormError(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => setForm({ email, password: 'password' });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>📚 Library Login</h1>
        <p className="muted">Sign in to browse and borrow books.</p>

        <Alert>{formError}</Alert>

        <form onSubmit={handleSubmit} noValidate>
          <FormInput label="Email" name="email" type="email" autoComplete="email" value={form.email}
            error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <FormInput label="Password" name="password" type="password" autoComplete="current-password" value={form.password}
            error={errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button type="submit" loading={loading}>Login</Button>
        </form>

        <p className="muted center">
          No account yet? <Link to="/register">Register</Link>
        </p>

        <div className="demo-box">
          <strong>Demo accounts</strong> (password: <code>password</code>)
          <div className="demo-actions">
            <button type="button" className="link-btn" onClick={() => fillDemo('admin@library.test')}>Use admin</button>
            <button type="button" className="link-btn" onClick={() => fillDemo('member@library.test')}>Use member</button>
          </div>
        </div>
      </div>
    </div>
  );
}
