import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getDesparasitaciones, createDesparasitacion, deleteDesparasitacion } from '../../src/services/api';
import DateField from '../../src/components/DateField';
import type { Desparasitacion } from '../../src/types';

type DesparasitacionForm = { fecha: string; producto: string; proxima: string };
type Tipo = 'interna' | 'externa';

export default function DesparasitacionScreen() {
  const [tipo, setTipo] = useState<Tipo>('interna');
  const [items, setItems] = useState<Desparasitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DesparasitacionForm>({ fecha: '', producto: '', proxima: '' });

  const load = (t?: Tipo) => {
    setLoading(true);
    getDesparasitaciones(t || tipo)
      .then(setItems)
      .catch(() => Alert.alert('Error', 'No se pudieron cargar'))
      .finally(() => setLoading(false));
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const switchTipo = (t: Tipo) => { setTipo(t); load(t); setShowForm(false); };

  const handleAdd = async () => {
    if (!form.fecha || !form.producto) return Alert.alert('Campos requeridos', 'Fecha y producto son obligatorios');
    try {
      await createDesparasitacion({ ...form, tipo });
      setForm({ fecha: '', producto: '', proxima: '' });
      setShowForm(false);
      load();
    } catch {
      Alert.alert('Error', 'No se pudo registrar');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Eliminar', '¿Seguro?', [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await deleteDesparasitacion(id); load(); } },
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

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
        <Text style={styles.addBtnText}>{showForm ? '✕ Cancelar' : '＋ Nueva Desparasitación'}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.form}>
          <DateField label="Fecha" value={form.fecha} onChange={(d) => setForm({ ...form, fecha: d })} />
          <TextInput style={styles.input} placeholder="Producto" value={form.producto} onChangeText={(t) => setForm({ ...form, producto: t })} />
          <DateField label="Próxima" value={form.proxima} onChange={(d) => setForm({ ...form, proxima: d })} />
          <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
            <Text style={styles.saveBtnText}>Guardar</Text>
          </TouchableOpacity>
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
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.producto}</Text>
                <Text style={styles.cardText}>📅 {item.fecha}</Text>
                <Text style={styles.cardText}>⏭️ Próxima: {item.proxima || 'N/A'}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteBtn}>🗑️</Text>
              </TouchableOpacity>
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
