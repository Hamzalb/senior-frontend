// contexts/NotificationContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useSocket } from "@/hooks/useSocket";
import {
  Notification,
  getNotifications,
  getUnreadCount,
  markAsRead as markAsReadApi,
  markAllAsRead as markAllAsReadApi,
  deleteNotification as deleteNotificationApi,
} from "@/lib/notificationService";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (page?: number) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  addNotification: () => {},
  isConnected: false,
});

interface NotificationProviderProps {
  children: ReactNode;
}

interface DecodedToken {
  id: string;
  _id?: string;
  userId?: string;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const isMountedRef = useRef(false);

  const { socket, isConnected, joinUserRoom, onNotification, onUnreadCount } = useSocket();

  // Mark as mounted on client side
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Extract user ID from token (JWT uses `id` field)
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const id = decoded.id || decoded._id || decoded.userId || null;
        setUserId(id ?? null);
      } catch (err) {
        console.error("Error decoding token:", err);
        setUserId(null);
      }
    }
  }, []);

  // Join user room when socket connects
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (isConnected && userId) {
      joinUserRoom(userId);
    }
  }, [isConnected, userId, joinUserRoom]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket || !isMountedRef.current) return;

    const cleanupNotification = onNotification((notification: Notification) => {
      if (!isMountedRef.current) return;
      console.log("Received notification:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    const cleanupUnreadCount = onUnreadCount((count: number) => {
      if (!isMountedRef.current) return;
      console.log("Received unread count:", count);
      setUnreadCount(count);
    });

    return () => {
      cleanupNotification();
      cleanupUnreadCount();
    };
  }, [socket, onNotification, onUnreadCount]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page: number = 1) => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await getNotifications(page);
      if (!isMountedRef.current) return;
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      if (isMountedRef.current) {
        setError(err.message || "Failed to fetch notifications");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!isMountedRef.current) return;
    
    try {
      const response = await markAsReadApi(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(response.unreadCount);
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
      if (isMountedRef.current) {
        setError(err.message || "Failed to mark notification as read");
      }
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      await markAllAsReadApi();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err);
      if (isMountedRef.current) {
        setError(err.message || "Failed to mark all notifications as read");
      }
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!isMountedRef.current) return;
    
    try {
      const response = await deleteNotificationApi(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      setUnreadCount(response.unreadCount);
    } catch (err: any) {
      console.error("Error deleting notification:", err);
      if (isMountedRef.current) {
        setError(err.message || "Failed to delete notification");
      }
    }
  }, []);

  // Add notification manually (for local updates)
  const addNotification = useCallback((notification: Notification) => {
    if (!isMountedRef.current) return;
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  // Initial fetch when user is logged in
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const token = Cookies.get("token");
    if (token) {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
        isConnected,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

export default NotificationContext;
