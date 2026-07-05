import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows } from '../theme';
import { useAuthStore } from '../stores/authStore';
import { useProfileStore } from '../stores/profileStore';
import { apiErrorToString } from '../utils/helpers';

const STEPS = ['Name & DOB', 'Gender & Intent', 'City & Bio', 'Photo'];

const INTENTS = [
  { key: 'lets_see', label: "Let's See" },
  { key: 'serious_relationship', label: 'Serious' },
  { key: 'casual', label: 'Casual' },
  { key: 'friendship', label: 'Friendship' },
  { key: 'marriage', label: 'Marriage' },
];

const GENDERS = ['male', 'female'];

export default function ProfileSetupScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const setupProfile = useProfileStore((s) => s.setupProfile);

  // Form state
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [intent, setIntent] = useState('lets_see');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Auto-format DOB with dashes
  const formatDob = useCallback((text: string) => {
    const digits = text.replace(/\D/g, '');
    let formatted = '';
    if (digits.length <= 4) {
      formatted = digits;
    } else if (digits.length <= 6) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    }
    setDob(formatted);
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const { launchImageLibraryAsync, MediaTypeOptions } = await import('expo-image-picker');
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setSelectedPhoto(result.assets[0].uri);
      }
    } catch {}
  }, []);

  // Upload photo to backend
  const uploadPhoto = useCallback(async (): Promise<string | null> => {
    if (!selectedPhoto) return null;
    try {
      const { profileApi } = await import('../api/client');
      await profileApi.uploadPhoto(selectedPhoto);
      return 'uploaded';
    } catch (err: any) {
      Alert.alert('Upload Failed', apiErrorToString(err, 'Could not upload photo. You can add one later.'));
      return null;
    }
  }, [selectedPhoto]);

  const handleNext = useCallback(async () => {
    if (step === 0) {
      if (!name || name.length < 2) { Alert.alert('Required', 'Enter your name'); return; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) { Alert.alert('Invalid', 'Use YYYY-MM-DD format'); return; }
    }
    if (step === 1) {
      if (!gender) { Alert.alert('Required', 'Select your gender'); return; }
    }
    if (step === 2) {
      if (!city) { Alert.alert('Required', 'Enter your city'); return; }
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    // Step 4 — submit profile
    setLoading(true);
    try {
      await setupProfile({
        name,
        date_of_birth: dob,
        gender,
        intent,
        city,
        bio: bio || null,
        languages: ['en'],
        preferred_language: 'en',
      });

      // Upload photo after profile is created
      await uploadPhoto();

      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (err: any) {
      Alert.alert('Error', apiErrorToString(err, 'Failed to setup profile'));
    } finally {
      setLoading(false);
    }
  }, [step, name, dob, gender, intent, city, bio, setupProfile, navigation, uploadPhoto]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i <= step && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.stepTitle}>{STEPS[step]}</Text>

        {step === 0 && (
          <>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            </View>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={dob}
                onChangeText={formatDob}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.optionsRow}>
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.optionPill,
                    gender === g && styles.optionPillActive,
                  ]}
                  onPress={() => setGender(g)}
                >
                  <Text
                    style={[
                      styles.optionPillText,
                      gender === g && styles.optionPillTextActive,
                    ]}
                  >
                    {g === 'male' ? 'Male' : 'Female'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 24 }]}>Looking for</Text>
            <View style={styles.optionsRow}>
              {INTENTS.map((i) => (
                <TouchableOpacity
                  key={i.key}
                  style={[
                    styles.optionPill,
                    intent === i.key && styles.optionPillActive,
                  ]}
                  onPress={() => setIntent(i.key)}
                >
                  <Text
                    style={[
                      styles.optionPillText,
                      intent === i.key && styles.optionPillTextActive,
                    ]}
                  >
                    {i.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Your city (e.g. Mumbai)"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            </View>
            <View style={styles.inputBox}>
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                value={bio}
                onChangeText={setBio}
                placeholder="A short bio (optional)"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>
          </>
        )}

        {step === 3 && (
          <View style={styles.photoContainer}>
            {selectedPhoto ? (
              <Image source={{ uri: selectedPhoto }} style={styles.previewImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>📸</Text>
              </View>
            )}
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Text style={styles.photoButtonText}>
                {selectedPhoto ? 'Change Photo' : 'Upload Photo'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.photoHint}>
              You can add more photos later
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        {step > 0 && (
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.skipBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, loading && { opacity: 0.6 }]}
          onPress={handleNext}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {loading ? 'Saving...' : step < 3 ? 'Next' : 'Done'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brown50 },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brown200,
  },
  progressDotActive: {
    backgroundColor: colors.brown700,
    width: 20,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 24 },
  stepTitle: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 24 },
  inputBox: {
    backgroundColor: colors.white,
    borderRadius: radii.small,
    borderWidth: 1,
    borderColor: colors.brown200,
    marginBottom: 14,
    ...shadows.card,
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionPill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.brown200,
    backgroundColor: colors.white,
  },
  optionPillActive: {
    borderColor: colors.brown700,
    backgroundColor: colors.brown700,
  },
  optionPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brown600,
  },
  optionPillTextActive: {
    color: colors.white,
  },
  photoContainer: { alignItems: 'center', paddingTop: 20 },
  photoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 20,
    backgroundColor: colors.brown200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  photoIcon: { fontSize: 48 },
  photoButton: {
    backgroundColor: colors.brown700,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: radii.full,
    ...shadows.button,
  },
  photoButtonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  photoHint: { fontSize: 12, color: colors.textMuted, marginTop: 12 },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.brown200,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.brown200,
    alignItems: 'center',
  },
  skipBtnText: { fontSize: 16, fontWeight: '600', color: colors.brown600 },
  nextBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: radii.full,
    backgroundColor: colors.brown700,
    alignItems: 'center',
    ...shadows.button,
  },
  nextBtnText: { fontSize: 16, fontWeight: '600', color: colors.white },
});
