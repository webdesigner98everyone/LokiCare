import { Redirect, Stack } from 'expo-router';
import { Platform, StatusBar, Text, View } from 'react-native';
import { MascotaProvider, useMascota } from '../src/context/MascotaContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import NotificationBell from '../src/components/NotificationBell';

function AppLayout() {
  const { c } = useTheme();
  const { mascotaNombre } = useMascota();

  const titulo = mascotaNombre
    ? `Ficha Médica de ${mascotaNombre} 🐶`
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
                paddingHorizontal: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ width: 40 }} />
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>
                {titulo}
              </Text>
              <NotificationBell />
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
