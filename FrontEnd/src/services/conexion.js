const API_URL = 'http://localhost:5000/api';

function qsBanco(bancoCodigo) {
  return bancoCodigo && bancoCodigo !== 'all'
    ? `?banco=${encodeURIComponent(bancoCodigo)}`
    : '';
}

export async function getTransacciones(bancoCodigo) {
  const res = await fetch(`${API_URL}/transacciones${qsBanco(bancoCodigo)}`);
  if (!res.ok) throw new Error('Error al obtener transacciones');
  return res.json();
}

export async function getClientes() {
  const res = await fetch(`${API_URL}/tareas`);
  if (!res.ok) throw new Error('Error al obtener clientes');
  return res.json();
}

export async function getAlertas() {
  const res = await fetch(`${API_URL}/alertas`);
  if (!res.ok) throw new Error('Error al obtener alertas');
  return res.json();
}

export async function getDispositivos(bancoCodigo) {
  const res = await fetch(`${API_URL}/dispositivos${qsBanco(bancoCodigo)}`);
  if (!res.ok) throw new Error('Error al obtener dispositivos');
  return res.json();
}

export async function getUsuarios(bancoCodigo) {
  const res = await fetch(`${API_URL}/usuarios${qsBanco(bancoCodigo)}`);
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return res.json();
}

export async function getDashboardStats(bancoCodigo) {
  const res = await fetch(`${API_URL}/dashboard/stats${qsBanco(bancoCodigo)}`);
  if (!res.ok) throw new Error('Error al obtener estadísticas del dashboard');
  return res.json();
}

export async function getAlertasRecientes(bancoCodigo) {
  const res = await fetch(`${API_URL}/dashboard/alertas-recientes${qsBanco(bancoCodigo)}`);
  if (!res.ok) throw new Error('Error al obtener alertas recientes');
  return res.json();
}

export async function getAnalyticsMetricas(bancoCodigo) {
  const res = await fetch(`${API_URL}/analytics/metricas${qsBanco(bancoCodigo)}`);
  if (!res.ok) throw new Error('Error al obtener métricas');
  return res.json();
}


export async function getAnalyticsAgregaciones(bancoCodigo) {
  const res = await fetch(`${API_URL}/analytics/agregaciones${qsBanco(bancoCodigo)}`);
  if (!res.ok) throw new Error('Error al obtener agregaciones');
  return res.json();
}

export async function getMapaStats(bancoCodigo) {
  const res = await fetch(`${API_URL}/mapa/stats${qsBanco(bancoCodigo)}`);
  if (!res.ok) throw new Error('Error al obtener stats del mapa');
  return res.json();
}

export async function getUbicacionesRecientes(bancoCodigo) {
  const res = await fetch(`${API_URL}/mapa/ubicaciones${qsBanco(bancoCodigo)}`);
  if (!res.ok) throw new Error('Error al obtener ubicaciones');
  return res.json();
}

export async function getBancos() {
  const res = await fetch(`${API_URL}/bancos`);
  if (!res.ok) throw new Error('Error al obtener bancos');
  return res.json();
}

export async function solicitarRecuperacionPassword(correo) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo }),
  });
  if (!res.ok) throw new Error('Error al solicitar la recuperación de contraseña');
  return res.json();
}