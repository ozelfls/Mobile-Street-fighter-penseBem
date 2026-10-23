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
};

export default function CombatStage({ event }) {
  const [poses, setPoses] = useState(['idle', 'idle']);
  const eventId = event?.id;

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
    <View style={styles.arena} accessible accessibilityLabel="Arena de combate: Ryu à esquerda e Ken à direita">
      <Text style={styles.arenaLabel}>ARENA</Text>
      <View style={styles.fighters}>
        <View style={styles.fighter}>
          <View style={styles.spriteFrame}>
            <Image
              key={`ryu-${poses[0]}-${eventId ?? 'idle'}`}
              source={SPRITES.ryu[poses[0]]}
              resizeMode="contain"
              style={poses[0] === 'attack' ? styles.ryuAttack : styles.sprite}
              accessibilityLabel={`Ryu ${poses[0] === 'attack' ? 'atacando' : poses[0] === 'hurt' ? 'apanhando' : 'em guarda'}`}
            />
          </View>
          <Text style={styles.name}>RYU · J1</Text>
        </View>
        <View style={styles.fighter}>
          <View style={styles.spriteFrame}>
            <Image
              key={`ken-${poses[1]}-${eventId ?? 'idle'}`}
              source={SPRITES.ken[poses[1]]}
              resizeMode="contain"
              style={[poses[1] === 'attack' ? styles.kenAttack : styles.sprite, styles.kenFacing]}
              accessibilityLabel={`Ken ${poses[1] === 'attack' ? 'atacando' : poses[1] === 'hurt' ? 'apanhando' : 'em guarda'}`}
            />
          </View>
          <Text style={styles.name}>KEN · J2</Text>
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
  spriteFrame: { width: '100%', height: 258, overflow: 'hidden' },
  sprite: { width: '100%', height: 145, position: 'absolute', bottom: 0 },
  ryuAttack: { width: 128, height: 258, position: 'absolute', bottom: 0, left: '50%', marginLeft: -64 },
  kenAttack: { width: 130, height: 214, position: 'absolute', bottom: 0, left: '50%', marginLeft: -65 },
  kenFacing: { transform: [{ scaleX: -1 }] },
  name: { color: '#F4C762', fontSize: 11, fontWeight: '900', marginBottom: 6 },
  floor: { height: 8, backgroundColor: '#34425A' },
});
