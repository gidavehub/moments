import { Asset } from 'expo-asset';
import { StyleSheet, View, type ViewStyle } from 'react-native';

const uri = Asset.fromModule(require('@/assets/textures/grain.png')).uri;

/** Web: react-native-web ignores resizeMode="repeat", so tile with a CSS background. */
export function GrainFill() {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundImage: `url(${uri})`, backgroundRepeat: 'repeat', backgroundSize: '128px 128px' } as unknown as ViewStyle,
      ]}
    />
  );
}
