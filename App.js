import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import questions from './questions.json';

const palette = {
  red: { name: 'Vermelho', hex: '#C9474C' },
  yellow: { name: 'Amarelo', hex: '#D3A330' },
  blue: { name: 'Azul', hex: '#4285BB' },
  green: { name: 'Verde', hex: '#3E9876' },
};

function Action({ title, onPress, secondary }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={title} activeOpacity={0.8}
      style={[styles.action, secondary && styles.actionSecondary]} onPress={onPress}>
      <Text style={[styles.actionText, secondary && styles.actionSecondaryText]}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function App() {
  const [program, setProgram] = useState(null);
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const programs = questions.programs || [];
  const current = program?.questions?.[index];
  const total = program?.questions?.length || 0;

  function start(item) {
    setProgram(item);
    setIndex(0);
    setAttempts(0);
    setWrong([]);
    setResult(null);
    setScore(0);
    setFinished(false);
  }

  function answer(color) {
    if (result || wrong.includes(color)) return;
    const turn = attempts + 1;
    setAttempts(turn);
    if (color === current.correctColor) {
      const earned = 4 - turn;
      setScore((value) => value + earned);
      setResult({ correct: true, earned });
    } else {
      setWrong((value) => [...value, color]);
      if (turn === 3) setResult({ correct: false, earned: 0 });
    }
  }

  function advance() {
    if (index + 1 === total) {
      setFinished(true);
    } else {
      setIndex((value) => value + 1);
      setAttempts(0);
      setWrong([]);
      setResult(null);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.kicker}>PENSE BEM</Text>
          <Text style={styles.title}>Street Fighter II</Text>
          <Text style={styles.subtitle}>O desafio de perguntas do livro, agora no celular.</Text>
        </View>

        {!program ? (
          <View>
            <Text style={styles.heading}>Escolha um programa</Text>
            <Text style={styles.helper}>São 30 perguntas por programa. Você tem até 3 tentativas e pode somar 90 pontos.</Text>
            {programs.map((item) => (
              <TouchableOpacity key={item.id} accessibilityRole="button"
                accessibilityLabel={`Iniciar programa ${item.id}, código ${item.code}`}
                style={styles.programCard} activeOpacity={0.8} onPress={() => start(item)}>
                <View style={styles.badge}><Text style={styles.badgeText}>{item.id}</Text></View>
                <View style={styles.programInfo}>
                  <Text style={styles.programName}>Programa {item.id}</Text>
                  <Text style={styles.programMeta}>Código {item.code} · {item.questions.length} perguntas</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
            {programs.length === 0 && <Text style={styles.helper}>Nenhum programa carregado.</Text>}
          </View>
        ) : finished ? (
          <View style={styles.resultCard}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.resultTitle}>Programa concluído!</Text>
            <Text style={styles.resultMeta}>Programa {program.id} · Código {program.code}</Text>
            <Text style={styles.finalScore}>{score}<Text style={styles.outOf}> / {total * 3}</Text></Text>
            <Text style={styles.scoreCaption}>pontos conquistados</Text>
            <Action title="Jogar novamente" onPress={() => start(program)} />
            <Action title="Escolher outro programa" secondary onPress={() => setProgram(null)} />
          </View>
        ) : current ? (
          <View>
            <View style={styles.row}>
              <Text style={styles.tag}>PROGRAMA {program.id} · {program.code}</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar aos programas" onPress={() => setProgram(null)}>
                <Text style={styles.exit}>Sair</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.track}><View style={[styles.fill, { width: `${((index + 1) / total) * 100}%` }]} /></View>
            <View style={styles.row}>
              <Text style={styles.progress}>Pergunta {index + 1} de {total}</Text>
              <Text style={styles.progress}>{score} pontos</Text>
            </View>
            <View style={styles.questionCard}>
              <Text style={styles.questionNumber}>QUESTÃO {String(current.number).padStart(2, '0')}</Text>
              <Text style={styles.question}>{current.prompt}</Text>
            </View>
            <Text style={styles.choiceTitle}>Escolha a resposta pela cor</Text>
            {current.options.map((option) => {
              const color = palette[option.color] || { name: option.color, hex: '#64748B' };
              const rejected = wrong.includes(option.color);
              const correct = result?.correct && option.color === current.correctColor;
              return (
                <TouchableOpacity key={option.color} accessibilityRole="button"
                  accessibilityLabel={`${color.name}: ${option.text}`}
                  accessibilityState={{ disabled: Boolean(result) || rejected }}
                  disabled={Boolean(result) || rejected} activeOpacity={0.8}
                  style={[styles.option, rejected && styles.rejected, correct && styles.correct]}
                  onPress={() => answer(option.color)}>
                  <View style={[styles.swatch, { backgroundColor: color.hex }]} />
                  <View style={styles.optionCopy}>
                    <Text style={styles.colorName}>{color.name}</Text>
                    <Text style={styles.optionText}>{option.text}</Text>
                  </View>
                  {rejected && <Text style={styles.wrongIcon}>×</Text>}
                  {correct && <Text style={styles.correctIcon}>✓</Text>}
                </TouchableOpacity>
              );
            })}
            <View style={styles.feedback}>
              {result ? (
                <>
                  <Text style={[styles.feedbackTitle, !result.correct && styles.feedbackError]}>
                    {result.correct ? `Acertou! +${result.earned} ${result.earned === 1 ? 'ponto' : 'pontos'}` : 'Fim das tentativas · 0 pontos'}
                  </Text>
                  {!result.correct && <Text style={styles.feedbackDetail}>Resposta: {palette[current.correctColor]?.name || current.correctColor}.</Text>}
                  <Action title={index + 1 === total ? 'Ver resultado' : 'Próxima pergunta'} onPress={advance} />
                </>
              ) : (
                <Text style={styles.feedbackDetail}>
                  {attempts === 0 ? 'Você tem 3 tentativas.' : `Tente outra cor. ${3 - attempts} ${3 - attempts === 1 ? 'tentativa restante' : 'tentativas restantes'}.`}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Perguntas indisponíveis</Text>
            <Action title="Escolher outro programa" secondary onPress={() => setProgram(null)} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#111827' },
  content: { flexGrow: 1, width: '100%', maxWidth: 650, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 36 },
  header: { paddingTop: 28, paddingBottom: 30 },
  kicker: { color: '#F4C762', fontSize: 12, fontWeight: '800', letterSpacing: 3, marginBottom: 9 },
  title: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', lineHeight: 38 },
  subtitle: { color: '#B7C2D4', fontSize: 14, lineHeight: 21, marginTop: 8 },
  heading: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  helper: { color: '#B7C2D4', fontSize: 14, lineHeight: 21, marginBottom: 22 },
  programCard: { backgroundColor: '#202B3D', borderColor: '#34425A', borderWidth: 1, borderRadius: 16, minHeight: 78, marginBottom: 12, padding: 14, flexDirection: 'row', alignItems: 'center' },
  badge: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#F4C762', alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#162033', fontWeight: '900', fontSize: 22 },
  programInfo: { flex: 1, paddingHorizontal: 13 },
  programName: { color: '#FFFFFF', fontWeight: '800', fontSize: 17 },
  programMeta: { color: '#B7C2D4', fontSize: 12, marginTop: 4 },
  arrow: { color: '#F4C762', fontSize: 28 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tag: { color: '#F4C762', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  exit: { color: '#D8E1EF', fontSize: 14, padding: 6 },
  track: { height: 7, backgroundColor: '#364257', borderRadius: 10, overflow: 'hidden' },
  fill: { height: 7, backgroundColor: '#F4C762' },
  progress: { color: '#B7C2D4', fontSize: 12, fontWeight: '600', marginTop: 8 },
  questionCard: { backgroundColor: '#202B3D', borderRadius: 18, borderWidth: 1, borderColor: '#34425A', padding: 22, marginVertical: 10 },
  questionNumber: { color: '#F4C762', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 },
  question: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', lineHeight: 29 },
  choiceTitle: { color: '#D8E1EF', fontSize: 13, fontWeight: '700', marginVertical: 12 },
  option: { backgroundColor: '#F7F9FC', borderRadius: 13, marginBottom: 10, minHeight: 66, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  rejected: { opacity: 0.48 },
  correct: { borderColor: '#55B88B' },
  swatch: { width: 34, height: 34, borderRadius: 9, marginRight: 12 },
  optionCopy: { flex: 1 },
  colorName: { color: '#334155', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 3 },
  optionText: { color: '#172235', fontSize: 15, fontWeight: '600', lineHeight: 20 },
  wrongIcon: { color: '#9B2731', fontSize: 24 },
  correctIcon: { color: '#278963', fontSize: 22 },
  feedback: { minHeight: 95, paddingTop: 11 },
  feedbackTitle: { color: '#80D8A9', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 9 },
  feedbackError: { color: '#FFB0A7' },
  feedbackDetail: { color: '#D8E1EF', fontSize: 14, textAlign: 'center', lineHeight: 21 },
  action: { backgroundColor: '#F4C762', borderRadius: 12, minHeight: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 12 },
  actionText: { color: '#162033', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  actionSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#66758F' },
  actionSecondaryText: { color: '#E8EEF8' },
  resultCard: { backgroundColor: '#202B3D', borderColor: '#34425A', borderWidth: 1, borderRadius: 20, padding: 25, marginTop: 14 },
  star: { color: '#F4C762', fontSize: 48, textAlign: 'center' },
  resultTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', textAlign: 'center', marginTop: 10 },
  resultMeta: { color: '#B7C2D4', fontSize: 14, textAlign: 'center', marginTop: 7 },
  finalScore: { color: '#F4C762', fontSize: 58, fontWeight: '900', textAlign: 'center', marginTop: 25 },
  outOf: { color: '#B7C2D4', fontSize: 25, fontWeight: '600' },
  scoreCaption: { color: '#D8E1EF', fontSize: 14, textAlign: 'center', marginBottom: 21 },
});
