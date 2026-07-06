import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows } from '../theme';
import { useAuthStore } from '../stores/authStore';
import { apiErrorToString } from '../utils/helpers';

export default function SetPasswordScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const setPasswordAction = useAuthStore((s) => s.setPassword);

  const handleSetPassword = useCallback(async () => {
    if (password.length < 6) {
      Alert.alert('Too Short', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await setPasswordAction(password);
      Alert.alert('Done', 'Password set successfully', [
        { text: 'Continue', onPress: () => navigation.navigate('ProfileSetup') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', apiErrorToString(err, 'Failed to set password'));
    } finally {
      setLoading(false);
    }
  }, [password, confirm, setPasswordAction, navigation]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Set a Password</Text>
        <Text style={styles.subtitle}>
          Protect your account with a password for easy login
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password (min 6 chars)"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            autoFocus
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Confirm password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSetPassword}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : 'Set Password'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileSetup')}
          style={styles.skip}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brown50 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  back: { position: 'absolute', top: 20, left: 24, zIndex: 10 },
  backText: { fontSize: 16, color: colors.brown700, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center' },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  inputContainer: {
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
  button: {
    backgroundColor: colors.brown700,
    paddingVertical: 16,
    borderRadius: radii.full,
    alignItems: 'center',
    marginTop: 8,
    ...shadows.button,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  skip: { marginTop: 20, alignItems: 'center' },
  skipText: { color: colors.textMuted, fontSize: 14 },
});
