import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, UserCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const result = await register(username, email, password, role);
      if (result.success) {
        setSuccessMsg('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoWrapper}>
            <span style={styles.logoText}>SW</span>
          </div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join Smart Warehouse Management</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {successMsg && (
          <div style={styles.successAlert}>
            <p style={styles.successText}>{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.icon} />
              <input
                type="text"
                placeholder="Choose username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.icon} />
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.icon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>System Role</label>
            <div style={styles.inputWrapper}>
              <UserCheck size={18} style={styles.icon} />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={styles.select}
                disabled={isLoading}
              >
                <option value="employee">Employee (Default)</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            style={styles.submitBtn(isLoading)}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={styles.loaderContent}>
                <Loader2 size={18} style={styles.spinner} />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Already have an account? </span>
          <Link to="/login" style={styles.footerLink}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'radial-gradient(circle at top left, rgba(170, 59, 255, 0.08), transparent 40%), radial-gradient(circle at bottom right, rgba(170, 59, 255, 0.05), transparent 40%), var(--bg)',
    padding: '24px',
    boxSizing: 'border-box',
    width: '100%',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow)',
    padding: '40px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    boxShadow: '0 4px 14px rgba(170, 59, 255, 0.4)',
  },
  logoText: {
    fontFamily: 'var(--heading)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: 'var(--text-h)',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text)',
    margin: 0,
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
  },
  errorText: {
    margin: 0,
    color: '#ef4444',
    fontSize: '14px',
    textAlign: 'left',
    fontWeight: '500',
  },
  successAlert: {
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
  },
  successText: {
    margin: 0,
    color: '#22c55e',
    fontSize: '14px',
    textAlign: 'left',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-h)',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text)',
    opacity: 0.7,
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 44px',
    fontSize: '15px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text-h)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  select: {
    width: '100%',
    padding: '14px 16px 14px 44px',
    fontSize: '15px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text-h)',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    backgroundSize: '16px',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  eyeButton: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    color: 'var(--text)',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    opacity: 0.7,
    transition: 'opacity 0.2s ease',
  },
  submitBtn: (loading) => ({
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '10px',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    cursor: loading ? 'not-allowed' : 'pointer',
    marginTop: '8px',
    boxShadow: loading ? 'none' : '0 4px 14px rgba(170, 59, 255, 0.3)',
    transition: 'transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease',
  }),
  loaderContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  footer: {
    textAlign: 'center',
    marginTop: '28px',
    fontSize: '14px',
  },
  footerText: {
    color: 'var(--text)',
  },
  footerLink: {
    color: 'var(--accent)',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'opacity 0.2s ease',
  }
};

// Add standard focus effect stylesheet details
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    select:focus {
      border-color: var(--accent) !important;
      box-shadow: 0 0 0 3px var(--accent-bg) !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Register;
