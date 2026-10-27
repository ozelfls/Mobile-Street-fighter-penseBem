import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

const MODES = [
  {
    key: 'basic',
    number: '01',
    title: 'Básico',
    description: 'Ache a questão no livro, toque na cor da resposta e avance na luta contra o carro.',
    detail: '30 questões · até 100 pontos',
    color: '#55B88B',
  },
  {
    key: 'pvp',
    number: '02',
    title: 'PvP',
    description: 'Dois jogadores, um livro e 20 turnos. Ache a questão, responda pela cor e lute até o fim.',
    detail: '20 turnos · 20 s por resposta',
    color: '#E77772',
  },
];

export default function Home({ onSelect }) {
  const { width, height } = useWindowDimensions();
  const compact = width < 380 || height < 700;
  const narrow = width < 340;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <ScrollView contentContainerStyle={[styles.content, compact && styles.contentCompact, narrow && styles.contentNarrow]}>
        <View style={[styles.header, compact && styles.headerCompact]}>
          <Text style={styles.kicker}>PENSE BEM</Text>
          <Text style={[styles.title, narrow && styles.titleNarrow]}>Street Fighter II</Text>
          <Text style={styles.subtitle}>Escolha um modo para começar.</Text>
        </View>

        <Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}>Modos de jogo</Text>
        {MODES.map((mode) => (
          <TouchableOpacity
            key={mode.key}
            accessibilityRole="button"
            accessibilityLabel={`${mode.title}. ${mode.description}`}
            activeOpacity={0.8}
            onPress={() => onSelect(mode.key)}
            style={[styles.card, compact && styles.cardCompact]}
          >
            <View style={[styles.cardTop, compact && styles.cardTopCompact]}>
              <View style={[styles.numberBadge, compact && styles.numberBadgeCompact, { backgroundColor: mode.color }]}>
                <Text style={styles.numberText}>{mode.number}</Text>
              </View>
              <Text style={[styles.cardDetail, { color: mode.color }]}>{mode.detail}</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardCopy}>
                <Text style={[styles.cardTitle, compact && styles.cardTitleCompact]}>{mode.title}</Text>
                <Text style={[styles.cardDescription, compact && styles.cardDescriptionCompact]}>{mode.description}</Text>
              </View>
              <Text style={[styles.arrow, { color: mode.color }]}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#111827' },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 650,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  contentCompact: { paddingHorizontal: 16, paddingBottom: 20 },
  contentNarrow: { paddingHorizontal: 12 },
  header: { paddingTop: 28, paddingBottom: 32 },
  headerCompact: { paddingTop: 16, paddingBottom: 20 },
  kicker: {
    color: '#F4C762',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 9,
  },
  title: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', lineHeight: 38 },
  titleNarrow: { fontSize: 28, lineHeight: 34 },
  subtitle: { color: '#B7C2D4', fontSize: 15, marginTop: 8 },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  sectionTitleCompact: { marginBottom: 11 },
  card: {
    backgroundColor: '#202B3D',
    borderColor: '#34425A',
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    minHeight: 145,
  },
  cardCompact: { minHeight: 0, padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  cardTopCompact: { marginBottom: 9 },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberBadgeCompact: { width: 32, height: 32, marginRight: 9 },
  numberText: { color: '#162033', fontSize: 14, fontWeight: '900' },
  cardDetail: { flexShrink: 1, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardBody: { flexDirection: 'row', alignItems: 'center' },
  cardCopy: { flex: 1, minWidth: 0 },
  cardTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginBottom: 5 },
  cardTitleCompact: { fontSize: 20, marginBottom: 3 },
  cardDescription: { color: '#C5D0E0', fontSize: 14, lineHeight: 20 },
  cardDescriptionCompact: { fontSize: 13, lineHeight: 18 },
  arrow: { fontSize: 32, marginLeft: 10 },
});
