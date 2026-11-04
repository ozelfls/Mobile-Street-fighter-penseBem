import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

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
const ATTACK_HEIGHT = { ryu: 192, ken: 192, chunli: 190, blanka: 185, guile: 180, dhalsim: 180 };
const HURT_SIZE = { ryu: { width: 222, height: 175 }, ken: { width: 226, height: 175 } };
// Encerre cada golpe antes de o GIF repetir ou entrar na pausa final.
const ATTACK_MS = { ryu: 760, ken: 680, chunli: 1450, blanka: 650, guile: 870, dhalsim: 520 };
// Ryu e Ken têm GIFs de dano longos; a transição suave evita cortar a reação bruscamente.
const HURT_MS = { ryu: 1600, ken: 1600, chunli: 1700, blanka: 790, guile: 890, dhalsim: 1190 };
const IMPACT_MS = { ryu: 180, ken: 350, chunli: 560, blanka: 60, guile: 340, dhalsim: 220 };
const RECOVERY_FADE_MS = 180;

export default function CombatStage({ characters = ['ryu', 'ken'], event, compactViewport = false, maxHeight, onImpact, onAnimationComplete }) {
  const [poses, setPoses] = useState(['idle', 'idle']);
  const [arenaWidth, setArenaWidth] = useState(360);
  const recovery = useRef(null);
  if (!recovery.current) recovery.current = [0, 1].map(() => ({
    hurt: new Animated.Value(1), idle: new Animated.Value(0),
  }));
  const { height: windowHeight } = useWindowDimensions();
  const eventId = event?.id;
  const left = SPRITES[characters[0]] ? characters[0] : 'ryu';
  const right = SPRITES[characters[1]] ? characters[1] : 'ken';
  const viewportScale = compactViewport
    ? Math.min(1, arenaWidth / 360)
    : Math.max(0.64, Math.min(1.08, arenaWidth / 360, windowHeight / 800));
  const scale = maxHeight ? Math.min(viewportScale, (maxHeight - 16) / (compactViewport ? 220 : 230)) : viewportScale;

  function imageStyle(character, pose, side) {
    if (pose === 'idle') {
      return { width: '100%', height: 175 * scale, position: 'absolute', bottom: 0 };
    }
    if (pose === 'hurt') {
      const size = HURT_SIZE[character];
      if (!size) return { width: '100%', height: 175 * scale, position: 'absolute', bottom: 0 };
      return { width: size.width * scale, height: size.height * scale, position: 'absolute', bottom: 0,
        left: '50%', marginLeft: -size.width * scale / 2 };
    }
    const size = ATTACK_SIZE[character];
    const attackScale = ATTACK_HEIGHT[character] * scale / size.height;
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

  function fighterImage(character, pose, side, index) {
    const face = side === 'right' && styles.faceLeft;
    const label = `${CHARACTER_NAMES[character]} ${pose === 'attack' ? 'atacando' : pose === 'hurt' ? 'apanhando' : 'em guarda'}`;
    const key = `${character}-${pose}-${eventId ?? 'idle'}`;
    if (pose === 'hurt' && (character === 'ryu' || character === 'ken')) {
      return (
        <>
          <Animated.Image source={SPRITES[character].idle} resizeMode="contain" accessible={false}
            style={[imageStyle(character, 'idle', side), face, { opacity: recovery.current[index].idle }]} />
          <Animated.Image key={key} source={SPRITES[character].hurt} resizeMode="contain" accessibilityLabel={label}
            style={[imageStyle(character, 'hurt', side), face, { opacity: recovery.current[index].hurt }]} />
        </>
      );
    }
    return <Image key={key} source={SPRITES[character][pose]} resizeMode="contain" accessibilityLabel={label}
      style={[imageStyle(character, pose, side), face]} />;
  }

  useEffect(() => {
    recovery.current.forEach(({ hurt, idle }) => {
      hurt.stopAnimation();
      idle.stopAnimation();
      hurt.setValue(1);
      idle.setValue(0);
    });
    if (eventId == null) {
      setPoses(['idle', 'idle']);
      return undefined;
    }

    const next = ['idle', 'idle'];
    if (event.attacker != null) next[event.attacker] = 'attack';
    setPoses(next);
    const timers = [];
    let duration = 0;
    let impactAt = 0;
    if (event.attacker != null) {
      const attacker = event.attacker;
      const character = attacker === 0 ? left : right;
      impactAt = IMPACT_MS[character];
      duration = Math.max(duration, ATTACK_MS[character]);
      timers.push(setTimeout(() => setPoses((current) => current.map((pose, index) => index === attacker ? 'idle' : pose)), ATTACK_MS[character]));
    }
    if (event.hurt != null) {
      const hurt = event.hurt;
      const character = hurt === 0 ? left : right;
      duration = Math.max(duration, impactAt + HURT_MS[character]);
      timers.push(setTimeout(() => {
        setPoses((current) => current.map((pose, index) => index === hurt ? 'hurt' : pose));
        onImpact?.();
      }, impactAt));
      if (character === 'ryu' || character === 'ken') {
        timers.push(setTimeout(() => Animated.parallel([
          Animated.timing(recovery.current[hurt].hurt, { toValue: 0, duration: RECOVERY_FADE_MS, useNativeDriver: true }),
          Animated.timing(recovery.current[hurt].idle, { toValue: 1, duration: RECOVERY_FADE_MS, useNativeDriver: true }),
        ]).start(), impactAt + HURT_MS[character] - RECOVERY_FADE_MS));
      }
      timers.push(setTimeout(() => setPoses((current) => current.map((pose, index) => index === hurt ? 'idle' : pose)), impactAt + HURT_MS[character]));
    } else if (onImpact) timers.push(setTimeout(onImpact, impactAt));
    if (onAnimationComplete) timers.push(setTimeout(onAnimationComplete, duration));
    return () => {
      timers.forEach(clearTimeout);
      recovery.current.forEach(({ hurt, idle }) => {
        hurt.stopAnimation();
        idle.stopAnimation();
      });
    };
  }, [eventId, event?.attacker, event?.hurt, left, right, onImpact, onAnimationComplete]);

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
          <View style={[styles.spriteFrame, { height: 190 * scale }]}>
            {fighterImage(left, poses[0], 'left', 0)}
          </View>
          <Text style={[styles.name, { fontSize: 11 * scale }]}>{CHARACTER_NAMES[left].toUpperCase()} · J1</Text>
        </View>
        <View style={styles.fighter}>
          <View style={[styles.spriteFrame, { height: 190 * scale }]}>
            {fighterImage(right, poses[1], 'right', 1)}
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
