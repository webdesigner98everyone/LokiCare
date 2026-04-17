import type { Resumen, Mascota, Vacuna, Desparasitacion, Bano, Propietario } from '../types';

// const API_URL = 'http://10.0.2.2:3001/api'; // Android emulator
// const API_URL = 'http://localhost:3001/api'; // Web
const API_URL = 'http://192.168.1.7:3001/api'; // Dispositivo físico

const MASCOTA_ID = 1;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

// Mascota
export const getResumen = () => request<Resumen>(`/mascota/${MASCOTA_ID}/resumen`);
export const getMascota = () => request<Mascota>(`/mascota/${MASCOTA_ID}`);
export const updateMascota = (data: Partial<Mascota>) =>
  request(`/mascota/${MASCOTA_ID}`, { method: 'PUT', body: JSON.stringify(data) });
export const updatePropietario = (data: Propietario) =>
  request(`/mascota/${MASCOTA_ID}/propietario`, { method: 'PUT', body: JSON.stringify(data) });

// Vacunas
export const getVacunas = () => request<Vacuna[]>(`/vacunas/mascota/${MASCOTA_ID}`);
export const createVacuna = (data: Omit<Vacuna, 'id' | 'mascota_id'>) =>
  request(`/vacunas/mascota/${MASCOTA_ID}`, { method: 'POST', body: JSON.stringify(data) });
export const deleteVacuna = (id: number) => request(`/vacunas/${id}`, { method: 'DELETE' });

// Desparasitaciones
export const getDesparasitaciones = (tipo: string) =>
  request<Desparasitacion[]>(`/desparasitaciones/mascota/${MASCOTA_ID}?tipo=${tipo}`);
export const createDesparasitacion = (data: Omit<Desparasitacion, 'id' | 'mascota_id'>) =>
  request(`/desparasitaciones/mascota/${MASCOTA_ID}`, { method: 'POST', body: JSON.stringify(data) });
export const deleteDesparasitacion = (id: number) => request(`/desparasitaciones/${id}`, { method: 'DELETE' });

// Baños
export const getBanos = () => request<Bano[]>(`/banos/mascota/${MASCOTA_ID}`);
export const createBano = (data: Omit<Bano, 'id' | 'mascota_id'>) =>
  request(`/banos/mascota/${MASCOTA_ID}`, { method: 'POST', body: JSON.stringify(data) });
export const deleteBano = (id: number) => request(`/banos/${id}`, { method: 'DELETE' });
