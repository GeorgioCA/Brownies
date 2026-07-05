import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from "react-native";
import api from "../api/client";
import { useAuth } from "../contexts/AuthContext";

export default function SettingsScreen() {
  const { user, setUser } = useAuth();
  const [prefs, setPrefs] = useState({
    min_age: "18",
    max_age: "50",
    preferred_gender: "all",
    max_distance_km: "50",
    intent_filter: "",
    city_filter: "",
  });
  const [profile, setProfile] = useState({
    bio: user?.bio || "",
    city: user?.city || "",
    preferred_language: user?.preferred_language || "en",
    show_online_status: user?.show_online_status !== false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api("/preferences");
        setPrefs({
          min_age: String(data.min_age),
          max_age: String(data.max_age),
          preferred_gender: data.preferred_gender,
          max_distance_km: String(data.max_distance_km),
          intent_filter: data.intent_filter || "",
          city_filter: data.city_filter || "",
        });
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  async function savePrefs() {
    setSaving(true);
    try {
      const body = {};
      if (prefs.min_age) body.min_age = parseInt(prefs.min_age);
      if (prefs.max_age) body.max_age = parseInt(prefs.max_age);
      if (prefs.preferred_gender) body.preferred_gender = prefs.preferred_gender;
      if (prefs.max_distance_km) body.max_distance_km = parseInt(prefs.max_distance_km);
      if (prefs.intent_filter) body.intent_filter = prefs.intent_filter;
      if (prefs.city_filter) body.city_filter = prefs.city_filter;
      await api("/preferences", { method: "PUT", body: JSON.stringify(body) });
      Alert.alert("Saved", "Preferences updated");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      await api("/profile/me", { method: "PATCH", body: JSON.stringify(profile) });
      const updated = await api("/profile/me");
      setUser(updated);
      Alert.alert("Saved", "Profile updated");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  }

  const GENDERS = [
    { key: "all", label: "All" },
    { key: "male", label: "Male" },
    { key: "female", label: "Female" },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.heading}>Profile</Text>
      <View style={s.field}>
        <Text style={s.label}>Bio</Text>
        <TextInput style={s.input} value={profile.bio} onChangeText={(v) => setProfile({ ...profile, bio: v })} multiline />
      </View>
      <View style={s.field}>
        <Text style={s.label}>City</Text>
        <TextInput style={s.input} value={profile.city} onChangeText={(v) => setProfile({ ...profile, city: v })} />
      </View>
      <TouchableOpacity style={s.saveBtn} onPress={saveProfile} disabled={saving}>
        <Text style={s.saveText}>{saving ? "Saving..." : "Save Profile"}</Text>
      </TouchableOpacity>

      <Text style={[s.heading, { marginTop: 32 }]}>Discovery Preferences</Text>
      <View style={s.row}>
        <View style={[s.field, { flex: 1 }]}>
          <Text style={s.label}>Min Age</Text>
          <TextInput style={s.input} value={prefs.min_age} onChangeText={(v) => setPrefs({ ...prefs, min_age: v })} keyboardType="numeric" />
        </View>
        <View style={[s.field, { flex: 1 }]}>
          <Text style={s.label}>Max Age</Text>
          <TextInput style={s.input} value={prefs.max_age} onChangeText={(v) => setPrefs({ ...prefs, max_age: v })} keyboardType="numeric" />
        </View>
      </View>
      <View style={s.field}>
        <Text style={s.label}>Preferred Gender</Text>
        <View style={s.chipRow}>
          {GENDERS.map((g) => (
            <TouchableOpacity key={g.key} style={[s.chip, prefs.preferred_gender === g.key && s.chipActive]} onPress={() => setPrefs({ ...prefs, preferred_gender: g.key })}>
              <Text style={[s.chipText, prefs.preferred_gender === g.key && s.chipTextActive]}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={s.field}>
        <Text style={s.label}>Max Distance (km)</Text>
        <TextInput style={s.input} value={prefs.max_distance_km} onChangeText={(v) => setPrefs({ ...prefs, max_distance_km: v })} keyboardType="numeric" />
      </View>
      <View style={s.field}>
        <Text style={s.label}>City Filter (optional)</Text>
        <TextInput style={s.input} value={prefs.city_filter} onChangeText={(v) => setPrefs({ ...prefs, city_filter: v })} placeholder="e.g. Mumbai" />
      </View>
      <TouchableOpacity style={s.saveBtn} onPress={savePrefs} disabled={saving}>
        <Text style={s.saveText}>{saving ? "Saving..." : "Save Preferences"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fcf8f3" },
  content: { padding: 24, paddingBottom: 60 },
  heading: { fontSize: 20, fontWeight: "700", color: "#2d1810", marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#4a2c20", marginBottom: 6 },
  input: {
    backgroundColor: "#fff", borderRadius: 12, padding: 12, fontSize: 15,
    borderWidth: 1, borderColor: "#ebd9c8", color: "#2d1810",
  },
  row: { flexDirection: "row", gap: 12 },
  chipRow: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 60,
    borderWidth: 1, borderColor: "#ebd9c8", backgroundColor: "#fff",
  },
  chipActive: { borderColor: "#6b3f2e", backgroundColor: "#6b3f2e" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#4a2c20" },
  chipTextActive: { color: "#fff" },
  saveBtn: {
    backgroundColor: "#6b3f2e", borderRadius: 60, paddingVertical: 14, alignItems: "center",
    marginTop: 8, shadowColor: "#4a2c20", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
