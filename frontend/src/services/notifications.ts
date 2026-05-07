import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getVacunas, getDesparasitaciones } from './api';
import { formatDate } from '../utils/format';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('recordatorios', {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
  return true;
}

export async function programarNotificaciones() {
  const granted = await requestPermissions();
  if (!granted) return;

  // Cancelar notificaciones previas para reprogramar
  await Notifications.cancelAllScheduledNotificationsAsync();

  try {
    const [vacunas, internas, externas] = await Promise.all([
      getVacunas(),
      getDesparasitaciones('interna'),
      getDesparasitaciones('externa'),
    ]);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Vacunas
    for (const v of vacunas) {
      if (!v.proxima) continue;
      const proxima = new Date(v.proxima);
      programarAlerta(proxima, hoy, `💉 Vacuna: ${v.producto}`, 'Recuerda llevar a tu mascota a vacunar');
    }

    // Desparasitaciones internas
    for (const d of internas) {
      if (!d.proxima) continue;
      const proxima = new Date(d.proxima);
      programarAlerta(proxima, hoy, `💊 Desp. Interna: ${d.producto}`, 'Es hora de la desparasitación interna');
    }

    // Desparasitaciones externas
    for (const d of externas) {
      if (!d.proxima) continue;
      const proxima = new Date(d.proxima);
      programarAlerta(proxima, hoy, `🦟 Desp. Externa: ${d.producto}`, 'Es hora de la desparasitación externa');
    }
  } catch {
    // Silenciar errores de red
  }
}

function programarAlerta(proxima: Date, hoy: Date, titulo: string, cuerpo: string) {
  const diffMs = proxima.getTime() - hoy.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Notificar 3 días antes
  if (diffDias === 3) {
    scheduleNotification(titulo, `⏰ Faltan 3 días - ${cuerpo}`, 3);
  }

  // Notificar 1 día antes
  if (diffDias === 1) {
    scheduleNotification(titulo, `⚠️ ¡Mañana! - ${cuerpo}`, 1);
  }

  // Notificar el mismo día
  if (diffDias === 0) {
    scheduleNotification(titulo, `🚨 ¡Hoy! - ${cuerpo}`, 0);
  }

  // Si faltan entre 1-7 días, programar para el día exacto
  if (diffDias > 0 && diffDias <= 7) {
    const trigger = new Date(proxima);
    trigger.setHours(9, 0, 0, 0); // Notificar a las 9 AM
    if (trigger > new Date()) {
      Notifications.scheduleNotificationAsync({
        content: { title: titulo, body: cuerpo, sound: 'default' },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
      });
    }
  }
}

async function scheduleNotification(title: string, body: string, delaySeconds: number) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default' },
    trigger: delaySeconds === 0
      ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 }
      : { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds * 2 },
  });
}
