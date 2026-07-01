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
  console.log("socket initialize");
  const io = new Server(server,  {
    // path: '/api/socket.io',
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    },
  })
  
  io.on("connection", (socket) => {
    console.log("User Connected");

    // USER ONLINE
    socket.on("userOnline", async ({ userId }) => {
      socket.userId = userId;

      await User.findByIdAndUpdate(userId, {
        isOnline: true,
      });
    });
    
    //Handle events
    // JOIN CHAT
    socket.on("joinChat", async  ({userId, chatId, firstName }) => {

      try {
        const chat = await Chat.findById(chatId);

        if(!chat) {
          console.error(`Chat ${chatId} not found`);
          return;
        }

        const targetUserId = chat.participants.find(
          id => id.toString() !== userId.toString()
        );

        if (!targetUserId) {
          console.error(`No other participant found in chat ${chatId}`);
          return;
        }

        const roomId = getSecretRoomId(
          userId,
          targetUserId.toString()
        );

        socket.join(roomId);
        socket.currentRoom = roomId;
        socket.currentChatId = chatId;
        console.log(`${firstName} (${userId}) Joined Room: ${roomId} for Chat: ${chatId}`);
      } catch (error) {
        console.error("Error joining chat:", error);
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
        console.log(`Sending message in room: ${roomId}`);
        console.log(`From: ${userId}, To: ${targetUserId}`);

        // Make sure the sender is in the room
        if (!socket.rooms.has(roomId)) {
          socket.join(roomId);
          console.log(`Added sender ${userId} to room: ${roomId}`);
        }

        const message = await Message.create({
          chatId: chat._id,
          senderId: userId,
          text,
          replyTo,
          status: "sent",
        });

        // Update chat with last message
        chat.lastMessage = message._id;
        chat.lastMessageAt = new Date();
        chat.lastMessageSender = userId;
        await chat.save();

        const populatedMessage = await Message.findById(message._id).populate(
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
        };

        await Message.findByIdAndUpdate(message._id, {
          status: "delivered",
        });

        // IMPORTANT: Emit only to the specific room
        io.to(roomId).emit("messageReceived", formattedMessage);
        console.log(`Message sent to room: ${roomId}`);


      } catch (error) {
         console.error("Error sending message:", error);
        socket.emit("messageError", {error: "Failed to send message: " + error.message });
      }
    });

    // Message seen
    socket.on("messageSeen",async ({ chatId, userId }) => {
      
      try {
        await Message.updateMany({
          chatId,
          senderId: {
            $ne: userId,
          },
          status: {
            $ne: "seen",
          },
        },
          {
            status: "seen",
          }
        );

        const chat = await Chat.findById(chatId);
        if (chat) {
          const otherUserId = chat.participants.find(
            p => p.toString() !== userId.toString()
          );
          
          if (otherUserId) {
            const roomId = getSecretRoomId(userId, otherUserId.toString());
            io.to(roomId).emit("messagesSeen", { chatId });
          }
        }
      } catch (error) {
        console.error("Error marking messages as seen:", error);
      }
    });

    // typing
    socket.on("typing", async ({ userId, chatId }) => {
      
      try {
      
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        const targetUserId = chat.participants.find(
          id => id.toString() !== userId.toString()
        );

        if (targetUserId) {
          const roomId = getSecretRoomId(userId, targetUserId.toString());
          socket.to(roomId).emit("userTyping", { userId, chatId });
        }
      } catch (error) {
        console.error("Error handling typing:", error);
      }
    });

    socket.on("stopTyping", async ({ userId, chatId }) => {
      
      try {
      
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        const targetUserId = chat.participants.find(
          id => id.toString() !== userId.toString()
        );

        if (targetUserId) {
          const roomId = getSecretRoomId(userId, targetUserId.toString());
          socket.to(roomId).emit("userStoppedTyping", { userId, chatId });
        }
      } catch (error) {
        console.error("Error handling stop typing:", error);
      }
    });

    socket.on("disconnect", async () => {
      try {
        if (socket.userId) {
          console.log(`User ${socket.userId} disconnected`);
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date(),
          });
        }
      } catch (error) {
        console.error("Error during disconnect:", error);
      }
    });
  });
}

export default initializeSocket;