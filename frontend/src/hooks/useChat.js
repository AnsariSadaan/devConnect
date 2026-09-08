import { useEffect, useRef, useState } from "react";
import api from "../utils/axios";
import { useDispatch, useSelector } from "react-redux";
import { createSocketConnection } from "../utils/socket";

import {
  setMessages,
  addMessage,
  updateMessageStatus,
  updateLastMessage,
  incrementUnread,
  clearUnread,
  addOnlineUser,
  removeOnlineUser,
  setTyping,
  clearTyping,
  setUnreadCount,
} from "../utils/chatSlice";

import { moveConnectionToTop } from '../utils/connectionSlice.js';

const useChat = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialFetch, setIsInitialFetch] = useState(true);

  const user = useSelector((store) => store.user);
  const {
      selectedUser,
      selectedChatId
  } = useSelector(store => store.chat);
  const messages = useSelector((store) => store.chat.messages);

  
  // Create socket ONLY ONCE
  useEffect(() => {
    if (!user) return;

    socketRef.current = createSocketConnection();

    // Socket event listeners
    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      // Send user online status
      socket.emit("userOnline", { userId: user._id });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    // Handle online users in chat
    socket.on("userOnlineInChat", ({ userId }) => {
      dispatch(addOnlineUser(userId));
    });

    socket.on("userOffline", ({ userId }) => {
      dispatch(removeOnlineUser(userId));
    });

    // Handle typing indicators
    socket.on("userTyping", ({ userId, chatId }) => {
      dispatch(setTyping({ chatId, userId, isTyping: true }));
    });

    socket.on("userStoppedTyping", ({ userId, chatId }) => {
      dispatch(setTyping({ chatId, userId, isTyping: false }));
    });

    // Handle messages seen
    socket.on("messagesSeen", ({ chatId }) => {
      // Update message statuses to seen for messages from others
      const currentMessages = useSelector((store) => store.chat.messages);
      if (currentMessages.length > 0) {
        const updatedMessages = currentMessages.map(msg =>
          msg.chatId === chatId && msg.senderId !== user._id
            ? { ...msg, status: "seen" }
            : msg
        );
        dispatch(setMessages(updatedMessages));
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("userOnlineInChat");
      socket.off("userOffline");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("messagesSeen");
      socket?.disconnect();
    };
  }, [user]);

  // Join room whenever selected user changes
  useEffect(() => {
    if (!socketRef.current) return;
    if (!selectedChatId) return;
    if (!user) return;

    const socket = socketRef.current;

    // Leave previous room if exists (optional - socket.io handles this)
    socket.emit("joinChat", {
      userId: user._id,
      chatId: selectedChatId,
      firstName: user.firstName,
    });

    // Clear unread when joining a chat
    dispatch(clearUnread(selectedChatId));

    // Mark messages as seen when joining
    if (socket.connected) {
      socket.emit("messageSeen", {
        chatId: selectedChatId,
        userId: user._id,
      });
    }

    // Reset initial fetch flag when chat changes
    setIsInitialFetch(true);

  }, [selectedChatId, user, dispatch]);

  // Fetch old messages
  useEffect(() => {
    if (!selectedChatId) {
      console.warn("No selectedChatId, skipping message fetch");
      return;
    }

    // Don't fetch if already fetched for this chat
    if (!isInitialFetch) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/${selectedChatId}`, {
          withCredentials: true,
        });

        const data = res.data.data;
        if (!data?.messages) {
          dispatch(setMessages([]));
          return;
        }

        const msgs = data.messages.map(msg => ({
          _id: msg._id,
          chatId: msg.chatId,
          senderId: msg.senderId,
          firstName: msg.firstName,
          lastName: msg.lastName,
          photoUrl: msg.photoUrl,
          text: msg.text,
          createdAt: msg.createdAt,
          status: msg.status,
        }));

        console.log("Messages fetched:", msgs.length);

        // Set messages in Redux
        dispatch(setMessages(msgs));

        // Update last message for sidebar
        if (msgs.length > 0) {
          const lastMsg = msgs[msgs.length - 1];
          dispatch(updateLastMessage({
            chatId: selectedChatId,
            message: lastMsg
          }));

          // Move connection to top when fetching messages
          dispatch(moveConnectionToTop(selectedChatId));
        }

        // Mark messages as seen after fetching
        if (socketRef.current?.connected) {
          socketRef.current.emit("messageSeen", {
            chatId: selectedChatId,
            userId: user._id,
          });
        }

        // Mark as fetched
        setIsInitialFetch(false);

      } catch (err) {
        console.error("Error fetching messages:", err);
        setIsInitialFetch(false);
      }
    };

    fetchMessages();
  }, [selectedChatId, dispatch, user, isInitialFetch]);

  // Listen for incoming messages - single listener
  useEffect(() => {
    if (!socketRef.current) return;

    const handleMessageReceived = (message) => {
      console.log("Message received:", message);

      // Check if the message belongs to the currently selected user
      if (message.chatId === selectedChatId) {
        // It's a message from the selected user - add to current chat
        dispatch(addMessage(message));
        dispatch(updateLastMessage({
          chatId: message.chatId,
          message
        }));

        dispatch(moveConnectionToTop(message.chatId));

        // Mark as seen immediately if in current chat
        if (socketRef.current?.connected) {
          socketRef.current.emit("messageSeen", {
            chatId: message.chatId,
            userId: user._id,
          });
        }
      } else {
        // It's a message from someone else - update last message and increment unread
        dispatch(updateLastMessage({
          chatId: message.chatId,
          message
        }));

        dispatch(incrementUnread({
          chatId: message.chatId
        }));

        // Move connection to top
        dispatch(moveConnectionToTop(message.chatId));
      }
    };

    socketRef.current.on("messageReceived", handleMessageReceived);

    return () => {
      socketRef.current?.off("messageReceived", handleMessageReceived);
    };
  }, [dispatch, selectedChatId, user]);

  // Handle typing indicator
  const handleTyping = (isTyping) => {
    if (!socketRef.current || !socketRef.current.connected) return;
    if (!selectedChatId || !user) return;

    if (isTyping) {
      socketRef.current.emit("typing", {
        userId: user._id,
        chatId: selectedChatId,
      });
    } else {
      socketRef.current.emit("stopTyping", {
        userId: user._id,
        chatId: selectedChatId,
      });
    }
  };

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim()) {
      console.warn("Cannot send empty message");
      return;
    }
    if (!selectedChatId) {
      console.warn("No chat selected");
      return;
    }
    if (!user) {
      console.warn("No user logged in");
      return;
    }
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn("Socket not connected");
      return;
    }

    const messageText = newMessage.trim();

    console.log("Sending message:", messageText);

    socketRef.current.emit("sendMessage", {
      userId: user._id,
      chatId: selectedChatId,
      text: messageText,
    });

    // Optimistically add message to UI (optional - can be handled by server response)
    // dispatch(addMessage({
    //   _id: `temp_${Date.now()}`,
    //   chatId: selectedChatId,
    //   senderId: user._id,
    //   firstName: user.firstName,
    //   lastName: user.lastName,
    //   photoUrl: user.photoUrl,
    //   text: messageText,
    //   createdAt: new Date().toISOString(),
    //   status: "sent",
    // }));

    dispatch(moveConnectionToTop(selectedChatId));
    setNewMessage("");
    handleTyping(false);
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    isConnected,
    handleTyping,
  };
};

export default useChat;