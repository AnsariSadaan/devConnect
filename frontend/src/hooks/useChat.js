import { useEffect, useRef, useState } from "react";
import api from "../utils/axios";
import { useDispatch, useSelector } from "react-redux";
import { createSocketConnection } from "../utils/socket";

import {
  setMessages,
  addMessage,
  updateLastMessage,
  incrementUnread,
} from "../utils/chatSlice";

import { moveConnectionToTop } from '../utils/connectionSlice.js';

const useChat = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");
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
    // Send user online status
    socketRef.current.emit("userOnline", { userId: user._id });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  
  //Join room whenever selected user changes
  useEffect(() => {
    if (!socketRef.current) return;
    if (!selectedChatId) return;
    if (!user) return;

    socketRef.current.emit("joinChat", {
      userId: user._id,
      chatId: selectedChatId,
      firstName: user.firstName,
    });
  }, [selectedChatId, user]);

  
  // Fetch old messages
  useEffect(() => {
    if (!selectedChatId) {
      console.warn("No selectedChatId, skipping message fetch");
      return;
    }

    const fetchMessages = async () => {
      try {

        const res = await api.get(`/chat/${selectedChatId}`,
          {
            withCredentials: true,
          }
        );

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
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [selectedChatId, dispatch]);

  // Listen for incoming messages - single listener
  useEffect(() => {
    if (!socketRef.current) return;

    const handleMessageReceived = (message) => {

      // Check if the message belongs to the currently selected user
      if (message.chatId === selectedChatId) {

        // It's a message from the selected user - add to current chat
        dispatch(addMessage(message));
        dispatch(updateLastMessage({
          chatId: message.chatId,
          message
        }));

        dispatch(moveConnectionToTop(message.chatId));
      } else {

        dispatch(updateLastMessage({
          chatId: message.chatId,
          message
        }));
        // It's a message from someone else - increment unread count
        dispatch(incrementUnread({
          chatId: message.chatId
        }));

        // Move connection to top when fetching messages
        dispatch(moveConnectionToTop(selectedChatId));
      }
    };

    socketRef.current.on("messageReceived", handleMessageReceived);

    return () => {
      socketRef.current?.off("messageReceived", handleMessageReceived);
    };
  }, [dispatch, selectedChatId]);
 

  // Send 
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

    socketRef.current.emit("sendMessage", {
      userId: user._id,
      chatId: selectedChatId,
      text: newMessage.trim(),
    });

    dispatch(moveConnectionToTop(selectedChatId));
    setNewMessage("");
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
  };
};

export default useChat;