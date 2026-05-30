// lib/messageService.ts
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

export interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    email: string;
    profileImage?: string;
  };
  recipient: {
    _id: string;
    username: string;
    email: string;
    profileImage?: string;
  };
  content: string;
  imageUrl?: string;
  messageType: 'text' | 'trade_request' | 'image';
  offeredProductId?: {
    _id: string;
    title: string;
    images: string[];
    category: string;
  };
  requestedProductId?: {
    _id: string;
    title: string;
    images: string[];
    category: string;
  };
  barterId?: string;
  productId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  user: {
    _id: string;
    username: string;
    email: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

export interface UserDirectory {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface UsersListResponse {
  message: string;
  data: UserDirectory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SendMessageParams {
  recipientId: string;
  content: string;
  barterId?: string;
  productId?: string;
  messageType?: 'text' | 'trade_request' | 'image';
  offeredProductId?: string;
  requestedProductId?: string;
}

export interface SendMessageWithImageParams extends SendMessageParams {
  image?: File;
}

// Send a new message
export const sendMessage = async (
  params: SendMessageParams,
  token: string
): Promise<{ message: string; data: Message }> => {
  const response = await axios.post(
    `${API_BASE}/api/messages`,
    params,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Send a message with image (for trade requests with product image)
export const sendMessageWithImage = async (
  params: SendMessageWithImageParams,
  token: string
): Promise<{ message: string; data: Message }> => {
  const formData = new FormData();
  formData.append('recipientId', params.recipientId);
  formData.append('content', params.content || '');
  if (params.messageType) formData.append('messageType', params.messageType);
  if (params.offeredProductId) formData.append('offeredProductId', params.offeredProductId);
  if (params.requestedProductId) formData.append('requestedProductId', params.requestedProductId);
  if (params.barterId) formData.append('barterId', params.barterId);
  if (params.productId) formData.append('productId', params.productId);
  if (params.image) formData.append('image', params.image);

  const response = await axios.post(
    `${API_BASE}/api/messages`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Get conversation with a specific user
export const getConversation = async (
  userId: string,
  token: string,
  options?: { limit?: number; skip?: number }
): Promise<{ message: string; data: Message[]; count: number }> => {
  const params = new URLSearchParams();
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.skip) params.append("skip", options.skip.toString());

  const response = await axios.get(
    `${API_BASE}/api/messages/conversation/${userId}?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Get all conversations for current user
export const getConversations = async (
  token: string
): Promise<{ message: string; data: Conversation[]; count: number }> => {
  const response = await axios.get(
    `${API_BASE}/api/messages/conversations`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Get unread messages count
export const getUnreadMessageCount = async (
  token: string
): Promise<{ message: string; unreadCount: number }> => {
  const response = await axios.get(
    `${API_BASE}/api/messages/unread-count`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Mark messages as read in a conversation
export const markMessagesAsRead = async (
  userId: string,
  token: string
): Promise<{ message: string; modifiedCount: number }> => {
  const response = await axios.put(
    `${API_BASE}/api/messages/mark-read/${userId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Delete a message
export const deleteMessage = async (
  messageId: string,
  token: string
): Promise<{ message: string }> => {
  const response = await axios.delete(
    `${API_BASE}/api/messages/${messageId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Get all users for directory
export const getAllUsers = async (
  token: string,
  options?: { search?: string; page?: number; limit?: number }
): Promise<UsersListResponse> => {
  const params = new URLSearchParams();
  if (options?.search) params.append('search', options.search);
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());

  const response = await axios.get(
    `${API_BASE}/api/users?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
