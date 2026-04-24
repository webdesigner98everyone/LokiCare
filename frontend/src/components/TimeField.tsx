import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimeFieldProps {
  label: string;
  value: string;
  onChange: (time: string) => void;
}

function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

export default function TimeField({ label, value, onChange }: TimeFieldProps) {
  const [show, setShow] = useState(false);

  const handleChange = (date: Date) => {
    setShow(Platform.OS === 'ios');
    onChange(formatTime(date));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.button} onPress={() => setShow(true)}>
        <Text style={[styles.buttonText, !value && styles.placeholder]}>
          {value || 'Seleccionar hora'}
        </Text>
        <Text style={styles.icon}>🕐</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onValueChange={handleChange}
          onDismiss={() => setShow(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  label: { fontSize: 14, color: '#555', marginBottom: 4 },
  button: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, backgroundColor: '#fafafa',
  },
  buttonText: { fontSize: 15, color: '#333' },
  placeholder: { color: '#aaa' },
  icon: { fontSize: 18 },
});
