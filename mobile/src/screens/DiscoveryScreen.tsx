import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows } from '../theme';
import { useDiscoveryStore } from '../stores/discoveryStore';
import { getIntentLabel, getIntentColors, formatDistance } from '../utils/helpers';
import { apiErrorToString } from '../utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

function SwipeCard({ profile, onSwipe, isTop }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = pan.x.interpolate({
    inputRange: [-150, 0, 150],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const nopeOpacity = pan.x.interpolate({
    inputRange: [-80, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        pan.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          Animated.spring(pan, {
            toValue: { x: SCREEN_WIDTH + 100, y: 0 },
            useNativeDriver: true,
          }).start(() => onSwipe('like'));
        } else if (gesture.dx < -120) {
          Animated.spring(pan, {
            toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
            useNativeDriver: true,
          }).start(() => onSwipe('pass'));
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const avatar = profile.photos?.[0]?.photo_url;
  const intentColors = getIntentColors(profile.intent);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            ...pan.getTranslateTransform(),
            { rotate },
          ],
        },
        !isTop && { transform: [{ scale: 0.95 }] },
      ]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      {/* Image */}
      <View style={styles.cardImage}>
        {avatar ? (
          <Image
            source={{ uri: avatar.startsWith('http') ? avatar : `http://10.0.2.2:8000${avatar}` }}
            style={styles.cardImageContent}
          />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.cardPlaceholderText}>
              {profile.name?.[0] || '?'}
            </Text>
          </View>
        )}

        {/* Like / Nope stamps */}
        <Animated.View style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}>
          <Text style={styles.stampText}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampNope, { opacity: nopeOpacity }]}>
          <Text style={styles.stampText}>NOPE</Text>
        </Animated.View>

        {/* Gradient overlay */}
        <View style={styles.cardGradient} />
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <View style={styles.cardNameRow}>
          <Text style={styles.cardName}>{profile.name}</Text>
          <Text style={styles.cardAge}>{profile.age}</Text>
          {profile.photo_verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardCity}>
          {profile.city} {profile.distance_km != null && `· ${formatDistance(profile.distance_km)}`}
        </Text>
        {profile.bio && <Text style={styles.cardBio} numberOfLines={2}>{profile.bio}</Text>}
        <View style={styles.cardIntentRow}>
          <View style={[styles.intentBadge, { backgroundColor: intentColors.bg }]}>
            <Text style={[styles.intentText, { color: intentColors.fg }]}>
              {getIntentLabel(profile.intent)}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function DiscoveryScreen() {
  const insets = useSafeAreaInsets();
  const {
    profiles,
    currentIndex,
    isLoading,
    likesRemaining,
    superLikesRemaining,
    error,
    fetchProfiles,
    swipe,
    loadMore,
    setCurrentIndex,
  } = useDiscoveryStore();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSwipe = useCallback(
    async (direction: any) => {
      const profile = profiles[currentIndex];
      if (!profile) return;

      if (direction === 'like' && likesRemaining <= 0) {
        Alert.alert('Out of Likes', 'Upgrade to Premium for unlimited likes');
        return;
      }
      if (direction === 'super_like' && superLikesRemaining <= 0) {
        Alert.alert('Out of Super Likes', 'Upgrade to Premium for more');
        return;
      }

      const result = await swipe(profile.id, direction);
      setCurrentIndex(currentIndex + 1);

      if (result?.matched) {
        Alert.alert("It's a Match!", `You matched with ${profile.name}`, [
          { text: 'Keep Swiping', style: 'cancel' },
          { text: 'Chat Now', onPress: () => {} },
        ]);
      }

      if (currentIndex + 1 >= profiles.length - 2) {
        loadMore();
      }
    },
    [profiles, currentIndex, likesRemaining, superLikesRemaining, swipe, setCurrentIndex, loadMore]
  );

  if (isLoading && profiles.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.brown700} />
      </View>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLogo}>Brownies</Text>
        <View style={styles.headerRight}>
          <View style={styles.likesBadge}>
            <Text style={styles.likesText}>{likesRemaining}</Text>
          </View>
        </View>
      </View>

      {/* Cards */}
      <View style={styles.cardContainer}>
        {currentProfile ? (
          profiles.slice(currentIndex, currentIndex + 2).reverse().map((profile, i) => (
            <SwipeCard
              key={profile.id}
              profile={profile}
              isTop={i === (profiles.slice(currentIndex, currentIndex + 2).length - 1)}
              onSwipe={handleSwipe}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No more profiles</Text>
            <Text style={styles.emptySub}>Check back later or expand your preferences</Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={fetchProfiles}>
              <Text style={styles.refreshBtnText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Action buttons */}
      {currentProfile && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionNope]}
            onPress={() => handleSwipe('pass')}
          >
            <Text style={styles.actionIcon}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionSuper]}
            onPress={() => handleSwipe('super_like')}
          >
            <Text style={styles.actionIcon}>⭐</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionLike]}
            onPress={() => handleSwipe('like')}
          >
            <Text style={styles.actionIcon}>♥</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brown50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.brown200,
    backgroundColor: colors.white,
  },
  headerLogo: { fontSize: 22, fontWeight: '800', color: colors.brown800 },
  headerRight: { flexDirection: 'row', gap: 12 },
  likesBadge: {
    backgroundColor: colors.brown100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  likesText: { fontSize: 13, fontWeight: '600', color: colors.brown700 },

  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radii.card,
    backgroundColor: colors.white,
    ...shadows.cardLg,
    overflow: 'hidden',
  },
  cardImage: { flex: 1 },
  cardImageContent: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardImagePlaceholder: {
    flex: 1,
    backgroundColor: colors.brown200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPlaceholderText: { fontSize: 64, fontWeight: '700', color: colors.brown400 },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(45,24,16,0.3)',
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  cardName: { fontSize: 22, fontWeight: '700', color: colors.white },
  cardAge: { fontSize: 18, fontWeight: '400', color: colors.white },
  verifiedBadge: {
    backgroundColor: colors.gold,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: { fontSize: 10, fontWeight: '700', color: colors.white },
  cardCity: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  cardBio: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 6 },
  cardIntentRow: { flexDirection: 'row', marginTop: 8 },
  intentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  intentText: { fontSize: 11, fontWeight: '600' },

  stamp: {
    position: 'absolute',
    top: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 4,
    transform: [{ rotate: '-20deg' }],
  },
  stampLike: {
    right: 20,
    borderColor: colors.success,
    backgroundColor: 'rgba(34,197,94,0.2)',
  },
  stampNope: {
    left: 20,
    borderColor: colors.error,
    backgroundColor: 'rgba(239,68,68,0.2)',
  },
  stampText: { fontSize: 28, fontWeight: '800', color: colors.white, letterSpacing: 4 },

  emptyState: { alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  refreshBtn: {
    backgroundColor: colors.brown700,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: radii.full,
    ...shadows.button,
  },
  refreshBtnText: { color: colors.white, fontWeight: '600' },

  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.brown200,
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  actionNope: {
    borderWidth: 2,
    borderColor: '#fee2e2',
    ...shadows.nopeBtn,
  },
  actionSuper: {
    borderWidth: 2,
    borderColor: '#fef3c7',
    ...shadows.superBtn,
  },
  actionLike: {
    borderWidth: 2,
    borderColor: '#dcfce7',
    ...shadows.likeBtn,
  },
  actionIcon: { fontSize: 24 },
});
