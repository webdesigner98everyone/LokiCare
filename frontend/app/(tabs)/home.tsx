import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getResumen, BASE_URL } from '../../src/services/api';
import { formatDate } from '../../src/utils/format';
import { useMascota } from '../../src/context/MascotaContext';
import { useTheme } from '../../src/context/ThemeContext';
import type { Resumen } from '../../src/types';

function calcularEdad(fechaNacimiento: string): string {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let anios = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();
  if (meses < 0) { anios--; meses += 12; }
  if (hoy.getDate() < nacimiento.getDate()) meses--;
  if (meses < 0) { anios--; meses += 12; }
  if (anios > 0) return `${anios} año${anios > 1 ? 's' : ''} y ${meses} mes${meses !== 1 ? 'es' : ''}`;
  return `${meses} mes${meses !== 1 ? 'es' : ''}`;
}

function diasRestantes(fecha: string | null): number | null {
  if (!fecha) return null;
  const proxima = new Date(fecha);
  const hoy = new Date();
  const diff = Math.ceil((proxima.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function HomeScreen() {
  const { setMascotaNombre } = useMascota();
  const { c } = useTheme();
  const [data, setData] = useState<Resumen | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const loadData = () => {
    getResumen()
      .then((res) => {
        setData(res);
        setMascotaNombre(res.mascota.nombre);
      })
      .catch((e: Error) => setError(e.message));
  };

  useFocusEffect(useCallback(() => {
    loadData();
  }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };

  if (error) return <View style={styles.center}><Text style={styles.errorText}>❌ {error}</Text></View>;
  if (!data) return <View style={styles.center}><ActivityIndicator size="large" color="#0077b6" /></View>;

  const { mascota, ultimaVacuna, ultimaDesparasitacionInterna, ultimaDesparasitacionExterna, ultimoBano } = data;

  const fotoSource = mascota.foto_url
    ? { uri: `${BASE_URL}${mascota.foto_url}` }
    : null;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: c.background }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0077b6']} />}>
      {fotoSource ? (
        <Image source={fotoSource} style={styles.image} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>🐾</Text>
        </View>
      )}
      <Text style={[styles.title, { color: c.text }]}>Ficha Médica de {mascota.nombre}</Text>
      <Text style={[styles.subtitle, { color: c.textSecondary }]}>{mascota.raza} • {mascota.especie}</Text>
      {mascota.fecha_nacimiento && (
        <Text style={styles.age}>🎂 {calcularEdad(mascota.fecha_nacimiento)}</Text>
      )}
      <Text style={[styles.text, { color: c.text }]}>Propietario: {mascota.propietario_nombre}</Text>
      <Text style={[styles.text, { color: c.text }]}>Teléfono: {mascota.telefono}</Text>

      <ResumenCard titulo="🩺 Última Vacuna" item={ultimaVacuna}
        campos={['producto', 'fecha', 'proxima']} />
      <ResumenCard titulo="💊 Última Desp. Interna" item={ultimaDesparasitacionInterna}
        campos={['producto', 'fecha', 'proxima']} />
      <ResumenCard titulo="🦟 Última Desp. Externa" item={ultimaDesparasitacionExterna}
        campos={['producto', 'fecha', 'proxima']} />
      <ResumenCard titulo="🧼 Último Baño" item={ultimoBano}
        campos={['fecha', 'hora', 'observaciones']} />
    </ScrollView>
  );
}

interface ResumenCardProps {
  titulo: string;
  item: Record<string, string | number | null> | null;
  campos: string[];
}

const LABELS: Record<string, string> = {
  producto: 'Producto', fecha: 'Fecha', proxima: 'Próxima', hora: 'Hora', observaciones: 'Notas',
};

const DATE_FIELDS = ['fecha', 'proxima'];

function ResumenCard({ titulo, item, campos }: ResumenCardProps) {
  const { c } = useTheme();
  if (!item) return null;
  const dias = diasRestantes(item['proxima']?.toString() || null);
  const isUrgent = dias !== null && dias <= 7;
  const isWarning = dias !== null && dias > 7 && dias <= 30;

  return (
    <View style={[styles.section, { backgroundColor: c.card }, isUrgent && styles.sectionUrgent, isWarning && styles.sectionWarning]}>
      <Text style={styles.sectionTitle}>{titulo}</Text>
      {campos.map((campo) => {
        const raw = item[campo]?.toString() || null;
        const display = DATE_FIELDS.includes(campo) ? formatDate(raw) : (raw || 'N/A');
        return <Text key={campo} style={[styles.text, { color: c.text }]}>{LABELS[campo]}: {display}</Text>;
      })}
      {dias !== null && (
        <Text style={[styles.badge, isUrgent && styles.badgeUrgent, isWarning && styles.badgeWarning]}>
          {dias <= 0 ? '⚠️ Vencido' : dias <= 7 ? `⚠️ Faltan ${dias} días` : dias <= 30 ? `📅 Faltan ${dias} días` : `✅ Faltan ${dias} días`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: 180, height: 180, borderRadius: 90, marginBottom: 20 },
  placeholderImage: { width: 180, height: 180, borderRadius: 90, marginBottom: 20, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1c1c1c', textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 4 },
  age: { fontSize: 16, color: '#0077b6', fontWeight: '600', marginBottom: 10 },
  text: { fontSize: 16, color: '#333' },
  errorText: { fontSize: 16, color: 'red' },
  section: {
    width: '100%', backgroundColor: '#fff', padding: 15, marginTop: 15,
    borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  sectionUrgent: { borderLeftWidth: 4, borderLeftColor: '#e63946' },
  sectionWarning: { borderLeftWidth: 4, borderLeftColor: '#f4a261' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#0077b6', marginBottom: 6 },
  badge: { marginTop: 8, fontSize: 13, color: '#2a9d8f', fontWeight: '600' },
  badgeUrgent: { color: '#e63946' },
  badgeWarning: { color: '#f4a261' },
});
