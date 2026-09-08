import { Server } from 'socket.io';
import crypto from 'crypto';
import { Chat } from '../models/chat.model.js';
import { User } from '../models/user.model.js';
import { Message } from '../models/message.model.js';

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash('sha256')
    .update([userId, targetUserId].sort().join("$$"))
    .digest("hex");
}

const initializeSocket = (server) => {
  const io = new Server(server,  {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
  })
  
  io.on("connection", (socket) => {
    // USER ONLINE
    console.log("Socket connected:", socket.id);
    socket.on("userOnline", async ({ userId }) => {
      try {
        if (!userId) {
          console.error("Missing userId for userOnline");
          return;
        }

        socket.userId = userId;
        socket.isOnline = true;

        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });

        console.log(`User ${userId} is online`);
      } catch (error) {
        console.error("Error in userOnline:", error);
      }
    });
    
    // JOIN CHAT
    socket.on("joinChat", async  ({userId, chatId, firstName }) => {

      try {
        if (!userId || !chatId) {
          console.error("Missing userId or chatId for joinChat");
          return;
        }
        console.log(`User ${userId} joining chat ${chatId}`);
        const chat = await Chat.findById(chatId);

        if (!chat) {
          console.error(`Chat ${chatId} not found`);
          socket.emit("chatError", { error: "Chat not found" });
          return;
        }

        // Verify user is participant
        const isParticipant = chat.participants.some(
          p => p.toString() === userId.toString()
        );

        if (!isParticipant) {
          console.error(`User ${userId} is not a participant of chat ${chatId}`);
          socket.emit("chatError", { error: "You are not a participant" });
          return;
        }

        const targetUserId = chat.participants.find(
          id => id.toString() !== userId.toString()
        );

        if (!targetUserId) {
          console.error(`No other participant found in chat ${chatId}`);
          socket.emit("chatError", { error: "No other participant found" });
          return;
        }

        const roomId = getSecretRoomId(
          userId,
          targetUserId.toString()
        );

        // Leave previous room if any
        if (socket.currentRoom && socket.currentRoom !== roomId) {
          socket.leave(socket.currentRoom);
          console.log(`Socket left room ${socket.currentRoom}`);
        }

        socket.join(roomId);
        socket.currentRoom = roomId;
        socket.currentChatId = chatId;

        console.log(`Socket ${socket.id} joined room ${roomId} for chat ${chatId}`);

        // Notify other user that this user is online in the chat
        socket.to(roomId).emit("userOnlineInChat", {
          userId,
          chatId,
          isOnline: true,
        });
      
      } catch (error) {
        console.error("Error joining chat:", error);
        socket.emit("chatError", { error: "Failed to join chat" });
      }
    });

    socket.on("sendMessage", async ({ userId, chatId, text, replyTo = null}) => {
      try {

        // Validate required fields
        if (!userId) {
          console.error("Missing userId");
          socket.emit("messageError", { error: "Missing userId" });
          return;
        }

        if (!chatId) {
          console.error("Missing chatId");
          socket.emit("messageError", { error: "Missing chatId" });
          return;
        }

        if (!text || !text.trim()) {
          console.error("Missing text");
          socket.emit("messageError", { error: "Missing message text" });
          return;
        }

        const chat = await Chat.findById(chatId);

        // Find the chat
        if (!chat) {
          console.error(`Chat ${chatId} not found`);
          socket.emit("messageError", { error: "Chat not found" });
          return;
        }

        // Find the other participant
        const targetUserId = chat.participants.find(
          id => id.toString() !== userId.toString()
        );

        if (!targetUserId) {
          console.error(`No other participant found in chat ${chatId}`);
          socket.emit("messageError", { error: "No other participant found" });
          return;
        }

        const roomId =getSecretRoomId(userId, targetUserId.toString());

        // Make sure the sender is in the room
        if (!socket.rooms.has(roomId)) {
          socket.join(roomId);
        }

        const message = await Message.create({
          chatId: chat._id,
          senderId: userId,
          text: text.trim(),
          replyTo,
          status: "sent",
          messageType: text,

        });

        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          lastMessageAt: message.createdAt,
          lastMessageSender: message.senderId,
        });

        const populatedMessage = await message.populate(
          "senderId",
          "firstName lastName photoUrl"
        );

        // Format message for client
        const formattedMessage = {
          _id: populatedMessage._id,
          chatId: chat._id.toString(),
          senderId: populatedMessage.senderId._id.toString(),
          receiverId: targetUserId.toString(),
          firstName: populatedMessage.senderId.firstName,
          lastName: populatedMessage.senderId.lastName,
          photoUrl: populatedMessage.senderId.photoUrl,
          text: populatedMessage.text,
          createdAt: populatedMessage.createdAt,
          status: "delivered",
          messageType: "text",
          replyTo: replyTo,
        };

        await Message.findByIdAndUpdate(message._id, {
          status: "delivered",
        });

        // Emit only to the specific room
        io.to(roomId).emit("messageReceived", formattedMessage);
        console.log(`Message sent to room ${roomId}: ${text}`);

      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("messageError", {error: "Failed to send message: " + error.message });
      }
    });

    // Message seen
    socket.on("messageSeen",async ({ chatId, userId }) => {
      
      try {

        if (!chatId || !userId) {
          console.error("Missing chatId or userId for messageSeen");
          return;
        }
        // Update all unread messages from other users to "seen"
        const result = await Message.updateMany(
          {
          chatId,
          senderId: {
            $ne: userId,
          },
          status: {
            $ne: "seen",
          },
          isDeleted: false,
        },
          {
            status: "seen",
          }
        );

        console.log(`Marked ${result.modifiedCount} messages as seen in chat ${chatId}`);

        const chat = await Chat.findById(chatId);
        if (chat) {
          const otherUserId = chat.participants.find(
            p => p.toString() !== userId.toString()
          );
          
          if (otherUserId) {
            const roomId = getSecretRoomId(userId, otherUserId.toString());
            io.to(roomId).emit("messagesSeen", { chatId, userId, timestamp: new Date(), });
          }
        }
      } catch (error) {
        console.error("Error marking messages as seen:", error);
      }
    });

    // typing
    socket.on("typing", async ({ userId, chatId }) => {
      
      try {

        if (!userId || !chatId) return;
      
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        const targetUserId = chat.participants.find(
          id => id.toString() !== userId.toString()
        );

        if (targetUserId) {
          const roomId = getSecretRoomId(userId, targetUserId.toString());
          socket.to(roomId).emit("userTyping", { userId, chatId, isTyping: true, });
        }
      } catch (error) {
        console.error("Error handling typing:", error);
      }
    });

    socket.on("stopTyping", async ({ userId, chatId }) => {
      
      try {
        if (!userId || !chatId) return;
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        const targetUserId = chat.participants.find(
          id => id.toString() !== userId.toString()
        );

        if (targetUserId) {
          const roomId = getSecretRoomId(userId, targetUserId.toString());
          socket.to(roomId).emit("userStoppedTyping", { userId, chatId, isTyping: false, });
        }
      } catch (error) {
        console.error("Error handling stop typing:", error);
      }
    });

    socket.on("disconnect", async () => {
      try {
        console.log(`Socket disconnected: ${socket.id}`);
        if (socket.userId) {
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date(),
          });

          // Notify other users in the chat
          if (socket.currentChatId && socket.currentRoom) {
            socket.to(socket.currentRoom).emit("userOffline", {
              userId: socket.userId,
              chatId: socket.currentChatId,
              isOnline: false,
            });
          }

          console.log(`User ${socket.userId} is now offline`);
        }
      } catch (error) {
        console.error("Error during disconnect:", error);
      }
    });
  });

  return io;
}

export default initializeSocket;