// hooks/useSocket.ts
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectAttemptRef = useRef(0);
  const isMountedRef = useRef(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    const token = Cookies.get("token");
    if (!token) {
      // No token, don't connect
      return;
    }

    // Clean up any existing socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    try {
      const newSocket = io(API_BASE, {
        transports: ["polling", "websocket"], // polling first — always works on mobile/proxies
        upgrade: true,                         // then upgrade to websocket if available
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 20000,                        // longer timeout for slow mobile networks
        forceNew: true,
      });

      socketRef.current = newSocket;

      newSocket.on("connect", () => {
        if (!isMountedRef.current) return;
        console.log("Socket connected:", newSocket.id);
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptRef.current = 0;
        
        // Request online users list
        newSocket.emit("get-online-users");
      });

      newSocket.on("disconnect", (reason) => {
        if (!isMountedRef.current) return;
        console.log("Socket disconnected:", reason);
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        if (!isMountedRef.current) return;
        console.error("Socket connection error:", error);
        reconnectAttemptRef.current += 1;
        
        if (reconnectAttemptRef.current >= 5) {
          setConnectionError("Unable to connect to server. Some features may be unavailable.");
        }
      });

      // Listen for online/offline events
      newSocket.on("user-online", (userId: string) => {
        if (!isMountedRef.current) return;
        setOnlineUsers((prev) => {
          if (!prev.includes(userId)) {
            return [...prev, userId];
          }
          return prev;
        });
      });

      newSocket.on("user-offline", (userId: string) => {
        if (!isMountedRef.current) return;
        setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      });

      newSocket.on("online-users", (users: string[]) => {
        if (!isMountedRef.current) return;
        setOnlineUsers(users);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error("Failed to create socket connection:", error);
      setConnectionError("Failed to initialize connection.");
    }

    return () => {
      isMountedRef.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Join user's personal room for notifications
  const joinUserRoom = useCallback((userId: string) => {
    if (socket && isConnected && isMountedRef.current) {
      socket.emit("join", userId);
      console.log(`Joined room for user: ${userId}`);
    }
  }, [socket, isConnected]);

  // Leave user's room
  const leaveUserRoom = useCallback((userId: string) => {
    if (socket && isConnected && isMountedRef.current) {
      socket.emit("leave", userId);
      console.log(`Left room for user: ${userId}`);
    }
  }, [socket, isConnected]);

  // Subscribe to notification events
  const onNotification = useCallback((callback: (notification: any) => void) => {
    if (!socket || !isMountedRef.current) return () => {};
    
    socket.on("notification", callback);
    return () => {
      if (socket && isMountedRef.current) {
        socket.off("notification", callback);
      }
    };
  }, [socket]);

  // Subscribe to unread count events
  const onUnreadCount = useCallback((callback: (count: number) => void) => {
    if (!socket || !isMountedRef.current) return () => {};
    
    socket.on("unread-count", callback);
    return () => {
      if (socket && isMountedRef.current) {
        socket.off("unread-count", callback);
      }
    };
  }, [socket]);

  // Subscribe to new message events
  const onNewMessage = useCallback((callback: (message: any) => void) => {
    if (!socket || !isMountedRef.current) return () => {};
    
    socket.on("new-message", callback);
    return () => {
      if (socket && isMountedRef.current) {
        socket.off("new-message", callback);
      }
    };
  }, [socket]);

  // Subscribe to typing events
  const onTyping = useCallback((callback: (data: { fromUserId: string }) => void) => {
    if (!socket || !isMountedRef.current) return () => {};
    
    socket.on("typing", callback);
    return () => {
      if (socket && isMountedRef.current) {
        socket.off("typing", callback);
      }
    };
  }, [socket]);

  // Subscribe to stop typing events
  const onStopTyping = useCallback((callback: (data: { fromUserId: string }) => void) => {
    if (!socket || !isMountedRef.current) return () => {};
    
    socket.on("stop-typing", callback);
    return () => {
      if (socket && isMountedRef.current) {
        socket.off("stop-typing", callback);
      }
    };
  }, [socket]);

  // Subscribe to messages read events
  const onMessagesRead = useCallback((callback: (data: { byUserId: string; timestamp: string }) => void) => {
    if (!socket || !isMountedRef.current) return () => {};
    
    socket.on("messages-read", callback);
    return () => {
      if (socket && isMountedRef.current) {
        socket.off("messages-read", callback);
      }
    };
  }, [socket]);

  // Emit typing indicator
  const emitTyping = useCallback((toUserId: string, fromUserId: string) => {
    if (socket && isConnected && isMountedRef.current) {
      socket.emit("typing", { toUserId, fromUserId });
    }
  }, [socket, isConnected]);

  // Emit stop typing indicator
  const emitStopTyping = useCallback((toUserId: string, fromUserId: string) => {
    if (socket && isConnected && isMountedRef.current) {
      socket.emit("stop-typing", { toUserId, fromUserId });
    }
  }, [socket, isConnected]);

  // Emit mark as read
  const emitMarkAsRead = useCallback((conversationUserId: string, currentUserId: string) => {
    if (socket && isConnected && isMountedRef.current) {
      socket.emit("mark-read", { conversationUserId, currentUserId });
    }
  }, [socket, isConnected]);

  // Check if user is online
  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.includes(userId);
  }, [onlineUsers]);

  return {
    socket,
    isConnected,
    onlineUsers,
    connectionError,
    joinUserRoom,
    leaveUserRoom,
    onNotification,
    onUnreadCount,
    onNewMessage,
    onTyping,
    onStopTyping,
    onMessagesRead,
    emitTyping,
    emitStopTyping,
    emitMarkAsRead,
    isUserOnline,
  };
};

export default useSocket;
