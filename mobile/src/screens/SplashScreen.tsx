import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../theme';

export default function SplashScreen() {
  const { restoreSession, isLoading } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background image */}
      <View style={styles.bgContainer}>
        <Image
          source={require('../../assets/splash-placeholder.png')}
          style={styles.bgImage}
          resizeMode="cover"
        />
      </View>

      {/* Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.logo}>Brownies</Text>
        <Text style={styles.tagline}>Dating, Desi Style.</Text>

        {isLoading && (
          <ActivityIndicator
            size="large"
            color={colors.gold}
            style={styles.loader}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brown900,
  },
  bgContainer: {
    ...StyleSheet.absoluteFill,
    opacity: 0.6,
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 18,
    color: colors.goldLight,
    marginTop: 8,
    fontWeight: '500',
  },
  loader: {
    marginTop: 40,
  },
});
