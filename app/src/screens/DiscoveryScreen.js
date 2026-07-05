import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, Dimensions, ActivityIndicator,
} from "react-native";
import api from "../api/client";

const { width, height } = Dimensions.get("window");

export default function DiscoveryScreen() {
  const [profiles, setProfiles] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      const data = await api("/discovery?per_page=20");
      setProfiles(data);
      setCurrent(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function swipe(direction) {
    const profile = profiles[current];
    if (!profile) return;
    try {
      const res = await api("/discovery/swipes", {
        method: "POST",
        body: JSON.stringify({ swiped_id: profile.id, direction }),
      });
      if (res.matched) {
        console.log("MATCH!", res.match_id);
      }
      setCurrent((c) => {
        const next = c + 1;
        if (next >= profiles.length - 3) loadProfiles().catch(console.error);
        return next;
      });
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) return <View style={s.centered}><ActivityIndicator size="large" color="#6b3f2e" /></View>;
  if (profiles.length === 0 || current >= profiles.length) {
    return (
      <View style={s.centered}>
        <Text style={s.emptyTitle}>No more profiles</Text>
        <Text style={s.emptySub}>Check back later for new people</Text>
        <TouchableOpacity style={s.refreshBtn} onPress={loadProfiles}>
          <Text style={s.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const profile = profiles[current];

  return (
    <View style={s.container}>
      <View style={s.card}>
        {profile.photos && profile.photos.length > 0 ? (
          <Image source={{ uri: profile.photos[0].photo_url }} style={s.photo} />
        ) : (
          <View style={[s.photo, s.placeholder]}>
            <Text style={s.placeholderText}>{profile.name?.[0]}</Text>
          </View>
        )}
        <View style={s.info}>
          <View style={s.nameRow}>
            <Text style={s.name}>{profile.name}, {profile.age}</Text>
            {profile.photo_verified && <Text style={s.verified}>✓</Text>}
          </View>
          <Text style={s.loc}>{profile.city}{profile.distance_km ? ` · ${profile.distance_km}km` : ""}</Text>
          {profile.bio ? <Text style={s.bio}>{profile.bio}</Text> : null}
          <Text style={s.intent}>{profile.intent?.replace(/_/g, " ")}</Text>
        </View>
      </View>
      <View style={s.actions}>
        <TouchableOpacity style={[s.btn, s.nope]} onPress={() => swipe("pass")}>
          <Text style={[s.btnIcon, { color: "#e8736a" }]}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, s.super]} onPress={() => swipe("super_like")}>
          <Text style={[s.btnIcon, { color: "#d4a358" }]}>★</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, s.like]} onPress={() => swipe("like")}>
          <Text style={[s.btnIcon, { color: "#22c55e" }]}>♥</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fcf8f3", paddingTop: 20 },
  centered: { flex: 1, backgroundColor: "#fcf8f3", justifyContent: "center", alignItems: "center", padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#2d1810", marginBottom: 8 },
  emptySub: { fontSize: 14, color: "#8b7a6e", marginBottom: 24 },
  refreshBtn: { backgroundColor: "#6b3f2e", borderRadius: 60, paddingHorizontal: 32, paddingVertical: 14 },
  refreshText: { color: "#fff", fontWeight: "700" },
  card: {
    marginHorizontal: 20, backgroundColor: "#fff", borderRadius: 24,
    overflow: "hidden", shadowColor: "#2d1810", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 8, marginBottom: 24,
  },
  photo: { width: "100%", height: height * 0.45 },
  placeholder: { backgroundColor: "#ebd9c8", justifyContent: "center", alignItems: "center" },
  placeholderText: { fontSize: 64, fontWeight: "800", color: "#c49a78" },
  info: { padding: 20 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: 24, fontWeight: "700", color: "#2d1810" },
  verified: { color: "#d4a358", fontSize: 18 },
  loc: { fontSize: 14, color: "#8b7a6e", marginTop: 4 },
  bio: { fontSize: 15, color: "#4a2c20", marginTop: 10, lineHeight: 22 },
  intent: { fontSize: 12, color: "#a8774f", marginTop: 8, textTransform: "capitalize", fontWeight: "600" },
  actions: { flexDirection: "row", justifyContent: "center", gap: 20, paddingBottom: 20 },
  btn: {
    width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff", shadowColor: "#2d1810", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  btnIcon: { fontSize: 24 },
  nope: { borderWidth: 2, borderColor: "#fecaca" },
  super: { borderWidth: 2, borderColor: "#fef3c7" },
  like: { borderWidth: 2, borderColor: "#dcfce7" },
});
