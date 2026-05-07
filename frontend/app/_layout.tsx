import { Redirect, Stack } from 'expo-router';
import { Platform, StatusBar, Text, View } from 'react-native';
import { MascotaProvider, useMascota } from '../src/context/MascotaContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

function AppLayout() {
  const { c } = useTheme();
  const { mascotaNombre } = useMascota();

  const titulo = mascotaNombre
    ? `Ficha Médica de ${mascotaNombre} 🐶 🐱`
    : 'LokiCare 🐶';

  return (
    <>
      <Redirect href="/home" />
      <Stack
        screenOptions={{
          header: () => (
            <View
              style={{
                backgroundColor: c.primary,
                paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 50,
                paddingBottom: 15,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
                {titulo}
              </Text>
            </View>
          ),
        }}
      />
    </>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <MascotaProvider>
        <AppLayout />
      </MascotaProvider>
    </ThemeProvider>
  );
}
