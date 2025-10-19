import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import mascotaData from '../data/mascota.json';

export default function HomeScreen() {
  const [mascota, setMascota] = useState(null);

  useEffect(() => {
    setMascota(mascotaData);
  }, []);

  if (!mascota) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando información de Loki...</Text>
      </View>
    );
  }

  const ultimaVacuna = mascota.vacunas[mascota.vacunas.length - 1];
  const ultimaDesparasitacionInterna =
    mascota.desparasitaciones.interna[mascota.desparasitaciones.interna.length - 1];
  const ultimaDesparasitacionExterna =
    mascota.desparasitaciones.externa[mascota.desparasitaciones.externa.length - 1];
  const ultimoBano = mascota.banos[mascota.banos.length - 1];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Imagen del perrito */}
      <Image
        source={require('../../assets/images/loki.jpg')} // coloca una imagen tuya en assets/loki.png
        style={styles.image}
      />

      {/* Info general */}
      <Text style={styles.title}>Ficha Médica de {mascota.mascota.nombre}</Text>
      <Text style={styles.subtitle}>{mascota.mascota.raza} • {mascota.mascota.especie}</Text>
      <Text style={styles.text}>Propietario: {mascota.mascota.propietario.nombre}</Text>
      <Text style={styles.text}>Teléfono: {mascota.mascota.propietario.telefono}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🩺 Última Vacuna</Text>
        <Text style={styles.text}>Producto: {ultimaVacuna.producto}</Text>
        <Text style={styles.text}>Fecha: {ultimaVacuna.fecha}</Text>
        <Text style={styles.text}>Próxima: {ultimaVacuna.proxima}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💊 Última Desparasitación Interna</Text>
        <Text style={styles.text}>Producto: {ultimaDesparasitacionInterna.producto}</Text>
        <Text style={styles.text}>Fecha: {ultimaDesparasitacionInterna.fecha}</Text>
        <Text style={styles.text}>Próxima: {ultimaDesparasitacionInterna.proxima}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🦟 Última Desparasitación Externa</Text>
        <Text style={styles.text}>Producto: {ultimaDesparasitacionExterna.producto}</Text>
        <Text style={styles.text}>Fecha: {ultimaDesparasitacionExterna.fecha}</Text>
        <Text style={styles.text}>Próxima: {ultimaDesparasitacionExterna.proxima}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧼 Último Baño</Text>
        <Text style={styles.text}>Fecha: {ultimoBano.fecha}</Text>
        <Text style={styles.text}>Hora: {ultimoBano.hora}</Text>
        <Text style={styles.text}>Notas: {ultimoBano.observaciones}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1c1c',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  section: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0077b6',
    marginBottom: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
});
