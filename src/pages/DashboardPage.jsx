import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userDB, turnDB } from '../db/db';
import { Plus, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isActive = userDB.isActive(user);

  const today = format(new Date(), 'yyyy-MM-dd');
  const hasTodayTurn = !!turnDB.getByDate(user.id, today);

  const recentTurns = turnDB.getByUser(user.id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 3);

  const formatDate = (d) => {
    try {
      const [y, m, day] = d.split('-');
      return format(new Date(+y, +m - 1, +day), "EEEE d MMM", { locale: es });
    } catch { return d; }
  };

  return (
    <div>
      {!isActive && (
        <div className="inactive-bar">
          <AlertTriangle size={14} style={{ display: 'inline', marginRight: 6 }} />
          Cuenta inactiva o vencida — no podés crear turnos nuevos
        </div>
      )}

      <div className="dashboard-hero">
        <div className="dashboard-greeting">Bienvenido,</div>
        <div className="dashboard-name">{user.nombre}</div>
        <div className="dashboard-info">
          Móvil {user.movil} · Matrícula {user.matricula}
        </div>
      </div>

      <div className="quick-actions">
        <button
          className="quick-btn"
          onClick={() => isActive ? navigate('/nuevo-turno') : null}
          style={!isActive ? { opacity: 0.4 } : {}}
        >
          <div className="icon"><Plus /></div>
          <div>
            <div className="btn-title">
              {hasTodayTurn ? 'Editar Turno de Hoy' : 'Nuevo Turno'}
            </div>
            <div className="btn-desc">
              {hasTodayTurn
                ? `Turno del ${formatDate(today)} ya registrado`
                : `Registrar turno del ${formatDate(today)}`}
            </div>
          </div>
        </button>

        <button className="quick-btn" onClick={() => navigate('/historial')}>
          <div className="icon"><Calendar /></div>
          <div>
            <div className="btn-title">Ver Historial</div>
            <div className="btn-desc">Consultar turnos anteriores por mes</div>
          </div>
        </button>
      </div>

      {recentTurns.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-title"><FileText size={16} /> Últimos Turnos</div>
          {recentTurns.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(`/turno/${t.id}`)}
              style={{
                width: '100%', background: 'var(--negro3)',
                border: '1px solid var(--gris)', borderRadius: 8,
                padding: '12px 14px', marginBottom: 8,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, color: 'var(--blanco)', fontSize: '0.95rem' }}>
                  {formatDate(t.fecha)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gris2)', marginTop: 2 }}>
                  Banderas: ${t.totalBanderas?.toFixed(0) || 0}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--amarillo)' }}>
                  ${t.totalFinal?.toFixed(0) || 0}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--gris2)' }}>A ENTREGAR</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
