import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [codigoChofer, setCodigoChofer] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = login(codigoChofer.trim(), password);
    setLoading(false);
    if (result.ok) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div style={{ fontSize: '3rem', marginBottom: 4 }}>🚕</div>
        <div className="logo-text">Cierre al Toque</div>
        <div className="logo-sub">Liquidación Diaria · Uruguay</div>
      </div>

      <div className="auth-card">
        <div className="auth-title">Ingresar</div>

        {error && (
          <div className="alert alert-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Número de Chofer</label>
            <input
              className="form-input"
              type="text"
              placeholder="Ej: 12345"
              value={codigoChofer}
              onChange={(e) => setCodigoChofer(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button className="btn btn-primary btn-full mt-2" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'ENTRAR'}
          </button>
        </form>

        <div className="text-center mt-2">
          <span className="text-muted">¿Primera vez? </span>
          <Link to="/register" style={{ color: 'var(--amarillo)', fontWeight: 700 }}>
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}
