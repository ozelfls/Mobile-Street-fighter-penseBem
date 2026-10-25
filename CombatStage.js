import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const SPRITES = {
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
};

export const COMBAT_CHARACTERS = [
  { id: 'ryu', name: 'Ryu', portrait: SPRITES.ryu.idle },
  { id: 'ken', name: 'Ken', portrait: SPRITES.ken.idle },
  { id: 'chunli', name: 'Chun-Li', portrait: SPRITES.chunli.idle },
  { id: 'blanka', name: 'Blanka', portrait: SPRITES.blanka.idle },
];

const CHARACTER_NAMES = Object.fromEntries(COMBAT_CHARACTERS.map(({ id, name }) => [id, name]));

export default function CombatStage({ characters = ['ryu', 'ken'], event }) {
  const [poses, setPoses] = useState(['idle', 'idle']);
  const eventId = event?.id;
  const left = SPRITES[characters[0]] ? characters[0] : 'ryu';
  const right = SPRITES[characters[1]] ? characters[1] : 'ken';
  const leftWideAttack = left === 'chunli' || left === 'blanka';
  const rightWideAttack = right === 'chunli' || right === 'blanka';

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
    <View style={styles.arena} accessible accessibilityLabel={`Arena de combate: ${CHARACTER_NAMES[left]} à esquerda e ${CHARACTER_NAMES[right]} à direita`}>
      <Text style={styles.arenaLabel}>ARENA</Text>
      <View style={styles.fighters}>
        <View style={styles.fighter}>
          <View style={styles.spriteFrame}>
            <Image
              key={`${left}-${poses[0]}-${eventId ?? 'idle'}`}
              source={SPRITES[left][poses[0]]}
              resizeMode="contain"
              style={[
                poses[0] === 'attack' ? styles[`${left}Attack`] || styles.defaultAttack : styles.sprite,
                poses[0] === 'attack' && leftWideAttack && styles.wideAttackLeft,
              ]}
              accessibilityLabel={`${CHARACTER_NAMES[left]} ${poses[0] === 'attack' ? 'atacando' : poses[0] === 'hurt' ? 'apanhando' : 'em guarda'}`}
            />
          </View>
          <Text style={styles.name}>{CHARACTER_NAMES[left].toUpperCase()} · J1</Text>
        </View>
        <View style={styles.fighter}>
          <View style={styles.spriteFrame}>
            <Image
              key={`${right}-${poses[1]}-${eventId ?? 'idle'}`}
              source={SPRITES[right][poses[1]]}
              resizeMode="contain"
              style={[
                poses[1] === 'attack' ? styles[`${right}Attack`] || styles.defaultAttack : styles.sprite,
                poses[1] === 'attack' && rightWideAttack && styles.wideAttackRight,
                styles.faceLeft,
              ]}
              accessibilityLabel={`${CHARACTER_NAMES[right]} ${poses[1] === 'attack' ? 'atacando' : poses[1] === 'hurt' ? 'apanhando' : 'em guarda'}`}
            />
          </View>
          <Text style={styles.name}>{CHARACTER_NAMES[right].toUpperCase()} · J2</Text>
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
    overflow: 'visible',
    minHeight: 300,
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
  spriteFrame: { width: '100%', height: 258, overflow: 'visible' },
  sprite: { width: '100%', height: 145, position: 'absolute', bottom: 0 },
  ryuAttack: { width: 128, height: 258, position: 'absolute', bottom: 0, left: '50%', marginLeft: -64 },
  kenAttack: { width: 130, height: 214, position: 'absolute', bottom: 0, left: '50%', marginLeft: -65 },
  chunliAttack: { width: 220, height: 133, position: 'absolute', bottom: 0, left: '50%', marginLeft: -110 },
  blankaAttack: { width: 220, height: 140, position: 'absolute', bottom: 0, left: '50%', marginLeft: -110 },
  wideAttackLeft: { marginLeft: -80 },
  wideAttackRight: { marginLeft: -140 },
  defaultAttack: { width: 145, height: 230, position: 'absolute', bottom: 0, left: '50%', marginLeft: -72 },
  faceLeft: { transform: [{ scaleX: -1 }] },
  name: { color: '#F4C762', fontSize: 11, fontWeight: '900', marginBottom: 6 },
  floor: { height: 8, backgroundColor: '#34425A' },
});
