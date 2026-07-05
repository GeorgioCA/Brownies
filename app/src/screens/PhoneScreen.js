import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { api } from "../api/client";

export default function PhoneScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length < 10) return Alert.alert("Invalid", "Enter a valid phone number");
    setLoading(true);
    try {
      const res = await api("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone_number: cleaned }),
      });
      navigation.navigate("Otp", { phone: cleaned, otpHint: res.otp });
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={s.inner}>
        <Text style={s.logo}>Brownies</Text>
        <Text style={s.tagline}>Dating, Desi Style</Text>
        <Text style={s.label}>Enter your phone number</Text>
        <TextInput
          style={s.input}
          placeholder="+91 9876543210"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          autoFocus
        />
        <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleSendOtp} disabled={loading}>
          <Text style={s.btnText}>{loading ? "Sending..." : "Send OTP"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fcf8f3" },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 32 },
  logo: { fontSize: 36, fontWeight: "900", color: "#4a2c20", textAlign: "center" },
  tagline: { fontSize: 14, color: "#8b7a6e", textAlign: "center", marginBottom: 48, marginTop: 4 },
  label: { fontSize: 15, fontWeight: "600", color: "#4a2c20", marginBottom: 12 },
  input: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16, fontSize: 18,
    borderWidth: 1, borderColor: "#ebd9c8", color: "#2d1810", marginBottom: 20,
  },
  btn: {
    backgroundColor: "#6b3f2e", borderRadius: 60, paddingVertical: 16, alignItems: "center",
    shadowColor: "#4a2c20", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
