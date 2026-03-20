import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { UserProvider } from './src/context/UserContext';
import HomeScreen from './src/screens/HomeScreen';
import StatsScreen from './src/screens/StatsScreen';
import AdsScreen from './src/screens/AdsScreen';
import AccountScreen from './src/screens/AccountScreen';
import DeviceCheckScreen from './src/screens/DeviceCheckScreen';
import { useDeviceCheck } from './src/services/DeviceCheckService';

const Tab = createBottomTabNavigator();

const BG = '#0A0A14';
const BAR_BG = '#0D0D1F';
const ACCENT = '#4444CC';

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: BAR_BG,
          borderTopColor: '#2A2A4A',
          borderTopWidth: 0.5,
        },
        tabBarActiveTintColor: '#8888FF',
        tabBarInactiveTintColor: '#5555AA',
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Accueil: 'home',
            Stats: 'bar-chart',
            Pubs: 'play-circle-filled',
            Compte: 'person',
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Pubs" component={AdsScreen} />
      <Tab.Screen name="Compte" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const { isCompatible, checked } = useDeviceCheck();

  if (!checked) return null; // Splash pendant vérification

  return (
    <SafeAreaProvider>
      <UserProvider>
        <NavigationContainer>
          {isCompatible ? <MainTabs /> : <DeviceCheckScreen />}
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}
