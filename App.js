import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    subtitle: 'Vida única',
    description: '50 perguntas sorteadas. Errou uma vez, a partida acaba e a pontuação zera.',
    accent: '#E77772',
  },
];

function ClassicChoice({ onSelect, onBack }) {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>PENSE BEM · STREET FIGHTER II</Text>
        <Text style={styles.title}>Clássico</Text>
        <Text style={styles.subtitle}>Escolha como enfrentar as 50 perguntas.</Text>
        {variants.map((variant) => (
          <TouchableOpacity key={variant.key} accessibilityRole="button"
            accessibilityLabel={`${variant.title}, ${variant.subtitle}. ${variant.description}`}
            activeOpacity={0.8} style={styles.card} onPress={() => onSelect(variant.key)}>
            <Text style={[styles.label, { color: variant.accent }]}>{variant.subtitle.toUpperCase()}</Text>
            <Text style={styles.cardTitle}>{variant.title}</Text>
            <Text style={styles.description}>{variant.description}</Text>
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
  kicker: { color: '#F4C762', fontSize: 11, fontWeight: '800', letterSpacing: 2, paddingTop: 32, marginBottom: 12 },
  title: { color: '#FFFFFF', fontSize: 34, fontWeight: '900' },
  subtitle: { color: '#B7C2D4', fontSize: 15, marginTop: 8, marginBottom: 24 },
  card: { backgroundColor: '#202B3D', borderColor: '#34425A', borderWidth: 1, borderRadius: 18, padding: 22, marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  cardTitle: { color: '#FFFFFF', fontSize: 23, fontWeight: '900' },
  description: { color: '#C5D0E0', fontSize: 14, lineHeight: 21, marginTop: 8 },
  back: { color: '#D8E1EF', fontSize: 14, paddingVertical: 14, marginTop: 8 },
});
