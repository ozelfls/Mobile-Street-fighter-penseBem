import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import Home from './Home';
import Game from './Game';

const variants = [
  {
    key: 'challenge',
    title: 'Desafio',
    subtitle: 'Três vidas',
    description: '50 perguntas sorteadas. Cada erro tira uma vida; cada acerto vale 1 ponto.',
    accent: '#F4C762',
  },
  {
    key: 'survival',
    title: 'Sobrevivência',
    subtitle: '3 minutos · maior pontuação',
    description: 'Acerte em sequência para multiplicar os pontos. Errar zera a sequência, mas você continua.',
    accent: '#E77772',
  },
];

function ClassicChoice({ onSelect, onBack }) {
  const { width, height } = useWindowDimensions();
  const compact = width < 380 || height < 700;
  const narrow = width < 340;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <ScrollView contentContainerStyle={[styles.content, compact && styles.contentCompact, narrow && styles.contentNarrow]}>
        <Text style={[styles.kicker, compact && styles.kickerCompact]}>PENSE BEM · STREET FIGHTER II</Text>
        <Text style={[styles.title, compact && styles.titleCompact]}>Clássico</Text>
        <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>Escolha entre 50 perguntas com três vidas ou 3 minutos para somar pontos.</Text>
        {variants.map((variant) => (
          <TouchableOpacity key={variant.key} accessibilityRole="button"
            accessibilityLabel={`${variant.title}, ${variant.subtitle}. ${variant.description}`}
            activeOpacity={0.8} style={[styles.card, compact && styles.cardCompact]} onPress={() => onSelect(variant.key)}>
            <Text style={[styles.label, { color: variant.accent }]}>{variant.subtitle.toUpperCase()}</Text>
            <Text style={[styles.cardTitle, compact && styles.cardTitleCompact]}>{variant.title}</Text>
            <Text style={[styles.description, compact && styles.descriptionCompact]}>{variant.description}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar ao início" onPress={onBack}>
          <Text style={styles.back}>← Voltar ao início</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [screen, setScreen] = useState('home');
  if (screen === 'home') return <Home onSelect={setScreen} />;
  if (screen === 'classic') return <ClassicChoice onSelect={setScreen} onBack={() => setScreen('home')} />;
  return <Game key={screen} mode={screen} onExit={() => setScreen('home')} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#111827' },
  content: { flexGrow: 1, width: '100%', maxWidth: 650, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 36 },
  contentCompact: { paddingHorizontal: 16, paddingBottom: 20 },
  contentNarrow: { paddingHorizontal: 12 },
  kicker: { color: '#F4C762', fontSize: 11, fontWeight: '800', letterSpacing: 2, paddingTop: 32, marginBottom: 12 },
  kickerCompact: { paddingTop: 16, marginBottom: 9 },
  title: { color: '#FFFFFF', fontSize: 34, fontWeight: '900' },
  titleCompact: { fontSize: 29 },
  subtitle: { color: '#B7C2D4', fontSize: 15, marginTop: 8, marginBottom: 24 },
  subtitleCompact: { fontSize: 14, marginTop: 6, marginBottom: 16 },
  card: { backgroundColor: '#202B3D', borderColor: '#34425A', borderWidth: 1, borderRadius: 18, padding: 22, marginBottom: 14 },
  cardCompact: { padding: 16, marginBottom: 10 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  cardTitle: { color: '#FFFFFF', fontSize: 23, fontWeight: '900' },
  cardTitleCompact: { fontSize: 21 },
  description: { color: '#C5D0E0', fontSize: 14, lineHeight: 21, marginTop: 8 },
  descriptionCompact: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  back: { color: '#D8E1EF', fontSize: 14, paddingVertical: 14, marginTop: 8, minHeight: 44 },
});
