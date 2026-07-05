import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const videoRef = useRef<Video>(null);
  const { restoreSession, isLoading } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <View style={styles.container}>
      {/* Video Background — replace asset when real intro video is available */}
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={require('../../assets/splash-placeholder.png') as any}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
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
  videoContainer: {
    ...StyleSheet.absoluteFill,
    opacity: 0.6,
  },
  video: {
    width,
    height,
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
