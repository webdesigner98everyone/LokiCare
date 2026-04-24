import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getBanos, createBano, updateBano, deleteBano } from '../../src/services/api';
import DateField from '../../src/components/DateField';
import TimeField from '../../src/components/TimeField';
import { formatDate } from '../../src/utils/format';
import { isValidDate } from '../../src/utils/validation';
import type { Bano } from '../../src/types';

type BanoForm = { fecha: string; hora: string; observaciones: string };
const EMPTY_FORM: BanoForm = { fecha: '', hora: '', observaciones: '' };

export default function BanosScreen() {
  const [banos, setBanos] = useState<Bano[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BanoForm>(EMPTY_FORM);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    setLoading(true);
    getBanos()
      .then(setBanos)
      .catch(() => Alert.alert('❌ Error', 'No se pudieron cargar los baños'))
      .finally(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await getBanos().then(setBanos).catch(() => {});
    setRefreshing(false);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item: Bano) => {
    setEditingId(item.id);
    setForm({
      fecha: formatDate(item.fecha),
      hora: item.hora || '',
      observaciones: item.observaciones || '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!isValidDate(form.fecha)) return Alert.alert('Campo requerido', 'Selecciona una fecha válida');
    try {
      if (editingId) {
        await updateBano(editingId, form);
        Alert.alert('✅ Actualizado', 'El baño se actualizó correctamente');
      } else {
        await createBano(form);
        Alert.alert('✅ Registrado', 'El baño se registró correctamente');
      }
      closeForm();
      load();
    } catch {
      Alert.alert('❌ Error', 'No se pudo guardar el baño');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Eliminar', '¿Seguro que deseas eliminar este baño?', [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await deleteBano(id);
          Alert.alert('✅ Eliminado', 'El baño se eliminó correctamente');
          load();
        } catch {
          Alert.alert('❌ Error', 'No se pudo eliminar el baño');
        }
      } },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0077b6" /></View>;

  return (
    <View style={styles.container}>
      {!showForm && (
        <TouchableOpacity style={styles.addBtn} onPress={openNew}>
          <Text style={styles.addBtnText}>＋ Nuevo Baño</Text>
        </TouchableOpacity>
      )}

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>{editingId ? '✏️ Editar Baño' : '＋ Nuevo Baño'}</Text>
          <DateField label="Fecha" value={form.fecha} onChange={(d) => setForm({ ...form, fecha: d })} />
          <TimeField label="Hora" value={form.hora} onChange={(t) => setForm({ ...form, hora: t })} />
          <TextInput style={styles.input} placeholder="Observaciones" value={form.observaciones} onChangeText={(t) => setForm({ ...form, observaciones: t })} multiline />
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
        data={banos}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => openEdit(item)}>
              <Text style={styles.cardTitle}>📅 {formatDate(item.fecha)}</Text>
              <Text style={styles.cardText}>🕐 {item.hora || 'Sin hora'}</Text>
              <Text style={styles.cardText}>📝 {item.observaciones || 'Sin observaciones'}</Text>
            </TouchableOpacity>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <Text style={styles.editBtn}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteBtn}>🗑️</Text>
              </TouchableOpacity>
            </View>
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
