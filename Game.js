import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import book from './questions.json';
import CombatStage from './CombatStage';

const COLORS = {
  red: { label: 'Vermelho', hex: '#C9474C' },
  yellow: { label: 'Amarelo', hex: '#D3A330' },
  blue: { label: 'Azul', hex: '#4285BB' },
  green: { label: 'Verde', hex: '#3E9876' },
};
const CLASSIC_LENGTH = 50;
const PVP_TURNS = 20;
const TURN_SECONDS = 20;

function shuffledQuestions(limit) {
  const pool = (book.programs || []).flatMap((program) => program.questions || []);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, limit);
}

function Button({ label, onPress, secondary = false }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.button, secondary && styles.buttonSecondary]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{label}</Text>
    </TouchableOpacity>
  );
}

function HealthBars({ hp }) {
  return (
    <View style={styles.hpRow}>
      {hp.map((value, index) => (
        <View key={index} style={styles.hpColumn}>
          <Text style={styles.hpText}>J{index + 1} · {value} HP</Text>
          <View style={styles.hpTrack}>
            <View
              style={[
                styles.hpFill,
                {
                  width: `${value}%`,
                  backgroundColor: value > 50 ? '#55B88B' : value > 25 ? '#F4C762' : '#E77772',
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function Game({ mode, onExit }) {
  const [phase, setPhase] = useState('select');
  const [program, setProgram] = useState(null);
  const [deck, setDeck] = useState([]);
  const [position, setPosition] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [wrongColors, setWrongColors] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(0);
  const [hp, setHp] = useState([100, 100]);
  const [remaining, setRemaining] = useState(TURN_SECONDS);
  const [lastTurn, setLastTurn] = useState(false);
  const [endReason, setEndReason] = useState('');
  const locked = useRef(false);
  const attemptsNow = useRef(0);
  const wrongNow = useRef([]);
  const startedAt = useRef(0);

  useEffect(() => {
    locked.current = false;
    attemptsNow.current = 0;
    wrongNow.current = [];
    setPosition(0);
    setAttempts(0);
    setWrongColors([]);
    setFeedback(null);
    setScore(0);
    setHp([100, 100]);
    setRemaining(TURN_SECONDS);
    setLastTurn(false);
    setEndReason('');
    setProgram(null);
    if (mode === 'basic') {
      setDeck([]);
      setLives(0);
      setPhase('select');
    } else if (mode === 'challenge' || mode === 'survival') {
      setDeck(shuffledQuestions(CLASSIC_LENGTH));
      setLives(mode === 'challenge' ? 3 : 1);
      setPhase('playing');
    } else if (mode === 'pvp') {
      setDeck(shuffledQuestions(PVP_TURNS));
      setLives(0);
      setPhase('ready');
    } else {
      setDeck([]);
      setPhase('select');
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'pvp' || phase !== 'playing') return undefined;
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
      setRemaining(Math.max(0, TURN_SECONDS - elapsed));
    }, 200);
    return () => clearInterval(timer);
  }, [mode, phase, position]);

  useEffect(() => {
    if (mode === 'pvp' && phase === 'playing' && remaining === 0) {
      resolvePvp(false, true);
    }
  }, [mode, phase, remaining]);

  const current = deck[position];
  const playerIndex = position % 2;
  const isBasic = mode === 'basic';
  const isClassic = mode === 'challenge' || mode === 'survival';
  const isPvp = mode === 'pvp';
  const modeTitle = isBasic
    ? 'Básico'
    : mode === 'challenge'
      ? 'Clássico · Desafio'
      : mode === 'survival'
        ? 'Clássico · Sobrevivência'
        : 'PvP';

  function chooseProgram(selected) {
    setProgram(selected);
    setDeck(selected.questions || []);
    setPosition(0);
    setScore(0);
    setAttempts(0);
    setWrongColors([]);
    setFeedback(null);
    attemptsNow.current = 0;
    wrongNow.current = [];
    locked.current = false;
    setPhase('playing');
  }

  function startPvpTurn() {
    locked.current = false;
    setFeedback(null);
    setRemaining(TURN_SECONDS);
    startedAt.current = Date.now();
    setPhase('playing');
  }

  function resolvePvp(correct, timedOut = false) {
    if (locked.current || phase !== 'playing') return;
    locked.current = true;
    const elapsedMs = Math.max(0, Date.now() - startedAt.current);
    const expired = timedOut || elapsedMs >= TURN_SECONDS * 1000;
    const acceptedCorrect = correct && !expired;
    const elapsed = expired ? TURN_SECONDS : Math.floor(elapsedMs / 1000);
    const damage = acceptedCorrect ? 15 : Math.min(30, 10 + 5 * Math.floor(elapsed / 5));
    const nextHp = [...hp];
    const damagedPlayer = acceptedCorrect ? 1 - playerIndex : playerIndex;
    nextHp[damagedPlayer] = Math.max(0, nextHp[damagedPlayer] - damage);
    setHp(nextHp);
    const endedByHp = nextHp[damagedPlayer] === 0;
    const endedByTurns = position + 1 === deck.length;
    setLastTurn(endedByHp || endedByTurns);
    if (endedByHp) setEndReason(`Jogador ${damagedPlayer + 1} ficou sem vida.`);
    else if (endedByTurns) setEndReason('Os 20 turnos terminaram.');
    setFeedback({ correct: acceptedCorrect, damage, timedOut: expired });
    setPhase('feedback');
  }

  function answer(color) {
    if (phase !== 'playing' || !current) return;
    if (isBasic) {
      if (wrongNow.current.includes(color) || locked.current) return;
      const nextAttempt = attemptsNow.current + 1;
      attemptsNow.current = nextAttempt;
      setAttempts(nextAttempt);
      if (color === current.correctColor) {
        locked.current = true;
        const earned = 4 - nextAttempt;
        setScore((value) => value + earned);
        setFeedback({ correct: true, earned });
        setPhase('feedback');
      } else {
        wrongNow.current = [...wrongNow.current, color];
        setWrongColors(wrongNow.current);
        if (nextAttempt === 3) {
          locked.current = true;
          setFeedback({ correct: false, earned: 0 });
          setPhase('feedback');
        }
      }
    } else if (isClassic) {
      if (locked.current) return;
      locked.current = true;
      const correct = color === current.correctColor;
      if (correct) setScore((value) => value + 1);
      else {
        setLives((value) => value - 1);
        if (mode === 'survival') setScore(0);
      }
      setFeedback({ correct, earned: correct ? 1 : 0 });
      setPhase('feedback');
    } else if (isPvp) {
      resolvePvp(color === current.correctColor);
    }
  }

  function advance() {
    if (isBasic && position + 1 === deck.length) {
      setPhase('ended');
      return;
    }
    if (isClassic && (position + 1 === deck.length || lives === 0)) {
      setEndReason(lives === 0 ? 'As vidas acabaram.' : 'As 50 perguntas terminaram.');
      setPhase('ended');
      return;
    }
    if (isPvp && lastTurn) {
      setPhase('ended');
      return;
    }
    setPosition((value) => value + 1);
    setFeedback(null);
    locked.current = false;
    if (isBasic) {
      attemptsNow.current = 0;
      wrongNow.current = [];
      setAttempts(0);
      setWrongColors([]);
      setPhase('playing');
    } else if (isPvp) {
      setPhase('ready');
    } else {
      setPhase('playing');
    }
  }

  const noQuestions = phase !== 'select' && deck.length === 0;
  const winner = hp[0] === hp[1] ? 0 : hp[0] > hp[1] ? 1 : 2;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.kicker}>PENSE BEM · STREET FIGHTER II</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Sair para o início" onPress={onExit}>
              <Text style={styles.exit}>Sair</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>{modeTitle}</Text>
        </View>

        {noQuestions ? (
          <View style={styles.panel}>
            <Text style={styles.heading}>Perguntas indisponíveis</Text>
            <Button label="Voltar ao início" onPress={onExit} />
          </View>
        ) : phase === 'select' && isBasic ? (
          <View>
            <Text style={styles.heading}>Escolha um programa</Text>
            <Text style={styles.muted}>30 perguntas · 3 tentativas por pergunta · até 90 pontos</Text>
            {(book.programs || []).map((item) => (
              <TouchableOpacity key={item.id} accessibilityRole="button"
                accessibilityLabel={`Iniciar programa ${item.id}, código ${item.code}`}
                onPress={() => chooseProgram(item)} activeOpacity={0.8} style={styles.program}>
                <View style={styles.badge}><Text style={styles.badgeText}>{item.id}</Text></View>
                <View style={styles.programCopy}>
                  <Text style={styles.programName}>Programa {item.id}</Text>
                  <Text style={styles.mutedSmall}>Código {item.code} · {item.questions.length} perguntas</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : phase === 'ready' && isPvp ? (
          <View style={styles.panel}>
            <Text style={styles.tag}>TURNO {position + 1} DE {deck.length}</Text>
            <Text style={styles.heading}>Jogador {playerIndex + 1}, pronto?</Text>
            <Text style={styles.body}>Passe o celular para o jogador {playerIndex + 1}. O cronômetro de 20 segundos começa ao tocar no botão.</Text>
            <CombatStage event={null} />
            <HealthBars hp={hp} />
            <Button label="Começar turno" onPress={startPvpTurn} />
          </View>
        ) : phase === 'ended' ? (
          <View style={styles.panel}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.heading}>{isPvp ? (winner === 0 ? 'Empate!' : `Jogador ${winner} venceu!`) : 'Jogo concluído!'}</Text>
            {isPvp ? (
              <>
                <Text style={styles.body}>{endReason}</Text>
                <CombatStage event={null} />
                <HealthBars hp={hp} />
              </>
            ) : (
              <>
                <Text style={styles.bigScore}>{score}<Text style={styles.outOf}> / {isBasic ? deck.length * 3 : CLASSIC_LENGTH}</Text></Text>
                <Text style={styles.body}>{isBasic ? `Programa ${program?.id} · Código ${program?.code}` : endReason}</Text>
              </>
            )}
            <Button label={isBasic ? 'Jogar programa novamente' : 'Jogar novamente'}
              onPress={() => {
                if (isBasic) chooseProgram(program);
                else if (isPvp) {
                  setDeck(shuffledQuestions(PVP_TURNS));
                  setPosition(0);
                  setHp([100, 100]);
                  setFeedback(null);
                  setLastTurn(false);
                  setEndReason('');
                  setPhase('ready');
                } else {
                  setDeck(shuffledQuestions(CLASSIC_LENGTH));
                  setPosition(0);
                  setScore(0);
                  setLives(mode === 'challenge' ? 3 : 1);
                  setFeedback(null);
                  locked.current = false;
                  setEndReason('');
                  setPhase('playing');
                }
              }}
            />
            <Button label="Voltar ao início" secondary onPress={onExit} />
          </View>
        ) : current ? (
          <View>
            <View style={styles.statsRow}>
              <Text style={styles.tag}>{isPvp ? `JOGADOR ${playerIndex + 1}` : isBasic ? `PROGRAMA ${program?.id} · ${program?.code}` : `VIDAS ${'♥'.repeat(Math.max(0, lives))}`}</Text>
              <Text style={styles.statValue}>{isPvp ? `${remaining}s` : `${score} pts`}</Text>
            </View>
            <View style={styles.track}><View style={[styles.fill, { width: `${((position + 1) / deck.length) * 100}%` }]} /></View>
            <Text style={styles.progress}>{isPvp ? 'Turno' : 'Pergunta'} {position + 1} de {deck.length}</Text>
            <View style={styles.questionCard}>
              <Text style={styles.questionNumber}>QUESTÃO {String(current.number).padStart(2, '0')}</Text>
              <Text style={styles.question}>{current.prompt}</Text>
            </View>
            {isPvp && (
              <>
                <CombatStage
                  event={phase === 'feedback' && feedback ? {
                    id: position,
                    attacker: feedback.correct ? playerIndex : null,
                    hurt: feedback.correct ? 1 - playerIndex : playerIndex,
                  } : null}
                />
                <HealthBars hp={hp} />
              </>
            )}
            <Text style={styles.choiceTitle}>Escolha a resposta pela cor</Text>
            {current.options.map((option) => {
              const color = COLORS[option.color] || { label: option.color, hex: '#64748B' };
              const rejected = wrongColors.includes(option.color);
              const right = phase === 'feedback' && option.color === current.correctColor;
              return (
                <TouchableOpacity key={option.color} accessibilityRole="button"
                  accessibilityLabel={`${color.label}: ${option.text}`}
                  accessibilityState={{ disabled: phase !== 'playing' || rejected }}
                  disabled={phase !== 'playing' || rejected}
                  activeOpacity={0.8} onPress={() => answer(option.color)}
                  style={[styles.option, rejected && styles.rejected, right && styles.right]}>
                  <View style={[styles.swatch, { backgroundColor: color.hex }]} />
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionText}>{option.text}</Text>
                  </View>
                  {rejected && <Text style={styles.wrongIcon}>×</Text>}
                  {right && <Text style={styles.rightIcon}>✓</Text>}
                </TouchableOpacity>
              );
            })}
            {phase === 'feedback' ? (
              <View style={styles.feedbackBox}>
                <Text style={[styles.feedbackTitle, !feedback.correct && styles.feedbackError]}>
                  {isPvp
                    ? feedback.correct ? 'Acertou! O adversário perdeu 15 HP.' : feedback.timedOut ? `Tempo esgotado! Você perdeu ${feedback.damage} HP.` : `Errou! Você perdeu ${feedback.damage} HP.`
                    : feedback.correct ? `Acertou! +${feedback.earned} ${feedback.earned === 1 ? 'ponto' : 'pontos'}` : isBasic ? 'Fim das tentativas · 0 pontos' : mode === 'survival' ? 'Errou! Pontuação zerada.' : 'Errou! Perdeu uma vida.'}
                </Text>
                {!feedback.correct && <Text style={styles.feedbackDetail}>Resposta: {COLORS[current.correctColor]?.label || current.correctColor}.</Text>}
                <Button label={lastTurn || (isBasic && position + 1 === deck.length) || (isClassic && (position + 1 === deck.length || lives === 0)) ? 'Ver resultado' : isPvp ? 'Próximo jogador' : 'Próxima pergunta'} onPress={advance} />
              </View>
            ) : (
              <Text style={styles.hint}>
                {isBasic ? attempts === 0 ? 'Você tem 3 tentativas.' : `${3 - attempts} ${3 - attempts === 1 ? 'tentativa restante' : 'tentativas restantes'}.` : isPvp ? 'Acerto tira 15 HP do rival. Erro e tempo esgotado reduzem seu HP.' : 'Uma resposta por pergunta. Cada acerto vale 1 ponto.'}
              </Text>
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#111827' },
  content: { flexGrow: 1, width: '100%', maxWidth: 650, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 36 },
  header: { paddingTop: 25, paddingBottom: 25 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: { color: '#F4C762', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, flex: 1 },
  exit: { color: '#D8E1EF', fontSize: 14, padding: 6 },
  title: { color: '#FFFFFF', fontSize: 29, fontWeight: '900', marginTop: 8 },
  heading: { color: '#FFFFFF', fontSize: 23, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
  body: { color: '#C5D0E0', fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 16 },
  muted: { color: '#B7C2D4', fontSize: 14, lineHeight: 21, marginBottom: 20 },
  mutedSmall: { color: '#B7C2D4', fontSize: 12, marginTop: 4 },
  panel: { backgroundColor: '#202B3D', borderColor: '#34425A', borderWidth: 1, borderRadius: 18, padding: 22, marginTop: 15 },
  program: { backgroundColor: '#202B3D', borderColor: '#34425A', borderWidth: 1, borderRadius: 15, minHeight: 76, flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 12 },
  badge: { width: 45, height: 45, backgroundColor: '#F4C762', borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#162033', fontSize: 21, fontWeight: '900' },
  programCopy: { flex: 1, paddingHorizontal: 13 },
  programName: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  arrow: { color: '#F4C762', fontSize: 28 },
  tag: { color: '#F4C762', fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  statValue: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  hpRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 15, padding: 12, borderRadius: 11, backgroundColor: '#2C3A50' },
  hpColumn: { width: '48%' },
  hpText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginBottom: 7 },
  hpTrack: { height: 9, borderRadius: 9, backgroundColor: '#111827', overflow: 'hidden' },
  hpFill: { height: 9, borderRadius: 9 },
  track: { height: 7, borderRadius: 10, backgroundColor: '#364257', overflow: 'hidden' },
  fill: { height: 7, backgroundColor: '#F4C762' },
  progress: { color: '#B7C2D4', fontSize: 12, fontWeight: '600', marginTop: 8 },
  questionCard: { backgroundColor: '#202B3D', borderColor: '#34425A', borderWidth: 1, borderRadius: 17, padding: 21, marginVertical: 18 },
  questionNumber: { color: '#F4C762', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 11 },
  question: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', lineHeight: 28 },
  choiceTitle: { color: '#D8E1EF', fontSize: 13, fontWeight: '700', marginBottom: 12 },
  option: { backgroundColor: '#F7F9FC', borderColor: 'transparent', borderWidth: 2, borderRadius: 13, minHeight: 64, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  rejected: { opacity: 0.48 },
  right: { borderColor: '#55B88B' },
  swatch: { width: 33, height: 33, borderRadius: 9, marginRight: 12 },
  optionCopy: { flex: 1 },
  optionText: { color: '#172235', fontSize: 15, fontWeight: '600', lineHeight: 20 },
  wrongIcon: { color: '#9B2731', fontSize: 24 },
  rightIcon: { color: '#278963', fontSize: 22 },
  feedbackBox: { paddingTop: 8 },
  feedbackTitle: { color: '#80D8A9', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  feedbackError: { color: '#FFB0A7' },
  feedbackDetail: { color: '#D8E1EF', fontSize: 14, textAlign: 'center' },
  hint: { color: '#D8E1EF', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 8 },
  button: { backgroundColor: '#F4C762', borderRadius: 12, minHeight: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 12 },
  buttonText: { color: '#162033', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  buttonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#66758F' },
  buttonSecondaryText: { color: '#E8EEF8' },
  star: { color: '#F4C762', fontSize: 48, textAlign: 'center', marginBottom: 6 },
  bigScore: { color: '#F4C762', fontSize: 58, fontWeight: '900', textAlign: 'center', marginVertical: 18 },
  outOf: { color: '#B7C2D4', fontSize: 25, fontWeight: '600' },
});
