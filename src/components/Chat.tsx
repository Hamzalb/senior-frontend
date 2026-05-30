"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, User, Loader2, Trash2, Check, CheckCheck, Circle, Repeat, X, Package, Image as ImageIcon } from "lucide-react";
import Cookies from "js-cookie";
import { useSocket } from "@/hooks/useSocket";
import { getConversation, sendMessage, sendMessageWithImage, deleteMessage, markMessagesAsRead, type Message } from "@/lib/messageService";
import axios from "axios";
import { getImageSrc } from "@/lib/getImageSrc";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://dakesh-backend.onrender.com";

interface Product {
  _id: string;
  title: string;
  images: string[];
  category: string;
  owner: string;
}

interface ChatProps {
  recipientId: string;
  recipientName?: string;
  recipientAvatar?: string;
  barterId?: string;
  productId?: string;
  currentUserId?: string;
  onBack?: () => void;
}

export default function Chat({
  recipientId,
  recipientName = "User",
  recipientAvatar,
  barterId,
  productId,
  currentUserId,
  onBack,
}: ChatProps) {
  const mountedRef = useRef(false);
  const token = Cookies.get("token");
  const { socket, isConnected, isUserOnline, onNewMessage, onTyping, onStopTyping, onMessagesRead, emitTyping, emitStopTyping, emitMarkAsRead } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [readStatus, setReadStatus] = useState<Record<string, { read: boolean; readAt?: string }>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRecipientOnline = isUserOnline(recipientId);

  useEffect(() => {
    mountedRef.current = true;
  }, []);
  
  // Trade request state
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [recipientProducts, setRecipientProducts] = useState<Product[]>([]);
  const [selectedMyProduct, setSelectedMyProduct] = useState<Product | null>(null);
  const [selectedRecipientProduct, setSelectedRecipientProduct] = useState<Product | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [tradeMessage, setTradeMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages on mount
  useEffect(() => {
    if (!mountedRef.current) return;
    const fetchMessages = async () => {
      if (!token || !recipientId) return;

      setIsLoading(true);
      try {
        const response = await getConversation(recipientId, token);
        if (!mountedRef.current) return;
        setMessages(response.data);
        
        // Mark messages as read
        await markMessagesAsRead(recipientId, token);
        if (currentUserId && mountedRef.current) {
          emitMarkAsRead(recipientId, currentUserId);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchMessages();
  }, [recipientId, token, currentUserId, emitMarkAsRead]);

  // Load products for trade request
  const loadProductsForTrade = async () => {
    if (!token || !mountedRef.current) return;
    setIsLoadingProducts(true);
    try {
      // Load my products
      const myProductsRes = await axios.get(`${API_BASE}/api/products/my-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!mountedRef.current) return;
      setMyProducts(Array.isArray(myProductsRes.data) ? myProductsRes.data : []);

      // Load recipient's products
      const recipientProductsRes = await axios.get(`${API_BASE}/api/products/user/${recipientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!mountedRef.current) return;
      setRecipientProducts(Array.isArray(recipientProductsRes.data) ? recipientProductsRes.data : []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      if (mountedRef.current) {
        setIsLoadingProducts(false);
      }
    }
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle sending trade request
  const handleSendTradeRequest = async () => {
    if (!token || !selectedMyProduct || !selectedRecipientProduct || !mountedRef.current) return;
    
    setIsSending(true);
    try {
      const defaultMsg = `I want to trade my "${selectedMyProduct.title}" for your "${selectedRecipientProduct.title}"`;
      const response = await sendMessageWithImage({
        recipientId,
        content: tradeMessage || defaultMsg,
        messageType: 'trade_request',
        offeredProductId: selectedMyProduct._id,
        requestedProductId: selectedRecipientProduct._id,
        image: selectedImage || undefined,
      }, token);

      if (!mountedRef.current) return;
      setMessages((prev) => [...prev, response.data]);
      setShowTradeModal(false);
      setSelectedMyProduct(null);
      setSelectedRecipientProduct(null);
      setTradeMessage("");
      setSelectedImage(null);
      setImagePreview(null);
      
      // Stop typing indicator
      if (currentUserId && mountedRef.current) {
        emitStopTyping(recipientId, currentUserId);
      }
    } catch (error) {
      console.error("Error sending trade request:", error);
    } finally {
      if (mountedRef.current) {
        setIsSending(false);
      }
    }
  };

  // Open trade modal
  const openTradeModal = () => {
    setShowTradeModal(true);
    loadProductsForTrade();
  };

  // Scroll to bottom when messages change (only within the chat container)
  useEffect(() => {
    if (!mountedRef.current) return;
    if (messagesContainerRef.current) {
      // Scroll the messages container to the bottom, not the entire page
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Listen for new messages via socket
  useEffect(() => {
    if (!mountedRef.current) return;
    const unsubscribe = onNewMessage((message: Message) => {
      if (!mountedRef.current) return;
      if (message.sender._id === recipientId || message.recipient._id === recipientId) {
        setMessages((prev) => [...prev, message]);
        
        // Mark as read if we're viewing this conversation
        if (message.sender._id === recipientId && token) {
          markMessagesAsRead(recipientId, token);
          if (currentUserId && mountedRef.current) {
            emitMarkAsRead(recipientId, currentUserId);
          }
        }
      }
    });

    return unsubscribe;
  }, [onNewMessage, recipientId, token, currentUserId, emitMarkAsRead]);

  // Listen for typing events
  useEffect(() => {
    if (!mountedRef.current) return;
    const unsubscribeTyping = onTyping(({ fromUserId }) => {
      if (!mountedRef.current) return;
      if (fromUserId === recipientId) {
        setIsTyping(true);
        // Clear typing indicator after 3 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setIsTyping(false);
          }
        }, 3000);
      }
    });

    const unsubscribeStopTyping = onStopTyping(({ fromUserId }) => {
      if (!mountedRef.current) return;
      if (fromUserId === recipientId) {
        setIsTyping(false);
      }
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      unsubscribeTyping();
      unsubscribeStopTyping();
    };
  }, [onTyping, onStopTyping, recipientId]);

  // Listen for read receipts
  useEffect(() => {
    if (!mountedRef.current) return;
    const unsubscribe = onMessagesRead(({ byUserId, timestamp }) => {
      if (!mountedRef.current) return;
      if (byUserId === recipientId && currentUserId) {
        // Mark all our messages as read
        setReadStatus((prev) => {
          const newStatus = { ...prev };
          messages.forEach((msg) => {
            if (msg.sender._id === currentUserId) {
              newStatus[msg._id] = { read: true, readAt: timestamp };
            }
          });
          return newStatus;
        });
      }
    });

    return unsubscribe;
  }, [onMessagesRead, recipientId, messages, currentUserId]);

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !token || isSending || !mountedRef.current) return;

    setIsSending(true);
    try {
      const response = await sendMessage({
        recipientId,
        content: newMessage.trim(),
        barterId,
        productId,
      }, token);

      if (!mountedRef.current) return;
      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
      
      // Stop typing indicator
      if (currentUserId && mountedRef.current) {
        emitStopTyping(recipientId, currentUserId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      if (mountedRef.current) {
        setIsSending(false);
      }
    }
  };

  // Handle typing indicator
  const handleInputChange = useCallback((value: string) => {
    setNewMessage(value);
    if (!currentUserId) return;
    
    if (value.length > 0) {
      emitTyping(recipientId, currentUserId);
    } else {
      emitStopTyping(recipientId, currentUserId);
    }
  }, [emitTyping, emitStopTyping, recipientId, currentUserId]);

  // Handle delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!token || !mountedRef.current) return;

    try {
      await deleteMessage(messageId, token);
      if (!mountedRef.current) return;
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { date: string; messages: Message[] }[], message) => {
    const date = formatDate(message.createdAt);
    const existingGroup = groups.find((g) => g.date === date);
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groups.push({ date, messages: [message] });
    }
    return groups;
  }, []);

  // Check if message was read
  const isMessageRead = (messageId: string) => {
    return readStatus[messageId]?.read ?? false;
  };

  // Check if message is from current user
  const isOwnMessage = (message: Message) => {
    return currentUserId && message.sender._id === currentUserId;
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-surface/80 backdrop-blur-xl">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        )}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            {recipientAvatar ? (
              <img
                src={recipientAvatar}
                alt={recipientName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            {/* Online status indicator */}
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface ${
              isRecipientOnline ? "bg-emerald-500" : "bg-gray-500"
            }`} />
          </div>
          <div>
            <h2 className="font-semibold text-white">{recipientName}</h2>
            <p className="text-xs text-white/50 flex items-center gap-1.5">
              {isRecipientOnline ? (
                <>
                  <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                  Online
                </>
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/50">
            <User className="w-16 h-16 mb-4 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 text-xs text-white/50 bg-white/5 rounded-full">
                  {group.date}
                </span>
              </div>

              {/* Messages */}
              {group.messages.map((message) => {
                const isOwn = isOwnMessage(message);
                const wasRead = isOwn && isMessageRead(message._id);
                const isTradeRequest = message.messageType === 'trade_request';
                const hasImage = !!message.imageUrl;
                
                return (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}
                  >
                    <div
                      className={`relative group max-w-[85%] sm:max-w-[70%] px-4 py-2 rounded-2xl ${
                        isTradeRequest
                          ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
                          : isOwn
                          ? "bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-br-md"
                          : "bg-white/10 text-white rounded-bl-md"
                      }`}
                    >
                      {/* Trade request header */}
                      {isTradeRequest && (
                        <div className="flex items-center gap-2 mb-2 text-amber-400">
                          <Repeat className="w-4 h-4" />
                          <span className="text-xs font-semibold">Trade Request</span>
                        </div>
                      )}
                      
                      {/* Product images for trade request */}
                      {isTradeRequest && message.offeredProductId && message.requestedProductId && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex flex-col items-center flex-1 min-w-0">
                            <img
                              src={getImageSrc(message.offeredProductId.images?.[0])}
                              alt={message.offeredProductId.title}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-white/20 w-full"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                            />
                            <span className="text-[10px] text-white/70 mt-1 truncate w-full text-center">{message.offeredProductId.title}</span>
                          </div>
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <Repeat className="w-3 h-3 text-amber-400" />
                          </div>
                          <div className="flex flex-col items-center flex-1 min-w-0">
                            <img
                              src={getImageSrc(message.requestedProductId.images?.[0])}
                              alt={message.requestedProductId.title}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-white/20 w-full"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                            />
                            <span className="text-[10px] text-white/70 mt-1 truncate w-full text-center">{message.requestedProductId.title}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Image message */}
                      {hasImage && !isTradeRequest && (
                        <img 
                          src={message.imageUrl || (message as any).image} 
                          alt="Shared image"
                          className="max-w-full rounded-lg mb-2"
                        />
                      )}
                      
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? "justify-end" : ""}`}>
                        <span className={`text-xs ${isOwn ? "text-white/70" : "text-white/50"}`}>
                          {formatTime(message.createdAt)}
                        </span>
                        {/* Read receipt for own messages */}
                        {isOwn && (
                          wasRead ? (
                            <CheckCheck className="w-3.5 h-3.5 text-brand-300" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-white/50" />
                          )
                        )}
                      </div>

                      {/* Delete button for own messages */}
                      {isOwn && (
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="absolute -right-2 -top-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 px-4 py-2 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="px-2 py-2 sm:px-4 sm:py-3 border-t border-white/10 bg-surface/80 backdrop-blur-xl">
        {/* Image preview strip */}
        {imagePreview && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-white/20" />
              <button type="button" onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
            <span className="text-xs text-white/40">Image attached</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Trade request button */}
          <button
            type="button"
            onClick={openTradeModal}
            className="p-2 sm:p-2.5 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors flex-shrink-0"
            title="Send Trade Request"
          >
            <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Image upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 sm:p-2.5 rounded-full bg-white/5 text-white/70 hover:bg-white/10 transition-colors flex-shrink-0"
            title="Send Image"
          >
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

          <input
            type="text"
            value={newMessage}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-full px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-white/40 focus:outline-none focus:border-brand-500 transition-colors"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={(!newMessage.trim() && !selectedImage) || isSending}
            className="p-2 sm:p-2.5 rounded-full bg-gradient-to-r from-brand-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-brand-500/25 transition-all flex-shrink-0"
          >
            {isSending ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </form>

      {/* Trade Request Modal */}
      <AnimatePresence>
        {showTradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setShowTradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-white/10 rounded-t-3xl sm:rounded-2xl p-4 sm:p-6 w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-amber-400" />
                  Send Trade Request
                </h2>
                <button
                  onClick={() => setShowTradeModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Your product */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-3">Your Product (What you offer)</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {myProducts.length === 0 ? (
                        <p className="text-white/50 col-span-full text-center py-4">You have no products available for trade</p>
                      ) : (
                        myProducts.map((product) => (
                          <button
                            key={product._id}
                            onClick={() => setSelectedMyProduct(product)}
                            className={`p-3 rounded-xl border transition-all ${
                              selectedMyProduct?._id === product._id
                                ? "border-amber-500 bg-amber-500/20"
                                : "border-white/10 hover:border-white/30"
                            }`}
                          >
                            <img
                              src={getImageSrc(product.images?.[0])}
                              alt={product.title}
                              className="w-full h-16 sm:h-20 object-cover rounded-lg mb-1.5"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                            />
                            <p className="text-xs sm:text-sm text-white truncate">{product.title}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recipient's product */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-3">Their Product (What you want)</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {recipientProducts.length === 0 ? (
                        <p className="text-white/50 col-span-full text-center py-4">This user has no products available for trade</p>
                      ) : (
                        recipientProducts.map((product) => (
                          <button
                            key={product._id}
                            onClick={() => setSelectedRecipientProduct(product)}
                            className={`p-3 rounded-xl border transition-all ${
                              selectedRecipientProduct?._id === product._id
                                ? "border-amber-500 bg-amber-500/20"
                                : "border-white/10 hover:border-white/30"
                            }`}
                          >
                            <img
                              src={getImageSrc(product.images?.[0])}
                              alt={product.title}
                              className="w-full h-16 sm:h-20 object-cover rounded-lg mb-1.5"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                            />
                            <p className="text-xs sm:text-sm text-white truncate">{product.title}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-3">Message (optional)</h3>
                    <textarea
                      value={tradeMessage}
                      onChange={(e) => setTradeMessage(e.target.value)}
                      placeholder="Add a message to your trade request..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-brand-500 resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Image upload */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-3">Additional Image (optional)</h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                      >
                        <ImageIcon className="w-5 h-5 text-white/70" />
                        <span className="text-sm text-white/70">Upload Image</span>
                      </button>
                      {imagePreview && (
                        <div className="relative">
                          <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                          <button
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview(null);
                            }}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Send button */}
                  <button
                    onClick={handleSendTradeRequest}
                    disabled={!selectedMyProduct || !selectedRecipientProduct || isSending}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Repeat className="w-5 h-5" />
                        Send Trade Request
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
