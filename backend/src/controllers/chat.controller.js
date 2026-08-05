import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Connection } from "../models/connection.model.js"

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

  const isParticipant = chat.participants.some(
    participant => participant.toString() === userId.toString()
  );

  if (!isParticipant) {
    return res.status(403).json(
      new ApiResponse(
      403,
      null,
      "You are not a participant in this chat"
      )
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

const getLastMessagesForConnections = AsyncHandler(async (req, res) => {

  const userId = req.user._id;
  const chats = await Chat.find({
    participants: userId
  })
  .sort({
    lastMessageAt:-1
  })
  .populate({
    path:"lastMessage",
    populate:{
      path:"senderId",
      select:"firstName lastName photoUrl"
    }
  });

  const lastMessages = {};

  chats.forEach(chat => {
    if (!chat.lastMessage) return;
      lastMessages[chat._id.toString()] = {
        _id: chat.lastMessage._id,
        chatId: chat._id.toString(),
        senderId: chat.lastMessage.senderId._id.toString(),
        firstName: chat.lastMessage.senderId.firstName,
        lastName: chat.lastMessage.senderId.lastName,
        photoUrl: chat.lastMessage.senderId.photoUrl,
        text: chat.lastMessage.text,
        createdAt: chat.lastMessage.createdAt,
        status: chat.lastMessage.status,
      };
    });

  return res.status(200).json(
    new ApiResponse(
      200,
      { lastMessages },
      "Last messages fetched successfully"
    )
  );

});


export { chatController, getLastMessagesForConnections }