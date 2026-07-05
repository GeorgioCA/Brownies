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
import { isValidPhone } from '../utils/helpers';
import { useAuthStore } from '../stores/authStore';

export default function PhoneInputScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('+91');
  const [loading, setLoading] = useState(false);
  const sendOtp = useAuthStore((s) => s.sendOtp);

  const handleSendOtp = useCallback(async () => {
    if (!isValidPhone(phone)) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      await sendOtp(phone);
      navigation.navigate('OTPVerify', { phone });
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.detail || 'Failed to send OTP'
      );
    } finally {
      setLoading(false);
    }
  }, [phone, navigation, sendOtp]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>Brownies</Text>
        <Text style={styles.title}>Your Phone Number</Text>
        <Text style={styles.subtitle}>
          We'll send you a verification code
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 98765 43210"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            autoFocus
            maxLength={15}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendOtp}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sending...' : 'Send OTP'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.loginLink}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brown50 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
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
    fontSize: 18,
    color: colors.text,
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
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginText: { color: colors.textMuted, fontSize: 14 },
  loginBold: { color: colors.brown700, fontWeight: '600' },
});
