// calculos.js - lógica de cálculo del turno

/**
 * Calcula todos los valores derivados de los datos del turno.
 * @param {object} datos - campos del formulario
 * @returns {object} resultado con todos los campos calculados
 */
export function calcularTurno(datos) {
  const num = (v) => parseFloat(v) || 0;

  const banderasDiurno = num(datos.banderasDiurno);
  const banderasNocturno = num(datos.banderasNocturno);
  const fichas = num(datos.fichas);
  const pctRetribucion = num(datos.pctRetribucion) || 29;

  const totalBanderas = banderasDiurno + banderasNocturno;

  // Retribución SOLO sobre banderas, redondeada al entero
  const retribucion = Math.round(totalBanderas * (pctRetribucion / 100));

  // Aporte Leyes = 18.1% de retribución
  const aporteLey = Math.round(retribucion * 0.181);

  // Gastos
  const combustible = num(datos.combustible);
  const viaticos = num(datos.viaticos);
  const aceite = num(datos.aceite);
  const gomeria = num(datos.gomeria);
  const lavado = num(datos.lavado);
  const otros = num(datos.otros);

  const totalGastos = combustible + viaticos + aceite + gomeria + lavado + otros;

  // Gastos Empresa = Retribución + Gastos operativos
  const totalGastosEmpresa = retribucion + totalGastos;

  // Líquido Empresa
  const liquidoEmpresa = totalBanderas - totalGastosEmpresa;

  // Subtotal = Líquido + AporteLey
  const subtotal = liquidoEmpresa + aporteLey;

  // Digitales
  const h13Total = (datos.h13 || []).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const mpTotal = (datos.mercadoPago || []).reduce(
    (s, r) => s + (parseFloat(r.monto) || 0),
    0
  );
  const tarjetas = num(datos.tarjetas);

  const totalDigital = h13Total + mpTotal + tarjetas;

  // Total final
  const totalFinal = subtotal - totalDigital;

  return {
    totalBanderas,
    retribucion,
    aporteLey,
    totalGastos,
    totalGastosEmpresa,
    liquidoEmpresa,
    subtotal,
    h13Total,
    mpTotal,
    tarjetas,
    totalDigital,
    totalFinal,
  };
}
