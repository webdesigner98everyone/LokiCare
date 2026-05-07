import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getPesos, createPeso, updatePeso, deletePeso } from '../../src/services/api';
import DateField from '../../src/components/DateField';
import { formatDate } from '../../src/utils/format';
import { isValidDate } from '../../src/utils/validation';
import type { Peso } from '../../src/types';

type PesoForm = { fecha: string; peso: string; notas: string };
const EMPTY_FORM: PesoForm = { fecha: '', peso: '', notas: '' };

export default function PesoScreen() {
  const [pesos, setPesos] = useState<Peso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PesoForm>(EMPTY_FORM);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    setLoading(true);
    getPesos()
      .then(setPesos)
      .catch(() => Alert.alert('❌ Error', 'No se pudo cargar el historial de peso'))
      .finally(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await getPesos().then(setPesos).catch(() => {});
    setRefreshing(false);
  };

  const openNew = () => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); };

  const openEdit = (item: Peso) => {
    setEditingId(item.id);
    setForm({ fecha: formatDate(item.fecha), peso: item.peso.toString(), notas: item.notas || '' });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); };

  const handleSave = async () => {
    if (!isValidDate(form.fecha) || !form.peso.trim()) return Alert.alert('Campos requeridos', 'Fecha y peso son obligatorios');
    const pesoNum = parseFloat(form.peso);
    if (isNaN(pesoNum) || pesoNum <= 0) return Alert.alert('Peso inválido', 'Ingresa un peso válido en kg');
    try {
      if (editingId) {
        await updatePeso(editingId, { fecha: form.fecha, peso: pesoNum, notas: form.notas });
        Alert.alert('✅ Actualizado', 'El peso se actualizó correctamente');
      } else {
        await createPeso({ fecha: form.fecha, peso: pesoNum, notas: form.notas });
        Alert.alert('✅ Registrado', 'El peso se registró correctamente');
      }
      closeForm();
      load();
    } catch {
      Alert.alert('❌ Error', 'No se pudo guardar');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Eliminar', '¿Seguro?', [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await deletePeso(id); Alert.alert('✅ Eliminado'); load(); }
        catch { Alert.alert('❌ Error', 'No se pudo eliminar'); }
      }},
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0077b6" /></View>;

  return (
    <View style={styles.container}>
      {!showForm && (
        <TouchableOpacity style={styles.addBtn} onPress={openNew}>
          <Text style={styles.addBtnText}>＋ Registrar Peso</Text>
        </TouchableOpacity>
      )}

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>{editingId ? '✏️ Editar Peso' : '＋ Nuevo Registro'}</Text>
          <DateField label="Fecha" value={form.fecha} onChange={(d) => setForm({ ...form, fecha: d })} />
          <TextInput style={styles.input} placeholder="Peso (kg)" value={form.peso} onChangeText={(t) => setForm({ ...form, peso: t })} keyboardType="decimal-pad" />
          <TextInput style={styles.input} placeholder="Notas (opcional)" value={form.notas} onChangeText={(t) => setForm({ ...form, notas: t })} />
          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeForm}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>{editingId ? 'Actualizar' : 'Guardar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={pesos}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => openEdit(item)}>
              <Text style={styles.cardTitle}>⚖️ {item.peso} kg</Text>
              <Text style={styles.cardText}>📅 {formatDate(item.fecha)}</Text>
              {item.notas ? <Text style={styles.cardText}>📝 {item.notas}</Text> : null}
            </TouchableOpacity>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => openEdit(item)}><Text style={styles.editBtn}>✏️</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}><Text style={styles.deleteBtn}>🗑️</Text></TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay registros de peso</Text>}
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
  formTitle: { fontSize: 16, fontWeight: 'bold', color: '#0077b6', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 8, backgroundColor: '#fafafa' },
  formButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#e0e0e0', marginRight: 8 },
  cancelBtnText: { fontWeight: 'bold', color: '#555' },
  saveBtn: { flex: 1, backgroundColor: '#00b4d8', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0077b6', marginBottom: 4 },
  cardText: { fontSize: 14, color: '#555' },
  cardActions: { alignItems: 'center', gap: 8 },
  editBtn: { fontSize: 22, padding: 4 },
  deleteBtn: { fontSize: 22, padding: 4 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
});
