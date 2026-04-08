// ============================================================
// Chat Types - Khớp 1:1 với Backend Models
// Conversation, Message, Friend
// ============================================================

/** Loại conversation */
export type ConversationType = 'direct' | 'group';

/** Trạng thái tin nhắn phía client */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

// --- Sub-types ---

/** User info khi được populate */
export interface UserInfo {
  _id: string;
  username: string;
  email?: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  lastSeen?: string | null;
}

/** Sender info khi populate senderId */
export interface SenderInfo {
  _id: string;
  username: string;
  avatarUrl?: string | null;
}

// --- Core Models ---

/** Backend Conversation model */
export interface Conversation {
  _id: string;
  type: ConversationType;
  name?: string | null;
  participants: UserInfo[];
  createdBy: string;
  lastMessageAt?: string | null;
  createdAt: string;
  updatedAt: string;
  /** Injected by backend list endpoint */
  latestMessage?: Message | null;
}

export interface Reaction {
  userId: string;
  emoji: string;
}

/** Backend Message model */
export interface Message {
  _id: string;
  conversationId: string;
  senderId: SenderInfo;
  content: string;
  mediaIds: string[];
  replyTo?: Message | string | null;
  forwardFrom?: Message | string | null;
  deliveredTo: string[];
  seenBy: string[];
  isRecalled?: boolean;
  deletedBy?: string[];
  reactions?: Reaction[];
  createdAt: string;
  updatedAt: string;
  /** Client-only */
  status?: MessageStatus;
}

/** Backend FriendRequest model */
export interface FriendRequest {
  _id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  respondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- API Payloads ---

/** POST /messages/send body */
export interface SendMessagePayload {
  conversationId: string;
  content?: string;
  mediaIds?: string[];
  replyTo?: string;
  forwardFrom?: string;
}

/** POST /conversations body */
export interface CreateConversationPayload {
  type: ConversationType;
  name?: string;
  participantIds: string[];
}

/** POST /friends/request body */
export interface SendFriendRequestPayload {
  toUserId: string;
}

// --- API Responses ---

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Cursor-based pagination for messages */
export interface CursorPaginatedMessages {
  items: Message[];
  nextCursor: string | null;
  limit: number;
}

/** GET /messages/conversation/:id params */
export interface GetMessagesParams {
  conversationId: string;
  limit?: number;
  cursor?: string;
}

/** Conversation list item for display */
export interface ConversationListItem extends Conversation {
  /** Computed display name for the conversation */
  displayName?: string;
  /** Computed avatar */
  displayAvatar?: string | null;
}
