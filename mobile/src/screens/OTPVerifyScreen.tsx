import React, { useState, useCallback, useRef } from 'react';
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
import { isValidOtp } from '../utils/helpers';
import { apiErrorToString } from '../utils/helpers';
import { useAuthStore } from '../stores/authStore';

export default function OTPVerifyScreen({ route, navigation }: any) {
  const { phone } = route.params;
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const inputRef = useRef<TextInput>(null);

  const handleVerify = useCallback(async () => {
    if (!isValidOtp(otp)) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const profileComplete = await verifyOtp(phone, otp);
      if (profileComplete) {
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'ProfileSetup' }] });
      }
    } catch (err: any) {
      Alert.alert(
        'Error',
        apiErrorToString(err, 'Invalid or expired OTP')
      );
    } finally {
      setLoading(false);
    }
  }, [otp, phone, verifyOtp, navigation]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Verify Your Number</Text>
        <Text style={styles.subtitle}>
          Enter the code sent to {phone}
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            placeholder="000000"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.resend}
        >
          <Text style={styles.resendText}>Change phone number</Text>
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
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.brown800,
    textAlign: 'center',
    marginBottom: 32,
  },
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
    marginBottom: 20,
    ...shadows.card,
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: colors.brown700,
    paddingVertical: 16,
    borderRadius: radii.full,
    alignItems: 'center',
    ...shadows.button,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  resend: { marginTop: 20, alignItems: 'center' },
  resendText: { color: colors.brown500, fontSize: 14, fontWeight: '500' },
});
