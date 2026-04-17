import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getVacunas, createVacuna, deleteVacuna } from '../../src/services/api';
import type { Vacuna } from '../../src/types';

type VacunaForm = { fecha: string; producto: string; veterinario: string; proxima: string };

export default function VacunasScreen() {
  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<VacunaForm>({ fecha: '', producto: '', veterinario: '', proxima: '' });

  const load = () => {
    setLoading(true);
    getVacunas()
      .then(setVacunas)
      .catch(() => Alert.alert('Error', 'No se pudieron cargar las vacunas'))
      .finally(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleAdd = async () => {
    if (!form.fecha || !form.producto) return Alert.alert('Campos requeridos', 'Fecha y producto son obligatorios');
    try {
      await createVacuna(form);
      setForm({ fecha: '', producto: '', veterinario: '', proxima: '' });
      setShowForm(false);
      load();
    } catch {
      Alert.alert('Error', 'No se pudo registrar');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Eliminar', '¿Seguro que deseas eliminar esta vacuna?', [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await deleteVacuna(id); load(); } },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0077b6" /></View>;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
        <Text style={styles.addBtnText}>{showForm ? '✕ Cancelar' : '＋ Nueva Vacuna'}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Fecha (YYYY-MM-DD)" value={form.fecha} onChangeText={(t) => setForm({ ...form, fecha: t })} />
          <TextInput style={styles.input} placeholder="Producto" value={form.producto} onChangeText={(t) => setForm({ ...form, producto: t })} />
          <TextInput style={styles.input} placeholder="Veterinario" value={form.veterinario} onChangeText={(t) => setForm({ ...form, veterinario: t })} />
          <TextInput style={styles.input} placeholder="Próxima (YYYY-MM-DD)" value={form.proxima} onChangeText={(t) => setForm({ ...form, proxima: t })} />
          <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
            <Text style={styles.saveBtnText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={vacunas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.producto}</Text>
              <Text style={styles.cardText}>📅 {item.fecha}</Text>
              <Text style={styles.cardText}>👨‍⚕️ {item.veterinario || 'N/A'}</Text>
              <Text style={styles.cardText}>⏭️ Próxima: {item.proxima || 'N/A'}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteBtn}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay vacunas registradas</Text>}
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
