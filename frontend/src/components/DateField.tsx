import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DateField({ label, value, onChange }: DateFieldProps) {
  const [show, setShow] = useState(false);

  const currentDate = value ? new Date(value + 'T00:00:00') : new Date();

  const handleChange = (date: Date) => {
    setShow(Platform.OS === 'ios');
    onChange(formatDate(date));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.button} onPress={() => setShow(true)}>
        <Text style={[styles.buttonText, !value && styles.placeholder]}>
          {value || 'Seleccionar fecha'}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={currentDate}
          mode="date"
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
