import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from "react-native";
import api from "../api/client";
import { useAuth } from "../contexts/AuthContext";

const INTENTS = [
  { key: "lets_see", label: "Let's See" },
  { key: "serious_relationship", label: "Serious Relationship" },
  { key: "casual", label: "Casual" },
  { key: "friendship", label: "Friendship" },
  { key: "marriage", label: "Marriage" },
];
const GENDERS = ["male", "female"];

export default function SetupProfileScreen({ navigation }) {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    date_of_birth: "",
    gender: "",
    intent: "lets_see",
    city: "",
    bio: "",
    languages: ["en"],
    preferred_language: "en",
  });
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await api("/profile/setup", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setUser(res);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <>
            <Text style={s.label}>Your Name</Text>
            <TextInput style={s.input} placeholder="Full name" value={form.name} onChangeText={(v) => update("name", v)} />
            <Text style={s.label}>Date of Birth</Text>
            <TextInput style={s.input} placeholder="YYYY-MM-DD" value={form.date_of_birth} onChangeText={(v) => update("date_of_birth", v)} keyboardType="numbers-and-punctuation" />
          </>
        );
      case 1:
        return (
          <>
            <Text style={s.label}>Gender</Text>
            <View style={s.chipRow}>
              {GENDERS.map((g) => (
                <TouchableOpacity key={g} style={[s.chip, form.gender === g && s.chipActive]} onPress={() => update("gender", g)}>
                  <Text style={[s.chipText, form.gender === g && s.chipTextActive]}>{g.charAt(0).toUpperCase() + g.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.label}>Intent</Text>
            <View style={s.chipRow}>
              {INTENTS.map((i) => (
                <TouchableOpacity key={i.key} style={[s.chip, form.intent === i.key && s.chipActive]} onPress={() => update("intent", i.key)}>
                  <Text style={[s.chipText, form.intent === i.key && s.chipTextActive]}>{i.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      case 2:
        return (
          <>
            <Text style={s.label}>City</Text>
            <TextInput style={s.input} placeholder="Mumbai, Delhi, Bangalore..." value={form.city} onChangeText={(v) => update("city", v)} />
            <Text style={s.label}>Bio (optional)</Text>
            <TextInput style={[s.input, s.multiline]} placeholder="Tell us about yourself..." value={form.bio} onChangeText={(v) => update("bio", v)} multiline numberOfLines={4} />
          </>
        );
      default:
        return null;
    }
  }

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Set Up Your Profile</Text>
      <View style={s.progress}>
        {[0, 1, 2].map((s2) => (
          <View key={s2} style={[s.dot, step >= s2 && s.dotActive]} />
        ))}
      </View>
      {renderStep()}
      <View style={s.btns}>
        {step > 0 && (
          <TouchableOpacity style={s.btnSecondary} onPress={() => setStep(step - 1)}>
            <Text style={s.btnSecondaryText}>Back</Text>
          </TouchableOpacity>
        )}
        {step < 2 ? (
          <TouchableOpacity style={s.btn} onPress={() => setStep(step + 1)}>
            <Text style={s.btnText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleSubmit} disabled={loading}>
            <Text style={s.btnText}>{loading ? "Creating..." : "Finish"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fcf8f3", paddingHorizontal: 32, paddingVertical: 48 },
  title: { fontSize: 24, fontWeight: "800", color: "#2d1810", textAlign: "center", marginBottom: 16 },
  progress: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 32 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#ebd9c8" },
  dotActive: { backgroundColor: "#6b3f2e", width: 28 },
  label: { fontSize: 14, fontWeight: "600", color: "#4a2c20", marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: "#fff", borderRadius: 16, padding: 14, fontSize: 16,
    borderWidth: 1, borderColor: "#ebd9c8", color: "#2d1810",
  },
  multiline: { height: 100, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 60,
    borderWidth: 1, borderColor: "#ebd9c8", backgroundColor: "#fff",
  },
  chipActive: { borderColor: "#6b3f2e", backgroundColor: "#6b3f2e" },
  chipText: { fontSize: 14, fontWeight: "600", color: "#4a2c20" },
  chipTextActive: { color: "#fff" },
  btns: { flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 32 },
  btn: {
    flex: 1, backgroundColor: "#6b3f2e", borderRadius: 60, paddingVertical: 16,
    alignItems: "center", shadowColor: "#4a2c20", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  btnSecondary: {
    flex: 1, borderRadius: 60, paddingVertical: 16, alignItems: "center",
    borderWidth: 1, borderColor: "#ebd9c8",
  },
  btnSecondaryText: { color: "#4a2c20", fontWeight: "600", fontSize: 16 },
});
