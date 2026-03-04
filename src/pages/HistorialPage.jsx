import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { turnDB } from '../db/db';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, getYear, getMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];
const DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

export default function HistorialPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [year, setYear] = useState(getYear(new Date()));
  const [month, setMonth] = useState(getMonth(new Date()) + 1);

  const turns = turnDB.getByMonth(user.id, year, month)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const turnMap = {};
  turns.forEach((t) => { turnMap[t.fecha] = t; });

  const firstDay = startOfMonth(new Date(year, month - 1));
  const lastDay = endOfMonth(firstDay);
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });
  const startWeekday = getDay(firstDay);
  const emptyBefore = Array(startWeekday).fill(null);

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Totales mensuales
  const totalBanderas   = turns.reduce((s, t) => s + (t.totalBanderas || 0), 0);
  const totalRetribucion = turns.reduce((s, t) => s + (t.retribucion || 0), 0);
  const totalDigital    = turns.reduce((s, t) => s + (t.totalDigital || 0), 0);
  const totalEntregado  = turns.reduce((s, t) => s + (t.totalFinal || 0), 0);

  const fmtDia = (fecha) => {
    try {
      const [y, m, d] = fecha.split('-');
      return format(new Date(+y, +m - 1, +d), "EEE d", { locale: es });
    } catch { return fecha; }
  };

  // Acumulado de retribución por turno (running total)
  let acumulado = 0;

  return (
    <div>

      {/* ── RETRIBUCIÓN ACUMULADA DESTACADA ── */}
      {turns.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #1a1a00 0%, #2a2000 100%)',
          border: '2px solid var(--amarillo)',
          borderRadius: 'var(--radius)',
          padding: '18px 20px',
          marginBottom: 14,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', right: -8, top: -8,
            fontSize: '5rem', opacity: 0.07, lineHeight: 1,
          }}>💰</div>
          <div style={{
            fontSize: '0.7rem', fontWeight: 700,
            color: 'var(--amarillo)', letterSpacing: 3,
            textTransform: 'uppercase', marginBottom: 4,
          }}>
            Retribución acumulada — {MONTHS[month - 1]} {year}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3.2rem', fontWeight: 900,
            color: 'var(--amarillo)', lineHeight: 1,
          }}>
            ${totalRetribucion.toFixed(0)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--gris2)', marginTop: 6 }}>
            {turns.length} turno{turns.length !== 1 ? 's' : ''} registrado{turns.length !== 1 ? 's' : ''}
            {turns.length > 0 && (
              <span style={{ marginLeft: 8, color: 'var(--amarillo)', opacity: 0.7 }}>
                · Promedio ${(totalRetribucion / turns.length).toFixed(0)}/turno
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── CALENDARIO ── */}
      <div className="card">
        <div className="calendar-header">
          <button className="btn btn-ghost btn-sm" onClick={prevMonth}><ChevronLeft size={18} /></button>
          <div className="calendar-month">{MONTHS[month - 1]} {year}</div>
          <button className="btn btn-ghost btn-sm" onClick={nextMonth}><ChevronRight size={18} /></button>
        </div>

        <div className="calendar-grid">
          {DAYS.map((d) => (
            <div key={d} className="cal-day-header">{d}</div>
          ))}
          {emptyBefore.map((_, i) => (
            <div key={`e${i}`} className="cal-day empty" />
          ))}
          {days.map((d) => {
            const key = format(d, 'yyyy-MM-dd');
            const turn = turnMap[key];
            const isToday = key === todayStr;
            return (
              <div
                key={key}
                className={`cal-day ${turn ? 'has-turn' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => turn && navigate(`/turno/${turn.id}`)}
              >
                {format(d, 'd')}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--gris2)', display: 'flex', gap: 12 }}>
          <span>
            <span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--amarillo)', borderRadius: 3, marginRight: 4 }} />
            Día con turno
          </span>
          <span>
            <span style={{ display: 'inline-block', width: 10, height: 10, border: '2px solid var(--amarillo)', borderRadius: 3, marginRight: 4 }} />
            Hoy
          </span>
        </div>
      </div>

      {/* ── LISTA DE TURNOS CON RETRIBUCIÓN ACUMULADA ── */}
      {turns.length > 0 && (
        <div className="card">
          <div className="card-title">📋 Retribución por día</div>

          {turns.map((t, idx) => {
            acumulado += (t.retribucion || 0);
            return (
              <div
                key={t.id}
                onClick={() => navigate(`/turno/${t.id}`)}
                style={{
                  cursor: 'pointer',
                  borderBottom: idx < turns.length - 1 ? '1px solid var(--gris)' : 'none',
                  padding: '11px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                {/* Número de turno */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(245,200,0,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 800, color: 'var(--amarillo)',
                  flexShrink: 0,
                }}>
                  {idx + 1}
                </div>

                {/* Fecha */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 700, fontSize: '0.9rem',
                    color: 'var(--blanco)', textTransform: 'capitalize',
                  }}>
                    {fmtDia(t.fecha)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gris2)', marginTop: 1 }}>
                    Banderas: ${(t.totalBanderas || 0).toFixed(0)}
                  </div>
                </div>

                {/* Retribución del día */}
                <div style={{ textAlign: 'center', minWidth: 70 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.2rem', fontWeight: 800,
                    color: 'var(--blanco)',
                  }}>
                    ${(t.retribucion || 0).toFixed(0)}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--gris2)', letterSpacing: 1 }}>
                    RETRIB.
                  </div>
                </div>

                {/* Acumulado */}
                <div style={{
                  textAlign: 'right', minWidth: 80,
                  borderLeft: '1px solid var(--gris)', paddingLeft: 10,
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.1rem', fontWeight: 900,
                    color: 'var(--amarillo)',
                  }}>
                    ${acumulado.toFixed(0)}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--amarillo)', opacity: 0.6, letterSpacing: 1 }}>
                    ACUMULADO
                  </div>
                </div>
              </div>
            );
          })}

          {/* Total final de retribución */}
          <div style={{
            marginTop: 10,
            background: 'var(--amarillo)',
            borderRadius: 8, padding: '12px 14px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--negro)', fontSize: '0.85rem' }}>
                TOTAL RETRIBUCIÓN
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gris)', marginTop: 1 }}>
                {turns.length} turnos · {MONTHS[month - 1]}
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem', fontWeight: 900, color: 'var(--negro)',
            }}>
              ${totalRetribucion.toFixed(0)}
            </div>
          </div>
        </div>
      )}

      {/* ── RESUMEN COMPLETO DEL MES ── */}
      {turns.length > 0 && (
        <div className="card">
          <div className="card-title">📈 Resumen completo — {MONTHS[month - 1]}</div>
          <div className="resumen-grid">
            <div className="resumen-item">
              <div className="r-label">Turnos</div>
              <div className="r-value">{turns.length}</div>
            </div>
            <div className="resumen-item">
              <div className="r-label">Total Banderas</div>
              <div className="r-value">${totalBanderas.toFixed(0)}</div>
            </div>
            <div className="resumen-item">
              <div className="r-label">Retribución</div>
              <div className="r-value">${totalRetribucion.toFixed(0)}</div>
            </div>
            <div className="resumen-item">
              <div className="r-label">Total Digital</div>
              <div className="r-value">${totalDigital.toFixed(0)}</div>
            </div>
          </div>
          <div style={{
            background: 'var(--negro3)', borderRadius: 8,
            padding: '12px 16px', marginTop: 10,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontWeight: 700, color: 'var(--gris2)', fontSize: '0.85rem' }}>TOTAL ENTREGADO</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--blanco)' }}>
              ${totalEntregado.toFixed(0)}
            </span>
          </div>
        </div>
      )}

      {turns.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📅</div>
          <div style={{ color: 'var(--gris2)' }}>
            No hay turnos registrados en {MONTHS[month - 1]} {year}
          </div>
        </div>
      )}
    </div>
  );
}
