import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ConnectionRequest } from "../models/connectionRequest.model.js"

const chatController = AsyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  // Find chat by chatId and verify user is participant
  const chat = await Chat.findById(chatId);

  if (!chat) {
    return res.status(404).json(
      new ApiResponse(404, null, "Chat not found")
    );
  }

  // Verify user is participant
  if (!chat.participants.includes(userId)) {
    return res.status(403).json(
      new ApiResponse(403, null, "You are not a participant in this chat")
    );
  }

  
  const messages = await Message.find({
    chatId: chat._id,
  })
  .populate("senderId", "firstName lastName photoUrl")
  .sort({ createdAt: 1 });

  const formattedMessages = messages.map(msg => ({
    _id: msg._id,
    chatId: chat._id.toString(),
    senderId: msg.senderId._id.toString(),
    firstName: msg.senderId.firstName,
    lastName: msg.senderId.lastName,
    photoUrl: msg.senderId.photoUrl,
    text: msg.text,
    createdAt: msg.createdAt,
    status: msg.status,
  }));
  return res.status(200).json(new ApiResponse(200, {chat, messages: formattedMessages}, "chats fetched successfully!"));
})

// In your chat controller
const getLastMessagesForConnections = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Get all connections
  const connections = await ConnectionRequest.find({
    $or: [
      { fromUserId: userId, status: "accepted" },
      { toUserId: userId, status: "accepted" }
    ]
  }).populate('fromUserId toUserId', 'firstName lastName photoUrl');
  
  if (!connections || connections.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, { lastMessages: {} }, "No connections found")
    );
  }

  // Create an object to store last messages with userId as key
  const lastMessagesMap = {};

  // Get last message for each connection
  await Promise.all(
    connections.map(async (connection) => {
      const otherUserId = connection.fromUserId._id.toString() === userId.toString() 
        ? connection.toUserId._id 
        : connection.fromUserId._id;
      
      const chat = await Chat.findOne({
        participants: { $all: [userId, otherUserId] }
      });
      
      if (!chat) {
        // lastMessagesMap[otherUserId.toString()] = null;
        return;
      }
      
      const lastMessage = await Message.findOne({ chatId: chat._id })
        .sort({ createdAt: -1 })
        .populate('senderId', 'firstName lastName photoUrl');
      
      if (lastMessage) {
        // Format the message to match frontend expectations
        lastMessagesMap[otherUserId.toString()] = {
          _id: lastMessage._id,
          chatId: chat._id.toString(),
          senderId: lastMessage.senderId._id.toString(),
          firstName: lastMessage.senderId.firstName,
          lastName: lastMessage.senderId.lastName,
          photoUrl: lastMessage.senderId.photoUrl,
          text: lastMessage.text,
          createdAt: lastMessage.createdAt,
          status: lastMessage.status,
        };
      } else {
        lastMessagesMap[otherUserId.toString()] = null;
      }
    })
  );
  
  return res.status(200).json(
    new ApiResponse(200, { lastMessages: lastMessagesMap }, "Last messages fetched successfully")
  );
});


export { chatController, getLastMessagesForConnections }