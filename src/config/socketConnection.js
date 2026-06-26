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
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(`${firstName} Joined Room: ${roomId}`);
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ firstName, lastName, userId, targetUserId, text, replyTo = null, }) => {
      // save message 
      try {
        const roomId = getSecretRoomId(userId, targetUserId);
        console.log(firstName + " " + text);
        let chat = await Chat.findOne({
          participants: { $all : [userId, targetUserId]},
          
        });
        if (!chat) {
          chat = new Chat({
            participants: [userId, targetUserId],
            // messages: [],
          }); 
        }

        const message = await Message.create({
          chatId: chat._id,
          senderId: userId,
          text,
          replyTo,
          status: "sent",
        });

        chat.lastMessage = text;
        chat.lastMessageAt = new Date();
        chat.lastMessageSender = userId;
        
        await chat.save();

        io.to(roomId).emit(
          "messageReceived",
          message
        );

        // Mark delivered immediately
        await Message.findByIdAndUpdate(
          message._id,
          {
            status: "delivered",
          }
        );

        // chat.messages.push({
        //   senderId: userId,
        //   text
        // })

        // io.to(roomId).emit("messageReceived", { firstName, lastName, text, createdAt: new Date().toISOString(), });

      } catch (error) {
        console.log(error)
      }
    });

    // Message seen
    socket.on(
      "messageSeen",
      async ({ chatId, userId }) => {
        try {
          await Message.updateMany(
            {
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

          io.emit("messagesSeen", {
            chatId,
          });
        } catch (error) {
          console.log(error);
        }
      }
    );

    // typing
    socket.on(
      "typing",
      ({ userId, targetUserId }) => {
        const roomId = getSecretRoomId(
          userId,
          targetUserId
        );

        socket
          .to(roomId)
          .emit("userTyping", {
            userId,
          });
      }
    );

    socket.on(
      "stopTyping",
      ({ userId, targetUserId }) => {
        const roomId = getSecretRoomId(
          userId,
          targetUserId
        );

        socket
          .to(roomId)
          .emit("userStoppedTyping", {
            userId,
          });
      }
    );


    // socket.on("disconnect", () => {
    //   // console.log("❌ Client disconnected:");
    // });

    socket.on("disconnect", async () => {
      try {
        if (socket.userId) {
          await User.findByIdAndUpdate(
            socket.userId,
            {
              isOnline: false,
              lastSeen: new Date(),
            }
          );
        }

        console.log("User disconnected");
      } catch (error) {
        console.log(error);
      }
    });
  });
}

export default initializeSocket;