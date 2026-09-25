import { Image, StyleSheet } from 'react-native';

const grainSrc = require('@/assets/textures/grain.png');

/** Native: RN Image tiles with resizeMode="repeat". */
export function GrainFill() {
  return <Image source={grainSrc} resizeMode="repeat" style={StyleSheet.absoluteFill} />;
}
