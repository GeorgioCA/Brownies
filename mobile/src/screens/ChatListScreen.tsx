import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows } from '../theme';
import { useMatchStore } from '../stores/matchStore';
import { timeAgo } from '../utils/helpers';

export default function ChatListScreen(navigation: any): any {
  const insets = useSafeAreaInsets();
  const { matches, isLoading, fetchMatches } = useMatchStore();

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleMatchPress = useCallback(
    (match) => {
      navigation.navigate('ChatDetail', {
        matchId: match.id,
        userId: match.user.id,
        userName: match.user.name,
      });
    },
    [navigation]
  );

  const renderMatch = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => handleMatchPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.user.name?.[0] || '?'}
          </Text>
          {item.user.photo_verified && (
            <View style={styles.verifiedDot}>
              <Text style={styles.verifiedDotText}>✓</Text>
            </View>
          )}
        </View>
        <View style={styles.matchInfo}>
          <View style={styles.matchNameRow}>
            <Text style={styles.matchName}>{item.user.name}</Text>
            <Text style={styles.matchAge}>{item.user.age}</Text>
          </View>
          <Text style={styles.matchCity}>{item.user.city}</Text>
          <Text style={styles.matchTime}>{timeAgo(item.matched_at)}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    ),
    [handleMatchPress]
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.brown700} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
      </View>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMatch}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptySub}>
              Keep swiping to find your match!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brown50 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.brown200,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
  list: { padding: 16, gap: 10 },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.card,
    padding: 14,
    ...shadows.card,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brown200,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.brown600 },
  verifiedDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  verifiedDotText: { fontSize: 8, fontWeight: '700', color: colors.white },
  matchInfo: { flex: 1 },
  matchNameRow: { flexDirection: 'row', gap: 6, alignItems: 'baseline' },
  matchName: { fontSize: 16, fontWeight: '700', color: colors.text },
  matchAge: { fontSize: 14, color: colors.textMuted },
  matchCity: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  matchTime: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  chevron: { fontSize: 24, color: colors.brown300, marginLeft: 8 },
  empty: { paddingTop: 80, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 14, color: colors.textMuted, marginTop: 8 },
});
