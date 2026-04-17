export interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  sexo: string;
  color: string;
  fecha_nacimiento: string;
  microchip: string;
  propietario_nombre: string;
  telefono: string;
  direccion: string;
  email: string;
}

export interface Vacuna {
  id: number;
  mascota_id: number;
  fecha: string;
  producto: string;
  veterinario: string;
  proxima: string;
}

export interface Desparasitacion {
  id: number;
  mascota_id: number;
  tipo: 'interna' | 'externa';
  fecha: string;
  producto: string;
  proxima: string;
}

export interface Bano {
  id: number;
  mascota_id: number;
  fecha: string;
  hora: string;
  observaciones: string;
}

export interface Propietario {
  nombre: string;
  telefono: string;
  direccion: string;
  email: string;
}

export interface Resumen {
  mascota: Mascota;
  ultimaVacuna: Vacuna | null;
  ultimaDesparasitacionInterna: Desparasitacion | null;
  ultimaDesparasitacionExterna: Desparasitacion | null;
  ultimoBano: Bano | null;
}
