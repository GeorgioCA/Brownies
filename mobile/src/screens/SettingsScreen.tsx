import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows } from '../theme';
import { useProfileStore } from '../stores/profileStore';

export default function SettingsScreen(navigation: any): any {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useProfileStore();
  const [bio, setBio] = useState(profile?.bio || '');
  const [college, setCollege] = useState(profile?.college || '');
  const [workplace, setWorkplace] = useState(profile?.workplace || '');
  const [height, setHeight] = useState(profile?.height_cm?.toString() || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        bio: bio || null,
        college: college || null,
        workplace: workplace || null,
        height_cm: height ? parseInt(height, 10) : null,
      });
      Alert.alert('Saved', 'Profile updated');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={styles.input}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people about yourself"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>College</Text>
          <TextInput
            style={styles.input}
            value={college}
            onChangeText={setCollege}
            placeholder="Where did you study?"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Workplace</Text>
          <TextInput
            style={styles.input}
            value={workplace}
            onChangeText={setWorkplace}
            placeholder="Where do you work?"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="e.g. 175"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brown50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.brown200,
  },
  backBtn: { fontSize: 16, fontWeight: '600', color: colors.brown700 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  content: { padding: 20, gap: 20 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: colors.brown700 },
  input: {
    backgroundColor: colors.white,
    borderRadius: radii.small,
    borderWidth: 1,
    borderColor: colors.brown200,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    ...shadows.card,
  },
  saveBtn: {
    backgroundColor: colors.brown700,
    paddingVertical: 16,
    borderRadius: radii.full,
    alignItems: 'center',
    marginTop: 20,
    ...shadows.button,
  },
  saveBtnText: { color: colors.white, fontWeight: '600', fontSize: 16 },
});
