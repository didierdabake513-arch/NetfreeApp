import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkDevice } from '../services/DeviceCheckService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = '#0A0A14';
const CARD = '#111128';
const BORDER = '#2A2A4A';
const TEXT = '#E0E0FF';
const MUTED = '#5555AA';

export default function DeviceCheckScreen({ onCompatible }) {
  const [state, setState] = useState('checking'); // checking | success | failed
  const [result, setResult] = useState(null);

  useEffect(() => { runCheck(); }, []);

  const runCheck = async () => {
    setState('checking');
    await new Promise(r => setTimeout(r, 1000)); // Laisser voir l'animation
    const res = await checkDevice();
    setResult(res);
    setState(res.isCompatible ? 'success' : 'failed');
  };

  const handleStart = async () => {
    await AsyncStorage.setItem('device_check_passed', 'true');
    if (onCompatible) onCompatible();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.logo}>NETFREE</Text>
        <Text style={styles.subtitle}>Vérification de compatibilité</Text>

        <View style={{ height: 40 }} />

        {state === 'checking' && <CheckingView />}
        {state === 'success' && <SuccessView result={result} onStart={handleStart} />}
        {state === 'failed' && <FailedView result={result} onRetry={runCheck} />}
      </ScrollView>
    </SafeAreaView>
  );
}

function CheckingView() {
  const criteria = ['Support eSIM...', 'Version Android...', 'Permissions réseau...', 'Espace disponible...'];
  return (
    <View>
      <ActivityIndicator size="large" color="#4444CC" style={{ marginBottom: 40 }} />
      {criteria.map((c, i) => (
        <View key={i} style={styles.checkRow}>
          <ActivityIndicator size="small" color="#4444CC" style={{ marginRight: 12 }} />
          <Text style={styles.checkText}>{c}</Text>
        </View>
      ))}
    </View>
  );
}

function SuccessView({ result, onStart }) {
  return (
    <View>
      <View style={[styles.iconCircle, { borderColor: '#22AA66', backgroundColor: '#0A2A1A' }]}>
        <Text style={{ fontSize: 36 }}>✓</Text>
      </View>
      <Text style={styles.resultTitle}>Ton téléphone est compatible !</Text>
      <Text style={styles.resultSub}>Tout est prêt pour activer ta connexion gratuite.</Text>
      <View style={{ height: 28 }} />
      <CriteriaRow label="eSIM supportée" ok={result?.esimSupported} />
      <CriteriaRow label="Android 9+" ok={result?.androidVersionOk} />
      <CriteriaRow label="Espace suffisant" ok={result?.storageOk} />
      <View style={{ height: 32 }} />
      <TouchableOpacity style={styles.startBtn} onPress={onStart}>
        <Text style={styles.startBtnText}>Commencer</Text>
      </TouchableOpacity>
    </View>
  );
}

function FailedView({ result, onRetry }) {
  return (
    <View>
      <View style={[styles.iconCircle, { borderColor: '#AA2222', backgroundColor: '#2A0A0A' }]}>
        <Text style={{ fontSize: 36 }}>✕</Text>
      </View>
      <Text style={styles.resultTitle}>Téléphone non compatible</Text>
      <Text style={styles.resultSub}>Certains critères ne sont pas remplis :</Text>
      <View style={{ height: 20 }} />
      <CriteriaRow label="eSIM supportée" ok={result?.esimSupported} />
      <CriteriaRow label="Android 9+" ok={result?.androidVersionOk} />
      <CriteriaRow label="Espace suffisant" ok={result?.storageOk} />
      <View style={{ height: 20 }} />
      {result?.failures?.map((f, i) => (
        <View key={i} style={styles.errorCard}>
          <Text style={{ fontSize: 20, marginRight: 10 }}>{f.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.errorLabel}>{f.label}</Text>
            <Text style={styles.errorDesc}>{f.desc}</Text>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryText}>Réessayer</Text>
      </TouchableOpacity>
    </View>
  );
}

function CriteriaRow({ label, ok }) {
  return (
    <View style={styles.criteriaRow}>
      <Text style={{ fontSize: 16, marginRight: 10 }}>{ok ? '✅' : '❌'}</Text>
      <Text style={[styles.criteriaLabel, { color: ok ? '#88CCAA' : '#CC8888' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { padding: 28 },
  logo: { fontSize: 24, fontWeight: '600', color: '#E0E0FF', letterSpacing: 3 },
  subtitle: { fontSize: 14, color: MUTED, marginTop: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkText: { fontSize: 14, color: '#8888CC' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 20 },
  resultTitle: { fontSize: 18, fontWeight: '500', color: '#E0E0FF', textAlign: 'center' },
  resultSub: { fontSize: 13, color: MUTED, textAlign: 'center', marginTop: 8 },
  criteriaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  criteriaLabel: { fontSize: 13 },
  errorCard: { backgroundColor: '#1A0A0A', borderWidth: 0.5, borderColor: '#3A1A1A', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  errorLabel: { fontSize: 13, fontWeight: '500', color: '#FF8888' },
  errorDesc: { fontSize: 12, color: '#885555', marginTop: 3 },
  startBtn: { backgroundColor: '#2A2AAA', borderRadius: 14, padding: 16, alignItems: 'center' },
  startBtnText: { fontSize: 16, fontWeight: '500', color: '#E0E0FF' },
  retryBtn: { borderWidth: 0.5, borderColor: '#3A3A6A', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  retryText: { fontSize: 14, color: '#8888CC' },
});
