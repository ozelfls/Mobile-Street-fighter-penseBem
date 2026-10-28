import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Image,
} from 'react-native';
import book from './questions.json';
import CombatStage, { COMBAT_CHARACTERS } from './CombatStage';
import BonusCarStage from './BonusCarStage';
import { useAnswerSounds } from './SoundFeedback';

const COLORS = {
  red: { label: 'Vermelho', hex: '#C9474C' },
  yellow: { label: 'Amarelo', hex: '#D3A330' },
  blue: { label: 'Azul', hex: '#4285BB' },
  green: { label: 'Verde', hex: '#3E9876' },
};
const PVP_TURNS = 20;

function shuffledQuestions(limit) {
  const pool = (book.programs || []).flatMap((program) =>
    (program.questions || []).map((question) => ({ ...question, programId: program.id })));
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, limit);
}

function Button({ label, onPress, secondary = false, disabled = false }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.button, secondary && styles.buttonSecondary, disabled && styles.buttonDisabled]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{label}</Text>
    </TouchableOpacity>
  );
}

function HealthBars({ hp, compact = false }) {
  return (
    <View style={[styles.hpRow, compact && styles.hpRowCompact]}>
      {hp.map((value, index) => (
        <View key={index} style={styles.hpColumn}>
          <Text style={[styles.hpText, compact && styles.hpTextCompact]}>J{index + 1} · {value} HP</Text>
          <View style={[styles.hpTrack, compact && styles.hpTrackCompact]}>
            <View
              style={[
                styles.hpFill,
                compact && styles.hpFillCompact,
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
  const { width, height } = useWindowDimensions();
  const compact = width < 390 || height < 720;
  const narrow = width < 345;
  const scrollRef = useRef(null);
  const [phase, setPhase] = useState('select');
  const [program, setProgram] = useState(null);
  const [deck, setDeck] = useState([]);
  const [position, setPosition] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [wrongColors, setWrongColors] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [perfectRun, setPerfectRun] = useState(true);
  const [carHits, setCarHits] = useState(0);
  const [comboActive, setComboActive] = useState(false);
  const [hp, setHp] = useState([100, 100]);
  const [lastTurn, setLastTurn] = useState(false);
  const [endReason, setEndReason] = useState('');
  const [characters, setCharacters] = useState([null, null]);
  const [selectedBasicCharacter, setSelectedBasicCharacter] = useState(null);
  const [selectingPlayer, setSelectingPlayer] = useState(0);
  const locked = useRef(false);
  const attemptsNow = useRef(0);
  const wrongNow = useRef([]);
  const startedAt = useRef(0);
  const { playCorrect, playWrong } = useAnswerSounds();
  const handleAttackComplete = useCallback(() => setComboActive(false), []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [mode, phase, position, selectingPlayer]);

  useEffect(() => {
    locked.current = false;
    attemptsNow.current = 0;
    wrongNow.current = [];
    setPosition(0);
    setAttempts(0);
    setWrongColors([]);
    setFeedback(null);
    setScore(0);
    setPerfectRun(true);
    setCarHits(0);
    setComboActive(false);
    setHp([100, 100]);
    setLastTurn(false);
    setEndReason('');
    setProgram(null);
    setCharacters([null, null]);
    setSelectedBasicCharacter(null);
    setSelectingPlayer(0);
    if (mode === 'basic') {
      setDeck([]);
      setPhase('select');
    } else if (mode === 'pvp') {
      setDeck(shuffledQuestions(PVP_TURNS));
      setPhase('characterSelect');
    } else {
      setDeck([]);
      setPhase('select');
    }
  }, [mode]);

  const current = deck[position];
  const playerIndex = position % 2;
  const isBasic = mode === 'basic';
  const isPvp = mode === 'pvp';
  const modeTitle = isBasic ? 'Básico' : 'PvP';
  const finalScore = score + (isBasic && perfectRun && phase === 'ended' ? 10 : 0);

  function chooseProgram(selected) {
    setProgram(selected);
    setDeck(selected.questions || []);
    setPosition(0);
    setScore(0);
    setPerfectRun(true);
    setCarHits(0);
    setComboActive(false);
    setSelectedBasicCharacter(null);
    setAttempts(0);
    setWrongColors([]);
    setFeedback(null);
    attemptsNow.current = 0;
    wrongNow.current = [];
    locked.current = false;
    setPhase('characterSelect');
  }

  function replayBasic(nextPhase = 'playing') {
    setPosition(0);
    setScore(0);
    setPerfectRun(true);
    setCarHits(0);
    setComboActive(false);
    setAttempts(0);
    setWrongColors([]);
    setFeedback(null);
    attemptsNow.current = 0;
    wrongNow.current = [];
    locked.current = false;
    if (nextPhase === 'characterSelect') setSelectedBasicCharacter(null);
    setPhase(nextPhase);
  }

  function chooseCharacter(characterId) {
    if (phase !== 'characterSelect') return;
    if (isBasic) {
      setSelectedBasicCharacter(characterId);
      setPhase('playing');
      return;
    }
    if (characters.includes(characterId)) return;
    if (selectingPlayer === 0) {
      setCharacters([characterId, null]);
      setSelectingPlayer(1);
    } else {
      setCharacters([characters[0], characterId]);
      setPhase('ready');
    }
  }

  function startPvpTurn() {
    locked.current = false;
    setFeedback(null);
    startedAt.current = Date.now();
    setPhase('playing');
  }

  function resolvePvp(correct) {
    if (locked.current || phase !== 'playing') return;
    locked.current = true;
    const elapsedMs = Math.max(0, Date.now() - startedAt.current);
    const elapsed = Math.floor(elapsedMs / 1000);
    const damage = correct ? 15 : Math.min(30, 10 + 5 * Math.floor(elapsed / 5));
    const nextHp = [...hp];
    const damagedPlayer = correct ? 1 - playerIndex : playerIndex;
    nextHp[damagedPlayer] = Math.max(0, nextHp[damagedPlayer] - damage);
    setHp(nextHp);
    const endedByHp = nextHp[damagedPlayer] === 0;
    const endedByTurns = position + 1 === deck.length;
    setLastTurn(endedByHp || endedByTurns);
    if (endedByHp) setEndReason(`Jogador ${damagedPlayer + 1} ficou sem vida.`);
    else if (endedByTurns) setEndReason('Os 20 turnos terminaram.');
    setFeedback({ correct, damage });
    if (correct) playCorrect();
    else playWrong();
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
        setCarHits((value) => value + 1);
        setComboActive(true);
        setFeedback({ correct: true, earned });
        playCorrect();
        setPhase('feedback');
      } else {
        setPerfectRun(false);
        wrongNow.current = [...wrongNow.current, color];
        setWrongColors(wrongNow.current);
        playWrong();
        if (nextAttempt === 3) {
          locked.current = true;
          setFeedback({ correct: false, earned: 0 });
          setPhase('feedback');
        }
      }
    } else if (isPvp) {
      resolvePvp(color === current.correctColor);
    }
  }

  function advance() {
    if (isBasic && comboActive) return;
    if (isBasic && position + 1 === deck.length) {
      setPhase('ended');
      return;
    }
    if (isPvp && lastTurn) {
      setPhase('ended');
      return;
    }
    setPosition((value) => value + 1);
    setFeedback(null);
    setComboActive(false);
    locked.current = false;
    if (isBasic) {
      attemptsNow.current = 0;
      wrongNow.current = [];
      setAttempts(0);
      setWrongColors([]);
      setPhase('playing');
    } else if (isPvp) setPhase('ready');
  }

  const noQuestions = phase !== 'select' && deck.length === 0;
  const winner = hp[0] === hp[1] ? 0 : hp[0] > hp[1] ? 1 : 2;
  const responseStatus = current && phase === 'feedback' && (
    <View style={styles.feedbackBox} accessibilityLiveRegion="polite">
      <Text style={[styles.feedbackTitle, !feedback.correct && styles.feedbackError]}>
        {isPvp
          ? feedback.correct ? 'Acertou! O adversário perdeu 15 HP.' : `Errou! Você perdeu ${feedback.damage} HP.`
          : feedback.correct ? `Acertou! +${feedback.earned} ${feedback.earned === 1 ? 'ponto' : 'pontos'}` : 'Três tentativas usadas · 0 pontos.'}
      </Text>
      {!feedback.correct && <Text style={styles.feedbackDetail}>Resposta: {COLORS[current.correctColor]?.label || current.correctColor}.</Text>}
      <Button label={comboActive ? 'Golpeando...' : lastTurn || (isBasic && position + 1 === deck.length) ? 'Ver resultado' : isPvp ? 'Próximo jogador' : 'Próxima pergunta'} onPress={advance} disabled={isBasic && comboActive} />
    </View>
  );

  const pinnedGameplay = current && (phase === 'playing' || phase === 'feedback');
  const basicShort = height < 650;
  const basicTiny = height < 570;
  const basicArenaHeight = basicTiny ? Math.max(72, height * 0.17 - 8) : Math.max(82, Math.min(168, height * 0.22 - 8));
  const pvpArenaHeight = Math.max(125, Math.min(205, height * 0.28));

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      {pinnedGameplay ? (
        <View style={[styles.pinnedLayout, narrow && styles.pinnedNarrow]}>
          <View style={styles.basicHeader}>
            <Text style={styles.basicBrand}>PENSE BEM <Text style={styles.basicBrandMode}>/ {isBasic ? 'BÁSICO' : 'PVP'}</Text></Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Sair para o início" onPress={onExit} style={styles.exitButton}>
              <Text style={styles.exit}>Sair</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.basicHud}>
            <Text style={styles.basicHudLabel}>{isBasic ? `QUESTÃO ${position + 1}/${deck.length}` : `JOGADOR ${playerIndex + 1}  ·  TURNO ${position + 1}/${deck.length}`}</Text>
            {isBasic && <Text style={styles.basicScore}>{score} <Text style={styles.basicScoreLabel}>PTS</Text></Text>}
          </View>
          <View style={styles.track}><View style={[styles.fill, { width: `${((position + 1) / deck.length) * 100}%` }]} /></View>
          <View style={[styles.basicBookCard, (basicShort || isPvp) && styles.basicBookCardShort, basicTiny && styles.basicBookCardTiny]}>
            <View>
              <Text style={styles.basicBookEyebrow}>QUESTÃO DO LIVRO</Text>
              <Text style={styles.basicBookCaption}>Programa {isBasic ? program?.id : current.programId}</Text>
            </View>
            <Text accessibilityRole="header" accessibilityLabel={`Programa ${isBasic ? program?.id : current.programId}, questão ${current.number}`}
              style={[styles.basicBookNumber, (basicShort || isPvp) && styles.basicBookNumberShort, basicTiny && styles.basicBookNumberTiny]}>
              {String(current.number).padStart(2, '0')}
            </Text>
          </View>
          <View style={[styles.basicActionArea, (basicShort || isPvp) && styles.basicActionAreaShort, basicTiny && styles.basicActionAreaTiny]}>
            {phase === 'playing' && (
              <>
                <Text style={[styles.basicChoiceTitle, basicShort && styles.basicChoiceTitleShort]}>TOQUE NA COR DA RESPOSTA</Text>
                <View style={styles.colorGrid}>
                  {Object.entries(COLORS).map(([key, color]) => {
                    const rejected = isBasic && wrongColors.includes(key);
                    return (
                      <TouchableOpacity key={key} accessibilityRole="button" accessibilityLabel={`Resposta ${color.label.toLowerCase()}`}
                        accessibilityState={{ disabled: rejected }} disabled={rejected}
                        onPress={() => answer(key)} activeOpacity={0.8}
                        style={[styles.colorKey, (basicShort || isPvp) && styles.colorKeyShort, basicTiny && styles.colorKeyTiny, { backgroundColor: color.hex }, rejected && styles.colorKeyRejected]}>
                        {rejected && <Text style={styles.colorKeyCross}>×</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={[styles.basicAttempt, basicShort && styles.basicAttemptShort, isBasic && attempts > 0 && styles.feedbackError]} accessibilityLiveRegion="polite">
                  {isBasic
                    ? attempts === 0 ? 'Você tem 3 tentativas.' : `Errou! Restam ${3 - attempts} ${3 - attempts === 1 ? 'tentativa' : 'tentativas'}.`
                    : 'Acerto: rival perde 15 HP. Erro: dano cresce com a demora.'}
                </Text>
              </>
            )}
            {phase === 'feedback' && responseStatus}
          </View>
          <View style={styles.basicArena}>
            {isBasic ? (
              <BonusCarStage character={selectedBasicCharacter} targetHits={30} maxHeight={basicArenaHeight} compactViewport
                event={phase === 'feedback' && feedback?.correct ? { id: position } : null} score={carHits}
                onAttackComplete={handleAttackComplete} />
            ) : (
              <>
                <CombatStage characters={characters} compactViewport maxHeight={pvpArenaHeight}
              event={phase === 'feedback' && feedback ? {
                id: position,
                attacker: feedback.correct ? playerIndex : 1 - playerIndex,
                hurt: feedback.correct ? 1 - playerIndex : playerIndex,
              } : null} />
                <HealthBars hp={hp} compact />
              </>
            )}
          </View>
        </View>
      ) : (
      <ScrollView ref={scrollRef}
        contentContainerStyle={[styles.content, compact && styles.contentCompact, narrow && styles.contentNarrow]}>
        <View style={[styles.header, compact && styles.headerCompact]}>
          <View style={styles.headerRow}>
            <Text style={styles.kicker}>PENSE BEM · STREET FIGHTER II</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Sair para o início" onPress={onExit} style={styles.exitButton}>
              <Text style={styles.exit}>Sair</Text>
            </TouchableOpacity>
          </View>
          <Text accessibilityRole="header" style={[styles.title, compact && styles.titleCompact]}>{modeTitle}</Text>
        </View>

        {noQuestions ? (
          <View style={[styles.panel, compact && styles.panelCompact]}>
            <Text style={styles.heading}>Perguntas indisponíveis</Text>
            <Button label="Voltar ao início" onPress={onExit} />
          </View>
        ) : phase === 'select' && isBasic ? (
          <View>
            <Text accessibilityRole="header" style={[styles.heading, compact && styles.headingCompact]}>Escolha um programa</Text>
            <Text style={styles.muted}>Pegue o livro e escolha um programa. São 30 perguntas, com até 3 tentativas por questão e 100 pontos possíveis.</Text>
            {(book.programs || []).map((item) => (
              <TouchableOpacity key={item.id} accessibilityRole="button"
                accessibilityLabel={`Iniciar programa ${item.id}`}
                onPress={() => chooseProgram(item)} activeOpacity={0.8} style={[styles.program, compact && styles.programCompact]}>
                <View style={styles.badge}><Text style={styles.badgeText}>{item.id}</Text></View>
                <View style={styles.programCopy}>
                  <Text style={styles.programName}>Programa {item.id}</Text>
                  <Text style={styles.mutedSmall}>{item.questions.length} perguntas do livro</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : phase === 'characterSelect' && isBasic ? (
          <View>
            <Text accessibilityRole="header" style={[styles.heading, compact && styles.headingCompact]}>Escolha seu lutador</Text>
            <Text style={styles.muted}>Programa {program?.id}. A cada resposta certa, seu lutador ataca o carro.</Text>
            <View style={styles.characterGrid}>
              {COMBAT_CHARACTERS.map((character) => (
                <TouchableOpacity key={character.id} accessibilityRole="button"
                  accessibilityLabel={`Jogar com ${character.name}`}
                  activeOpacity={0.8} onPress={() => chooseCharacter(character.id)}
                  style={[styles.characterCard, compact && styles.characterCardCompact]}>
                  <Image source={character.portrait} resizeMode="contain" style={[styles.characterPortrait, compact && styles.characterPortraitCompact]} />
                  <Text style={styles.characterName}>{character.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : phase === 'characterSelect' && isPvp ? (
          <View>
            <Text accessibilityRole="header" style={[styles.heading, compact && styles.headingCompact]}>Jogador {selectingPlayer + 1}, escolha seu lutador</Text>
            <Text style={styles.muted}>
              {selectingPlayer === 0
                ? 'O Jogador 1 fica à esquerda da arena.'
                : 'O Jogador 2 fica à direita. Escolha um personagem diferente do Jogador 1.'}
            </Text>
            <View style={styles.characterGrid}>
              {COMBAT_CHARACTERS.map((character) => {
                const unavailable = characters.includes(character.id);
                return (
                  <TouchableOpacity key={character.id} accessibilityRole="button"
                    accessibilityLabel={`${character.name}${unavailable ? ', já escolhido pelo Jogador 1' : ''}`}
                    accessibilityState={{ disabled: unavailable }}
                    disabled={unavailable} activeOpacity={0.8}
                    onPress={() => chooseCharacter(character.id)}
                    style={[styles.characterCard, compact && styles.characterCardCompact, unavailable && styles.characterUnavailable]}>
                    <Image source={character.portrait} resizeMode="contain" style={[styles.characterPortrait, compact && styles.characterPortraitCompact]} />
                    <Text style={styles.characterName}>{character.name}</Text>
                    {unavailable && <Text style={styles.characterTaken}>Escolhido por J1</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
            {selectingPlayer === 1 && (
              <Button label="Alterar escolha do Jogador 1" secondary onPress={() => {
                setCharacters([null, null]);
                setSelectingPlayer(0);
              }} />
            )}
          </View>
        ) : phase === 'ready' && isPvp ? (
          <View style={[styles.panel, compact && styles.panelCompact]}>
            <Text style={styles.tag}>TURNO {position + 1} DE {deck.length}</Text>
            <Text accessibilityRole="header" style={[styles.heading, compact && styles.headingCompact]}>Jogador {playerIndex + 1}, pronto?</Text>
            <Text style={styles.body}>Passe o celular e encontre esta questão no livro:</Text>
            <View style={[styles.basicBookCard, styles.readyBookCard]}>
              <View>
                <Text style={styles.basicBookEyebrow}>QUESTÃO DO LIVRO</Text>
                <Text style={styles.basicBookCaption}>Programa {current.programId}</Text>
              </View>
              <Text accessibilityLabel={`Programa ${current.programId}, questão ${current.number}`} style={styles.basicBookNumber}>
                {String(current.number).padStart(2, '0')}
              </Text>
            </View>
            <Text style={styles.body}>Quando estiver pronto, comece o turno e responda pelas teclas coloridas.</Text>
            <Button label="Começar turno" onPress={startPvpTurn} />
            <CombatStage characters={characters} event={null} />
            <HealthBars hp={hp} />
          </View>
        ) : phase === 'ended' ? (
          <View style={[styles.panel, compact && styles.panelCompact]}>
            <Text style={styles.star}>★</Text>
            <Text accessibilityRole="header" style={[styles.heading, compact && styles.headingCompact]}>{isPvp ? (winner === 0 ? 'Empate!' : `Jogador ${winner} venceu!`) : 'Jogo concluído!'}</Text>
            {isPvp ? (
              <>
                <Text style={styles.body}>{endReason}</Text>
                <CombatStage characters={characters} event={null} />
                <HealthBars hp={hp} />
              </>
            ) : (
              <>
                <Text style={styles.bigScore}>{finalScore}<Text style={styles.outOf}> / 100</Text></Text>
                <Text style={styles.body}>Programa {program?.id}{perfectRun ? ' · Bônus perfeito: +10 pontos!' : ''}</Text>
              </>
            )}
            <Button label={isBasic ? 'Jogar programa novamente' : 'Jogar novamente'}
              onPress={() => {
                if (isBasic) replayBasic();
                else if (isPvp) {
                  setDeck(shuffledQuestions(PVP_TURNS));
                  setPosition(0);
                  setHp([100, 100]);
                  setFeedback(null);
                  setLastTurn(false);
                  setEndReason('');
                  setPhase('ready');
                }
              }}
            />
            {isBasic && <Button label="Trocar lutador" secondary onPress={() => replayBasic('characterSelect')} />}
            {isBasic && <Button label="Trocar programa" secondary onPress={() => {
              setProgram(null);
              setDeck([]);
              setSelectedBasicCharacter(null);
              setPhase('select');
            }} />}
            {isPvp && <Button label="Trocar personagens" secondary onPress={() => {
              setCharacters([null, null]);
              setSelectingPlayer(0);
              setDeck(shuffledQuestions(PVP_TURNS));
              setPosition(0);
              setHp([100, 100]);
              setFeedback(null);
              setLastTurn(false);
              setEndReason('');
              setPhase('characterSelect');
            }} />}
            <Button label="Voltar ao início" secondary onPress={onExit} />
          </View>
        ) : null}
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#111827' },
  pinnedLayout: { flex: 1, width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 16, paddingBottom: 6 },
  pinnedNarrow: { paddingHorizontal: 12 },
  basicHeader: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  basicBrand: { color: '#F4C762', fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  basicBrandMode: { color: '#D8E1EF', fontWeight: '700' },
  basicHud: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  basicHudLabel: { color: '#D8E1EF', fontSize: 11, fontWeight: '800', letterSpacing: 0.35, flexShrink: 1 },
  basicScore: { color: '#F4C762', fontSize: 21, fontWeight: '900' },
  basicScoreLabel: { fontSize: 10, fontWeight: '800' },
  basicBookCard: { height: 108, marginTop: 10, marginBottom: 8, borderRadius: 17, backgroundColor: '#F4C762', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  readyBookCard: { marginBottom: 16 },
  basicBookCardShort: { height: 82, marginTop: 7, marginBottom: 5, paddingHorizontal: 15 },
  basicBookCardTiny: { height: 72, marginTop: 5, marginBottom: 4 },
  basicBookEyebrow: { color: '#54401B', fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  basicBookCaption: { color: '#182235', fontSize: 21, fontWeight: '900', marginTop: 5 },
  basicBookNumber: { color: '#182235', fontSize: 68, lineHeight: 78, fontWeight: '900' },
  basicBookNumberShort: { fontSize: 53, lineHeight: 60 },
  basicBookNumberTiny: { fontSize: 46, lineHeight: 52 },
  basicActionArea: { flex: 1, minHeight: 188, justifyContent: 'center' },
  basicActionAreaShort: { minHeight: 160 },
  basicActionAreaTiny: { minHeight: 150 },
  basicChoiceTitle: { color: '#D8E1EF', fontSize: 11, fontWeight: '800', letterSpacing: 0.65, marginBottom: 9, textAlign: 'center' },
  basicChoiceTitleShort: { marginBottom: 6 },
  basicAttempt: { color: '#D8E1EF', fontSize: 13, lineHeight: 19, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  basicAttemptShort: { fontSize: 12, lineHeight: 16, marginTop: 5 },
  basicArena: { flexShrink: 0, paddingBottom: 5 },
  content: { flexGrow: 1, width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 36 },
  contentCompact: { paddingHorizontal: 16, paddingBottom: 22 },
  contentNarrow: { paddingHorizontal: 12 },
  header: { paddingTop: 25, paddingBottom: 25 },
  headerCompact: { paddingTop: 12, paddingBottom: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: { color: '#F4C762', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, flex: 1 },
  exitButton: { minWidth: 44, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' },
  exit: { color: '#D8E1EF', fontSize: 14, padding: 6 },
  title: { color: '#FFFFFF', fontSize: 29, fontWeight: '900', marginTop: 8 },
  titleCompact: { fontSize: 25, marginTop: 2 },
  heading: { color: '#FFFFFF', fontSize: 23, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
  headingCompact: { fontSize: 21, marginBottom: 8 },
  body: { color: '#C5D0E0', fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 16 },
  muted: { color: '#B7C2D4', fontSize: 14, lineHeight: 21, marginBottom: 20 },
  mutedSmall: { color: '#B7C2D4', fontSize: 12, marginTop: 4 },
  panel: { backgroundColor: '#202B3D', borderColor: '#34425A', borderWidth: 1, borderRadius: 18, padding: 22, marginTop: 15 },
  panelCompact: { padding: 15, marginTop: 4 },
  program: { backgroundColor: '#202B3D', borderColor: '#34425A', borderWidth: 1, borderRadius: 15, minHeight: 76, flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 12 },
  programCompact: { minHeight: 66, padding: 10, marginBottom: 9 },
  badge: { width: 45, height: 45, backgroundColor: '#F4C762', borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#162033', fontSize: 21, fontWeight: '900' },
  programCopy: { flex: 1, paddingHorizontal: 13 },
  programName: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  characterGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  characterCard: { width: '48%', backgroundColor: '#202B3D', borderColor: '#34425A', borderWidth: 1, borderRadius: 15, minHeight: 170, alignItems: 'center', justifyContent: 'center', padding: 12, marginBottom: 12 },
  characterCardCompact: { minHeight: 132, padding: 8, marginBottom: 9 },
  characterUnavailable: { opacity: 0.4 },
  characterPortrait: { width: '100%', height: 112 },
  characterPortraitCompact: { height: 82 },
  characterName: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginTop: 8 },
  characterTaken: { color: '#F4C762', fontSize: 11, fontWeight: '700', marginTop: 3 },
  arrow: { color: '#F4C762', fontSize: 28 },
  tag: { color: '#F4C762', fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  hpRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 15, padding: 12, borderRadius: 11, backgroundColor: '#2C3A50' },
  hpRowCompact: { marginVertical: 3, padding: 6 },
  hpColumn: { width: '48%' },
  hpText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginBottom: 7 },
  hpTextCompact: { fontSize: 12, marginBottom: 3 },
  hpTrack: { height: 9, borderRadius: 9, backgroundColor: '#111827', overflow: 'hidden' },
  hpTrackCompact: { height: 7 },
  hpFill: { height: 9, borderRadius: 9 },
  hpFillCompact: { height: 7 },
  track: { height: 7, borderRadius: 10, backgroundColor: '#364257', overflow: 'hidden' },
  fill: { height: 7, backgroundColor: '#F4C762' },
  colorGrid: { width: '100%', maxWidth: 420, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 9 },
  colorKey: { width: '48%', minHeight: 70, borderRadius: 14, borderWidth: 3, borderColor: '#FFFFFF88', alignItems: 'center', justifyContent: 'center' },
  colorKeyShort: { minHeight: 52 },
  colorKeyTiny: { minHeight: 48 },
  colorKeyRejected: { opacity: 0.35 },
  colorKeyCross: { color: '#FFFFFF', fontSize: 29, fontWeight: '900' },
  feedbackBox: { paddingTop: 8 },
  feedbackTitle: { color: '#80D8A9', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  feedbackError: { color: '#FFB0A7' },
  feedbackDetail: { color: '#D8E1EF', fontSize: 14, textAlign: 'center' },
  button: { backgroundColor: '#F4C762', borderRadius: 12, minHeight: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 12 },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { color: '#162033', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  buttonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#66758F' },
  buttonSecondaryText: { color: '#E8EEF8' },
  star: { color: '#F4C762', fontSize: 48, textAlign: 'center', marginBottom: 6 },
  bigScore: { color: '#F4C762', fontSize: 58, fontWeight: '900', textAlign: 'center', marginVertical: 18 },
  outOf: { color: '#B7C2D4', fontSize: 25, fontWeight: '600' },
});
