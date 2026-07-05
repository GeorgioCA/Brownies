import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows } from '../theme';
import { useProfileStore } from '../stores/profileStore';
import { useAuthStore } from '../stores/authStore';
import { calculateAge, getIntentLabel } from '../utils/helpers';

export default function ProfileScreen(navigation: any): any {
  const insets = useSafeAreaInsets();
  const { profile, isLoading, fetchProfile } = useProfileStore();
  const logout = useAuthStore((s) => s.logout);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'PhoneInput' }] });
        },
      },
    ]);
  }, [logout, navigation]);

  if (!profile) return null;

  const primaryPhoto = profile.photos?.find((p) => p.is_primary) || profile.photos?.[0];
  const age = calculateAge(profile.date_of_birth);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView>
        {/* Photo header */}
        <View style={styles.photoHeader}>
          {primaryPhoto ? (
            <Image
              source={{
                uri: primaryPhoto.photo_url.startsWith('http')
                  ? primaryPhoto.photo_url
                  : `http://10.0.2.2:8000${primaryPhoto.photo_url}`,
              }}
              style={styles.profilePhoto}
            />
          ) : (
            <View style={styles.profilePhotoPlaceholder}>
              <Text style={styles.placeholderText}>
                {profile.name?.[0] || '?'}
              </Text>
            </View>
          )}

          <View style={styles.photoOverlay}>
            <Text style={styles.profileName}>
              {profile.name}, {age}
            </Text>
            <Text style={styles.profileCity}>{profile.city}</Text>
          </View>
        </View>

        {/* Details card */}
        <View style={styles.detailsCard}>
          {profile.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.sectionBody}>{profile.bio}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basics</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Looking for</Text>
              <Text style={styles.detailValue}>{getIntentLabel(profile.intent)}</Text>
            </View>
            {profile.height_cm && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Height</Text>
                <Text style={styles.detailValue}>{profile.height_cm} cm</Text>
              </View>
            )}
            {profile.education && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Education</Text>
                <Text style={styles.detailValue}>{profile.education}</Text>
              </View>
            )}
            {profile.occupation && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Work</Text>
                <Text style={styles.detailValue}>{profile.occupation}</Text>
              </View>
            )}
          </View>

          {/* Verification status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verification</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={[styles.detailValue, { color: profile.phone_verified ? colors.success : colors.rose }]}>
                {profile.phone_verified ? 'Verified ✓' : 'Not verified'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Photo</Text>
              <Text style={[styles.detailValue, { color: profile.photo_verified ? colors.success : colors.rose }]}>
                {profile.photo_verified ? 'Verified ✓' : 'Not verified'}
              </Text>
            </View>
          </View>

          {/* Premium status */}
          {profile.is_premium && (
            <View style={[styles.premiumBanner]}>
              <Text style={styles.premiumIcon}>⭐</Text>
              <Text style={styles.premiumText}>Premium Member</Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.85}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brown50 },
  photoHeader: { height: 300, position: 'relative' },
  profilePhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  profilePhotoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.brown200,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  placeholderText: { fontSize: 80, fontWeight: '700', color: colors.brown400 },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(45,24,16,0.4)',
  },
  profileName: { fontSize: 26, fontWeight: '700', color: colors.white },
  profileCity: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  detailsCard: {
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: radii.card,
    padding: 20,
    ...shadows.card,
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brown500,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  sectionBody: { fontSize: 15, color: colors.text, lineHeight: 22 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.brown50,
  },
  detailLabel: { fontSize: 14, color: colors.textMuted },
  detailValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    paddingVertical: 12,
    borderRadius: radii.small,
  },
  premiumIcon: { fontSize: 18 },
  premiumText: { fontSize: 14, fontWeight: '700', color: colors.gold },
  actions: { padding: 16, gap: 12, paddingBottom: 40 },
  editBtn: {
    backgroundColor: colors.brown700,
    paddingVertical: 14,
    borderRadius: radii.full,
    alignItems: 'center',
    ...shadows.button,
  },
  editBtnText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  logoutBtn: {
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: radii.full,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.rose,
  },
  logoutBtnText: { color: colors.rose, fontWeight: '600', fontSize: 16 },
});
