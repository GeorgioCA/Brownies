import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/client";

export default function ChatListScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const data = await api("/matches");
          setMatches(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  if (loading) return <View style={s.centered}><ActivityIndicator size="large" color="#6b3f2e" /></View>;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={s.row}
      onPress={() => navigation.navigate("Chat", { matchId: item.id, name: item.user?.name })}
    >
      <View style={s.avatar}>
        <Text style={s.avatarText}>{item.user?.name?.[0]}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.name}>{item.user?.name}</Text>
        <Text style={s.sub}>{item.user?.age}, {item.user?.city}</Text>
      </View>
      {item.is_active ? <View style={s.dot} /> : null}
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      {matches.length === 0 ? (
        <View style={s.centered}>
          <Text style={s.empty}>No matches yet</Text>
          <Text style={s.emptySub}>Start swiping to find matches!</Text>
        </View>
      ) : (
        <FlatList data={matches} keyExtractor={(m) => String(m.id)} renderItem={renderItem} contentContainerStyle={s.list} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fcf8f3" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { fontSize: 18, fontWeight: "700", color: "#2d1810" },
  emptySub: { fontSize: 14, color: "#8b7a6e", marginTop: 8 },
  list: { paddingVertical: 8 },
  row: {
    flexDirection: "row", alignItems: "center", padding: 16,
    backgroundColor: "#fff", marginHorizontal: 16, marginVertical: 4,
    borderRadius: 16, shadowColor: "#2d1810", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: "#ebd9c8",
    justifyContent: "center", alignItems: "center", marginRight: 14,
  },
  avatarText: { fontSize: 22, fontWeight: "700", color: "#6b3f2e" },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600", color: "#2d1810" },
  sub: { fontSize: 13, color: "#8b7a6e", marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#22c55e" },
});
