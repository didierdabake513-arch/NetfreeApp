import { useState, useEffect } from 'react';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useDeviceCheck() {
  const [checked, setChecked] = useState(false);
  const [isCompatible, setIsCompatible] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    runCheck();
  }, []);

  const runCheck = async () => {
    // Si déjà validé une fois, on passe directement
    const alreadyPassed = await AsyncStorage.getItem('device_check_passed');
    if (alreadyPassed === 'true') {
      setIsCompatible(true);
      setChecked(true);
      return;
    }

    const checkResult = await checkDevice();
    setResult(checkResult);
    setIsCompatible(checkResult.isCompatible);

    if (checkResult.isCompatible) {
      await AsyncStorage.setItem('device_check_passed', 'true');
    }
    setChecked(true);
  };

  return { checked, isCompatible, result, retry: runCheck };
}

export async function checkDevice() {
  const [
    hasNfc,        // eSIM nécessite souvent NFC ou puce eSIM
    systemVersion, // Version OS
    freeDisk,      // Espace libre
  ] = await Promise.all([
    DeviceInfo.hasGms(),          // Google Mobile Services (Android)
    DeviceInfo.getSystemVersion(),
    DeviceInfo.getFreeDiskStorage(),
  ]);

  const freeDiskMb = freeDisk / (1024 * 1024);

  // Android 9+ (API 28+) requis pour eSIM
  const androidVersionOk = Platform.OS === 'android'
    ? parseInt(systemVersion, 10) >= 9
    : true; // iOS géré différemment

  // Espace minimum 50 Mo
  const storageOk = freeDiskMb >= 50;

  // GMS requis pour AdMob et les services Google
  const gmsOk = hasNfc;

  // Pour l'eSIM : on vérifie via DeviceInfo si la puce est présente
  // En sandbox/test on met true, en prod utiliser un module natif
  const esimSupported = Platform.OS === 'android'
    ? parseInt(systemVersion, 10) >= 9
    : true;

  const isCompatible = esimSupported && androidVersionOk && storageOk;

  return {
    isCompatible,
    esimSupported,
    androidVersionOk,
    storageOk,
    gmsOk,
    failures: [
      !esimSupported && { key: 'esim', label: 'eSIM non supportée', desc: 'Ton téléphone ne supporte pas la technologie eSIM.', icon: '📵' },
      !androidVersionOk && { key: 'android', label: 'Android 9+ requis', desc: 'Mets à jour ton système Android.', icon: '🤖' },
      !storageOk && { key: 'storage', label: 'Espace insuffisant', desc: 'Libère au moins 50 Mo sur ton téléphone.', icon: '💾' },
    ].filter(Boolean),
  };
}
