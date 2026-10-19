import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseError } from '../services/api';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function Register() {
  const { register } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.password_confirmation) e.password_confirmation = 'Passwords do not match.';
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
      await register(form);
      notify.success('Account created. Welcome to the library!');
      navigate('/', { replace: true });
    } catch (err) {
      const parsed = parseError(err);
      setErrors(Object.fromEntries(Object.entries(parsed.errors).map(([k, v]) => [k, v[0]])));
      if (parsed.status !== 422) setFormError(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create an account</h1>
        <Alert>{formError}</Alert>
        <form onSubmit={handleSubmit} noValidate>
          <FormInput label="Full name *" name="name" value={form.name} error={errors.name} onChange={set('name')} />
          <FormInput label="Email *" name="email" type="email" value={form.email} error={errors.email} onChange={set('email')} />
          <FormInput label="Phone" name="phone" value={form.phone} error={errors.phone} onChange={set('phone')} />
          <FormInput label="Password *" name="password" type="password" value={form.password} error={errors.password} onChange={set('password')} />
          <FormInput label="Confirm password *" name="password_confirmation" type="password" value={form.password_confirmation}
            error={errors.password_confirmation} onChange={set('password_confirmation')} />
          <Button type="submit" loading={loading}>Register</Button>
        </form>
        <p className="muted center">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
