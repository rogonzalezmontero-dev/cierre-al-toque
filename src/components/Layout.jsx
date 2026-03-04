import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Plus, Calendar, User, ShieldCheck } from 'lucide-react';

export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const active = (path) => (pathname === path ? 'nav-item active' : 'nav-item');

  return (
    <div className="app-layout">
      <header className="app-header">
        <div>
          <h1>Cierre al Toque</h1>
          <div className="subtitle">Liquidación Diaria</div>
        </div>
        <div className="header-right">
          {user && (
            <span style={{ fontSize: '0.8rem', color: 'var(--negro)', fontWeight: 700 }}>
              Móvil {user.movil || '—'}
            </span>
          )}
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <button className={active('/')} onClick={() => navigate('/')}>
          <Home size={22} />
          Inicio
        </button>
        <button className={active('/nuevo-turno')} onClick={() => navigate('/nuevo-turno')}>
          <Plus size={22} />
          Turno
        </button>
        <button className={active('/historial')} onClick={() => navigate('/historial')}>
          <Calendar size={22} />
          Historial
        </button>
        <button className={active('/perfil')} onClick={() => navigate('/perfil')}>
          <User size={22} />
          Perfil
        </button>
        {user?.role === 'admin' && (
          <button className={active('/admin')} onClick={() => navigate('/admin')}>
            <ShieldCheck size={22} />
            Admin
          </button>
        )}
      </nav>
    </div>
  );
}
