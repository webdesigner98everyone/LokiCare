import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getVacunas, createVacuna, updateVacuna, deleteVacuna } from '../../src/services/api';
import DateField from '../../src/components/DateField';
import { formatDate } from '../../src/utils/format';
import { isValidDate, isNotEmpty } from '../../src/utils/validation';
import { useTheme } from '../../src/context/ThemeContext';
import AnimatedCard from '../../src/components/AnimatedCard';
import type { Vacuna } from '../../src/types';

type VacunaForm = { fecha: string; producto: string; veterinario: string; proxima: string };
const EMPTY_FORM: VacunaForm = { fecha: '', producto: '', veterinario: '', proxima: '' };
type Orden = 'desc' | 'asc';

export default function VacunasScreen() {
  const { c } = useTheme();
  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<VacunaForm>(EMPTY_FORM);
  const [refreshing, setRefreshing] = useState(false);
  const [orden, setOrden] = useState<Orden>('desc');
  const [busqueda, setBusqueda] = useState('');

  const load = () => {
    setLoading(true);
    getVacunas()
      .then(setVacunas)
      .catch(() => Alert.alert('Error', 'No se pudieron cargar las vacunas'))
      .finally(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await getVacunas().then(setVacunas).catch(() => {});
    setRefreshing(false);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item: Vacuna) => {
    setEditingId(item.id);
    setForm({
      fecha: formatDate(item.fecha),
      producto: item.producto,
      veterinario: item.veterinario || '',
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
    if (!isValidDate(form.fecha) || !isNotEmpty(form.producto)) return Alert.alert('Campos requeridos', 'Fecha válida y producto son obligatorios');
    try {
      if (editingId) {
        await updateVacuna(editingId, form);
        Alert.alert('✅ Actualizado', 'La vacuna se actualizó correctamente');
      } else {
        await createVacuna(form);
        Alert.alert('✅ Registrado', 'La vacuna se registró correctamente');
      }
      closeForm();
      load();
    } catch {
      Alert.alert('❌ Error', 'No se pudo guardar la vacuna');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Eliminar', '¿Seguro que deseas eliminar esta vacuna?', [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await deleteVacuna(id);
          Alert.alert('✅ Eliminado', 'La vacuna se eliminó correctamente');
          load();
        } catch {
          Alert.alert('❌ Error', 'No se pudo eliminar la vacuna');
        }
      } },
    ]);
  };

  const vacunasOrdenadas = [...vacunas]
    .filter(v => !busqueda || v.producto.toLowerCase().includes(busqueda.toLowerCase()) || (v.veterinario || '').toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      return orden === 'desc' ? dateB - dateA : dateA - dateB;
    });

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0077b6" /></View>;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.addBtn} onPress={openNew}>
          <Text style={styles.addBtnText}>＋ Nueva Vacuna</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setOrden(orden === 'desc' ? 'asc' : 'desc')}>
          <Text style={styles.sortBtnText}>{orden === 'desc' ? '⬇️ Recientes' : '⬆️ Antiguas'}</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.searchInput, { backgroundColor: c.card, color: c.text }]}
        placeholder="🔍 Buscar por producto o veterinario..."
        placeholderTextColor={c.textSecondary}
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? '✏️ Editar Vacuna' : '＋ Nueva Vacuna'}</Text>
              <TouchableOpacity onPress={closeForm}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <DateField label="Fecha" value={form.fecha} onChange={(d) => setForm({ ...form, fecha: d })} />
              <TextInput style={styles.modalInput} placeholder="Producto" value={form.producto} onChangeText={(t) => setForm({ ...form, producto: t })} />
              <TextInput style={styles.modalInput} placeholder="Veterinario" value={form.veterinario} onChangeText={(t) => setForm({ ...form, veterinario: t })} />
              <DateField label="Próxima" value={form.proxima} onChange={(d) => setForm({ ...form, proxima: d })} />
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave}>
                <Text style={styles.modalSaveBtnText}>{editingId ? 'Actualizar' : 'Guardar'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <FlatList
        data={vacunasOrdenadas}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item, index }) => (
          <AnimatedCard index={index} style={[styles.card, { backgroundColor: c.card }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => openEdit(item)}>
              <Text style={[styles.cardTitle, { color: c.primary }]}>{item.producto}</Text>
              <Text style={[styles.cardText, { color: c.textSecondary }]}>📅 {formatDate(item.fecha)}</Text>
              <Text style={[styles.cardText, { color: c.textSecondary }]}>👨‍⚕️ {item.veterinario || 'N/A'}</Text>
              <Text style={[styles.cardText, { color: c.textSecondary }]}>⏭️ Próxima: {formatDate(item.proxima)}</Text>
            </TouchableOpacity>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <Text style={styles.editBtn}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteBtn}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay vacunas registradas</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topRow: { flexDirection: 'row', marginBottom: 10, gap: 8 },
  addBtn: { flex: 1, backgroundColor: '#0077b6', padding: 12, borderRadius: 10, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sortBtn: { backgroundColor: '#e0e0e0', padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sortBtnText: { fontWeight: 'bold', color: '#555', fontSize: 13 },
  searchInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxHeight: '80%', elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0077b6' },
  modalClose: { fontSize: 24, color: '#999', padding: 4 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 10, backgroundColor: '#fafafa', fontSize: 15 },
  modalSaveBtn: { backgroundColor: '#0077b6', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  modalSaveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
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
