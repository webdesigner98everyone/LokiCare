import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getResumen } from '../../src/services/api';
import { formatDate } from '../../src/utils/format';
import type { Resumen } from '../../src/types';

export default function HomeScreen() {
  const [data, setData] = useState<Resumen | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getResumen()
        .then(setData)
        .catch((e: Error) => setError(e.message));
    }, [])
  );

  if (error) return <View style={styles.center}><Text style={styles.errorText}>❌ {error}</Text></View>;
  if (!data) return <View style={styles.center}><ActivityIndicator size="large" color="#0077b6" /></View>;

  const { mascota, ultimaVacuna, ultimaDesparasitacionInterna, ultimaDesparasitacionExterna, ultimoBano } = data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/images/loki.jpg')} style={styles.image} />
      <Text style={styles.title}>Ficha Médica de {mascota.nombre}</Text>
      <Text style={styles.subtitle}>{mascota.raza} • {mascota.especie}</Text>
      <Text style={styles.text}>Propietario: {mascota.propietario_nombre}</Text>
      <Text style={styles.text}>Teléfono: {mascota.telefono}</Text>

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
  if (!item) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{titulo}</Text>
      {campos.map((c) => {
        const raw = item[c]?.toString() || null;
        const display = DATE_FIELDS.includes(c) ? formatDate(raw) : (raw || 'N/A');
        return <Text key={c} style={styles.text}>{LABELS[c]}: {display}</Text>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: 180, height: 180, borderRadius: 90, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1c1c1c', textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 10 },
  text: { fontSize: 16, color: '#333' },
  errorText: { fontSize: 16, color: 'red' },
  section: {
    width: '100%', backgroundColor: '#fff', padding: 15, marginTop: 15,
    borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#0077b6', marginBottom: 6 },
});
