import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="home" options={{
        title: 'Inicio',
        tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
      }} />
      <Tabs.Screen name="vacunas" options={{
        title: 'Vacunas',
        tabBarIcon: ({ color, size }) => <Ionicons name="medkit" color={color} size={size} />,
      }} />
      <Tabs.Screen name="banos" options={{
        title: 'Baños',
        tabBarIcon: ({ color, size }) => <Ionicons name="water" color={color} size={size} />,
      }} />
      <Tabs.Screen name="desparasitacion" options={{
        title: 'Desparasitación',
        tabBarIcon: ({ color, size }) => <Ionicons name="bug" color={color} size={size} />,
      }} />
      <Tabs.Screen name="perfil" options={{
        title: 'Perfil',
        tabBarIcon: ({ color, size }) => <Ionicons name="paw" color={color} size={size} />,
      }} />
    </Tabs>
  );
}
