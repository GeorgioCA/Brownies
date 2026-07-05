import React, { useState, useCallback } from "react";
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import api, { apiMultipart } from "../api/client";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen({ navigation }) {
  const { user, setUser, logout } = useAuth();
  const [profile, setProfile] = useState(user);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const data = await api("/profile/me");
          setProfile(data);
          setUser(data);
        } catch (e) {
          console.error(e);
        }
      })();
    }, [])
  );

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert("Permission required");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const formData = new FormData();
      formData.append("file", { uri, name: "photo.jpg", type: "image/jpeg" });
      try {
        await apiMultipart("/profile/photos", formData);
        const updated = await api("/profile/me");
        setProfile(updated);
        setUser(updated);
      } catch (e) {
        Alert.alert("Error", e.message);
      }
    }
  }

  if (!profile) return <View style={s.centered}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        {profile.photos?.length > 0 ? (
          <Image source={{ uri: profile.photos[0].photo_url }} style={s.avatar} />
        ) : (
          <TouchableOpacity style={[s.avatar, s.placeholder]} onPress={pickPhoto}>
            <Text style={s.placeholderText}>Add Photo</Text>
          </TouchableOpacity>
        )}
        <Text style={s.name}>{profile.name}</Text>
        <Text style={s.loc}>{profile.city}</Text>
        <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate("Settings")}>
          <Text style={s.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.photoRow}>
          {profile.photos?.map((p) => (
            <Image key={p.id} source={{ uri: p.photo_url }} style={s.thumb} />
          ))}
          {(!profile.photos || profile.photos.length < 6) && (
            <TouchableOpacity style={s.addThumb} onPress={pickPhoto}>
              <Text style={s.addText}>+</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {profile.bio ? <View style={s.section}><Text style={s.sectionTitle}>Bio</Text><Text style={s.bio}>{profile.bio}</Text></View> : null}

      <View style={s.section}>
        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fcf8f3" },
  content: { paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", paddingTop: 32, paddingBottom: 24 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 16 },
  placeholder: { backgroundColor: "#ebd9c8", justifyContent: "center", alignItems: "center" },
  placeholderText: { color: "#8b7a6e", fontWeight: "600" },
  name: { fontSize: 24, fontWeight: "700", color: "#2d1810" },
  loc: { fontSize: 14, color: "#8b7a6e", marginTop: 4 },
  editBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 60, borderWidth: 1, borderColor: "#ebd9c8" },
  editText: { color: "#6b3f2e", fontWeight: "600" },
  section: { paddingHorizontal: 24, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#2d1810", marginBottom: 12 },
  photoRow: { flexDirection: "row", gap: 10 },
  thumb: { width: 80, height: 110, borderRadius: 12, backgroundColor: "#ebd9c8" },
  addThumb: {
    width: 80, height: 110, borderRadius: 12, borderWidth: 2, borderColor: "#ebd9c8", borderStyle: "dashed",
    justifyContent: "center", alignItems: "center",
  },
  addText: { fontSize: 28, color: "#c49a78" },
  bio: { fontSize: 15, color: "#4a2c20", lineHeight: 22 },
  logoutBtn: { paddingVertical: 14, borderRadius: 60, borderWidth: 1, borderColor: "#fecaca", alignItems: "center" },
  logoutText: { color: "#e8736a", fontWeight: "600", fontSize: 16 },
});
