import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { COMBAT_CHARACTERS, SPRITES } from './CombatStage';

const CAR_SHEET = require('./assets/combat/bonus-car-sprites.png');
const DOCK_STAGE = require('./assets/combat/car-bonus-dock.png');
const BONUS_ATTACKS = {
  ryu: require('./assets/combat/ryu-car-attack.gif'),
  ken: require('./assets/combat/ken-car-attack.gif'),
  chunli: require('./assets/combat/chunli-car-attack.gif'),
  blanka: require('./assets/combat/blanka-car-attack.gif'),
};
const CAR_FRAME_HEIGHT = 94;
const CAR_GROUND_INSET = 16;
// O último pixel visível varia entre os quadros; alinhe todos à mesma linha do cais.
const CAR_FRAMES = [
  { x: 0, y: 90, visibleBottom: 88 },
  { x: 0, y: 190, visibleBottom: 94 },
  { x: 190, y: 190, visibleBottom: 77 },
  { x: 380, y: 190, visibleBottom: 77 },
  { x: 0, y: 283, visibleBottom: 94 },
  { x: 190, y: 283, visibleBottom: 75 },
  { x: 380, y: 283, visibleBottom: 94 },
  { x: 0, y: 376, visibleBottom: 93 },
  { x: 190, y: 376, visibleBottom: 94 },
];
const CAR_HIT_THRESHOLDS = {
  45: [0, 1, 3, 6, 10, 16, 24, 34, 45],
  30: [0, 1, 2, 4, 7, 11, 16, 22, 30],
  15: [0, 1, 2, 3, 5, 7, 10, 12, 15],
};
const ATTACK_SIZE = {
  ryu: { width: 180, height: 146, left: 10 },
  ken: { width: 215, height: 189, left: 13 },
  chunli: { width: 225, height: 161, left: 0 },
  blanka: { width: 227, height: 160, left: -5 },
};
const IMPACT_DELAY = { ryu: 160, ken: 700, chunli: 120, blanka: 130 };

export default function BonusCarStage({ character = 'ryu', event, score = 0, targetHits = 45, compactViewport = false }) {
  const [attacking, setAttacking] = useState(false);
  const [impactVisible, setImpactVisible] = useState(false);
  const [displayHits, setDisplayHits] = useState(score);
  const shake = useRef(new Animated.Value(0)).current;
  const { height, width } = useWindowDimensions();
  const scale = compactViewport
    ? Math.min((width - 24) / 340, Math.max(0.52, Math.min(0.72, height / 1000)))
    : Math.min(1.05, (width - 40) / 340, height / 780);
  const fighter = SPRITES[character] ? character : 'ryu';
  const fighterName = COMBAT_CHARACTERS.find(({ id }) => id === fighter)?.name || 'Ryu';
  const eventId = event?.id;
  const thresholds = CAR_HIT_THRESHOLDS[targetHits] || CAR_HIT_THRESHOLDS[45];
  const frameIndex = thresholds.reduce((index, threshold, current) =>
    displayHits >= threshold ? current : index, 0);
  const frame = CAR_FRAMES[frameIndex];
  const carBottom = (CAR_GROUND_INSET - (CAR_FRAME_HEIGHT - frame.visibleBottom)) * scale;

  useEffect(() => {
    if (score === displayHits) return undefined;
    const change = setTimeout(() => setDisplayHits(score), score > displayHits ? IMPACT_DELAY[fighter] : 0);
    return () => clearTimeout(change);
  }, [score, displayHits, fighter]);

  useEffect(() => {
    if (eventId == null) {
      setAttacking(false);
      setImpactVisible(false);
      shake.setValue(0);
      return undefined;
    }

    setAttacking(true);
    setImpactVisible(false);
    shake.setValue(0);
    const impact = setTimeout(() => {
      setImpactVisible(true);
      Animated.sequence([
        Animated.timing(shake, { toValue: 7 * scale, duration: 65, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -5 * scale, duration: 65, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 4 * scale, duration: 65, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 65, useNativeDriver: true }),
      ]).start();
    }, IMPACT_DELAY[fighter]);
    const hideImpact = setTimeout(() => setImpactVisible(false), IMPACT_DELAY[fighter] + 180);
    const reset = setTimeout(() => setAttacking(false), 1500);
    return () => {
      clearTimeout(impact);
      clearTimeout(hideImpact);
      clearTimeout(reset);
      shake.stopAnimation();
    };
  }, [eventId, fighter]);

  const attack = ATTACK_SIZE[fighter];
  const fighterStyle = attacking
    ? { width: attack.width * scale, height: attack.height * scale, left: attack.left * scale }
    : { width: 130 * scale, height: 145 * scale, left: 0 };

  return (
    <View
      style={[styles.arena, { width: 340 * scale, height: 210 * scale, marginTop: compactViewport ? 0 : 12 }]}
      accessible
      accessibilityLabel={`${fighterName} ${attacking ? 'atacando' : 'ao lado'} do carro bônus. ${score} acertos.`}
    >
      <Image source={DOCK_STAGE} resizeMode="cover"
        style={[styles.stageBackground, { width: 340 * scale, height: 210 * scale }]} />
      <View style={[styles.carShadow, { width: 182 * scale, height: 10 * scale, right: 5 * scale, bottom: 10 * scale, borderRadius: 10 * scale }]} />
      <Animated.View
        style={[
          styles.carWindow,
          {
            width: 190 * scale,
            height: CAR_FRAME_HEIGHT * scale,
            right: 0,
            bottom: carBottom,
            transform: [{ translateX: shake }],
          },
        ]}
      >
        <Image
          source={CAR_SHEET}
          resizeMode="stretch"
          style={{ position: 'absolute', width: 571 * scale, height: 579 * scale, left: -frame.x * scale, top: -frame.y * scale }}
        />
      </Animated.View>
      <Image
        key={`${fighter}-${attacking ? 'attack' : 'idle'}-${eventId ?? 'ready'}`}
        source={attacking ? BONUS_ATTACKS[fighter] : SPRITES[fighter].idle}
        resizeMode="contain"
        style={[styles.fighter, fighterStyle, { bottom: 21 * scale }]}
      />
      {impactVisible && <View style={[styles.impact, { left: 150 * scale, bottom: 82 * scale }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  arena: {
    alignSelf: 'center',
    backgroundColor: '#78B9EC',
    borderColor: '#486782',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
  },
  stageBackground: { position: 'absolute', top: 0, left: 0 },
  carShadow: { position: 'absolute', backgroundColor: 'rgba(34, 22, 18, 0.55)' },
  carWindow: { position: 'absolute', overflow: 'hidden' },
  fighter: { position: 'absolute' },
  impact: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#F4C762BB' },
});
