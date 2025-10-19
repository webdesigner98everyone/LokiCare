import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0077b6' },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#0077b6',
        tabBarInactiveTintColor: '#777',
        tabBarStyle: { backgroundColor: '#fff', height: 60, paddingBottom: 5 },
      }}
    >
      <Tabs.Screen
        name="(tabs)/home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(tabs)/vacunas"
        options={{
          title: 'Vacunas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(tabs)/desparasitacion"
        options={{
          title: 'Desparasitación',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bug" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(tabs)/banos"
        options={{
          title: 'Baños',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="water" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
