import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  View as RNView,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth';
import { getFriendList, sendFriendRequest, removeFriend } from '@/utils/friendService';
import { searchUsers } from '@/utils/searchService';
import type { UserInfo } from '@/types/chat';

export default function ContactsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuth();

  const [friends, setFriends] = useState<UserInfo[]>([]);
  const [searchResults, setSearchResults] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const getUserId = useCallback((u: UserInfo) => u._id || u.id || '', []);

  const loadFriends = useCallback(async () => {
    try {
      const res = await getFriendList(1, 100);
      if (res?.items) {
        setFriends(res.items);
      }
    } catch (error: any) {
      console.log('Failed to fetch friends:', error.message);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadFriends();
      setLoading(false);
    };
    init();
  }, [loadFriends]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  }, [loadFriends]);

  // Search users when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchUsers(searchQuery.trim(), 1, 20);
        // Filter out current user from results
        const filtered = (res?.items || []).filter((u) => getUserId(u) && getUserId(u) !== user?.id);
        const deduped = Array.from(new Map(filtered.map((u) => [getUserId(u), u])).values());
        setSearchResults(deduped);
      } catch (error: any) {
        console.log('Search failed:', error.message);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchQuery, user?.id, getUserId]);

  const handleAddFriend = async (targetUserId: string) => {
    if (!targetUserId) {
      Alert.alert('Lỗi', 'Không xác định được người dùng để kết bạn');
      return;
    }

    Alert.alert('Kết bạn', 'Gửi lời mời kết bạn?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Gửi',
        onPress: async () => {
          try {
            await sendFriendRequest({ toUserId: targetUserId });
            Alert.alert('Thành công ✅', 'Đã gửi lời mời kết bạn!');
          } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Không thể gửi lời mời');
          }
        },
      },
    ]);
  };

  const handleRemoveFriend = async (friendId: string) => {
    Alert.alert('Xóa bạn', 'Bạn có chắc muốn xóa người này khỏi danh sách bạn bè?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFriend(friendId);
            Alert.alert('Đã xóa', 'Đã xóa khỏi danh sách bạn bè');
            await loadFriends();
          } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Không thể xóa bạn');
          }
        },
      },
    ]);
  };

  const isFriend = (userId: string) => friends.some((f) => getUserId(f) === userId);

  const renderUserItem = (item: UserInfo, isFriendItem: boolean) => (
    <TouchableOpacity
      style={[styles.userItem, { backgroundColor: colors.surface }]}
      activeOpacity={0.7}
      onLongPress={isFriendItem ? () => handleRemoveFriend(getUserId(item)) : undefined}
    >
      <Image
        source={{
          uri: item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.username)}&background=6366F1&color=fff&size=100&bold=true`,
        }}
        style={styles.avatar}
      />
      <View style={[styles.userInfo, { backgroundColor: 'transparent' }]}>
        <Text style={[styles.userName, { color: colors.text }]}>{item.username}</Text>
        <Text style={{ fontSize: 13, color: colors.muted }}>
          {item.email || (item.isOnline ? '🟢 Đang hoạt động' : '')}
        </Text>
      </View>
      {/* Online indicator */}
      {item.isOnline && (
        <View style={[styles.onlineBadge, { backgroundColor: 'transparent' }]}>
          <View style={styles.onlineDot} />
        </View>
      )}
      {/* Add friend button for search results */}
      {!isFriendItem && !isFriend(getUserId(item)) && (
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.tint }]}
          onPress={() => handleAddFriend(getUserId(item))}
        >
          <Ionicons name="person-add" size={16} color="#fff" />
        </TouchableOpacity>
      )}
      {!isFriendItem && isFriend(getUserId(item)) && (
        <View style={[styles.friendBadge, { backgroundColor: '#10B98115' }]}>
          <Text style={{ fontSize: 12, color: '#10B981', fontWeight: '600' }}>Bạn bè</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.tint + '15' }]}>
        <Ionicons name="people-outline" size={48} color={colors.tint} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có bạn bè</Text>
      <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
        Tìm kiếm bạn bè bằng username hoặc email
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={{ marginTop: 12, color: colors.muted }}>Đang tải...</Text>
      </View>
    );
  }

  const showSearchResults = searchQuery.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <RNView style={[styles.searchContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <RNView style={[styles.searchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            placeholder="Tìm bạn bè (username, email)..."
            placeholderTextColor={colors.muted}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </RNView>
      </RNView>

      {showSearchResults ? (
        /* Search Results */
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => getUserId(item) || `search-${index}`}
          renderItem={({ item }) => renderUserItem(item, false)}
          ListEmptyComponent={
            isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.tint} />
              </View>
            ) : (
              <View style={[styles.emptyContainer, { paddingTop: 60 }]}>
                <Text style={{ color: colors.muted }}>Không tìm thấy kết quả</Text>
              </View>
            )
          }
          contentContainerStyle={searchResults.length === 0 ? { flex: 1 } : { paddingVertical: 8 }}
          ItemSeparatorComponent={() => (
            <RNView style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 80 }} />
          )}
        />
      ) : (
        /* Friends List */
        <FlatList
          data={friends}
          keyExtractor={(item, index) => getUserId(item) || `friend-${index}`}
          renderItem={({ item }) => renderUserItem(item, true)}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
          }
          contentContainerStyle={friends.length === 0 ? { flex: 1 } : { paddingVertical: 8 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            friends.length > 0 ? (
              <RNView style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.muted }}>
                  {friends.length} bạn bè
                </Text>
              </RNView>
            ) : null
          }
          ItemSeparatorComponent={() => (
            <RNView style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 80 }} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },

  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 14 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },

  onlineBadge: { marginRight: 8 },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },

  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  friendBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
