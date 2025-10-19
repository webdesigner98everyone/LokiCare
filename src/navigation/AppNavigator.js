import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Importar las pantallas
import HomeScreen from '../screens/HomeScreen';
import VacunasScreen from '../screens/VacunasScreen';
import DesparasitacionScreen from '../screens/DesparasitacionScreen';
import BanosScreen from '../screens/BanosScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            switch (route.name) {
              case 'Inicio':
                iconName = 'home';
                break;
              case 'Vacunas':
                iconName = 'medkit';
                break;
              case 'Desparasitación':
                iconName = 'bug';
                break;
              case 'Baños':
                iconName = 'water';
                break;
              default:
                iconName = 'paw';
                break;
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#0077b6',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#eee',
            paddingBottom: 5,
            height: 60,
          },
          headerStyle: {
            backgroundColor: '#0077b6',
          },
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
        })}
      >
        <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Vacunas" component={VacunasScreen} />
        <Tab.Screen name="Desparasitación" component={DesparasitacionScreen} />
        <Tab.Screen name="Baños" component={BanosScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
