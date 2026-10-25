import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { COMBAT_CHARACTERS, SPRITES } from './CombatStage';

const CAR_SHEET = require('./assets/combat/bonus-car-sprites.png');
const HARBOR_STAGE = require('./assets/combat/car-bonus-harbor.gif');
const BONUS_ATTACKS = {
  ryu: require('./assets/combat/ryu-car-attack.gif'),
  ken: require('./assets/combat/ken-car-attack.gif'),
  chunli: require('./assets/combat/chunli-car-attack.gif'),
  blanka: require('./assets/combat/blanka-car-attack.gif'),
};
const CAR_FRAMES = [
  { x: 0, y: 90 },
  { x: 0, y: 190 },
  { x: 190, y: 190 },
  { x: 0, y: 283 },
  { x: 380, y: 283 },
];
const ATTACK_SIZE = {
  ryu: { width: 145, height: 118, left: 19 },
  ken: { width: 155, height: 136, left: 18 },
  chunli: { width: 175, height: 142, left: 10 },
  blanka: { width: 175, height: 124, left: 10 },
};
const IMPACT_DELAY = { ryu: 160, ken: 700, chunli: 120, blanka: 130 };

export default function BonusCarStage({ character = 'ryu', event, score = 0 }) {
  const [width, setWidth] = useState(340);
  const [attacking, setAttacking] = useState(false);
  const [impactVisible, setImpactVisible] = useState(false);
  const [displayHits, setDisplayHits] = useState(score);
  const shake = useRef(new Animated.Value(0)).current;
  const { height } = useWindowDimensions();
  const scale = Math.max(0.62, Math.min(1.05, width / 340, height / 780));
  const fighter = SPRITES[character] ? character : 'ryu';
  const fighterName = COMBAT_CHARACTERS.find(({ id }) => id === fighter)?.name || 'Ryu';
  const eventId = event?.id;
  const frame = CAR_FRAMES[displayHits >= 40 ? 4 : displayHits >= 25 ? 3 : displayHits >= 10 ? 2 : displayHits >= 1 ? 1 : 0];

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
      style={[styles.arena, { height: 210 * scale }]}
      onLayout={({ nativeEvent }) => {
        const nextWidth = nativeEvent.layout.width;
        if (Math.abs(nextWidth - width) > 1) setWidth(nextWidth);
      }}
      accessible
      accessibilityLabel={`${fighterName} ${attacking ? 'atacando' : 'ao lado'} do carro bônus. ${score} acertos.`}
    >
      <Image source={HARBOR_STAGE} resizeMode="cover" style={styles.stageBackground} />
      <Text style={styles.label}>CARRO BÔNUS</Text>
      <Animated.View
        style={[
          styles.carWindow,
          {
            width: 190 * scale,
            height: 94 * scale,
            right: 0,
            bottom: 21 * scale,
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
      {impactVisible && <View style={[styles.impact, { left: width - 190 * scale, bottom: 82 * scale }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  arena: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#78B9EC',
    borderColor: '#486782',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
  },
  stageBackground: { position: 'absolute', width: '100%', height: '100%' },
  label: { alignSelf: 'flex-start', color: '#FFFFFF', backgroundColor: '#152B43CC', borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3, overflow: 'hidden', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginTop: 7, marginLeft: 8 },
  carWindow: { position: 'absolute', overflow: 'hidden' },
  fighter: { position: 'absolute' },
  impact: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#F4C762BB' },
});
