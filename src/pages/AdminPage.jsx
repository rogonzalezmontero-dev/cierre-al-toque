import { useState } from 'react';
import { userDB } from '../db/db';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Plus, Edit2, X, Check } from 'lucide-react';

function UserRow({ u, onEdit, onToggle, onDelete }) {
  const isActive = u.estado === 'activo';
  return (
    <div style={{
      background: 'var(--negro3)', border: '1px solid var(--gris)',
      borderRadius: 8, padding: 12, marginBottom: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{u.nombre}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gris2)', marginTop: 2 }}>
            CI: {u.cedula} · Móvil: {u.movil} · {u.codigoChofer}
          </div>
          {u.vencimiento && (
            <div style={{ fontSize: '0.72rem', color: new Date(u.vencimiento) < new Date() ? 'var(--rojo)' : 'var(--gris2)', marginTop: 2 }}>
              Vence: {u.vencimiento}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span className={`badge ${isActive ? 'badge-activo' : 'badge-inactivo'}`}>
            {isActive ? 'Activo' : 'Inactivo'}
          </span>
          {u.role === 'admin' && <span className="badge badge-admin">Admin</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(u)}>
          <Edit2 size={13} /> Editar
        </button>
        <button
          className={`btn btn-sm ${isActive ? 'btn-danger' : 'btn-outline'}`}
          onClick={() => onToggle(u)}
        >
          {isActive ? <X size={13} /> : <Check size={13} />}
          {isActive ? 'Desactivar' : 'Activar'}
        </button>
        {u.role !== 'admin' && (
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(u.id)}>
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(userDB.getAll());
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({});

  const refresh = () => setUsers(userDB.getAll());
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openEdit = (u) => {
    setEditing(u.id);
    setCreating(false);
    setForm({
      nombre: u.nombre, cedula: u.cedula, codigoChofer: u.codigoChofer,
      matricula: u.matricula, movil: u.movil, email: u.email,
      estado: u.estado, role: u.role, vencimiento: u.vencimiento || '',
      password: '',
    });
  };

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ nombre: '', cedula: '', codigoChofer: '', matricula: '', movil: '', email: '', estado: 'activo', role: 'user', vencimiento: '', password: '' });
  };

  const saveEdit = () => {
    const updates = { ...form };
    if (!updates.password) delete updates.password;
    userDB.update(editing, updates);
    setEditing(null);
    refresh();
  };

  const saveCreate = () => {
    if (!form.cedula || !form.password) { alert('Cédula y contraseña son obligatorias'); return; }
    if (userDB.getByCedula(form.cedula)) { alert('Ya existe ese usuario'); return; }
    userDB.create(form);
    setCreating(false);
    refresh();
  };

  const toggleActive = (u) => {
    userDB.update(u.id, { estado: u.estado === 'activo' ? 'inactivo' : 'activo' });
    refresh();
  };

  const deleteUser = (id) => {
    if (window.confirm('¿Eliminar este usuario?')) { userDB.delete(id); refresh(); }
  };

  const FormFields = ({ isCreate }) => (
    <>
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Nombre</label>
          <input className="form-input" value={form.nombre || ''} onChange={(e) => set('nombre', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Cédula{isCreate && ' *'}</label>
          <input className="form-input" value={form.cedula || ''} onChange={(e) => set('cedula', e.target.value)} disabled={!isCreate} />
        </div>
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Cód. Chofer</label>
          <input className="form-input" value={form.codigoChofer || ''} onChange={(e) => set('codigoChofer', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Móvil</label>
          <input className="form-input" value={form.movil || ''} onChange={(e) => set('movil', e.target.value)} />
        </div>
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Matrícula</label>
          <input className="form-input" value={form.matricula || ''} onChange={(e) => set('matricula', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
        </div>
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Estado</label>
          <select className="form-input" value={form.estado || 'activo'} onChange={(e) => set('estado', e.target.value)}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Rol</label>
          <select className="form-input" value={form.role || 'user'} onChange={(e) => set('role', e.target.value)}>
            <option value="user">Usuario</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Vencimiento suscripción (opcional)</label>
        <input className="form-input" type="date" value={form.vencimiento || ''} onChange={(e) => set('vencimiento', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">{isCreate ? 'Contraseña *' : 'Nueva Contraseña (dejar vacío para no cambiar)'}</label>
        <input className="form-input" type="password" value={form.password || ''} onChange={(e) => set('password', e.target.value)} />
      </div>
    </>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={22} color="var(--amarillo)" /> Administración
          </div>
          <div style={{ color: 'var(--gris2)', fontSize: '0.8rem' }}>{users.length} usuarios registrados</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {creating && (
        <div className="card">
          <div className="card-title"><Plus size={16} /> Nuevo Usuario</div>
          <FormFields isCreate />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveCreate}>Crear</button>
            <button className="btn btn-ghost" onClick={() => setCreating(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {editing && (
        <div className="card">
          <div className="card-title"><Edit2 size={16} /> Editar Usuario</div>
          <FormFields />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveEdit}>Guardar</button>
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancelar</button>
          </div>
        </div>
      )}

      {users.map((u) => (
        <UserRow key={u.id} u={u} onEdit={openEdit} onToggle={toggleActive} onDelete={deleteUser} />
      ))}
    </div>
  );
}
