import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userDB } from '../db/db';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    nombre: '', cedula: '', codigoChofer: '',
    matricula: '', movil: '', email: '',
    password: '', confirmPassword: '',
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSig(true);
  };

  const stopDraw = () => setDrawing(false);

  const clearSig = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!form.codigoChofer) {
      setError('El código de chofer es obligatorio');
      return;
    }
    const existing = userDB.getByCodigoChofer(form.codigoChofer);
    if (existing) {
      setError('Ya existe un usuario con ese código de chofer');
      return;
    }

    const firma = hasSig ? canvasRef.current.toDataURL('image/png') : '';

    userDB.create({
      nombre: form.nombre,
      cedula: form.cedula,
      codigoChofer: form.codigoChofer,
      matricula: form.matricula,
      movil: form.movil,
      email: form.email,
      password: form.password,
      firma,
      role: 'user',
      estado: 'activo',
      vencimiento: '',
    });

    const result = login(form.codigoChofer, form.password);
    if (result.ok) {
      setSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 2000);
    } else {
      setError('Error al ingresar, intentá de nuevo');
    }
  };

  return (
    <div className="auth-page" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div className="auth-logo">
        <div style={{ fontSize: '2.5rem', marginBottom: 4 }}>🚕</div>
        <div className="logo-text">Cierre al Toque</div>
        <div className="logo-sub">Registro de Chofer</div>
      </div>

      <div className="auth-card" style={{ maxWidth: 420, width: '100%' }}>
        <div className="auth-title">Datos del Chofer</div>

        {success && (
          <div className="alert alert-success">
            ✅ ¡Registro exitoso! Entrando...
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre Completo *</label>
            <input className="form-input" required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Juan Pérez" />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Cédula *</label>
              <input className="form-input" required value={form.cedula} onChange={(e) => set('cedula', e.target.value)} placeholder="12345678" />
            </div>
            <div className="form-group">
              <label className="form-label">Cód. Chofer *</label>
              <input className="form-input" required value={form.codigoChofer} onChange={(e) => set('codigoChofer', e.target.value)} placeholder="12345" />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Matrícula *</label>
              <input className="form-input" required value={form.matricula} onChange={(e) => set('matricula', e.target.value)} placeholder="STX 1234" />
            </div>
            <div className="form-group">
              <label className="form-label">Nº Móvil *</label>
              <input className="form-input" required value={form.movil} onChange={(e) => set('movil', e.target.value)} placeholder="1234" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email (opcional)</label>
            <input className="form-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="correo@ejemplo.com" />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Contraseña *</label>
              <input className="form-input" type="password" required value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar *</label>
              <input className="form-input" type="password" required value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} placeholder="••••••" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Firma Digital (opcional)</label>
            <canvas
              ref={canvasRef}
              className="signature-canvas"
              width={360} height={120}
              style={{ height: 120, cursor: 'crosshair' }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            <button type="button" className="btn btn-ghost btn-sm mt-1" onClick={clearSig}>
              Limpiar Firma
            </button>
          </div>

          <button className="btn btn-primary btn-full mt-2" type="submit" disabled={success}>
            REGISTRARME
          </button>
        </form>

        <div className="text-center mt-2">
          <span className="text-muted">¿Ya tenés cuenta? </span>
          <Link to="/login" style={{ color: 'var(--amarillo)', fontWeight: 700 }}>Ingresar</Link>
        </div>
      </div>
    </div>
  );
}
