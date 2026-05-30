"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, User, Search, Loader2, ArrowLeft, Users, MessageSquare } from "lucide-react";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import { getConversations, getAllUsers, type Conversation, type UserDirectory } from "@/lib/messageService";
import Chat from "@/components/Chat";
import SectionBackground from "@/components/SectionBackground";

interface CurrentUser {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

// Interface for a new conversation user (not in existing conversations)
interface NewConversationUser {
  _id: string;
  username: string;
  isNew: true;
}

type TabType = "conversations" | "users";

function MessagesContent() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allUsers, setAllUsers] = useState<UserDirectory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newChatUser, setNewChatUser] = useState<NewConversationUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("conversations");

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
  }, []);

  const token = Cookies.get("token");
  const searchParams = useSearchParams();
  const userIdFromUrl = searchParams.get("userId");

  useEffect(() => {
    if (!mountedRef.current) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mountedRef.current) {
      setPrefersReducedMotion(mediaQuery.matches);
    }

    const handleChange = (e: MediaQueryListEvent) => {
      if (mountedRef.current) {
        setPrefersReducedMotion(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Fetch current user
  useEffect(() => {
    if (!mountedRef.current) return;

    const fetchCurrentUser = async () => {
      if (!token || !mountedRef.current) return;

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok && mountedRef.current) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, [token]);

  // Fetch conversations
  useEffect(() => {
    if (!mountedRef.current) return;

    const fetchConversations = async () => {
      if (!token || !mountedRef.current) return;

      if (mountedRef.current) {
        setIsLoading(true);
      }
      try {
        const response = await getConversations(token);
        if (mountedRef.current) {
          setConversations(response.data);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchConversations();
  }, [token]);

  // Fetch all users when the users tab is active
  useEffect(() => {
    if (!mountedRef.current) return;

    const fetchUsers = async () => {
      if (!token || activeTab !== "users" || !mountedRef.current) return;

      if (mountedRef.current) {
        setIsLoadingUsers(true);
      }
      try {
        const response = await getAllUsers(token, { search: userSearchQuery || undefined });
        if (mountedRef.current) {
          setAllUsers(response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        if (mountedRef.current) {
          setIsLoadingUsers(false);
        }
      }
    };

    fetchUsers();
  }, [token, activeTab, userSearchQuery]);

  // Handle userId from URL - auto-select or create conversation
  useEffect(() => {
    if (!mountedRef.current) return;
    if (!userIdFromUrl || isLoading || conversations.length === 0) return;

    const existingConversation = conversations.find(
      (conv) => conv.user._id === userIdFromUrl
    );

    if (existingConversation) {
      if (mountedRef.current) {
        setSelectedConversation(existingConversation);
        setNewChatUser(null);
      }
    } else {
      const fetchUserInfo = async () => {
        if (!mountedRef.current) return;

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5001";
          const response = await fetch(`${API_URL}/api/users/${userIdFromUrl}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok && mountedRef.current) {
            const userData = await response.json();
            setNewChatUser({
              _id: userIdFromUrl,
              username: userData.username || "User",
              isNew: true,
            });
            setSelectedConversation(null);
          } else if (mountedRef.current) {
            setNewChatUser({
              _id: userIdFromUrl,
              username: "User",
              isNew: true,
            });
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
          if (mountedRef.current) {
            setNewChatUser({
              _id: userIdFromUrl,
              username: "User",
              isNew: true,
            });
          }
        }
      };

      fetchUserInfo();
    }
  }, [userIdFromUrl, conversations, isLoading, token]);

  // Filter conversations by search query
  const filteredConversations = conversations.filter((conv) =>
    conv.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
  );

  // Handle selecting a user from the all users list
  const handleSelectUser = (user: UserDirectory) => {
    if (!mountedRef.current) return;

    const existingConversation = conversations.find(
      (conv) => conv.user._id === user._id
    );

    if (existingConversation) {
      if (mountedRef.current) {
        setSelectedConversation(existingConversation);
        setNewChatUser(null);
      }
    } else {
      if (mountedRef.current) {
        setNewChatUser({
          _id: user._id,
          username: user.username,
          isNew: true,
        });
        setSelectedConversation(null);
      }
    }
  };

  // Format last message time
  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Get the active chat recipient
  const getActiveRecipient = () => {
    if (selectedConversation) {
      return {
        id: selectedConversation.user._id,
        name: selectedConversation.user.username,
      };
    }
    if (newChatUser) {
      return {
        id: newChatUser._id,
        name: newChatUser.username,
      };
    }
    return null;
  };

  const activeRecipient = getActiveRecipient();

  // Desktop view
  const DesktopView = () => (
    <div className="flex h-[calc(100dvh-220px)] min-h-[400px] rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
      {/* Sidebar with tabs */}
      <div className="w-full md:w-72 lg:w-80 flex-shrink-0 border-r border-white/10 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("conversations")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              activeTab === "conversations"
                ? "text-brand-500 bg-brand-500/10 border-b-2 border-brand-500"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Conversations
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              activeTab === "users"
                ? "text-brand-500 bg-brand-500/10 border-b-2 border-brand-500"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="w-4 h-4" />
            All Users
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              value={activeTab === "conversations" ? searchQuery : userSearchQuery}
              onChange={(e) => {
                if (activeTab === "conversations") {
                  setSearchQuery(e.target.value);
                } else {
                  setUserSearchQuery(e.target.value);
                }
              }}
              placeholder={activeTab === "conversations" ? "Search conversations..." : "Search users..."}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "conversations" ? (
            // Conversations Tab
            <>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                </div>
              ) : filteredConversations.length === 0 && !newChatUser ? (
                <div className="flex flex-col items-center justify-center h-full text-white/50 p-4">
                  <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm text-center mt-2">
                    Switch to "All Users" tab to start a new conversation
                  </p>
                </div>
              ) : (
                <>
                  {/* Show new chat user at top if exists */}
                  {newChatUser && (
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => setSelectedConversation(null)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-brand-500/30 bg-brand-500/10`}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[10px] bg-brand-500 text-white rounded-full">
                          New
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-medium text-white">
                          {newChatUser.username}
                        </h3>
                        <p className="text-sm text-brand-400">
                          Start a new conversation
                        </p>
                      </div>
                    </motion.button>
                  )}

                  {/* Existing conversations */}
                  {filteredConversations.map((conversation) => (
                    <motion.button
                      key={conversation.user._id}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        setNewChatUser(null);
                      }}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors ${
                        selectedConversation?.user._id === conversation.user._id
                          ? "bg-white/10"
                          : ""
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-white">
                            {conversation.user.username}
                          </h3>
                          <span className="text-xs text-white/50">
                            {formatLastMessageTime(conversation.lastMessage.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-white/50 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </>
              )}
            </>
          ) : (
            // Users Tab
            <>
              {isLoadingUsers ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                </div>
              ) : allUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/50 p-4">
                  <Users className="w-16 h-16 mb-4 opacity-50" />
                  <p>No users found</p>
                  <p className="text-sm text-center mt-2">
                    Try adjusting your search query
                  </p>
                </div>
              ) : (
                allUsers.map((user) => {
                  // Check if this user has an existing conversation
                  const existingConv = conversations.find(c => c.user._id === user._id);
                  const isSelected = (selectedConversation?.user._id === user._id) || (newChatUser?._id === user._id);
                  
                  return (
                    <motion.button
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors ${
                        isSelected ? "bg-white/10" : ""
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        {existingConv && existingConv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
                            {existingConv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-white">
                            {user.username}
                          </h3>
                          {existingConv && (
                            <span className="hidden lg:inline text-xs text-brand-400">
                              In conversations
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/50 truncate">
                          {user.email}
                        </p>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1">
        {activeRecipient ? (
          <Chat
            recipientId={activeRecipient.id}
            recipientName={activeRecipient.name}
            currentUserId={currentUser?.id}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/50">
            <MessageCircle className="w-20 h-20 mb-4 opacity-50" />
            <p className="text-lg">Select a conversation</p>
            <p className="text-sm">Choose from your existing conversations or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile view
  const MobileView = () => (
    <div className="h-[calc(100dvh-160px)] min-h-[380px] rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
      <AnimatePresence mode="wait">
        {activeRecipient ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="h-full"
          >
            <Chat
              recipientId={activeRecipient.id}
              recipientName={activeRecipient.name}
              currentUserId={currentUser?.id}
              onBack={() => {
                setSelectedConversation(null);
                setNewChatUser(null);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            className="h-full flex flex-col"
          >
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab("conversations")}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  activeTab === "conversations"
                    ? "text-brand-500 bg-brand-500/10 border-b-2 border-brand-500"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Conversations
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  activeTab === "users"
                    ? "text-brand-500 bg-brand-500/10 border-b-2 border-brand-500"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Users className="w-4 h-4" />
                All Users
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  value={activeTab === "conversations" ? searchQuery : userSearchQuery}
                  onChange={(e) => {
                    if (activeTab === "conversations") {
                      setSearchQuery(e.target.value);
                    } else {
                      setUserSearchQuery(e.target.value);
                    }
                  }}
                  placeholder={activeTab === "conversations" ? "Search conversations..." : "Search users..."}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Content based on active tab */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "conversations" ? (
                // Conversations Tab
                <>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                    </div>
                  ) : filteredConversations.length === 0 && !newChatUser ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/50 p-4">
                      <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                      <p>No conversations yet</p>
                      <p className="text-sm text-center mt-2">
                        Switch to "All Users" tab to start a new conversation
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Show new chat user at top if exists */}
                      {newChatUser && (
                        <motion.button
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-brand-500/30 bg-brand-500/10"
                        >
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[10px] bg-brand-500 text-white rounded-full">
                              New
                            </span>
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-medium text-white">
                              {newChatUser.username}
                            </h3>
                            <p className="text-sm text-brand-400">
                              Start a new conversation
                            </p>
                          </div>
                        </motion.button>
                      )}

                      {/* Existing conversations */}
                      {filteredConversations.map((conversation) => (
                        <motion.button
                          key={conversation.user._id}
                          onClick={() => {
                            setSelectedConversation(conversation);
                            setNewChatUser(null);
                          }}
                          className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5"
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            {conversation.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-white">
                                {conversation.user.username}
                              </h3>
                              <span className="text-xs text-white/50">
                                {formatLastMessageTime(conversation.lastMessage.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-white/50 truncate">
                              {conversation.lastMessage.content}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </>
                  )}
                </>
              ) : (
                // Users Tab
                <>
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                    </div>
                  ) : allUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/50 p-4">
                      <Users className="w-16 h-16 mb-4 opacity-50" />
                      <p>No users found</p>
                      <p className="text-sm text-center mt-2">
                        Try adjusting your search query
                      </p>
                    </div>
                  ) : (
                    allUsers.map((user) => {
                      // Check if this user has an existing conversation
                      const existingConv = conversations.find(c => c.user._id === user._id);
                      const isSelected = (selectedConversation?.user._id === user._id) || (newChatUser?._id === user._id);
                      
                      return (
                        <motion.button
                          key={user._id}
                          onClick={() => handleSelectUser(user)}
                          className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 ${
                            isSelected ? "bg-white/10" : ""
                          }`}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            {existingConv && existingConv.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
                                {existingConv.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-white">
                                {user.username}
                              </h3>
                              {existingConv && (
                                <span className="text-xs text-brand-400">
                                  In conversations
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-white/50 truncate">
                              {user.email}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <section className="relative bg-surface min-h-screen py-6 sm:py-12 md:py-16 px-3 sm:px-6 lg:px-10 overflow-hidden">
      <SectionBackground prefersReducedMotion={prefersReducedMotion} />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-6"
          >
            <MessageCircle className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-medium text-white/80 tracking-wide uppercase">
              Messages
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-5xl font-heading font-bold tracking-tight mb-2 sm:mb-4"
          >
            <span className="bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
              Your
            </span>
            <span className="text-brand-500"> Conversations</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden sm:block text-lg text-white/60 max-w-2xl mx-auto"
          >
            Connect with other traders and discuss your exchanges
          </motion.p>
        </div>

        {/* Desktop view (md and up) */}
        <div className="hidden md:block">
          <DesktopView />
        </div>

        {/* Mobile view (below md) */}
        <div className="md:hidden">
          <MobileView />
        </div>
      </div>
    </section>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="text-white min-h-screen bg-surface px-4 py-12 flex items-center justify-center">Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
