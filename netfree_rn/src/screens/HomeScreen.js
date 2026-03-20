import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useUser } from '../context/UserContext';

const BG = '#0A0A14';
const CARD = '#111128';
const BORDER = '#2A2A4A';
const ACCENT = '#4444CC';
const TEXT = '#E0E0FF';
const MUTED = '#5555AA';
const SOFT = '#C0C0EE';

export default function HomeScreen() {
  const { megabytesLeft, dailyLimit, adsWatched, percentUsed, onAdWatched, isLoading } = useUser();
  const [watching, setWatching] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={ACCENT} size="large" />
      </View>
    );
  }

  const handleWatchAd = () => {
    if (megabytesLeft >= dailyLimit) {
      Alert.alert('Limite atteinte', 'Tu as atteint la limite de 300 Mo pour aujourd\'hui. Reviens demain !');
      return;
    }
    // TODO : Remplacer par un vrai RewardedAd AdMob
    Alert.alert(
      '📺 Pub en cours',
      'Simulation pub — 30 secondes\n(Intégrer AdMob ici)',
      [{
        text: 'Terminer',
        onPress: async () => {
          setWatching(true);
          await onAdWatched('Jumia Togo');
          setWatching(false);
          Alert.alert('✅ +50 Mo ajoutés !', `Il te reste ${Math.min(megabytesLeft + 50, dailyLimit)} Mo aujourd'hui.`);
        },
      }]
    );
  };

  const fillPercent = ((dailyLimit - megabytesLeft) / dailyLimit) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>NETFREE</Text>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>eSIM actif</Text>
          </View>
        </View>

        {/* Cercle de progression */}
        <View style={styles.circleWrap}>
          <AnimatedCircularProgress
            size={180}
            width={12}
            fill={fillPercent}
            tintColor={ACCENT}
            backgroundColor="#1A1A3A"
            lineCap="round"
            rotation={0}
          >
            {() => (
              <View style={styles.circleInner}>
                <Text style={styles.mbNumber}>{Math.round(megabytesLeft)}</Text>
                <Text style={styles.mbLabel}>Mo restants</Text>
              </View>
            )}
          </AnimatedCircularProgress>
        </View>

        {/* Stats rapides */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{dailyLimit}</Text>
            <Text style={styles.statKey}>Mo/jour</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{Math.round(dailyLimit - megabytesLeft)}</Text>
            <Text style={styles.statKey}>Mo utilisés</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{adsWatched}</Text>
            <Text style={styles.statKey}>Pubs vues</Text>
          </View>
        </View>

        {/* Carte pub */}
        <View style={styles.adCard}>
          <Text style={styles.adCardLabel}>PUBLICITÉ DISPONIBLE — +50 Mo</Text>
          <View style={styles.adRow}>
            <View style={styles.adIcon}>
              <Text style={{ fontSize: 22 }}>🛒</Text>
            </View>
            <View style={styles.adInfo}>
              <Text style={styles.adBrand}>Jumia Togo</Text>
              <Text style={styles.adDesc}>Promo téléphones — 30 sec</Text>
            </View>
            <TouchableOpacity style={styles.adBtn} onPress={handleWatchAd}>
              <Text style={styles.adBtnText}>Voir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bouton principal */}
        <TouchableOpacity
          style={[styles.mainBtn, megabytesLeft >= dailyLimit && styles.mainBtnDisabled]}
          onPress={handleWatchAd}
          disabled={watching}
        >
          {watching
            ? <ActivityIndicator color={TEXT} />
            : <>
                <Text style={styles.mainBtnText}>Regarder une pub</Text>
                <Text style={styles.mainBtnSub}>
                  {megabytesLeft >= dailyLimit ? 'Maximum atteint pour aujourd\'hui' : '+50 Mo par vidéo'}
                </Text>
              </>
          }
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { padding: 20 },
  center: { flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  logo: { fontSize: 22, fontWeight: '600', color: TEXT, letterSpacing: 3 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A3A', borderWidth: 0.5, borderColor: '#3A3A6A', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#44FF88', marginRight: 6 },
  badgeText: { fontSize: 11, color: '#8888CC' },
  circleWrap: { alignItems: 'center', marginBottom: 24 },
  circleInner: { alignItems: 'center' },
  mbNumber: { fontSize: 40, fontWeight: '500', color: TEXT },
  mbLabel: { fontSize: 12, color: MUTED, marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 28 },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '500', color: SOFT },
  statKey: { fontSize: 11, color: MUTED, marginTop: 2 },
  adCard: { backgroundColor: CARD, borderWidth: 0.5, borderColor: BORDER, borderRadius: 16, padding: 14, marginBottom: 16 },
  adCardLabel: { fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 10 },
  adRow: { flexDirection: 'row', alignItems: 'center' },
  adIcon: { width: 44, height: 44, backgroundColor: '#2A2A5A', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  adInfo: { flex: 1 },
  adBrand: { fontSize: 13, fontWeight: '500', color: SOFT },
  adDesc: { fontSize: 11, color: MUTED, marginTop: 2 },
  adBtn: { backgroundColor: '#2A2A6A', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  adBtnText: { fontSize: 11, color: '#9999FF' },
  mainBtn: { backgroundColor: '#2A2AAA', borderRadius: 14, padding: 16, alignItems: 'center' },
  mainBtnDisabled: { backgroundColor: '#1A1A5A', opacity: 0.6 },
  mainBtnText: { fontSize: 15, fontWeight: '500', color: TEXT },
  mainBtnSub: { fontSize: 11, color: '#9999CC', marginTop: 3 },
});
