import { Stack, Redirect } from 'expo-router';
import { View, Text, Platform, StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { MascotaProvider } from '../src/context/MascotaContext';

function AppLayout() {
  const { c } = useTheme();

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
                Ficha Médica de Loki 🐶
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
