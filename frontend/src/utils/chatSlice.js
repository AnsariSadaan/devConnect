  import { createSlice } from "@reduxjs/toolkit";

  const initialState = {
    selectedUser: null,
    selectedChatId: null,
    messages: [],
    onlineUsers: [],
    typingUsers: [],
    unreadMessages: {},
    lastMessages: {},
    isTyping: {},
  };

  const chatSlice = createSlice({
    name: "chat",
    initialState,

    reducers: {

      // Selected Conversation
      setSelectedUser(state, action) {
        state.selectedUser = action.payload.user;
        state.selectedChatId = action.payload.chatId;
      },

      // Messages
      setMessages: (state, action) => {
        state.messages = action.payload;
        
        // Update last message for this chat
  		  if (state.selectedChatId && action.payload && action.payload.length > 0) {
  		    const lastMsg = action.payload[action.payload.length - 1];
  		    state.lastMessages[state.selectedChatId] = lastMsg;
  		  }
      },

      addMessage: (state, action) => {
        // Prevent duplicate messages
        const exists = state.messages.some(m => m._id === action.payload._id);
        if (!exists) {
          state.messages.push(action.payload);
        }
        
        // Update last message
        if (state.selectedChatId) {
          state.lastMessages[state.selectedChatId] = action.payload;
        }
      },

      updateMessageStatus: (state, action) => {
        const { messageId, status } = action.payload;
        const message = state.messages.find(m => m._id === messageId);
        if (message) {
          message.status = status;
        }
      },

      clearMessages(state) {
        state.messages = [];
      },

      // Online Users
      setOnlineUsers(state, action) {
        state.onlineUsers = action.payload;
      },

      addOnlineUser(state, action) {
        if (!state.onlineUsers.includes(action.payload)) {
          state.onlineUsers.push(action.payload);
        }
      },

      removeOnlineUser(state, action) {
        state.onlineUsers = state.onlineUsers.filter(
          (id) => id !== action.payload
        );
      },

      // Typing Users
      addTypingUser(state, action) {
        if (!state.typingUsers.includes(action.payload)) {
          state.typingUsers.push(action.payload);
        }
      },

      removeTypingUser(state, action) {
        state.typingUsers = state.typingUsers.filter(
          (id) => id !== action.payload
        );
      },

      // Typing per chat
      setTyping: (state, action) => {
        const { chatId, userId, isTyping } = action.payload;
        if (isTyping) {
          state.isTyping[chatId] = { userId, isTyping: true };
        } else {
          delete state.isTyping[chatId];
        }
      },

      clearTyping: (state, action) => {
        const chatId = action.payload;
        delete state.isTyping[chatId];
      },

      // Unread Messages
      setUnreadCount: (state, action) => {
        const { chatId, count } = action.payload;
        state.unreadMessages[chatId] = count;
      },

      // Unread Messages
      incrementUnread: (state, action) => {
  		  const chatId = action.payload.chatId;
        // Don't increment if the chat is currently selected
        if (state.selectedChatId === chatId) {
          return;
        }
  		  state.unreadMessages[chatId] = (state.unreadMessages[chatId] || 0) + 1;
  		},

      clearUnread(state, action) {
        const chatId = action.payload;
        delete state.unreadMessages[chatId];
      },

      // Last Messages
      setLastMessage(state, action) {
        const { chatId, message } = action.payload;
        state.lastMessages[chatId] = message;
      },

      updateLastMessage: (state, action) => {
        const { chatId, message } = action.payload;
        if (chatId && message) {
          state.lastMessages[chatId] = message;
        }
      },

      clearChatState() {
        return initialState;
      },
    },
  });

  export const {
    setSelectedUser,
    setMessages,
    addMessage,
    updateMessageStatus,
    clearMessages,
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    addTypingUser,
    removeTypingUser,
    setTyping,
    clearTyping,
    setUnreadCount,
    incrementUnread,
    clearUnread,
    setLastMessage,
    updateLastMessage,
    clearChatState
  } = chatSlice.actions;

  export default chatSlice.reducer;