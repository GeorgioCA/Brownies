import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows } from '../theme';
import { useMatchStore } from '../stores/matchStore';
import { timeAgo } from '../utils/helpers';
import { apiErrorToString } from '../utils/helpers';

export default function ChatDetailScreen({ route, navigation }: any) {
  const { matchId, userId, userName } = route.params;
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const { messages, isLoading, fetchMessages, sendMessage } = useMatchStore();

  useEffect(() => {
    fetchMessages(matchId);
    navigation.setOptions({ title: userName });
  }, [matchId]);

  const handleSend = useCallback(async () => {
    if (!text.trim()) return;
    try {
      await sendMessage(matchId, text.trim());
      setText('');
      // Scroll to bottom
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {}
  }, [text, matchId, sendMessage]);

  const msgs = messages[matchId] || [];

  const renderMessage = useCallback(
    ({ item }) => {
      const isMe = item.sender_id !== userId;
      return (
        <View style={[styles.msgRow, isMe && styles.msgRowMine]}>
          <View
            style={[
              styles.msgBubble,
              isMe ? styles.msgBubbleMine : styles.msgBubbleTheirs,
            ]}
          >
            <Text
              style={[isMe ? styles.msgTextMine : styles.msgTextTheirs]}
            >
              {item.content}
            </Text>
          </View>
          <Text style={styles.msgTime}>{timeAgo(item.created_at)}</Text>
        </View>
      );
    },
    [userId]
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {isLoading && msgs.length === 0 ? (
        <ActivityIndicator size="large" color={colors.brown700} style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={msgs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.msgList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySub}>Send a message to start chatting!</Text>
            </View>
          }
        />
      )}

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
          activeOpacity={0.7}
        >
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brown50 },
  msgList: { padding: 16, gap: 12 },
  msgRow: { alignItems: 'flex-start' },
  msgRowMine: { alignItems: 'flex-end' },
  msgBubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  msgBubbleMine: {
    backgroundColor: colors.brown700,
    borderBottomRightRadius: 6,
  },
  msgBubbleTheirs: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.brown200,
  },
  msgTextMine: { color: colors.white, fontSize: 15, lineHeight: 20 },
  msgTextTheirs: { color: colors.text, fontSize: 15, lineHeight: 20 },
  msgTime: { fontSize: 11, color: colors.textMuted, marginTop: 4, marginHorizontal: 4 },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.brown200,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.brown50,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.brown200,
  },
  sendBtn: {
    backgroundColor: colors.brown700,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    ...shadows.button,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
});
