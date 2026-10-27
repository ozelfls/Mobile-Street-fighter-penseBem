import { useCallback, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';

const CORRECT_SOUND = require('./assets/sounds/correct.wav');
const WRONG_SOUND = require('./assets/sounds/wrong.wav');

export function useAnswerSounds() {
  const correctPlayer = useAudioPlayer(CORRECT_SOUND);
  const wrongPlayer = useAudioPlayer(WRONG_SOUND);

  useEffect(() => {
    correctPlayer.volume = 0.35;
    wrongPlayer.volume = 0.35;
  }, [correctPlayer, wrongPlayer]);

  const playCorrect = useCallback(() => {
    correctPlayer.seekTo(0).catch(() => {});
    correctPlayer.play();
  }, [correctPlayer]);

  const playWrong = useCallback(() => {
    wrongPlayer.seekTo(0).catch(() => {});
    wrongPlayer.play();
  }, [wrongPlayer]);

  return { playCorrect, playWrong };
}
