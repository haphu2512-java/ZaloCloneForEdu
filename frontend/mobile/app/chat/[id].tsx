import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator,
  Alert, Image, ActionSheetIOS
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '../../context/auth';
import { getMessages, sendMessage, markMessageRead, deleteMessage, recallMessage } from '../../utils/messageService';
import * as DocumentPicker from 'expo-document-picker';
import { Message, ConversationListItem } from '../../types/chat';

function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const loadInitialMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getMessages({ conversationId: conversationId as string, limit: 30 });
      setMessages(res.items);
      setNextCursor(res.nextCursor);
    } catch (error) {
      console.log('Error loading messages', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadInitialMessages();
  }, [loadInitialMessages]);

  const loadMoreMessages = async () => {
    if (!nextCursor || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const res = await getMessages({ conversationId: conversationId as string, limit: 20, cursor: nextCursor });
      setMessages(prev => [...prev, ...res.items]);
      setNextCursor(res.nextCursor);
    } catch (error) {
      console.log('Error loading more messages', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    setIsSending(true);
    try {
      const newMsg = await sendMessage({
        conversationId: conversationId as string,
        content: text,
      });
      // Optimistically add to UI, but usually socket will broadcast it back. Let's just prepend for responsiveness:
      setMessages(prev => [newMsg, ...prev]);
      setInputText('');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
    } finally {
      setIsSending(false);
    }
  };

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsSending(true);
        try {
          // Read to base64
          const FileSystem = require('expo-file-system');
          const base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Upload media
          const { uploadMedia } = require('../../utils/messageService');
          const media = await uploadMedia({
            fileName: asset.name,
            mimeType: asset.mimeType || 'application/octet-stream',
            contentBase64: base64,
          });

          // Send message
          const newMsg = await sendMessage({
            conversationId: conversationId as string,
            mediaIds: [media._id],
            content: `Đã gửi file: ${asset.name}`
          });
          setMessages(prev => [newMsg, ...prev]);

        } catch (uploadErr) {
          console.log(uploadErr);
          Alert.alert('Lỗi', 'Không thể tải lên file');
        } finally {
          setIsSending(false);
        }
      }
    } catch (e) {
      console.log('Document picker err', e);
    }
  };

  const handleMessageLongPress = (msg: Message) => {
    const isMine = msg.senderId._id === user?.id || (msg.senderId as any) === user?.id; // backend might populate string or object
    const options = ['Hủy'];
    const actions: Array<() => void> = [() => { }];

    if (isMine && !msg.isRecalled) {
      options.push('Thu hồi tin nhắn (với mọi người)');
      actions.push(async () => {
        try {
          await recallMessage(msg._id);
          setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRecalled: true } : m));
        } catch (e) {
          Alert.alert('Lỗi', 'Không thể thu hồi tin nhắn');
        }
      });
    }

    if (!msg.isRecalled) {
      options.push('Xóa tin nhắn (phía tôi)');
      actions.push(async () => {
        try {
          await deleteMessage(msg._id);
          setMessages(prev => prev.filter(m => m._id !== msg._id));
        } catch (e) {
          Alert.alert('Lỗi', 'Không thể xóa tin nhắn');
        }
      });
    }

    // Add forward option
    if (!msg.isRecalled) {
      options.push('Chuyển tiếp (Forward)');
      actions.push(() => {
        Alert.alert('Chuyển tiếp', 'Tính năng forward sẽ mở danh sách bạn bè.');
      });
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 0 },
        (buttonIndex) => { actions[buttonIndex](); }
      );
    } else {
      // Very basic alert for Android since simple actions
      Alert.alert('Tùy chọn tin nhắn', '', options.map((btn, idx) => ({
        text: btn,
        onPress: actions[idx],
        style: idx === 0 ? 'cancel' : 'default'
      })));
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.senderId._id === user?.id || (item.senderId as any) === user?.id;

    if (item.isRecalled) {
      return (
        <View style={[{ padding: 10, marginVertical: 4, marginHorizontal: 16, borderRadius: 16, maxWidth: '75%' },
        isMine ? { alignSelf: 'flex-end', backgroundColor: '#F1F5F9' } : { alignSelf: 'flex-start', backgroundColor: '#F1F5F9' }]}>
          <Text style={{ color: '#94A3B8', fontStyle: 'italic' }}>Tin nhắn đã bị thu hồi</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        onLongPress={() => handleMessageLongPress(item)}
        activeOpacity={0.8}
        style={[
          { padding: 12, marginVertical: 4, marginHorizontal: 16, borderRadius: 16, maxWidth: '75%' },
          isMine ? { alignSelf: 'flex-end', backgroundColor: '#3B82F6', borderBottomRightRadius: 4 } : { alignSelf: 'flex-start', backgroundColor: '#F1F5F9', borderBottomLeftRadius: 4 }
        ]}
      >
        {!isMine && <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>{item.senderId?.username || 'Khách'}</Text>}
        {item.content ? <Text style={{ color: isMine ? '#fff' : '#0F172A', fontSize: 16 }}>{item.content}</Text> : null}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{
        title: 'Trò chuyện',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
        )
      }} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          data={messages}
          keyExtractor={item => item._id}
          renderItem={renderMessage}
          inverted
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingMore ? <ActivityIndicator style={{ margin: 16 }} /> : null}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}>
          <TouchableOpacity onPress={handleDocumentPick} style={{ marginRight: 12 }}>
            <Ionicons name="attach" size={28} color="#64748B" />
          </TouchableOpacity>

          <TextInput
            style={{ flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 24, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, fontSize: 16, maxHeight: 100 }}
            placeholder="Nhắn tin..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity onPress={handleSend} disabled={isSending || inputText.trim().length === 0} style={{ marginLeft: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: inputText.trim().length > 0 ? '#3B82F6' : '#CBD5E1', alignItems: 'center', justifyContent: 'center' }}>
            {isSending ? <ActivityIndicator color="#fff" /> : <Ionicons name="send" size={20} color="#fff" style={{ marginLeft: 4 }} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default ChatScreen;






