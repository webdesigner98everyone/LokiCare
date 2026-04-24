import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getDesparasitaciones, createDesparasitacion, updateDesparasitacion, deleteDesparasitacion } from '../../src/services/api';
import DateField from '../../src/components/DateField';
import { formatDate } from '../../src/utils/format';
import type { Desparasitacion } from '../../src/types';

type DesparasitacionForm = { fecha: string; producto: string; proxima: string };
type Tipo = 'interna' | 'externa';
const EMPTY_FORM: DesparasitacionForm = { fecha: '', producto: '', proxima: '' };

export default function DesparasitacionScreen() {
  const [tipo, setTipo] = useState<Tipo>('interna');
  const [items, setItems] = useState<Desparasitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<DesparasitacionForm>(EMPTY_FORM);

  const load = (t?: Tipo) => {
    setLoading(true);
    getDesparasitaciones(t || tipo)
      .then(setItems)
      .catch(() => Alert.alert('Error', 'No se pudieron cargar'))
      .finally(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const switchTipo = (t: Tipo) => { setTipo(t); load(t); closeForm(); };

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item: Desparasitacion) => {
    setEditingId(item.id);
    setForm({
      fecha: formatDate(item.fecha),
      producto: item.producto,
      proxima: formatDate(item.proxima),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.fecha || !form.producto) return Alert.alert('Campos requeridos', 'Fecha y producto son obligatorios');
    try {
      if (editingId) {
        await updateDesparasitacion(editingId, { ...form, tipo });
        Alert.alert('✅ Actualizado', 'La desparasitación se actualizó correctamente');
      } else {
        await createDesparasitacion({ ...form, tipo });
        Alert.alert('✅ Registrado', 'La desparasitación se registró correctamente');
      }
      closeForm();
      load();
    } catch {
      Alert.alert('❌ Error', 'No se pudo guardar la desparasitación');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Eliminar', '¿Seguro?', [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await deleteDesparasitacion(id);
          Alert.alert('✅ Eliminado', 'La desparasitación se eliminó correctamente');
          load();
        } catch {
          Alert.alert('❌ Error', 'No se pudo eliminar la desparasitación');
        }
      } },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tipo === 'interna' && styles.tabActive]} onPress={() => switchTipo('interna')}>
          <Text style={[styles.tabText, tipo === 'interna' && styles.tabTextActive]}>💊 Interna</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tipo === 'externa' && styles.tabActive]} onPress={() => switchTipo('externa')}>
          <Text style={[styles.tabText, tipo === 'externa' && styles.tabTextActive]}>🦟 Externa</Text>
        </TouchableOpacity>
      </View>

      {!showForm && (
        <TouchableOpacity style={styles.addBtn} onPress={openNew}>
          <Text style={styles.addBtnText}>＋ Nueva Desparasitación</Text>
        </TouchableOpacity>
      )}

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>{editingId ? '✏️ Editar Desparasitación' : '＋ Nueva Desparasitación'}</Text>
          <DateField label="Fecha" value={form.fecha} onChange={(d) => setForm({ ...form, fecha: d })} />
          <TextInput style={styles.input} placeholder="Producto" value={form.producto} onChangeText={(t) => setForm({ ...form, producto: t })} />
          <DateField label="Próxima" value={form.proxima} onChange={(d) => setForm({ ...form, proxima: d })} />
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

      {loading ? (
        <ActivityIndicator size="large" color="#0077b6" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => openEdit(item)}>
                <Text style={styles.cardTitle}>{item.producto}</Text>
                <Text style={styles.cardText}>📅 {formatDate(item.fecha)}</Text>
                <Text style={styles.cardText}>⏭️ Próxima: {formatDate(item.proxima)}</Text>
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
          ListEmptyComponent={<Text style={styles.empty}>No hay registros</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  tabs: { flexDirection: 'row', marginBottom: 10 },
  tab: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#e0e0e0', borderRadius: 8, marginHorizontal: 4 },
  tabActive: { backgroundColor: '#0077b6' },
  tabText: { fontWeight: 'bold', color: '#555' },
  tabTextActive: { color: '#fff' },
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
