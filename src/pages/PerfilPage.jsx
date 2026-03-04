import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userDB } from '../db/db';
import { LogOut, Save } from 'lucide-react';

export default function PerfilPage() {
  const { user, logout, refreshUser } = useAuth();
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    nombre: user.nombre || '',
    matricula: user.matricula || '',
    movil: user.movil || '',
    email: user.email || '',
    codigoChofer: user.codigoChofer || '',
    newPassword: '',
    confirmPassword: '',
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

    if (user.firma) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = user.firma;
      setHasSig(true);
    }
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    if (e.touches) return { x: (e.touches[0].clientX - rect.left) * sx, y: (e.touches[0].clientY - rect.top) * sy };
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const startDraw = (e) => { e.preventDefault(); setDrawing(true); const c = canvasRef.current; const ctx = c.getContext('2d'); const p = getPos(e, c); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const draw = (e) => { e.preventDefault(); if (!drawing) return; const c = canvasRef.current; const ctx = c.getContext('2d'); const p = getPos(e, c); ctx.lineTo(p.x, p.y); ctx.stroke(); setHasSig(true); };
  const stopDraw = () => setDrawing(false);
  const clearSig = () => { const c = canvasRef.current; const ctx = c.getContext('2d'); ctx.fillStyle = '#FFF'; ctx.fillRect(0, 0, c.width, c.height); setHasSig(false); };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = (e) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      alert('Las contraseñas no coinciden'); return;
    }
    const updates = {
      nombre: form.nombre,
      matricula: form.matricula,
      movil: form.movil,
      email: form.email,
      codigoChofer: form.codigoChofer,
      firma: hasSig ? canvasRef.current.toDataURL('image/png') : '',
    };
    if (form.newPassword) updates.password = form.newPassword;
    userDB.update(user.id, updates);
    refreshUser();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isExpired = user.vencimiento && new Date(user.vencimiento) < new Date();
  const isActive = userDB.isActive(user);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>
          Mi Perfil
        </div>
        <div style={{ color: 'var(--gris2)', fontSize: '0.8rem' }}>
          Cédula: {user.cedula} ·
          <span className={`badge ${isActive ? 'badge-activo' : 'badge-inactivo'}`} style={{ marginLeft: 6 }}>
            {isActive ? 'Activo' : 'Inactivo'}
          </span>
          {user.role === 'admin' && <span className="badge badge-admin" style={{ marginLeft: 6 }}>Admin</span>}
        </div>
        {isExpired && (
          <div className="alert alert-error mt-1">⚠ Tu suscripción venció el {user.vencimiento}</div>
        )}
        {user.vencimiento && !isExpired && (
          <div className="alert alert-warning mt-1">⏰ Suscripción vence: {user.vencimiento}</div>
        )}
      </div>

      {saved && <div className="alert alert-success">✓ Perfil actualizado</div>}

      <form onSubmit={handleSave}>
        <div className="card">
          <div className="card-title">👤 Datos Personales</div>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input className="form-input" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Cód. Chofer</label>
              <input className="form-input" value={form.codigoChofer} onChange={(e) => set('codigoChofer', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Nº Móvil</label>
              <input className="form-input" value={form.movil} onChange={(e) => set('movil', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Matrícula</label>
            <input className="form-input" value={form.matricula} onChange={(e) => set('matricula', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
        </div>

        <div className="card">
          <div className="card-title">🔒 Cambiar Contraseña</div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Nueva Contraseña</label>
              <input className="form-input" type="password" value={form.newPassword} onChange={(e) => set('newPassword', e.target.value)} placeholder="Dejar vacío para no cambiar" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar</label>
              <input className="form-input" type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} placeholder="Repetir contraseña" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">✍ Firma Digital</div>
          <canvas
            ref={canvasRef}
            className="signature-canvas"
            width={360} height={120} style={{ height: 120, cursor: 'crosshair' }}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
          />
          <button type="button" className="btn btn-ghost btn-sm mt-1" onClick={clearSig}>Limpiar Firma</button>
        </div>

        <button className="btn btn-primary btn-full" type="submit" style={{ minHeight: 52, fontSize: '1rem', marginBottom: 12 }}>
          <Save size={18} /> GUARDAR CAMBIOS
        </button>
      </form>

      <button className="btn btn-danger btn-full" style={{ marginBottom: 16 }} onClick={logout}>
        <LogOut size={18} /> CERRAR SESIÓN
      </button>
    </div>
  );
}
