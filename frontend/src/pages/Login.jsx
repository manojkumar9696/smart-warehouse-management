import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login(identifier, password);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err || 'Invalid username/email or password.');
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
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Smart Warehouse Management System</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email or Username</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.icon} />
              <input
                type="text"
                placeholder="Enter email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
                placeholder="Enter password"
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

          <button
            type="submit"
            style={styles.submitBtn(isLoading)}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={styles.loaderContent}>
                <Loader2 size={18} style={styles.spinner} />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Don't have an account? </span>
          <Link to="/register" style={styles.footerLink}>
            Create an Account
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

// Add standard keyframe and focus style effects
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    input:focus {
      border-color: var(--accent) !important;
      box-shadow: 0 0 0 3px var(--accent-bg) !important;
    }
    button:hover:not(:disabled) {
      filter: brightness(1.05);
    }
    button:active:not(:disabled) {
      transform: scale(0.98);
    }
    a:hover {
      text-decoration: underline;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Login;
