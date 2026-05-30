// app/(app)/notifications/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  Package,
  ArrowRightLeft,
  AlertCircle,
  MessageCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Notification, decideBarter, getNotifications } from "@/lib/notificationService";
import Link from "next/link";
import Image from "next/image";
import { getImageSrc } from "@/lib/getImageSrc";

type NotificationType = "all" | "barter_request" | "barter_approved" | "barter_declined" | "message";
type ReadStatus = "all" | "read" | "unread";

export default function NotificationsPage() {
  const {
    notifications: contextNotifications,
    unreadCount,
    isLoading: contextLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isConnected,
  } = useNotifications();

  // Local state for pagination and filtering
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState<NotificationType>("all");
  const [readFilter, setReadFilter] = useState<ReadStatus>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch notifications with filters
  const fetchNotificationsData = useCallback(async (pageNum: number = 1) => {
    setIsLoading(true);
    try {
      const response = await getNotifications(pageNum, 10);
      let filtered = response.notifications;

      // Apply type filter
      if (typeFilter !== "all") {
        filtered = filtered.filter((n) => n.type === typeFilter);
      }

      // Apply read status filter
      if (readFilter === "read") {
        filtered = filtered.filter((n) => n.isRead);
      } else if (readFilter === "unread") {
        filtered = filtered.filter((n) => !n.isRead);
      }

      setNotifications(filtered);
      setTotalPages(response.pagination.pages);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, readFilter]);

  useEffect(() => {
    fetchNotificationsData(page);
  }, [page, fetchNotificationsData]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    fetchNotificationsData(1);
  }, [typeFilter, readFilter]);

  // Get notification icon based on type
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "barter_request":
        return <ArrowRightLeft className="w-5 h-5 text-brand-400" />;
      case "barter_approved":
        return <Check className="w-5 h-5 text-green-400" />;
      case "barter_declined":
        return <X className="w-5 h-5 text-red-400" />;
      case "message":
        return <MessageCircle className="w-5 h-5 text-blue-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
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
    try {
      await decideBarter(barterId, decision);
      fetchNotificationsData(page);
    } catch (error) {
      console.error("Error making decision:", error);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n._id));
    }
  };

  // Handle individual select
  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteNotification(id)));
      setSelectedIds([]);
      fetchNotificationsData(page);
    } catch (error) {
      console.error("Error deleting notifications:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle bulk mark as read
  const handleBulkMarkRead = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map((id) => markAsRead(id)));
      setSelectedIds([]);
      fetchNotificationsData(page);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-20 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-brand-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Notifications</h1>
                <p className="text-sm text-white/60">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                </p>
              </div>
            </div>
            {/* Connection indicator */}
            <span
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                isConnected
                  ? "bg-green-500/20 text-green-400"
                  : "bg-slate-500/20 text-slate-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-400" : "bg-slate-400"
                }`}
              />
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/40" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as NotificationType)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Types</option>
                <option value="barter_request">Barter Requests</option>
                <option value="barter_approved">Approved</option>
                <option value="barter_declined">Declined</option>
                <option value="message">Messages</option>
              </select>
            </div>

            {/* Read Status Filter */}
            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value as ReadStatus)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Selection Actions */}
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center justify-between p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl"
          >
            <span className="text-sm text-brand-300">
              {selectedIds.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkMarkRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark read
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Delete
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Notifications List */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-white/40">
              <Bell className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm mt-1">
                {typeFilter !== "all" || readFilter !== "all"
                  ? "Try adjusting your filters"
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <input
                  type="checkbox"
                  checked={selectedIds.length === notifications.length && notifications.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
                />
                <span className="text-sm text-white/60">Select all</span>
              </div>

              {/* Notification Items */}
              <AnimatePresence mode="popLayout">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative flex items-start gap-4 px-4 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
                      !notification.isRead ? "bg-brand-500/5" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(notification._id)}
                      onChange={() => handleSelect(notification._id)}
                      className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
                    />

                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <span className="absolute left-8 top-1/2 -translate-y-1/2 w-2 h-2 bg-brand-500 rounded-full" />
                    )}

                    {/* Icon or Product Image */}
                    {notification.productRequestedId?.images?.[0] ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={getImageSrc(notification.productRequestedId.images[0])}
                          alt=""
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-base font-medium text-white">
                            {notification.title}
                          </p>
                          <p className="text-sm text-white/60 mt-0.5">
                            {notification.message}
                          </p>
                        </div>
                        <span className="text-xs text-white/40 whitespace-nowrap">
                          {timeAgo(notification.createdAt)}
                        </span>
                      </div>

                      {/* Action buttons for barter requests */}
                      {notification.type === "barter_request" && notification.barterId && (
                        <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const barterId = typeof notification.barterId === 'string' 
                                ? notification.barterId 
                                : notification.barterId!._id;
                              handleDecision(e, barterId, "approved");
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                          >
                            <Check className="w-4 h-4" />
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
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Decline
                          </button>
                        </div>
                      )}

                      {/* Chat links */}
                      {notification.sender && (
                        <Link
                          href={`/messages?userId=${notification.sender._id || notification.sender}`}
                          className="inline-flex items-center gap-1.5 mt-3 text-sm text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {notification.type === "message" ? "Reply" : "Chat"}
                        </Link>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4 text-white/40 hover:text-brand-400" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t border-white/5">
                  <span className="text-sm text-white/40">
                    Showing {notifications.length} of {total}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5 text-white/60" />
                    </button>
                    <span className="text-sm text-white/60">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5 text-white/60" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
