  const API_URL = 'http://localhost:5000/api';

  export async function getTransacciones() {
    const res = await fetch(`${API_URL}/transacciones`);
    if (!res.ok) {
      throw new Error('Error al obtener transacciones');
    }
    return res.json();
  }

  export async function getClientes() {
    const res = await fetch(`${API_URL}/tareas`);
    if (!res.ok) {
      throw new Error('Error al obtener clientes');
    }
    return res.json();
  }

export async function getDispositivos() {
  const res = await fetch(`${API_URL}/dispositivos`);
  if (!res.ok) {
    throw new Error('Error al obtener dispositivos');
  }
  return res.json();
}

export async function getAlertas() {
  const res = await fetch(`${API_URL}/alertas`);
  if (!res.ok) {
    throw new Error('Error al obtener alertas');
  }
  return res.json();
}