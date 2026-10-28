import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

export const SPRITES = {
  ryu: {
    idle: require('./assets/combat/ryu-idle.gif'),
    attack: require('./assets/combat/ryu-attack.gif'),
    hurt: require('./assets/combat/ryu-hurt.gif'),
  },
  ken: {
    idle: require('./assets/combat/ken-idle.gif'),
    attack: require('./assets/combat/ken-attack.gif'),
    hurt: require('./assets/combat/ken-hurt.gif'),
  },
  chunli: {
    idle: require('./assets/combat/chunli-idle.gif'),
    attack: require('./assets/combat/chunli-attack.gif'),
    hurt: require('./assets/combat/chunli-hurt.gif'),
  },
  blanka: {
    idle: require('./assets/combat/blanka-idle.gif'),
    attack: require('./assets/combat/blanka-attack.gif'),
    hurt: require('./assets/combat/blanka-hurt.gif'),
  },
  guile: {
    idle: require('./assets/combat/guile-idle.gif'),
    attack: require('./assets/combat/guile-attack.gif'),
    hurt: require('./assets/combat/guile-hurt.gif'),
  },
  dhalsim: {
    idle: require('./assets/combat/dhalsim-idle.gif'),
    attack: require('./assets/combat/dhalsim-attack.gif'),
    hurt: require('./assets/combat/dhalsim-hurt.gif'),
  },
};

export const COMBAT_CHARACTERS = [
  { id: 'ryu', name: 'Ryu', portrait: SPRITES.ryu.idle },
  { id: 'ken', name: 'Ken', portrait: SPRITES.ken.idle },
  { id: 'chunli', name: 'Chun-Li', portrait: SPRITES.chunli.idle },
  { id: 'blanka', name: 'Blanka', portrait: SPRITES.blanka.idle },
  { id: 'guile', name: 'Guile', portrait: SPRITES.guile.idle },
  { id: 'dhalsim', name: 'Dhalsim', portrait: SPRITES.dhalsim.idle },
];

const CHARACTER_NAMES = Object.fromEntries(COMBAT_CHARACTERS.map(({ id, name }) => [id, name]));
const ATTACK_SIZE = {
  ryu: { width: 128, height: 258 },
  ken: { width: 130, height: 214 },
  chunli: { width: 315, height: 190 },
  blanka: { width: 220, height: 140 },
  guile: { width: 225, height: 145 },
  dhalsim: { width: 347, height: 145 },
};
const ATTACK_OFFSET = { chunli: 30, blanka: 30, guile: 56, dhalsim: 93 };

export default function CombatStage({ characters = ['ryu', 'ken'], event, compactViewport = false, maxHeight }) {
  const [poses, setPoses] = useState(['idle', 'idle']);
  const [arenaWidth, setArenaWidth] = useState(360);
  const { height: windowHeight } = useWindowDimensions();
  const eventId = event?.id;
  const left = SPRITES[characters[0]] ? characters[0] : 'ryu';
  const right = SPRITES[characters[1]] ? characters[1] : 'ken';
  const viewportScale = compactViewport
    ? Math.min(1, arenaWidth / 360)
    : Math.max(0.64, Math.min(1.08, arenaWidth / 360, windowHeight / 800));
  const scale = maxHeight ? Math.min(viewportScale, (maxHeight - 16) / (compactViewport ? 220 : 273)) : viewportScale;

  function imageStyle(character, pose, side) {
    if (pose !== 'attack') {
      return { width: '100%', height: (compactViewport ? 175 : 145) * scale, position: 'absolute', bottom: 0 };
    }
    const size = ATTACK_SIZE[character];
    const attackScale = compactViewport
      ? Math.min(175 * scale / size.height, arenaWidth * 0.88 / size.width)
      : scale;
    const wideOffset = (side === 'left' ? 1 : -1) * (ATTACK_OFFSET[character] || 0) * attackScale;
    return {
      width: size.width * attackScale,
      height: size.height * attackScale,
      position: 'absolute',
      bottom: 0,
      left: '50%',
      marginLeft: -size.width * attackScale / 2 + wideOffset,
    };
  }

  useEffect(() => {
    if (eventId == null) {
      setPoses(['idle', 'idle']);
      return undefined;
    }

    const next = ['idle', 'idle'];
    if (event.attacker != null) next[event.attacker] = 'attack';
    if (event.hurt != null) next[event.hurt] = 'hurt';
    setPoses(next);
    const reset = setTimeout(() => setPoses(['idle', 'idle']), 1400);
    return () => clearTimeout(reset);
  }, [eventId]);

  return (
    <View
      style={[styles.arena, { paddingTop: (compactViewport ? 4 : 10) * scale, marginTop: compactViewport ? 0 : 8 }]}
      onLayout={(layout) => {
        const nextWidth = layout.nativeEvent.layout.width;
        if (Math.abs(nextWidth - arenaWidth) > 1) setArenaWidth(nextWidth);
      }}
      accessible accessibilityLabel={`Arena de combate: ${CHARACTER_NAMES[left]} à esquerda e ${CHARACTER_NAMES[right]} à direita`}
    >
      {!compactViewport && <Text style={styles.arenaLabel}>ARENA</Text>}
      <View style={styles.fighters}>
        <View style={styles.fighter}>
          <View style={[styles.spriteFrame, { height: (compactViewport ? 190 : 258) * scale }]}>
            <Image
              key={`${left}-${poses[0]}-${eventId ?? 'idle'}`}
              source={SPRITES[left][poses[0]]}
              resizeMode="contain"
              style={imageStyle(left, poses[0], 'left')}
              accessibilityLabel={`${CHARACTER_NAMES[left]} ${poses[0] === 'attack' ? 'atacando' : poses[0] === 'hurt' ? 'apanhando' : 'em guarda'}`}
            />
          </View>
          <Text style={[styles.name, { fontSize: 11 * scale }]}>{CHARACTER_NAMES[left].toUpperCase()} · J1</Text>
        </View>
        <View style={styles.fighter}>
          <View style={[styles.spriteFrame, { height: (compactViewport ? 190 : 258) * scale }]}>
            <Image
              key={`${right}-${poses[1]}-${eventId ?? 'idle'}`}
              source={SPRITES[right][poses[1]]}
              resizeMode="contain"
              style={[imageStyle(right, poses[1], 'right'), styles.faceLeft]}
              accessibilityLabel={`${CHARACTER_NAMES[right]} ${poses[1] === 'attack' ? 'atacando' : poses[1] === 'hurt' ? 'apanhando' : 'em guarda'}`}
            />
          </View>
          <Text style={[styles.name, { fontSize: 11 * scale }]}>{CHARACTER_NAMES[right].toUpperCase()} · J2</Text>
        </View>
      </View>
      <View style={styles.floor} />
    </View>
  );
}

const styles = StyleSheet.create({
  arena: {
    backgroundColor: '#202B3D',
    borderColor: '#34425A',
    borderWidth: 1,
    borderRadius: 17,
    overflow: 'hidden',
    marginTop: 8,
    paddingTop: 10,
  },
  arenaLabel: {
    color: '#8394AC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  fighters: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  fighter: { width: '48%', alignItems: 'center' },
  spriteFrame: { width: '100%', overflow: 'visible' },
  faceLeft: { transform: [{ scaleX: -1 }] },
  name: { color: '#F4C762', fontSize: 11, fontWeight: '900', marginBottom: 6 },
  floor: { height: 8, backgroundColor: '#34425A' },
});
