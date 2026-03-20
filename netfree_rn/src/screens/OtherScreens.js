import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';

const BG = '#0A0A14';
const CARD = '#111128';
const BORDER = '#2A2A4A';
const TEXT = '#E0E0FF';
const MUTED = '#5555AA';
const SOFT = '#C0C0EE';

// ── STATS ─────────────────────────────────────────────────────────────────────
export function StatsScreen() {
  const { megabytesLeft, dailyLimit, adsWatched } = useUser();
  const usedToday = dailyLimit - megabytesLeft;

  const days = [
    { label: 'Aujourd\'hui', used: usedToday },
    { label: 'Hier', used: 210 },
    { label: 'Avant-hier', used: 180 },
    { label: 'Lundi', used: 245 },
    { label: 'Dimanche', used: 120 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Statistiques</Text>

        {days.map((d, i) => (
          <View key={i} style={styles.barSection}>
            <View style={styles.barHeader}>
              <Text style={styles.barLabel}>{d.label}</Text>
              <Text style={styles.barVal}>{Math.round(d.used)} / {dailyLimit} Mo</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.min((d.used / dailyLimit) * 100, 100)}%` }]} />
            </View>
          </View>
        ))}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total cette semaine</Text>
          <Text style={styles.summaryVal}>
            {Math.round(days.reduce((s, d) => s + d.used, 0))} Mo
          </Text>
          <Text style={styles.summaryMuted}>{adsWatched} pubs regardées aujourd'hui</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── ADS ───────────────────────────────────────────────────────────────────────
const ADS_LIST = [
  { icon: '🛒', brand: 'Jumia Togo', desc: 'Promo téléphones', mb: 50, duration: '30 sec' },
  { icon: '🏦', brand: 'Ecobank', desc: 'Ouvrir un compte', mb: 80, duration: '45 sec' },
  { icon: '📱', brand: 'Moov Africa', desc: 'Forfait data promo', mb: 60, duration: '30 sec' },
  { icon: '🍺', brand: 'Brasserie BB', desc: 'Nouvelle bière Awooyo', mb: 40, duration: '20 sec' },
];

export function AdsScreen() {
  const { onAdWatched } = useUser();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scroll}>
        <Text style={styles.title}>Publicités disponibles</Text>
        <Text style={[styles.barMuted, { marginBottom: 16 }]}>Regardez pour gagner des Mo</Text>
        <FlatList
          data={ADS_LIST}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <View style={styles.adItem}>
              <View style={styles.adIcon}>
                <Text style={{ fontSize: 22 }}>{item.icon}</Text>
              </View>
              <View style={styles.adInfo}>
                <Text style={styles.adBrand}>{item.brand}</Text>
                <Text style={styles.adDesc}>{item.desc}</Text>
                <Text style={styles.adDur}>{item.duration}</Text>
              </View>
              <TouchableOpacity
                style={styles.adBtn}
                onPress={() => onAdWatched(item.brand)}
              >
                <Text style={styles.adBtnText}>+{item.mb} Mo</Text>
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      </View>
    </SafeAreaView>
  );
}

// ── ACCOUNT ───────────────────────────────────────────────────────────────────
const MENU = [
  { icon: '📶', label: 'Mon eSIM', sub: 'Actif — Gigs Network' },
  { icon: '📋', label: 'Historique', sub: 'Consommation journalière' },
  { icon: '⭐', label: 'Passer Premium', sub: '5 Go/mois à 2 500 FCFA' },
  { icon: '❓', label: 'Aide', sub: 'FAQ et support' },
  { icon: '🚪', label: 'Déconnexion', sub: '' },
];

export function AccountScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>DB</Text>
        </View>
        <Text style={[styles.title, { textAlign: 'center', marginBottom: 4 }]}>Didier B.</Text>
        <Text style={[styles.barMuted, { textAlign: 'center', marginBottom: 32 }]}>didier@example.com</Text>

        {MENU.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem}>
            <Text style={{ fontSize: 20, marginRight: 12 }}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.sub ? <Text style={styles.menuSub}>{item.sub}</Text> : null}
            </View>
            <Text style={{ color: MUTED, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { padding: 20 },
  title: { fontSize: 22, fontWeight: '500', color: TEXT, marginBottom: 20 },
  barSection: { marginBottom: 16 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barLabel: { fontSize: 13, color: SOFT },
  barVal: { fontSize: 12, color: MUTED },
  barMuted: { fontSize: 13, color: MUTED },
  barTrack: { height: 8, backgroundColor: '#1A1A3A', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#4444CC', borderRadius: 4 },
  summaryCard: { backgroundColor: CARD, borderWidth: 0.5, borderColor: BORDER, borderRadius: 14, padding: 16, marginTop: 12 },
  summaryLabel: { fontSize: 12, color: MUTED, marginBottom: 6 },
  summaryVal: { fontSize: 28, fontWeight: '500', color: TEXT },
  summaryMuted: { fontSize: 12, color: MUTED, marginTop: 4 },
  adItem: { backgroundColor: CARD, borderWidth: 0.5, borderColor: BORDER, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center' },
  adIcon: { width: 48, height: 48, backgroundColor: '#2A2A5A', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  adInfo: { flex: 1 },
  adBrand: { fontSize: 14, fontWeight: '500', color: SOFT },
  adDesc: { fontSize: 12, color: MUTED },
  adDur: { fontSize: 11, color: '#3333AA', marginTop: 2 },
  adBtn: { backgroundColor: '#2A2A6A', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  adBtnText: { fontSize: 12, color: '#9999FF', fontWeight: '500' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2A2A5A', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 12 },
  avatarText: { fontSize: 24, color: '#8888FF', fontWeight: '500' },
  menuItem: { backgroundColor: CARD, borderWidth: 0.5, borderColor: BORDER, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  menuLabel: { fontSize: 14, color: SOFT },
  menuSub: { fontSize: 11, color: MUTED, marginTop: 2 },
});
