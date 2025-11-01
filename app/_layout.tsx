import { Stack, Redirect } from "expo-router";
import { View, Text, Platform, StatusBar } from "react-native";

export default function Layout() {
  return (
    <>
      {/* Redirige automáticamente al Home */}
      <Redirect href="/home" />

      <Stack
        screenOptions={{
          header: () => (
            <View
              style={{
                backgroundColor: "#0077b6",
                paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 50,
                paddingBottom: 15,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                Ficha Médica de Loki 🐶
              </Text>
            </View>
          ),
        }}
      />
    </>
  );
}
