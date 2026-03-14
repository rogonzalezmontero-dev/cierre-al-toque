// calculos.js - lógica central de cálculo del turno

export const DEFAULTS = {
  PCT_RETRIBUCION: 29,
  PCT_APORTES: 19.6,
};

export function calcularTurno(datos) {
  const num = (v) => parseFloat(v) || 0;

  const banderasDiurno = num(datos.banderasDiurno);
  const banderasNocturno = num(datos.banderasNocturno);
  const pctRetribucion = num(datos.pctRetribucion) || DEFAULTS.PCT_RETRIBUCION;
  const pctAportes = num(datos.pctAportes) || DEFAULTS.PCT_APORTES;

  const totalBanderas = banderasDiurno + banderasNocturno;

  const retribucion = Math.round(totalBanderas * (pctRetribucion / 100));
  const aporteLey = Math.round(retribucion * (pctAportes / 100));

  const combustible = num(datos.combustible);
  const viaticos = num(datos.viaticos);
  const aceite = num(datos.aceite);
  const gomeria = num(datos.gomeria);
  const lavado = num(datos.lavado);
  const otros = num(datos.otros);

  const totalGastos = combustible + viaticos + aceite + gomeria + lavado + otros;
  const totalGastosEmpresa = retribucion + totalGastos;
  const liquidoEmpresa = totalBanderas - totalGastosEmpresa;
  const subtotal = liquidoEmpresa + aporteLey;

  const h13Total = (datos.h13 || []).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const mpTotal = (datos.mercadoPago || []).reduce((s, r) => s + (parseFloat(r.monto) || 0), 0);
  const tarjetas = num(datos.tarjetas);
  const totalDigital = h13Total + mpTotal + tarjetas;
  const totalFinal = subtotal - totalDigital;

  return {
    totalBanderas, retribucion, aporteLey, totalGastos,
    totalGastosEmpresa, liquidoEmpresa, subtotal,
    h13Total, mpTotal, tarjetas, totalDigital, totalFinal,
  };
}
