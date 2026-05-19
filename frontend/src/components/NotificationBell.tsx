import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList, StyleSheet,
} from 'react-native';
import { obtenerAlertas, Alerta } from '../services/alertas';

export default function NotificationBell() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [descartadas, setDescartadas] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const cargar = () => {
    obtenerAlertas().then((a) => setAlertas(a.filter(al => !descartadas.includes(al.id)))).catch(() => {});
  };

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 60000);
    return () => clearInterval(interval);
  }, [descartadas]);

  const descartar = (id: string) => {
    setDescartadas([...descartadas, id]);
    setAlertas(alertas.filter(a => a.id !== id));
  };

  const limpiarTodas = () => {
    setDescartadas([...descartadas, ...alertas.map(a => a.id)]);
    setAlertas([]);
  };

  const count = alertas.length;

  const getColor = (urgencia: string) => {
    switch (urgencia) {
      case 'critico': return '#e63946';
      case 'advertencia': return '#f4a261';
      case 'celebracion': return '#2a9d8f';
      default: return '#0077b6';
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.bellContainer} onPress={() => { cargar(); setShowModal(true); }}>
        <Text style={styles.bellIcon}>🔔</Text>
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔔 Notificaciones</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {alertas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={styles.emptyText}>No hay alertas pendientes</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity style={styles.clearAllBtn} onPress={limpiarTodas}>
                  <Text style={styles.clearAllText}>🗑️ Limpiar todas</Text>
                </TouchableOpacity>
                <FlatList
                  data={alertas}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={[styles.alertCard, { borderLeftColor: getColor(item.urgencia) }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.alertTitle}>{item.titulo}</Text>
                        <Text style={styles.alertMessage}>{item.mensaje}</Text>
                      </View>
                      <TouchableOpacity onPress={() => descartar(item.id)} style={styles.dismissBtn}>
                        <Text style={styles.dismissText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellContainer: { position: 'relative', padding: 4 },
  bellIcon: { fontSize: 24 },
  badge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#e63946', borderRadius: 10, minWidth: 18, height: 18,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxHeight: '80%', elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0077b6' },
  modalClose: { fontSize: 24, color: '#999', padding: 4 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 16, color: '#999' },
  alertCard: {
    backgroundColor: '#f8f9fa', padding: 12, borderRadius: 10, marginBottom: 10,
    borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center',
  },
  alertTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  alertMessage: { fontSize: 13, color: '#555' },
  dismissBtn: { padding: 8 },
  dismissText: { fontSize: 18, color: '#999' },
  clearAllBtn: { alignSelf: 'flex-end', marginBottom: 10, padding: 6 },
  clearAllText: { fontSize: 13, color: '#e63946', fontWeight: '600' },
});
