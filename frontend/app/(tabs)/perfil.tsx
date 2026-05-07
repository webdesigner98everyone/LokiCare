import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getMascota, updateMascota, updatePropietario, uploadFoto, getVacunas, getDesparasitaciones, getBanos, getPesos, getAllMascotas, createMascotaCompleta, getPropietarios, createPropietario, setMascotaId, BASE_URL } from '../../src/services/api';
import { formatDate } from '../../src/utils/format';
import DateField from '../../src/components/DateField';
import { useTheme } from '../../src/context/ThemeContext';
import { useMascota } from '../../src/context/MascotaContext';
import type { Mascota, Propietario } from '../../src/types';


interface FieldProps {
  label: string;
  value: string;
  editable: boolean;
  onChange: (text: string) => void;
}

function Field({ label, value, editable, onChange }: FieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}:</Text>
      <TextInput style={[styles.input, !editable && styles.readOnly]} value={value || ''} editable={editable} onChangeText={onChange} />
    </View>
  );
}

export default function PerfilScreen() {
  const { theme, toggleTheme, c } = useTheme();
  const { mascotaId, setMascotaId: setCtxMascotaId, setMascotaNombre } = useMascota();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mascota, setMascota] = useState<Mascota>({} as Mascota);
  const [propietario, setPropietario] = useState<Propietario>({} as Propietario);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [mascotas, setMascotas] = useState<{ id: number; nombre: string; raza: string }[]>([]);
  const [showNewMascota, setShowNewMascota] = useState(false);
  const [newMascota, setNewMascota] = useState({ nombre: '', especie: '', raza: '', sexo: '', color: '', fecha_nacimiento: '', microchip: '' });
  const [propietarios, setPropietarios] = useState<{ id: number; nombre: string; telefono: string; direccion: string; email: string }[]>([]);
  const [selectedPropietarioId, setSelectedPropietarioId] = useState<number | null>(null);
  const [showNewPropietario, setShowNewPropietario] = useState(false);
  const [newPropietario, setNewPropietario] = useState({ nombre: '', telefono: '', direccion: '', email: '' });

  useFocusEffect(
    useCallback(() => {
      getAllMascotas().then(setMascotas).catch(() => {});
      getMascota()
        .then((data) => {
          setMascota(data);
          setMascotaNombre(data.nombre);
          setFotoUri(data.foto_url ? `${BASE_URL}${data.foto_url}` : null);
          setPropietario({
            nombre: data.propietario_nombre,
            telefono: data.telefono,
            direccion: data.direccion,
            email: data.email,
          });
        })
        .catch(() => Alert.alert('Error', 'No se pudo cargar el perfil'))
        .finally(() => setLoading(false));
    }, [])
  );

  const handleNewMascota = async () => {
    if (!newMascota.nombre.trim() || !newMascota.especie.trim()) return Alert.alert('Campos requeridos', 'Nombre y especie son obligatorios');
    if (!selectedPropietarioId) return Alert.alert('Propietario requerido', 'Selecciona o crea un propietario');
    try {
      await createMascotaCompleta({ ...newMascota, propietario_id: selectedPropietarioId });
      Alert.alert('✅ Mascota creada', `${newMascota.nombre} fue registrada`);
      setNewMascota({ nombre: '', especie: '', raza: '', sexo: '', color: '', fecha_nacimiento: '', microchip: '' });
      setSelectedPropietarioId(null);
      setShowNewMascota(false);
      getAllMascotas().then(setMascotas).catch(() => {});
    } catch {
      Alert.alert('❌ Error', 'No se pudo crear la mascota');
    }
  };

  const handleNewPropietario = async () => {
    if (!newPropietario.nombre.trim()) return Alert.alert('Campo requerido', 'El nombre del propietario es obligatorio');
    try {
      const { id } = await createPropietario(newPropietario);
      Alert.alert('✅ Propietario creado');
      setSelectedPropietarioId(id);
      setNewPropietario({ nombre: '', telefono: '', direccion: '', email: '' });
      setShowNewPropietario(false);
      getPropietarios().then(setPropietarios).catch(() => {});
    } catch {
      Alert.alert('❌ Error', 'No se pudo crear el propietario');
    }
  };

  const pickImage = () => {
    Alert.alert('Cambiar foto', '¿De dónde quieres seleccionar la foto?', [
      {
        text: 'Cámara',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') return Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara');
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
          if (!result.canceled) handleUpload(result.assets[0].uri);
        },
      },
      {
        text: 'Galería',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') return Alert.alert('Permiso denegado', 'Se necesita acceso a la galería');
          const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
          if (!result.canceled) handleUpload(result.assets[0].uri);
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleUpload = async (uri: string) => {
    try {
      const { foto_url } = await uploadFoto(uri);
      setFotoUri(`${BASE_URL}${foto_url}`);
      Alert.alert('✅ Foto actualizada');
    } catch {
      Alert.alert('❌ Error', 'No se pudo subir la foto');
    }
  };

  const handleSave = async () => {
    try {
      await updateMascota({
        nombre: mascota.nombre, especie: mascota.especie, raza: mascota.raza,
        sexo: mascota.sexo, color: mascota.color, fecha_nacimiento: mascota.fecha_nacimiento, microchip: mascota.microchip,
      });
      await updatePropietario(propietario);
      Alert.alert('✅ Datos actualizados');
      setIsEditing(false);
    } catch {
      Alert.alert('❌ Error', 'No se pudieron guardar los datos');
    }
  };

  const exportPDF = async () => {
    try {
      const [vacunas, internas, externas, banos, pesos] = await Promise.all([
        getVacunas(), getDesparasitaciones('interna'), getDesparasitaciones('externa'), getBanos(), getPesos(),
      ]);

      const html = `
        <html><head><style>
          body { font-family: Arial; padding: 20px; }
          h1 { color: #0077b6; }
          .section { page-break-inside: avoid; margin-top: 20px; }
          .section h2 { color: #333; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 12px; }
          th { background: #0077b6; color: #fff; }
        </style></head><body>
          <h1>🐶 Historial Médico - ${mascota.nombre}</h1>
          <p><b>Raza:</b> ${mascota.raza} | <b>Especie:</b> ${mascota.especie} | <b>Nacimiento:</b> ${formatDate(mascota.fecha_nacimiento)}</p>
          <p><b>Propietario:</b> ${propietario.nombre} | <b>Tel:</b> ${propietario.telefono}</p>

          <div class="section">
            <h2>💉 Vacunas</h2>
            <table><tr><th>Fecha</th><th>Producto</th><th>Veterinario</th><th>Próxima</th></tr>
            ${vacunas.map(v => `<tr><td>${formatDate(v.fecha)}</td><td>${v.producto}</td><td>${v.veterinario || 'N/A'}</td><td>${formatDate(v.proxima)}</td></tr>`).join('')}
            </table>
          </div>

          <div class="section">
            <h2>💊 Desparasitación Interna</h2>
            <table><tr><th>Fecha</th><th>Producto</th><th>Próxima</th></tr>
            ${internas.map(d => `<tr><td>${formatDate(d.fecha)}</td><td>${d.producto}</td><td>${formatDate(d.proxima)}</td></tr>`).join('')}
            </table>
          </div>

          <div class="section">
            <h2>🪲 Desparasitación Externa</h2>
            <table><tr><th>Fecha</th><th>Producto</th><th>Próxima</th></tr>
            ${externas.map(d => `<tr><td>${formatDate(d.fecha)}</td><td>${d.producto}</td><td>${formatDate(d.proxima)}</td></tr>`).join('')}
            </table>
          </div>

          <div class="section">
            <h2>🧼 Baños</h2>
            <table><tr><th>Fecha</th><th>Hora</th><th>Observaciones</th></tr>
            ${banos.map(b => `<tr><td>${formatDate(b.fecha)}</td><td>${b.hora || '-'}</td><td>${b.observaciones || '-'}</td></tr>`).join('')}
            </table>
          </div>

          <div class="section">
            <h2>⚖️ Historial de Peso</h2>
            <table><tr><th>Fecha</th><th>Peso (kg)</th><th>Notas</th></tr>
            ${pesos.map(p => `<tr><td>${formatDate(p.fecha)}</td><td>${p.peso}</td><td>${p.notas || '-'}</td></tr>`).join('')}
            </table>
          </div>
        </body></html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch {
      Alert.alert('❌ Error', 'No se pudo generar el PDF');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0077b6" /></View>;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.themeToggle}>
        <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: c.card }]}> 
          <Text style={{ fontSize: 20 }}>{theme === 'light' ? '🌙' : '☀️'}</Text>
          <Text style={[styles.themeBtnText, { color: c.text }]}>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mascotaSelector}>
        <Text style={[styles.selectorLabel, { color: c.text }]}>Mascota activa:</Text>
        <View style={styles.selectorRow}>
          {mascotas.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.selectorBtn, mascotaId === m.id && styles.selectorBtnActive]}
              onPress={() => { setMascotaId(m.id); setCtxMascotaId(m.id); setLoading(true); getMascota().then((data) => { setMascota(data); setMascotaNombre(data.nombre); setFotoUri(data.foto_url ? `${BASE_URL}${data.foto_url}` : null); setPropietario({ nombre: data.propietario_nombre, telefono: data.telefono, direccion: data.direccion, email: data.email }); }).finally(() => setLoading(false)); }}
            >
              <Text style={[styles.selectorBtnText, mascotaId === m.id && styles.selectorBtnTextActive]}>{m.nombre}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.selectorAddBtn} onPress={() => { getPropietarios().then(setPropietarios).catch(() => {}); setShowNewMascota(true); }}>
            <Text style={styles.selectorAddBtnText}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showNewMascota} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🐾 Nueva Mascota</Text>
              <TouchableOpacity onPress={() => { setShowNewMascota(false); setShowNewPropietario(false); }}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput style={styles.modalInput} placeholder="Nombre *" value={newMascota.nombre} onChangeText={(t) => setNewMascota({ ...newMascota, nombre: t })} />
              <TextInput style={styles.modalInput} placeholder="Especie * (ej: Canino, Felino)" value={newMascota.especie} onChangeText={(t) => setNewMascota({ ...newMascota, especie: t })} />
              <TextInput style={styles.modalInput} placeholder="Raza" value={newMascota.raza} onChangeText={(t) => setNewMascota({ ...newMascota, raza: t })} />
              <TextInput style={styles.modalInput} placeholder="Sexo (Macho/Hembra)" value={newMascota.sexo} onChangeText={(t) => setNewMascota({ ...newMascota, sexo: t })} />
              <TextInput style={styles.modalInput} placeholder="Color" value={newMascota.color} onChangeText={(t) => setNewMascota({ ...newMascota, color: t })} />
              <DateField label="Fecha de Nacimiento" value={newMascota.fecha_nacimiento} onChange={(d) => setNewMascota({ ...newMascota, fecha_nacimiento: d })} />

              <Text style={styles.propietarioLabel}>👤 Propietario</Text>
              <View style={styles.propietarioList}>
                {propietarios.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.propietarioBtn, selectedPropietarioId === p.id && styles.propietarioBtnActive]}
                    onPress={() => setSelectedPropietarioId(p.id)}
                  >
                    <Text style={[styles.propietarioBtnText, selectedPropietarioId === p.id && styles.propietarioBtnTextActive]}>{p.nombre}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.propietarioNewBtn} onPress={() => { setShowNewPropietario(!showNewPropietario); getPropietarios().then(setPropietarios).catch(() => {}); }}>
                  <Text style={styles.propietarioNewBtnText}>{showNewPropietario ? '✕' : '＋ Nuevo'}</Text>
                </TouchableOpacity>
              </View>

              {showNewPropietario && (
                <View style={styles.newPropietarioForm}>
                  <TextInput style={styles.modalInput} placeholder="Nombre *" value={newPropietario.nombre} onChangeText={(t) => setNewPropietario({ ...newPropietario, nombre: t })} />
                  <TextInput style={styles.modalInput} placeholder="Teléfono" value={newPropietario.telefono} onChangeText={(t) => setNewPropietario({ ...newPropietario, telefono: t })} keyboardType="phone-pad" />
                  <TextInput style={styles.modalInput} placeholder="Dirección" value={newPropietario.direccion} onChangeText={(t) => setNewPropietario({ ...newPropietario, direccion: t })} />
                  <TextInput style={styles.modalInput} placeholder="Email" value={newPropietario.email} onChangeText={(t) => setNewPropietario({ ...newPropietario, email: t })} keyboardType="email-address" />
                  <TouchableOpacity style={styles.propietarioSaveBtn} onPress={handleNewPropietario}>
                    <Text style={styles.modalSaveBtnText}>Crear Propietario</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleNewMascota}>
                <Text style={styles.modalSaveBtnText}>Registrar Mascota</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <TouchableOpacity onPress={pickImage}>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>🐾</Text>
          </View>
        )}
        <View style={styles.cameraIcon}>
          <Text style={styles.cameraText}>📷</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.name}>{mascota.nombre}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🐾 Información de la Mascota</Text>
        <Field label="Nombre" value={mascota.nombre} editable={isEditing} onChange={(t) => setMascota({ ...mascota, nombre: t })} />
        <Field label="Especie" value={mascota.especie} editable={isEditing} onChange={(t) => setMascota({ ...mascota, especie: t })} />
        <Field label="Raza" value={mascota.raza} editable={isEditing} onChange={(t) => setMascota({ ...mascota, raza: t })} />
        <Field label="Sexo" value={mascota.sexo} editable={isEditing} onChange={(t) => setMascota({ ...mascota, sexo: t })} />
        <Field label="Color" value={mascota.color} editable={isEditing} onChange={(t) => setMascota({ ...mascota, color: t })} />
        {isEditing ? (
          <DateField label="Nacimiento" value={formatDate(mascota.fecha_nacimiento)} onChange={(d) => setMascota({ ...mascota, fecha_nacimiento: d })} />
        ) : (
          <Field label="Nacimiento" value={formatDate(mascota.fecha_nacimiento)} editable={false} onChange={() => {}} />
        )}
        <Field label="Microchip" value={mascota.microchip} editable={isEditing} onChange={(t) => setMascota({ ...mascota, microchip: t })} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Información del Propietario</Text>
        <Field label="Nombre" value={propietario.nombre} editable={isEditing} onChange={(t) => setPropietario({ ...propietario, nombre: t })} />
        <Field label="Teléfono" value={propietario.telefono} editable={isEditing} onChange={(t) => setPropietario({ ...propietario, telefono: t })} />
        <Field label="Dirección" value={propietario.direccion} editable={isEditing} onChange={(t) => setPropietario({ ...propietario, direccion: t })} />
        <Field label="Email" value={propietario.email} editable={isEditing} onChange={(t) => setPropietario({ ...propietario, email: t })} />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: isEditing ? '#0077b6' : '#00b4d8' }]}
        onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
      >
        <Text style={styles.buttonText}>{isEditing ? 'Guardar Cambios' : 'Editar Información'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#2a9d8f' }]} onPress={exportPDF}>
        <Text style={styles.buttonText}>📄 Exportar Historial PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 30 },
  themeToggle: { width: '90%', alignItems: 'flex-end', marginBottom: 10 },
  themeBtn: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, elevation: 2, gap: 6 },
  themeBtnText: { fontWeight: '600', fontSize: 13 },
  mascotaSelector: { width: '90%', marginBottom: 15 },
  selectorLabel: { fontWeight: '600', marginBottom: 6 },
  selectorRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  selectorBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e0e0e0' },
  selectorBtnActive: { backgroundColor: '#0077b6' },
  selectorBtnText: { fontWeight: '600', color: '#555' },
  selectorBtnTextActive: { color: '#fff' },
  selectorAddBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2a9d8f', justifyContent: 'center', alignItems: 'center' },
  selectorAddBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxHeight: '80%', elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0077b6' },
  modalClose: { fontSize: 24, color: '#999', padding: 4 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 10, backgroundColor: '#fafafa', fontSize: 15 },
  modalSaveBtn: { backgroundColor: '#0077b6', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  modalSaveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  propietarioLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 8 },
  propietarioList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  propietarioBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e0e0e0' },
  propietarioBtnActive: { backgroundColor: '#0077b6' },
  propietarioBtnText: { fontWeight: '600', color: '#555' },
  propietarioBtnTextActive: { color: '#fff' },
  propietarioNewBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2a9d8f' },
  propietarioNewBtnText: { fontWeight: '600', color: '#fff' },
  newPropietarioForm: { backgroundColor: '#f0f9f4', padding: 12, borderRadius: 10, marginBottom: 10 },
  propietarioSaveBtn: { backgroundColor: '#2a9d8f', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: 160, height: 160, borderRadius: 80, marginBottom: 20 },
  placeholderImage: { width: 160, height: 160, borderRadius: 80, marginBottom: 20, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 50 },
  cameraIcon: {
    position: 'absolute', bottom: 20, right: 0,
    backgroundColor: '#0077b6', borderRadius: 20, width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center', elevation: 3,
  },
  cameraText: { fontSize: 20 },
  name: { fontSize: 26, fontWeight: 'bold', color: '#0077b6', marginBottom: 8 },
  section: {
    width: '90%', backgroundColor: '#fff', padding: 15, borderRadius: 12,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, marginBottom: 25,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0077b6', marginBottom: 8 },
  fieldContainer: { marginBottom: 12 },
  label: { fontWeight: '600', color: '#333', marginBottom: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8 },
  readOnly: { backgroundColor: '#f1f1f1' },
  button: { padding: 15, borderRadius: 10, alignItems: 'center', width: '90%', marginBottom: 50 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
