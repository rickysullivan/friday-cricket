import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { COLORS, SIZES } from '../src/utils/constants';
import Button from '../src/components/ui/Button';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.message}>This screen doesn't exist.</Text>
      <Link href="/" asChild>
        <Button title="Go to Home" onPress={() => {}} />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.SPACING_LG,
    backgroundColor: COLORS.BACKGROUND,
  },
  title: {
    fontSize: SIZES.FONT_XLARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SIZES.SPACING_MD,
  },
  message: {
    fontSize: SIZES.FONT_MEDIUM,
    color: COLORS.TEXT,
    marginBottom: SIZES.SPACING_LG,
    textAlign: 'center',
  },
});
