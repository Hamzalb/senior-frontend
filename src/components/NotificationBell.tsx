// components/NotificationBell.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Trash2, X, Package, ArrowRightLeft, AlertCircle, MessageCircle } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Notification } from "@/lib/notificationService";
import { decideBarter } from "@/lib/notificationService";
import Link from "next/link";
import Image from "next/image";
import { getImageSrc } from "@/lib/getImageSrc";

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    isConnected,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!mountedRef.current) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (mountedRef.current) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "barter_request":
        return <ArrowRightLeft className="w-4 h-4 text-brand-400" />;
      case "barter_approved":
        return <Check className="w-4 h-4 text-green-400" />;
      case "barter_declined":
        return <X className="w-4 h-4 text-red-400" />;
      case "message":
        return <MessageCircle className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  // Format time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Handle barter decision
  const handleDecision = async (
    e: React.MouseEvent,
    barterId: string,
    decision: "approved" | "declined"
  ) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!mountedRef.current) return;
    
    try {
      await decideBarter(barterId, decision);
      if (mountedRef.current) {
        await fetchNotifications();
      }
    } catch (error) {
      if (mountedRef.current) {
        console.error("Error making decision:", error);
      }
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white/80" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-brand-500 text-white text-[10px] font-bold rounded-full px-1"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}

        {/* Connection indicator */}
        <span
          className={`absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-slate-500"
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-white/40">
                  <Bell className="w-8 h-8 mb-2" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`relative px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group ${
                      !notification.isRead ? "bg-brand-500/5" : ""
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification._id);
                      }
                    }}
                  >
                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-500 rounded-full" />
                    )}

                    <div className="flex gap-3">
                      {/* Icon or Product Image */}
                      {notification.productRequestedId?.images?.[0] ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={getImageSrc(notification.productRequestedId.images[0])}
                            alt=""
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white line-clamp-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-white/60 line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-white/40 mt-1">
                          {timeAgo(notification.createdAt)}
                        </p>

                        {/* Action buttons for barter requests */}
                        {notification.type === "barter_request" && notification.barterId && (
                          <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                const barterId = typeof notification.barterId === 'string' 
                                  ? notification.barterId 
                                  : notification.barterId!._id;
                                handleDecision(e, barterId, "approved");
                              }}
                              className="flex-1 px-3 py-1.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                const barterId = typeof notification.barterId === 'string' 
                                  ? notification.barterId 
                                  : notification.barterId!._id;
                                handleDecision(e, barterId, "declined");
                              }}
                              className="flex-1 px-3 py-1.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {/* Chat button for barter requests - allows owner to chat with requester */}
                        {notification.type === "barter_request" && notification.sender && (
                          <Link
                            href={`/messages?userId=${notification.sender._id || notification.sender}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-1.5 mt-2 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Chat with requester
                          </Link>
                        )}

                        {/* Chat button for approved/declined notifications - allows requester to chat with owner */}
                        {(notification.type === "barter_approved" || notification.type === "barter_declined") && notification.sender && (
                          <Link
                            href={`/messages?userId=${notification.sender._id || notification.sender}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-1.5 mt-2 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Chat with owner
                          </Link>
                        )}

                        {/* Chat button for message notifications */}
                        {notification.type === "message" && notification.sender && (
                          <Link
                            href={`/messages?userId=${notification.sender._id || notification.sender}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-1.5 mt-2 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Reply
                          </Link>
                        )}
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-white/10 bg-white/5">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-xs text-brand-400 hover:text-brand-300 transition-colors"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
