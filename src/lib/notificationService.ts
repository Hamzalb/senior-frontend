// lib/notificationService.ts
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    username: string;
  };
  type: "barter_request" | "barter_approved" | "barter_declined" | "message";
  title: string;
  message: string;
  barterId?: {
    _id: string;
    status: string;
  };
  productId?: {
    _id: string;
    title: string;
    images: string[];
  };
  productOfferedId?: {
    _id: string;
    title: string;
    images: string[];
  };
  productRequestedId?: {
    _id: string;
    title: string;
    images: string[];
  };
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

// Get all notifications for the current user
export const getNotifications = async (
  page: number = 1,
  limit: number = 20
): Promise<NotificationsResponse> => {
  const response = await axios.get(
    `${API_BASE}/api/notifications?page=${page}&limit=${limit}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Get unread notification count
export const getUnreadCount = async (): Promise<{ count: number }> => {
  const response = await axios.get(`${API_BASE}/api/notifications/unread-count`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Mark a notification as read
export const markAsRead = async (
  notificationId: string
): Promise<{ message: string; notification: Notification; unreadCount: number }> => {
  const response = await axios.put(
    `${API_BASE}/api/notifications/${notificationId}/read`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async (): Promise<{ message: string; unreadCount: number }> => {
  const response = await axios.put(
    `${API_BASE}/api/notifications/read-all`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Delete a notification
export const deleteNotification = async (
  notificationId: string
): Promise<{ message: string; unreadCount: number }> => {
  const response = await axios.delete(
    `${API_BASE}/api/notifications/${notificationId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Make a barter decision (approve/decline)
export const decideBarter = async (
  barterId: string,
  decision: "approved" | "declined"
): Promise<{ message: string; barter: any }> => {
  const response = await axios.patch(
    `${API_BASE}/api/barter/${barterId}/decision`,
    { decision },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Get user's barter requests (incoming and outgoing)
export const getMyBarters = async (): Promise<{
  outgoing: any[];
  incoming: any[];
}> => {
  const response = await axios.get(`${API_BASE}/api/barter/my-barters`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
