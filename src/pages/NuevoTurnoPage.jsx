import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userDB, turnDB } from '../db/db';
import { calcularTurno } from '../utils/calculos';
import { format } from 'date-fns';
import { Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react';

const today = () => format(new Date(), 'yyyy-MM-dd');

function CurrencyInput({ label, value, onChange, placeholder = '0', big = false }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--gris2)', fontWeight: 700, fontSize: big ? '1.2rem' : '1rem',
          pointerEvents: 'none',
        }}>$</span>
        <input
          className={`form-input ${big ? 'form-input-big' : ''}`}
          style={{ paddingLeft: 28 }}
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function KmInput({ label, value, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className="form-input form-input-big"
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--gris2)', fontWeight: 600, fontSize: '0.85rem',
          pointerEvents: 'none',
        }}>km</span>
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight, negative }) {
  return (
    <div className="result-row">
      <span className="result-label">{label}</span>
      <span className={`result-value ${highlight ? 'positive' : ''} ${negative ? 'negative' : ''}`}>
        ${isNaN(value) ? '0' : Number(value).toFixed(0)}
      </span>
    </div>
  );
}

export default function NuevoTurnoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isActive = userDB.isActive(user);

  const [fecha, setFecha] = useState(today());
  const [showGastos, setShowGastos] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Kilometraje
  const [kmInicial, setKmInicial] = useState('');
  const [kmFinal, setKmFinal] = useState('');

  // Producción
  const [banderasDiurno, setBanderasDiurno] = useState('');
  const [banderasNocturno, setBanderasNocturno] = useState('');
  const [fichas, setFichas] = useState('');
  const [pctRetribucion, setPctRetribucion] = useState('29');

  // Gastos
  const [combustible, setCombustible] = useState('');
  const [viaticos, setViaticos] = useState('');
  const [aceite, setAceite] = useState('');
  const [gomeria, setGomeria] = useState('');
  const [lavado, setLavado] = useState('');
  const [otros, setOtros] = useState('');

  // Digitales
  const [h13, setH13] = useState(['']);
  const [mercadoPago, setMercadoPago] = useState([{ monto: '', operacion: '' }]);
  const [tarjetas, setTarjetas] = useState('');

  // Load existing turn for date
  useEffect(() => {
    const existing = turnDB.getByDate(user.id, fecha);
    if (existing) {
      setKmInicial(existing.kmInicial || '');
      setKmFinal(existing.kmFinal || '');
      setBanderasDiurno(existing.banderasDiurno || '');
      setBanderasNocturno(existing.banderasNocturno || '');
      setFichas(existing.fichas || '');
      setPctRetribucion(existing.pctRetribucion || '29');
      setCombustible(existing.combustible || '');
      setViaticos(existing.viaticos || '');
      setAceite(existing.aceite || '');
      setGomeria(existing.gomeria || '');
      setLavado(existing.lavado || '');
      setOtros(existing.otros || '');
      setH13(existing.h13?.length ? existing.h13 : ['']);
      setMercadoPago(existing.mercadoPago?.length ? existing.mercadoPago : [{ monto: '', operacion: '' }]);
      setTarjetas(existing.tarjetas || '');
      setIsSaved(true);
    } else {
      setKmInicial(''); setKmFinal('');
      setBanderasDiurno(''); setBanderasNocturno(''); setFichas('');
      setPctRetribucion('29'); setCombustible(''); setViaticos('');
      setAceite(''); setGomeria(''); setLavado(''); setOtros('');
      setH13(['']); setMercadoPago([{ monto: '', operacion: '' }]);
      setTarjetas(''); setIsSaved(false);
    }
  }, [fecha, user.id]);

  const datos = {
    banderasDiurno, banderasNocturno, fichas, pctRetribucion,
    combustible, viaticos, aceite, gomeria, lavado, otros,
    h13, mercadoPago, tarjetas,
  };
  const calc = calcularTurno(datos);

  // km recorridos calculado automático
  const kmRecorridos = (kmInicial !== '' && kmFinal !== '')
    ? Math.max(0, parseFloat(kmFinal) - parseFloat(kmInicial))
    : null;

  const handleSave = () => {
    if (!isActive) return;
    for (const mp of mercadoPago) {
      if (mp.monto && mp.operacion && mp.operacion.replace(/\s/g, '').length !== 12) {
        alert('El número de operación de Mercado Pago debe tener exactamente 12 dígitos');
        return;
      }
    }

    const existing = turnDB.getByDate(user.id, fecha);
    const savedTurn = turnDB.save({
      id: existing?.id,
      userId: user.id,
      fecha,
      kmInicial,
      kmFinal,
      ...datos,
      ...calc,
    });
    setIsSaved(true);
    alert('✅ Turno guardado correctamente');
    navigate(`/turno/${savedTurn.id}`);
  };

  // H13 handlers
  const addH13 = () => setH13((h) => [...h, '']);
  const setH13Val = (i, v) => setH13((h) => h.map((x, j) => j === i ? v : x));
  const removeH13 = (i) => setH13((h) => h.filter((_, j) => j !== i));

  // MP handlers
  const addMP = () => setMercadoPago((m) => [...m, { monto: '', operacion: '' }]);
  const setMPVal = (i, k, v) => setMercadoPago((m) => m.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const removeMP = (i) => setMercadoPago((m) => m.filter((_, j) => j !== i));

  return (
    <div>
      {!isActive && (
        <div className="alert alert-warning">
          ⚠ Cuenta inactiva — no podés guardar turnos
        </div>
      )}

      {/* Fecha */}
      <div className="card">
        <div className="card-title">📅 Fecha del Turno</div>
        <input
          className="form-input"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          style={{ fontSize: '1.1rem', fontWeight: 700 }}
        />
        {isSaved && (
          <div className="alert alert-success mt-1" style={{ marginBottom: 0, marginTop: 8 }}>
            ✓ Turno ya guardado para esta fecha
          </div>
        )}
      </div>

      {/* Kilometraje */}
      <div className="card">
        <div className="card-title">🚗 Kilometraje</div>
        <div className="grid-2">
          <KmInput label="Km Inicial" value={kmInicial} onChange={setKmInicial} />
          <KmInput label="Km Final" value={kmFinal} onChange={setKmFinal} />
        </div>
        {kmRecorridos !== null && (
          <div style={{
            background: 'var(--negro3)', borderRadius: 8,
            padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ color: 'var(--gris2)', fontSize: '0.85rem' }}>Km recorridos</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--amarillo)' }}>
              {kmRecorridos.toFixed(0)} km
            </span>
          </div>
        )}
      </div>

      {/* Producción */}
      <div className="card">
        <div className="card-title">🏁 Producción</div>
        <div className="grid-2">
          <CurrencyInput label="Banderas Diurno" value={banderasDiurno} onChange={setBanderasDiurno} big />
          <CurrencyInput label="Banderas Nocturno" value={banderasNocturno} onChange={setBanderasNocturno} big />
        </div>
        <CurrencyInput label="Fichas (opcional)" value={fichas} onChange={setFichas} />

        <div className="form-group">
          <label className="form-label">% Retribución</label>
          <input
            className="form-input"
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.1"
            value={pctRetribucion}
            onChange={(e) => setPctRetribucion(e.target.value)}
            style={{ fontSize: '1.1rem', fontWeight: 700 }}
          />
        </div>

        <div style={{ background: 'var(--negro3)', borderRadius: 8, padding: '10px 14px', marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--gris2)' }}>Total Banderas</span>
            <span style={{ fontWeight: 800, color: 'var(--amarillo)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
              ${calc.totalBanderas.toFixed(0)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: 4 }}>
            <span style={{ color: 'var(--gris2)' }}>Retribución ({pctRetribucion}%)</span>
            <span style={{ fontWeight: 700, color: 'var(--blanco)' }}>${calc.retribucion}</span>
          </div>
        </div>
      </div>

      {/* Gastos */}
      <div className="card">
        <button
          style={{ width: '100%', background: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showGastos ? 12 : 0 }}
          onClick={() => setShowGastos((s) => !s)}
        >
          <div className="card-title" style={{ marginBottom: 0 }}>⛽ Gastos</div>
          {showGastos ? <ChevronUp size={20} color="var(--gris2)" /> : <ChevronDown size={20} color="var(--gris2)" />}
        </button>

        {showGastos && (
          <>
            <div className="grid-2">
              <CurrencyInput label="Combustible" value={combustible} onChange={setCombustible} />
              <CurrencyInput label="Viáticos" value={viaticos} onChange={setViaticos} />
            </div>
            <div className="grid-2">
              <CurrencyInput label="Aceite" value={aceite} onChange={setAceite} />
              <CurrencyInput label="Gomería" value={gomeria} onChange={setGomeria} />
            </div>
            <div className="grid-2">
              <CurrencyInput label="Lavado" value={lavado} onChange={setLavado} />
              <CurrencyInput label="Otros" value={otros} onChange={setOtros} />
            </div>
          </>
        )}

        {!showGastos && (
          <div style={{ color: 'var(--gris2)', fontSize: '0.8rem', marginTop: 2 }}>
            Total gastos: <strong style={{ color: 'var(--blanco)' }}>${calc.totalGastos.toFixed(0)}</strong> — tocá para expandir
          </div>
        )}
      </div>

      {/* Digitales */}
      <div className="card">
        <div className="card-title">📱 Cobros Digitales</div>

        {/* H13 */}
        <div className="section-divider"><span>H13</span></div>
        {h13.map((v, i) => (
          <div key={i} className="digital-row">
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gris2)', fontWeight: 700 }}>$</span>
              <input
                className="form-input"
                style={{ paddingLeft: 28 }}
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="Monto"
                value={v}
                onChange={(e) => setH13Val(i, e.target.value)}
              />
            </div>
            {h13.length > 1 && (
              <button className="btn-remove" onClick={() => removeH13(i)}><Trash2 size={16} /></button>
            )}
          </div>
        ))}
        <button className="btn btn-outline btn-sm btn-full" onClick={addH13}>
          <Plus size={14} /> Agregar H13
        </button>

        {/* Mercado Pago */}
        <div className="section-divider" style={{ marginTop: 16 }}><span>Mercado Pago</span></div>
        {mercadoPago.map((mp, i) => (
          <div key={i} style={{ background: 'var(--negro3)', borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <div className="grid-2" style={{ marginBottom: 8 }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gris2)', fontWeight: 700, fontSize: '0.9rem' }}>$</span>
                <input
                  className="form-input"
                  style={{ paddingLeft: 28, fontSize: '1rem' }}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="Monto"
                  value={mp.monto}
                  onChange={(e) => setMPVal(i, 'monto', e.target.value)}
                />
              </div>
              <input
                className="form-input"
                style={{ fontSize: '1rem' }}
                type="text"
                inputMode="numeric"
                placeholder="Nº Operación (12 dígitos)"
                maxLength={12}
                value={mp.operacion}
                onChange={(e) => setMPVal(i, 'operacion', e.target.value.replace(/\D/g, ''))}
              />
            </div>
            {mp.operacion.length > 0 && mp.operacion.length !== 12 && (
              <div style={{ color: 'var(--rojo)', fontSize: '0.75rem', marginBottom: 4 }}>
                ⚠ El número de operación debe tener 12 dígitos ({mp.operacion.length}/12)
              </div>
            )}
            {mercadoPago.length > 1 && (
              <button className="btn btn-danger btn-sm" onClick={() => removeMP(i)}>
                <Trash2 size={14} /> Eliminar
              </button>
            )}
          </div>
        ))}
        <button className="btn btn-outline btn-sm btn-full" onClick={addMP}>
          <Plus size={14} /> Agregar Mercado Pago
        </button>

        {/* Tarjetas */}
        <div className="section-divider" style={{ marginTop: 16 }}><span>Tarjetas Crédito / Débito</span></div>
        <CurrencyInput value={tarjetas} onChange={setTarjetas} placeholder="Total tarjetas" />
      </div>

      {/* Resultado Final */}
      <div className="card">
        <div className="card-title">📊 Resumen del Turno</div>
        <ResultRow label="Total Banderas" value={calc.totalBanderas} highlight />
        <ResultRow label={`Retribución (${pctRetribucion}%)`} value={calc.retribucion} />
        <ResultRow label="Aporte 18.1% (leyes)" value={calc.aporteLey} />
        <ResultRow label="Total Gastos Empresa" value={calc.totalGastosEmpresa} />
        <ResultRow label="Líquido Empresa" value={calc.liquidoEmpresa} />
        <ResultRow label="Subtotal" value={calc.subtotal} highlight />
        <ResultRow label="Total Digital" value={calc.totalDigital} negative />

        <div className="total-final-box" style={{ background: calc.totalFinal < 0 ? 'var(--rojo)' : 'var(--amarillo)' }}>
          <div className="total-final-label">Total Final a Entregar</div>
          <div className="total-final-amount" style={{ color: 'var(--negro)' }}>
            ${calc.totalFinal.toFixed(0)}
          </div>
          <div className="total-final-currency" style={{ color: calc.totalFinal < 0 ? 'rgba(255,255,255,0.7)' : 'var(--gris)' }}>
            PESOS URUGUAYOS
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        className="btn btn-primary btn-full"
        style={{ marginBottom: 16, fontSize: '1.1rem', minHeight: 56 }}
        onClick={handleSave}
        disabled={!isActive}
      >
        <Save size={20} />
        {isSaved ? 'ACTUALIZAR TURNO' : 'GUARDAR TURNO'}
      </button>
    </div>
  );
}
