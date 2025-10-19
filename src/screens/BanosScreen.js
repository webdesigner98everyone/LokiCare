import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BanosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🧼 Aquí se mostrarán los baños de Loki</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18 },
});
