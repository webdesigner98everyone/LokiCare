import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getBanos, createBano, deleteBano } from '../../src/services/api';
import DateField from '../../src/components/DateField';
import TimeField from '../../src/components/TimeField';
import { formatDate } from '../../src/utils/format';
import type { Bano } from '../../src/types';

type BanoForm = { fecha: string; hora: string; observaciones: string };

export default function BanosScreen() {
  const [banos, setBanos] = useState<Bano[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BanoForm>({ fecha: '', hora: '', observaciones: '' });

  const load = () => {
    setLoading(true);
    getBanos()
      .then(setBanos)
      .catch(() => Alert.alert('Error', 'No se pudieron cargar los baños'))
      .finally(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleAdd = async () => {
    if (!form.fecha) return Alert.alert('Campo requerido', 'La fecha es obligatoria');
    try {
      await createBano(form);
      setForm({ fecha: '', hora: '', observaciones: '' });
      setShowForm(false);
      load();
    } catch {
      Alert.alert('Error', 'No se pudo registrar');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Eliminar', '¿Seguro que deseas eliminar este baño?', [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await deleteBano(id); load(); } },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0077b6" /></View>;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
        <Text style={styles.addBtnText}>{showForm ? '✕ Cancelar' : '＋ Nuevo Baño'}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.form}>
          <DateField label="Fecha" value={form.fecha} onChange={(d) => setForm({ ...form, fecha: d })} />
          <TimeField label="Hora" value={form.hora} onChange={(t) => setForm({ ...form, hora: t })} />
          <TextInput style={styles.input} placeholder="Observaciones" value={form.observaciones} onChangeText={(t) => setForm({ ...form, observaciones: t })} multiline />
          <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
            <Text style={styles.saveBtnText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={banos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>📅 {formatDate(item.fecha)}</Text>
              <Text style={styles.cardText}>🕐 {item.hora || 'Sin hora'}</Text>
              <Text style={styles.cardText}>📝 {item.observaciones || 'Sin observaciones'}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteBtn}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay baños registrados</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addBtn: { backgroundColor: '#0077b6', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  form: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 8, backgroundColor: '#fafafa' },
  saveBtn: { backgroundColor: '#00b4d8', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0077b6', marginBottom: 4 },
  cardText: { fontSize: 14, color: '#555' },
  deleteBtn: { fontSize: 22, padding: 8 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
});
