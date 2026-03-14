import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userDB } from '../db/db';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [codigoChofer, setCodigoChofer] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Recuperación
  const [showRecuperar, setShowRecuperar] = useState(false);
  const [recCodigo, setRecCodigo] = useState('');
  const [recEmail, setRecEmail] = useState('');
  const [recNewPass, setRecNewPass] = useState('');
  const [recConfirm, setRecConfirm] = useState('');
  const [recStep, setRecStep] = useState(1);
  const [recError, setRecError] = useState('');
  const [recSuccess, setRecSuccess] = useState(false);

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

  const handleVerificar = (e) => {
    e.preventDefault();
    setRecError('');
    const user = userDB.getByCodigoChofer(recCodigo.trim());
    if (!user) {
      setRecError('No existe un usuario con ese código de chofer');
      return;
    }
    if (!user.email || user.email.toLowerCase() !== recEmail.trim().toLowerCase()) {
      setRecError('El email no coincide con el registrado');
      return;
    }
    setRecStep(2);
  };

  const handleCambiarPass = (e) => {
    e.preventDefault();
    setRecError('');
    if (recNewPass.length < 6) {
      setRecError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (recNewPass !== recConfirm) {
      setRecError('Las contraseñas no coinciden');
      return;
    }
    const user = userDB.getByCodigoChofer(recCodigo.trim());
    userDB.update(user.id, { password: recNewPass });
    setRecSuccess(true);
    setTimeout(() => {
      setShowRecuperar(false);
      setRecStep(1);
      setRecCodigo(''); setRecEmail('');
      setRecNewPass(''); setRecConfirm('');
      setRecSuccess(false);
    }, 2500);
  };

  if (showRecuperar) {
    return (
      <div className="auth-page">
        <div className="auth-logo">
          <div style={{ fontSize: '3rem', marginBottom: 4 }}>🚕</div>
          <div className="logo-text">Cierre al Toque</div>
          <div className="logo-sub">Recuperar Contraseña</div>
        </div>

        <div className="auth-card">
          <div className="auth-title">
            {recStep === 1 ? '🔍 Verificar Identidad' : '🔑 Nueva Contraseña'}
          </div>

          {recError && (
            <div className="alert alert-error"><span>⚠</span> {recError}</div>
          )}

          {recSuccess && (
            <div className="alert alert-success">✅ Contraseña actualizada. Ingresá con tu nueva contraseña.</div>
          )}

          {recStep === 1 && !recSuccess && (
            <form onSubmit={handleVerificar}>
              <div className="form-group">
                <label className="form-label">Número de Chofer</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Ej: 12345"
                  value={recCodigo}
                  onChange={(e) => setRecCodigo(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email registrado</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={recEmail}
                  onChange={(e) => setRecEmail(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-primary btn-full mt-2" type="submit">
                VERIFICAR
              </button>
            </form>
          )}

          {recStep === 2 && !recSuccess && (
            <form onSubmit={handleCambiarPass}>
              <div className="form-group">
                <label className="form-label">Nueva Contraseña</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••"
                  value={recNewPass}
                  onChange={(e) => setRecNewPass(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar Contraseña</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••"
                  value={recConfirm}
                  onChange={(e) => setRecConfirm(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-primary btn-full mt-2" type="submit">
                GUARDAR CONTRASEÑA
              </button>
            </form>
          )}

          <div className="text-center mt-2">
            <button
              style={{ background: 'none', color: 'var(--amarillo)', fontWeight: 700, fontSize: '0.9rem' }}
              onClick={() => { setShowRecuperar(false); setRecStep(1); setRecError(''); }}
            >
              ← Volver al login
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <button
            style={{ background: 'none', color: 'var(--gris2)', fontSize: '0.85rem' }}
            onClick={() => setShowRecuperar(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

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
