import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import api from "../api/client";
import { useAuth } from "../contexts/AuthContext";

export default function ChatScreen({ route }) {
  const { matchId, name } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const flatRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  async function loadMessages() {
    try {
      const data = await api(`/matches/${matchId}/messages?per_page=100`);
      setMessages(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function send() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await api(`/matches/${matchId}/messages`, {
        method: "POST",
        body: JSON.stringify({ message_type: "text", content: trimmed }),
      });
      setText("");
      loadMessages();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  const myId = user?.id;

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(m) => String(m.id)}
        inverted
        renderItem={({ item }) => (
          <View style={[s.bubble, item.sender_id === myId ? s.my : s.their]}>
            <Text style={s.msgText}>{item.content}</Text>
            <Text style={s.time}>{new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
          </View>
        )}
        contentContainerStyle={s.msgList}
      />
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <TouchableOpacity style={[s.sendBtn, sending && s.disabled]} onPress={send} disabled={sending}>
          <Text style={s.sendText}>{sending ? "..." : "Send"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fcf8f3" },
  msgList: { padding: 16, gap: 10 },
  bubble: { maxWidth: "75%", borderRadius: 18, padding: 12, paddingBottom: 6 },
  my: { alignSelf: "flex-end", backgroundColor: "#6b3f2e" },
  their: { alignSelf: "flex-start", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ebd9c8" },
  msgText: { fontSize: 16, color: "#2d1810" },
  time: { fontSize: 11, color: "#8b7a6e", textAlign: "right", marginTop: 4 },
  inputRow: {
    flexDirection: "row", padding: 12, borderTopWidth: 1, borderColor: "#ebd9c8",
    backgroundColor: "#fff", alignItems: "center", gap: 8,
  },
  input: {
    flex: 1, backgroundColor: "#f5ebe1", borderRadius: 24,
    paddingHorizontal: 18, paddingVertical: 12, fontSize: 16, color: "#2d1810",
  },
  sendBtn: { backgroundColor: "#6b3f2e", borderRadius: 60, paddingHorizontal: 22, paddingVertical: 12 },
  sendText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  disabled: { opacity: 0.5 },
});
