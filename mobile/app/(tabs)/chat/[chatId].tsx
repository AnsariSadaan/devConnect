import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { api } from "@/services/api";
import {
  connectSocket,
  getSocket,
} from "@/services/socket";

import { useAuth } from "@/context/AuthContext";

interface ChatUser {
  _id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
}

interface Chat {
  _id: string;
  participants: ChatUser[];
}

interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  text: string;
  createdAt: string;
  status: "sent" | "delivered" | "seen";
}

interface ChatResponse {
  chat: Chat;
  messages: Message[];
}

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  
  // FETCH CHAT
  useEffect(() => {
    if (authLoading || !isAuthenticated || !chatId) {
      return;
    }

    let mounted = true;

    const fetchChat = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching chat:", chatId);

        const response = await api.get(`/chat/${chatId}`);

        console.log("Chat response:", response.data);

        if (!mounted) {
          return;
        }

        const chatData: ChatResponse = response.data.data;

        setChat(chatData.chat);
        setMessages(chatData.messages || []);
      } catch (error: any) {
        console.log("Chat fetch error:", error);

        if (!mounted) {
          return;
        }

        const message =
          error?.response?.data?.message || "Failed to load chat.";

        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchChat();

    return () => {
      mounted = false;
    };
  }, [chatId, isAuthenticated, authLoading]);


  // socket.io connection
  useEffect(() => {
    if (authLoading || !chatId || !isAuthenticated || !user?._id) {
      return;
    }

    console.log("Starting socket connection...");

    const socket = connectSocket();

    // SOCKET CONNECTED
    const handleConnect = () => {
      console.log("Socket connected from chat:", socket.id);

      // Tell backend user is online
      socket.emit("userOnline", {
        userId: user._id,
      });

      // Join this chat
      socket.emit("joinChat", {
        userId: user._id,
        chatId,
      });

      console.log("Joining chat:", chatId);
    };

    // NEW MESSAGE
    const handleMessageReceived = (message: Message) => {
      console.log("Message received:", message);

      // Only process messages for current chat
      if (message.chatId.toString() !== chatId.toString()) {
        return;
      }

      setMessages((prev) => {
        // Prevent duplicate messages
        const alreadyExists = prev.some((item) => item._id === message._id);

        if (alreadyExists) {
          return prev;
        }

        return [...prev, message];
      });

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({
          animated: true,
        });
      }, 100);
    };

    // MESSAGE ERROR
    const handleMessageError = (error: { error: string }) => {
      console.log("Socket message error:", error);

      setSending(false);
    };

    // MESSAGE SEEN
    const handleMessagesSeen = (data: { chatId: string }) => {
      console.log("Messages seen:", data);

      if (data.chatId !== chatId) {
        return;
      }

      setMessages((prev) =>
        prev.map((message) => {
          if (message.senderId !== user._id) {
            return message;
          }

          return {
            ...message,
            status: "seen" as const,
          };
        })
      );
    };

    // CONNECT EVENT
    socket.on("connect", handleConnect);

    // MESSAGE EVENT
    socket.on("messageReceived", handleMessageReceived);

    // ERROR EVENT
    socket.on("messageError", handleMessageError);

    // SEEN EVENT
    socket.on("messagesSeen", handleMessagesSeen);

    // If socket already connected
    if (socket.connected) {
      handleConnect();
    }

    // CLEANUP
    return () => {
      console.log("Cleaning chat socket listeners");

      socket.off("connect", handleConnect);

      socket.off("messageReceived", handleMessageReceived);

      socket.off("messageError", handleMessageError);

      socket.off("messagesSeen", handleMessagesSeen);
    };
  }, [chatId, isAuthenticated, authLoading, user?._id]);
  

  // send message
  const handleSendMessage = () => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    if (!chatId) {
      return;
    }

    if (!user?._id) {
      console.log("User not available");
      return;
    }

    const socket = getSocket();

    if (!socket) {
      console.log("Socket does not exist");
      return;
    }

    if (!socket.connected) {
      console.log("Socket is not connected");
      return;
    }

    console.log("Sending message:", trimmedText);

    setSending(true);

    socket.emit("sendMessage", {
      userId: user._id,
      chatId,
      text: trimmedText,
    });

    setText("");
    // We don't wait here.
    // Server will emit messageReceived.
    setSending(false);
  };

  // AUTH LOADING
  

  if (authLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  
  // CHAT LOADING
  

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  
  // ERROR
  

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>

        <Text style={styles.errorText}>{error}</Text>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  
  // MAIN UI
  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Chat</Text>

          <Text style={styles.headerSubtitle}>{messages.length} messages</Text>
        </View>
      </View>

      {/* MESSAGES */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        onLayout={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isOwnMessage={item.senderId === user?._id}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No messages yet</Text>

            <Text style={styles.emptyText}>
              Start the conversation by sending a message.
            </Text>
          </View>
        }
      />

      {/* INPUT */}
      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          style={styles.input}
          multiline
          editable={!sending}
        />

        <Pressable
          style={({ pressed }) => [
            styles.sendButton,
            pressed && styles.pressed,
            (!text.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!text.trim() || sending}
        >
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// MESSAGE BUBBLE
interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <View
      style={[
        styles.messageContainer,
        isOwnMessage ? styles.myMessageContainer : styles.otherMessageContainer,
      ]}
    >
      {!isOwnMessage && (
        <Image
          source={{
            uri: message.photoUrl || "https://via.placeholder.com/32",
          }}
          style={styles.messageAvatar}
        />
      )}

      <View
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isOwnMessage && (
          <Text style={styles.senderName}>
            {message.firstName} {message.lastName}
          </Text>
        )}

        <Text
          style={[
            styles.messageText,
            isOwnMessage ? styles.myMessageText : styles.otherMessageText,
          ]}
        >
          {message.text}
        </Text>

        <Text
          style={[
            styles.messageTime,
            isOwnMessage ? styles.myMessageTime : styles.otherMessageTime,
          ]}
        >
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}


// FORMAT TIME
function formatTime(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}


// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },

  backIcon: {
    fontSize: 30,
    lineHeight: 32,
    color: "#111827",
  },

  headerInfo: {
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#6b7280",
  },

  // LOADING
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },

  loadingText: {
    marginTop: 10,
    color: "#6b7280",
  },

  // ERROR
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#dc2626",
  },

  errorText: {
    marginTop: 8,
    color: "#6b7280",
    textAlign: "center",
  },

  // EMPTY
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },

  // MESSAGE LIST
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexGrow: 1,
  },

  // MESSAGE
  messageContainer: {
    flexDirection: "row",
    marginBottom: 12,
    maxWidth: "85%",
  },

  myMessageContainer: {
    alignSelf: "flex-end",
  },

  otherMessageContainer: {
    alignSelf: "flex-start",
  },

  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#e5e7eb",
  },

  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: "100%",
  },

  myMessage: {
    backgroundColor: "#111827",
    borderBottomRightRadius: 4,
  },

  otherMessage: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
  },

  senderName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 4,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },

  myMessageText: {
    color: "#ffffff",
  },

  otherMessageText: {
    color: "#111827",
  },

  messageTime: {
    fontSize: 10,
    marginTop: 5,
    alignSelf: "flex-end",
  },

  myMessageTime: {
    color: "#d1d5db",
  },

  otherMessageTime: {
    color: "#9ca3af",
  },

  // INPUT
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 22,
    fontSize: 15,
  },

  sendButton: {
    marginLeft: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: "#111827",
  },

  sendButtonDisabled: {
    opacity: 0.5,
  },

  sendText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.7,
  },

  backButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
});