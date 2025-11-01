import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import data from "../../src/data/mascota.json";

export default function PerfilScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [mascota, setMascota] = useState(data.mascota);
  const [propietario, setPropietario] = useState(data.mascota.propietario);

  const filePath = FileSystem.documentDirectory + "mascota.json";

  // 🐾 Crear el archivo local si no existe
  useEffect(() => {
    async function ensureFileExists() {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data, null, 2));
      } else {
        const fileContent = await FileSystem.readAsStringAsync(filePath);
        const jsonData = JSON.parse(fileContent);
        setMascota(jsonData.mascota);
        setPropietario(jsonData.mascota.propietario);
      }
    }
    ensureFileExists();
  }, []);

  // 💾 Guardar cambios
  const handleSave = async () => {
    try {
      const updatedData = {
        ...data,
        mascota: {
          ...mascota,
          propietario: propietario,
        },
      };
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(updatedData, null, 2));
      Alert.alert("✅ Datos actualizados", "La información se ha guardado correctamente.");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Error", "No se pudieron guardar los datos.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require("../../assets/images/loki.jpg")}
        style={styles.image}
      />

      <Text style={styles.name}>{mascota.nombre}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🐾 Información de la Mascota</Text>
        {renderInput("Nombre", mascota.nombre, (text) => setMascota({ ...mascota, nombre: text }), isEditing)}
        {renderInput("Especie", mascota.especie, (text) => setMascota({ ...mascota, especie: text }), isEditing)}
        {renderInput("Raza", mascota.raza, (text) => setMascota({ ...mascota, raza: text }), isEditing)}
        {renderInput("Sexo", mascota.sexo, (text) => setMascota({ ...mascota, sexo: text }), isEditing)}
        {renderInput("Color", mascota.Color, (text) => setMascota({ ...mascota, Color: text }), isEditing)}
        {renderInput(
          "Fecha de Nacimiento",
          mascota.fechaNacimiento,
          (text) => setMascota({ ...mascota, fechaNacimiento: text }),
          isEditing
        )}
        {renderInput("Microchip", mascota.microchip, (text) => setMascota({ ...mascota, microchip: text }), isEditing)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Información del Propietario</Text>
        {renderInput(
          "Nombre",
          propietario.nombre,
          (text) => setPropietario({ ...propietario, nombre: text }),
          isEditing
        )}
        {renderInput(
          "Teléfono",
          propietario.telefono,
          (text) => setPropietario({ ...propietario, telefono: text }),
          isEditing
        )}
        {renderInput(
          "Dirección",
          propietario.direccion,
          (text) => setPropietario({ ...propietario, direccion: text }),
          isEditing
        )}
        {renderInput(
          "Correo Electrónico",
          propietario.email,
          (text) => setPropietario({ ...propietario, email: text }),
          isEditing
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: isEditing ? "#0077b6" : "#00b4d8" }]}
        onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
      >
        <Text style={styles.buttonText}>{isEditing ? "Guardar Cambios" : "Editar Información"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// 🧩 Componente auxiliar para inputs
const renderInput = (label, value, onChange, editable) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}:</Text>
    <TextInput
      style={[styles.input, !editable && styles.readOnly]}
      value={value}
      editable={editable}
      onChangeText={onChange}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#f9f9f9",
  },
  image: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0077b6",
    marginBottom: 8,
  },
  section: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0077b6",
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
  readOnly: {
    backgroundColor: "#f1f1f1",
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
    marginBottom: 50,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
