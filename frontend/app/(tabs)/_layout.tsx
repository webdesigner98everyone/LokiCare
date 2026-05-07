import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';

export default function TabLayout() {
  const { c } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textSecondary,
        tabBarStyle: {
          backgroundColor: c.tabBar,
          borderTopColor: c.tabBarBorder,
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
      <Tabs.Screen name="peso" options={{
        title: 'Peso',
        tabBarIcon: ({ color, size }) => <Ionicons name="fitness" color={color} size={size} />,
      }} />
      <Tabs.Screen name="perfil" options={{
        title: 'Perfil',
        tabBarIcon: ({ color, size }) => <Ionicons name="paw" color={color} size={size} />,
      }} />
    </Tabs>
  );
}
