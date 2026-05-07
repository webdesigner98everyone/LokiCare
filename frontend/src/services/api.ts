import type { Resumen, Mascota, Vacuna, Desparasitacion, Bano, Propietario, Peso } from '../types';

// const API_URL = 'http://10.0.2.2:3001/api'; // Android emulator
// const API_URL = 'http://localhost:3001/api'; // Web
const API_URL = 'http://192.168.1.7:3001/api'; // Dispositivo físico
export const BASE_URL = 'http://192.168.1.7:3001';

const MASCOTA_ID_KEY = 'mascotaId';
let currentMascotaId = 1;

export const getMascotaId = () => currentMascotaId;
export const setMascotaId = (id: number) => { currentMascotaId = id; };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

// Mascota
export const getAllMascotas = () => request<{ id: number; nombre: string; raza: string; foto_url: string }[]>('/mascota');
export const createMascotaCompleta = (data: any) => request('/mascota', { method: 'POST', body: JSON.stringify(data) });
export const getResumen = () => request<Resumen>(`/mascota/${currentMascotaId}/resumen`);
export const getMascota = () => request<Mascota>(`/mascota/${currentMascotaId}`);
export const updateMascota = (data: Partial<Mascota>) =>
  request(`/mascota/${currentMascotaId}`, { method: 'PUT', body: JSON.stringify(data) });
export const updatePropietario = (data: Propietario) =>
  request(`/mascota/${currentMascotaId}/propietario`, { method: 'PUT', body: JSON.stringify(data) });

export const uploadFoto = async (uri: string): Promise<{ foto_url: string }> => {
  const formData = new FormData();
  const filename = uri.split('/').pop() || 'foto.jpg';
  const ext = filename.split('.').pop();
  formData.append('foto', {
    uri,
    name: filename,
    type: `image/${ext}`,
  } as any);

  const res = await fetch(`${API_URL}/mascota/${currentMascotaId}/foto`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
};

// Vacunas
export const getVacunas = () => request<Vacuna[]>(`/vacunas/mascota/${currentMascotaId}`);
export const createVacuna = (data: Omit<Vacuna, 'id' | 'mascota_id'>) =>
  request(`/vacunas/mascota/${currentMascotaId}`, { method: 'POST', body: JSON.stringify(data) });
export const updateVacuna = (id: number, data: Omit<Vacuna, 'id' | 'mascota_id'>) =>
  request(`/vacunas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteVacuna = (id: number) => request(`/vacunas/${id}`, { method: 'DELETE' });

// Desparasitaciones
export const getDesparasitaciones = (tipo: string) =>
  request<Desparasitacion[]>(`/desparasitaciones/mascota/${currentMascotaId}?tipo=${tipo}`);
export const createDesparasitacion = (data: Omit<Desparasitacion, 'id' | 'mascota_id'>) =>
  request(`/desparasitaciones/mascota/${currentMascotaId}`, { method: 'POST', body: JSON.stringify(data) });
export const updateDesparasitacion = (id: number, data: Omit<Desparasitacion, 'id' | 'mascota_id'>) =>
  request(`/desparasitaciones/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDesparasitacion = (id: number) => request(`/desparasitaciones/${id}`, { method: 'DELETE' });

// Baños
export const getBanos = () => request<Bano[]>(`/banos/mascota/${currentMascotaId}`);
export const createBano = (data: Omit<Bano, 'id' | 'mascota_id'>) =>
  request(`/banos/mascota/${currentMascotaId}`, { method: 'POST', body: JSON.stringify(data) });
export const updateBano = (id: number, data: Omit<Bano, 'id' | 'mascota_id'>) =>
  request(`/banos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBano = (id: number) => request(`/banos/${id}`, { method: 'DELETE' });

// Pesos
export const getPesos = () => request<Peso[]>(`/pesos/mascota/${currentMascotaId}`);
export const createPeso = (data: Omit<Peso, 'id' | 'mascota_id'>) =>
  request(`/pesos/mascota/${currentMascotaId}`, { method: 'POST', body: JSON.stringify(data) });
export const updatePeso = (id: number, data: Omit<Peso, 'id' | 'mascota_id'>) =>
  request(`/pesos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePeso = (id: number) => request(`/pesos/${id}`, { method: 'DELETE' });

// Propietarios
export const getPropietarios = () => request<{ id: number; nombre: string; telefono: string; direccion: string; email: string }[]>('/propietarios');
export const createPropietario = (data: { nombre: string; telefono: string; direccion: string; email: string }) =>
  request<{ id: number }>('/propietarios', { method: 'POST', body: JSON.stringify(data) });
