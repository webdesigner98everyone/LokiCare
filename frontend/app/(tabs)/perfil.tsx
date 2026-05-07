import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TextInput, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getMascota, updateMascota, updatePropietario, uploadFoto, getVacunas, getDesparasitaciones, getBanos, getPesos, getAllMascotas, setMascotaId, BASE_URL } from '../../src/services/api';
import { formatDate } from '../../src/utils/format';
import DateField from '../../src/components/DateField';
import { useTheme } from '../../src/context/ThemeContext';
import { useMascota } from '../../src/context/MascotaContext';
import type { Mascota, Propietario } from '../../src/types';

const DEFAULT_IMAGE = require('../../assets/images/loki.jpg');

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
  const { mascotaId, setMascotaId: setCtxMascotaId } = useMascota();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mascota, setMascota] = useState<Mascota>({} as Mascota);
  const [propietario, setPropietario] = useState<Propietario>({} as Propietario);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [mascotas, setMascotas] = useState<{ id: number; nombre: string; raza: string }[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllMascotas().then(setMascotas).catch(() => {});
      getMascota()
        .then((data) => {
          setMascota(data);
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

      {mascotas.length > 1 && (
        <View style={styles.mascotaSelector}>
          <Text style={[styles.selectorLabel, { color: c.text }]}>Mascota activa:</Text>
          <View style={styles.selectorRow}>
            {mascotas.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.selectorBtn, mascotaId === m.id && styles.selectorBtnActive]}
                onPress={() => { setMascotaId(m.id); setCtxMascotaId(m.id); setLoading(true); getMascota().then((data) => { setMascota(data); setFotoUri(data.foto_url ? `${BASE_URL}${data.foto_url}` : null); setPropietario({ nombre: data.propietario_nombre, telefono: data.telefono, direccion: data.direccion, email: data.email }); }).finally(() => setLoading(false)); }}
              >
                <Text style={[styles.selectorBtnText, mascotaId === m.id && styles.selectorBtnTextActive]}>{m.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity onPress={pickImage}>
        <Image source={fotoUri ? { uri: fotoUri } : DEFAULT_IMAGE} style={styles.image} />
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: 160, height: 160, borderRadius: 80, marginBottom: 20 },
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
