import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { turnDB, userDB } from '../db/db';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, FileDown, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

function Row({ label, value, yellow }) {
  return (
    <div className="result-row">
      <span className="result-label">{label}</span>
      <span className="result-value" style={yellow ? { color: 'var(--amarillo)' } : {}}>
        ${isNaN(value) ? '0' : Number(value).toFixed(0)}
      </span>
    </div>
  );
}

export default function TurnoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const turn = turnDB.getAll().find((t) => t.id === id);

  if (!turn) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p style={{ color: 'var(--gris2)' }}>Turno no encontrado</p>
        <button className="btn btn-ghost mt-2" onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  const userData = userDB.getById(turn.userId) || user;
  const fecLabel = (() => {
    try {
      const [y, m, d] = turn.fecha.split('-');
      return format(new Date(+y, +m - 1, +d), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
    } catch { return turn.fecha; }
  })();

  const exportPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210; const pad = 14;

    // Fondo blanco total
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, W, 297, 'F');

    // Encabezado amarillo
    doc.setFillColor(245, 200, 0);
    doc.rect(0, 0, W, 32, 'F');

    // Título
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 17, 17);
    doc.text('CIERRE AL TOQUE', pad, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Liquidación Diaria de Taxista · Uruguay', pad, 21);
    doc.text(fecLabel.toUpperCase(), W - pad, 14, { align: 'right' });

    let y = 42;

    const title = (t) => {
      doc.setFillColor(240, 240, 240);
      doc.rect(pad, y, W - pad * 2, 7, 'F');
      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text(t, pad + 2, y + 5);
      y += 10;
    };

    const row = (label, value) => {
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(label, pad, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 17, 17);
      doc.text(`$${Number(value || 0).toFixed(0)}`, W - pad, y, { align: 'right' });
      y += 7;
    };

    const divider = () => {
      doc.setDrawColor(220, 220, 220);
      doc.line(pad, y, W - pad, y);
      y += 4;
    };

    // Datos del chofer
    title('DATOS DEL CHOFER');
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 40, 40);
    doc.text(`Nombre: ${userData.nombre}`, pad, y); y += 5;
    doc.text(`Cédula: ${userData.cedula}   Cód. Chofer: ${userData.codigoChofer}`, pad, y); y += 5;
    doc.text(`Matrícula: ${userData.matricula}   Móvil: ${userData.movil}`, pad, y); y += 8;

    // Kilometraje
    if (turn.kmInicial || turn.kmFinal) {
      title('KILOMETRAJE');
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
      doc.text(`Km Inicial: ${turn.kmInicial || '—'}   Km Final: ${turn.kmFinal || '—'}`, pad, y); y += 5;
      if (turn.kmInicial && turn.kmFinal) {
        const recorridos = Math.max(0, parseFloat(turn.kmFinal) - parseFloat(turn.kmInicial)).toFixed(0);
        doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 17, 17);
        doc.text(`Km recorridos: ${recorridos} km`, pad, y); y += 8;
      } else { y += 3; }
    }

    // Producción
    title('PRODUCCIÓN');
    row('Banderas Diurno', turn.banderasDiurno);
    row('Banderas Nocturno', turn.banderasNocturno);
    if (+turn.fichas > 0) row('Fichas', turn.fichas);
    row('Total Banderas', turn.totalBanderas);
    row(`Retribución (${turn.pctRetribucion || 29}%)`, turn.retribucion);
    row('Aporte Leyes (18.1%)', turn.aporteLey);
    y += 2;

    // Gastos
    if (turn.totalGastos > 0) {
      title('GASTOS');
      if (+turn.combustible > 0) row('Combustible', turn.combustible);
      if (+turn.viaticos > 0) row('Viáticos', turn.viaticos);
      if (+turn.aceite > 0) row('Aceite', turn.aceite);
      if (+turn.gomeria > 0) row('Gomería', turn.gomeria);
      if (+turn.lavado > 0) row('Lavado', turn.lavado);
      if (+turn.otros > 0) row('Otros', turn.otros);
      row('Total Gastos Empresa', turn.totalGastosEmpresa);
      y += 2;
    }

    // Digitales
    if (turn.totalDigital > 0) {
      title('COBROS DIGITALES');
      if (turn.h13Total > 0) row('H13', turn.h13Total);
      if (turn.mpTotal > 0) row('Mercado Pago', turn.mpTotal);
      if (+turn.tarjetas > 0) row('Tarjetas', turn.tarjetas);
      row('Total Digital', turn.totalDigital);
      y += 2;
    }

    // Resultado
    title('RESULTADO');
    row('Líquido Empresa', turn.liquidoEmpresa);
    row('Subtotal', turn.subtotal);
    if (turn.totalDigital > 0) row('Total Digital (−)', turn.totalDigital);
    y += 4;

    divider();
    y += 2;

    // Total Final — caja amarilla
    doc.setFillColor(245, 200, 0);
    doc.rect(pad, y, W - pad * 2, 20, 'F');
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 17, 17);
    doc.text('TOTAL FINAL A ENTREGAR', pad + 4, y + 8);
    doc.setFontSize(20);
    doc.text(`$${Number(turn.totalFinal || 0).toFixed(0)}`, W - pad - 4, y + 14, { align: 'right' });
    y += 26;

    // Firma
    if (userData.firma) {
      doc.setFontSize(9); doc.setTextColor(80, 80, 80); doc.setFont('helvetica', 'normal');
      doc.text('Firma del chofer:', pad, y); y += 4;
      try { doc.addImage(userData.firma, 'PNG', pad, y, 60, 20); } catch {}
      y += 24;
    }

    divider();
    doc.setFontSize(7); doc.setTextColor(150, 150, 150);
    doc.text('Generado por Cierre al Toque · cierrealtoque.uy', W / 2, y + 3, { align: 'center' });

    doc.save(`turno_${turn.fecha}_movil${userData.movil || ''}.pdf`);
  };

  const handleDelete = () => {
    if (window.confirm('¿Eliminar este turno?')) {
      turnDB.delete(id);
      navigate('/historial');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, textTransform: 'capitalize' }}>
            {fecLabel}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gris2)', letterSpacing: 1 }}>DETALLE DEL TURNO</div>
        </div>
      </div>

      <div className="total-final-box" style={{ background: turn.totalFinal < 0 ? 'var(--rojo)' : 'var(--amarillo)' }}>
        <div className="total-final-label">Total Final a Entregar</div>
        <div className="total-final-amount">${Number(turn.totalFinal || 0).toFixed(0)}</div>
        <div className="total-final-currency">PESOS URUGUAYOS</div>
      </div>

      {(turn.kmInicial || turn.kmFinal) && (
        <div className="card">
          <div className="card-title">🚗 Kilometraje</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ color: 'var(--gris2)' }}>Km Inicial</span>
            <span style={{ fontWeight: 700 }}>{turn.kmInicial || '—'} km</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ color: 'var(--gris2)' }}>Km Final</span>
            <span style={{ fontWeight: 700 }}>{turn.kmFinal || '—'} km</span>
          </div>
          {turn.kmInicial && turn.kmFinal && (
            <div style={{ background: 'var(--negro3)', borderRadius: 8, padding: '10px 14px', marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--gris2)', fontSize: '0.85rem' }}>Km recorridos</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, color: 'var(--amarillo)' }}>
                {Math.max(0, parseFloat(turn.kmFinal) - parseFloat(turn.kmInicial)).toFixed(0)} km
              </span>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="card-title">🏁 Producción</div>
        <Row label="Banderas Diurno" value={turn.banderasDiurno} />
        <Row label="Banderas Nocturno" value={turn.banderasNocturno} />
        {+turn.fichas > 0 && <Row label="Fichas" value={turn.fichas} />}
        <Row label="Total Banderas" value={turn.totalBanderas} yellow />
        <Row label={`Retribución (${turn.pctRetribucion || 29}%)`} value={turn.retribucion} />
        <Row label="Aporte Leyes 18.1%" value={turn.aporteLey} />
      </div>

      {turn.totalGastos > 0 && (
        <div className="card">
          <div className="card-title">⛽ Gastos</div>
          {+turn.combustible > 0 && <Row label="Combustible" value={turn.combustible} />}
          {+turn.viaticos > 0 && <Row label="Viáticos" value={turn.viaticos} />}
          {+turn.aceite > 0 && <Row label="Aceite" value={turn.aceite} />}
          {+turn.gomeria > 0 && <Row label="Gomería" value={turn.gomeria} />}
          {+turn.lavado > 0 && <Row label="Lavado" value={turn.lavado} />}
          {+turn.otros > 0 && <Row label="Otros" value={turn.otros} />}
          <Row label="Total Gastos Empresa" value={turn.totalGastosEmpresa} yellow />
        </div>
      )}

      <div className="card">
        <div className="card-title">📊 Resultado</div>
        <Row label="Líquido Empresa" value={turn.liquidoEmpresa} />
        <Row label="Subtotal" value={turn.subtotal} yellow />
        {turn.totalDigital > 0 && (
          <>
            {turn.h13Total > 0 && <Row label="H13" value={turn.h13Total} />}
            {turn.mpTotal > 0 && <Row label="Mercado Pago" value={turn.mpTotal} />}
            {+turn.tarjetas > 0 && <Row label="Tarjetas" value={turn.tarjetas} />}
            <Row label="Total Digital (−)" value={turn.totalDigital} />
          </>
        )}
      </div>

      {turn.mercadoPago?.some((m) => m.monto) && (
        <div className="card">
          <div className="card-title">💳 Detalle Mercado Pago</div>
          {turn.mercadoPago.filter((m) => m.monto).map((m, i) => (
            <div key={i} className="result-row">
              <div>
                <div style={{ fontWeight: 600 }}>${Number(m.monto).toFixed(0)}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--gris2)' }}>Op: {m.operacion}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={exportPDF}>
          <FileDown size={18} /> Exportar PDF
        </button>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
```

Commit changes, y después en la Terminal:
```
git pull
npm run dev
