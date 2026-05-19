import { getVacunas, getDesparasitaciones, getMascota } from './api';
import { formatDate } from '../utils/format';

export interface Alerta {
  id: string;
  tipo: 'vacuna' | 'desparasitacion' | 'cumpleanos';
  titulo: string;
  mensaje: string;
  diasRestantes: number;
  urgencia: 'critico' | 'advertencia' | 'info' | 'celebracion';
}

function calcDias(fecha: string): number {
  const target = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

function getProximoCumple(fechaNacimiento: string): { dias: number; edad: number } {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  const cumpleEsteAnio = new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate());

  let proximoCumple = cumpleEsteAnio;
  if (cumpleEsteAnio < hoy) {
    proximoCumple = new Date(hoy.getFullYear() + 1, nacimiento.getMonth(), nacimiento.getDate());
  }

  const dias = calcDias(proximoCumple.toISOString());
  const edad = proximoCumple.getFullYear() - nacimiento.getFullYear();
  return { dias, edad };
}

function getUrgencia(dias: number): 'critico' | 'advertencia' | 'info' {
  if (dias <= 7) return 'critico';
  if (dias <= 30) return 'advertencia';
  return 'info';
}

function crearAlertaVencimiento(id: string, tipo: Alerta['tipo'], nombre: string, producto: string, proxima: string, dias: number): Alerta {
  let titulo: string;
  let mensaje: string;

  if (dias < 0) {
    titulo = `\u{1F6A8} ${nombre} vencida`;
    mensaje = `${producto} - Venci\u00f3 hace ${Math.abs(dias)} d\u00edas (${formatDate(proxima)})`;
  } else if (dias === 0) {
    titulo = `\u{1F6A8} \u00a1${nombre} hoy!`;
    mensaje = `${producto} - \u00a1Es hoy! (${formatDate(proxima)})`;
  } else {
    titulo = `${nombre} pr\u00f3xima`;
    mensaje = `${producto} - Faltan ${dias} d\u00edas (${formatDate(proxima)})`;
  }

  return { id, tipo, titulo, mensaje, diasRestantes: dias, urgencia: getUrgencia(dias) };
}

export async function obtenerAlertas(): Promise<Alerta[]> {
  const alertas: Alerta[] = [];

  try {
    const [vacunas, internas, externas, mascota] = await Promise.all([
      getVacunas(),
      getDesparasitaciones('interna'),
      getDesparasitaciones('externa'),
      getMascota(),
    ]);

    // Solo la vacuna mas reciente con proxima fecha
    const ultimaVacuna = vacunas.find(v => v.proxima);
    if (ultimaVacuna) {
      const dias = calcDias(ultimaVacuna.proxima);
      if (dias >= -7 && dias <= 30) {
        alertas.push(crearAlertaVencimiento(`vac-${ultimaVacuna.id}`, 'vacuna', '\u{1F489} Vacuna', ultimaVacuna.producto, ultimaVacuna.proxima, dias));
      }
    }

    // Solo la desp interna mas reciente
    const ultimaInterna = internas.find(d => d.proxima);
    if (ultimaInterna) {
      const dias = calcDias(ultimaInterna.proxima);
      if (dias >= -7 && dias <= 30) {
        alertas.push(crearAlertaVencimiento(`desp-int-${ultimaInterna.id}`, 'desparasitacion', '\u{1F48A} Desp. interna', ultimaInterna.producto, ultimaInterna.proxima, dias));
      }
    }

    // Solo la desp externa mas reciente
    const ultimaExterna = externas.find(d => d.proxima);
    if (ultimaExterna) {
      const dias = calcDias(ultimaExterna.proxima);
      if (dias >= -7 && dias <= 30) {
        alertas.push(crearAlertaVencimiento(`desp-ext-${ultimaExterna.id}`, 'desparasitacion', '\u{1FAB2} Desp. externa', ultimaExterna.producto, ultimaExterna.proxima, dias));
      }
    }

    // Cumpleanos
    if (mascota.fecha_nacimiento) {
      const { dias, edad } = getProximoCumple(mascota.fecha_nacimiento);
      if (dias === 0) {
        alertas.push({
          id: 'cumple-hoy',
          tipo: 'cumpleanos',
          titulo: '\u{1F382}\u{1F389} \u00a1Feliz cumplea\u00f1os!',
          mensaje: `\u00a1${mascota.nombre} cumple ${edad} a\u00f1o${edad > 1 ? 's' : ''} hoy!`,
          diasRestantes: 0,
          urgencia: 'celebracion',
        });
      } else if (dias <= 30) {
        alertas.push({
          id: 'cumple-proximo',
          tipo: 'cumpleanos',
          titulo: '\u{1F382} Cumplea\u00f1os pr\u00f3ximo',
          mensaje: `${mascota.nombre} cumple ${edad} a\u00f1o${edad > 1 ? 's' : ''} en ${dias} d\u00edas`,
          diasRestantes: dias,
          urgencia: 'celebracion',
        });
      }
    }

    alertas.sort((a, b) => a.diasRestantes - b.diasRestantes);
  } catch {
    // Silenciar errores de red
  }

  return alertas;
}
