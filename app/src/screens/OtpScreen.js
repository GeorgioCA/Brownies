import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert,
} from "react-native";
import { api } from "../api/client";
import { useAuth } from "../contexts/AuthContext";

export default function OtpScreen({ route, navigation }) {
  const { phone, otpHint } = route.params;
  const { login } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const refs = useRef([]);

  function handleChange(text, index) {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);
    if (text && index < 5) refs.current[index + 1]?.focus();
  }

  async function handleVerify() {
    const code = otp.join("");
    if (code.length < 6) return;
    setLoading(true);
    try {
      const res = await api("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone_number: phone, otp: code }),
      });
      if (res.profile_complete) {
        await login(res.access_token, res.refresh_token);
      } else {
        await login(res.access_token, res.refresh_token);
        navigation.reset({ index: 0, routes: [{ name: "SetupProfile" }] });
      }
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Verify OTP</Text>
      <Text style={s.subtitle}>Sent to {phone}</Text>
      {otpHint ? <Text style={s.hint}>Dev: {otpHint}</Text> : null}
      <View style={s.row}>
        {otp.map((d, i) => (
          <TextInput
            key={i}
            ref={(r) => (refs.current[i] = r)}
            style={s.box}
            keyboardType="number-pad"
            maxLength={1}
            value={d}
            onChangeText={(t) => handleChange(t, i)}
          />
        ))}
      </View>
      <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleVerify} disabled={loading}>
        <Text style={s.btnText}>{loading ? "Verifying..." : "Verify"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fcf8f3", justifyContent: "center", paddingHorizontal: 32 },
  title: { fontSize: 28, fontWeight: "800", color: "#2d1810", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#8b7a6e", textAlign: "center", marginBottom: 32 },
  hint: { fontSize: 12, color: "#d4a358", textAlign: "center", marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 32 },
  box: {
    width: 48, height: 56, borderRadius: 12, borderWidth: 1, borderColor: "#ebd9c8",
    backgroundColor: "#fff", textAlign: "center", fontSize: 22, fontWeight: "700", color: "#2d1810",
  },
  btn: {
    backgroundColor: "#6b3f2e", borderRadius: 60, paddingVertical: 16, alignItems: "center",
    shadowColor: "#4a2c20", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
