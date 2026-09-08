import request from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";

import { User } from "../../models/user.model.js";
import { Chat } from "../../models/chat.model.js";
import { Message } from "../../models/message.model.js";
import { Connection } from "../../models/connection.model.js";

describe("Chat API", () => {
  let user1;
  let user2;
  let user3;
  let token1;
  let token2;
  let token3;
  let chat;
  let chat2;
  let chat3;
  let message1;
  let message2;
  let message3;

  beforeEach(async () => {
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});
    await Connection.deleteMany({});

    // Create users
    user1 = await User.create({
      firstName: "Sadaan",
      lastName: "Ansari",
      emailId: "sadaan@test.com",
      password: "Password@123",
      age: 25,
      gender: "male",
      photoUrl: "https://example.com/photo1.jpg"
    });

    user2 = await User.create({
      firstName: "Rahul",
      lastName: "Patil",
      emailId: "rahul@test.com",
      password: "Password@123",
      age: 26,
      gender: "male",
      photoUrl: "https://example.com/photo2.jpg"
    });

    user3 = await User.create({
      firstName: "Priya",
      lastName: "Patel",
      emailId: "priya@test.com",
      password: "Password@123",
      age: 24,
      gender: "female",
      photoUrl: "https://example.com/photo3.jpg"
    });

    token1 = user1.generateAccessToken();
    token2 = user2.generateAccessToken();
    token3 = user3.generateAccessToken();

    // Create connections (required for last messages)
    await Connection.create({
      users: [user1._id, user2._id]
    });
    await Connection.create({
      users: [user1._id, user3._id]
    });

    // Create chats
    chat = await Chat.create({
      participants: [user1._id, user2._id]
    });

    chat2 = await Chat.create({
      participants: [user1._id, user3._id]
    });

    chat3 = await Chat.create({
      participants: [user2._id, user3._id]
    });

    // Create messages in chat1
    message1 = await Message.create({
      chatId: chat._id,
      senderId: user1._id,
      text: "Hello Rahul!",
      status: "sent"
    });

    message2 = await Message.create({
      chatId: chat._id,
      senderId: user2._id,
      text: "Hi Sadaan! How are you?",
      status: "sent"
    });

    message3 = await Message.create({
      chatId: chat._id,
      senderId: user1._id,
      text: "I'm good, thanks!",
      status: "sent"
    });

    // Update chat with last message
    chat.lastMessage = message3._id;
    chat.lastMessageAt = message3.createdAt;
    chat.lastMessageSender = user1._id;
    await chat.save();

    // Create message in chat2
    const chat2Message = await Message.create({
      chatId: chat2._id,
      senderId: user3._id,
      text: "Hello from Priya!",
      status: "sent"
    });

    // Update chat2 with last message
    chat2.lastMessage = chat2Message._id;
    chat2.lastMessageAt = chat2Message.createdAt;
    chat2.lastMessageSender = user3._id;
    await chat2.save();

    // chat3 has no messages
  });

  describe("GET /api/chat/:chatId", () => {
    test("should reject unauthorized request", async () => {
      const res = await request(app)
        .get(`/api/chat/${chat._id}`);
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should return 404 when chat does not exist", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/chat/${fakeId}`)
        .set("Cookie", `accessToken=${token1}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Chat not found");
    });

    test("should return 403 when user is not a participant", async () => {
      const res = await request(app)
        .get(`/api/chat/${chat._id}`)
        .set("Cookie", `accessToken=${token3}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("You are not a participant in this chat");
    });

    test("should return chat with empty messages", async () => {
      // Create a chat with no messages
      const emptyChat = await Chat.create({
        participants: [user1._id, user3._id]
      });

      const res = await request(app)
        .get(`/api/chat/${emptyChat._id}`)
        .set("Cookie", `accessToken=${token1}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("chat");
      expect(res.body.data).toHaveProperty("messages");
      expect(res.body.data.messages).toHaveLength(0);
      expect(res.body.message).toBe("chats fetched successfully!");
    });

    test("should return chat with single message", async () => {
      // Create a chat with one message
      const singleChat = await Chat.create({
        participants: [user1._id, user3._id]
      });

      await Message.create({
        chatId: singleChat._id,
        senderId: user1._id,
        text: "Single message",
        status: "sent"
      });

      const res = await request(app)
        .get(`/api/chat/${singleChat._id}`)
        .set("Cookie", `accessToken=${token1}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.messages).toHaveLength(1);
      expect(res.body.data.messages[0].text).toBe("Single message");
    });

    test("should return messages sorted by createdAt ascending", async () => {
      const res = await request(app)
        .get(`/api/chat/${chat._id}`)
        .set("Cookie", `accessToken=${token1}`);

      const messages = res.body.data.messages;
      expect(messages).toHaveLength(3);
      
      // Check chronological order
      expect(messages[0].text).toBe("Hello Rahul!");
      expect(messages[1].text).toBe("Hi Sadaan! How are you?");
      expect(messages[2].text).toBe("I'm good, thanks!");
      
      // Verify timestamps are in ascending order
      const timestamps = messages.map(msg => new Date(msg.createdAt).getTime());
      expect(timestamps[0]).toBeLessThan(timestamps[1]);
      expect(timestamps[1]).toBeLessThan(timestamps[2]);
    });

    test("should populate sender details", async () => {
      const res = await request(app)
        .get(`/api/chat/${chat._id}`)
        .set("Cookie", `accessToken=${token1}`);

      const messages = res.body.data.messages;
      
      // Check first message from user1
      expect(messages[0].senderId).toBe(user1._id.toString());
      expect(messages[0].firstName).toBe("Sadaan");
      expect(messages[0].lastName).toBe("Ansari");
      expect(messages[0].photoUrl).toBe("https://example.com/photo1.jpg");
      
      // Check second message from user2
      expect(messages[1].senderId).toBe(user2._id.toString());
      expect(messages[1].firstName).toBe("Rahul");
      expect(messages[1].lastName).toBe("Patil");
      expect(messages[1].photoUrl).toBe("https://example.com/photo2.jpg");
      
      // Check third message from user1
      expect(messages[2].senderId).toBe(user1._id.toString());
      expect(messages[2].firstName).toBe("Sadaan");
    });

    test("should return formatted message object", async () => {
      const res = await request(app)
        .get(`/api/chat/${chat._id}`)
        .set("Cookie", `accessToken=${token1}`);

      const message = res.body.data.messages[0];
      
      // Verify all required fields are present with correct types
      expect(message).toMatchObject({
        _id: expect.any(String),
        chatId: expect.any(String),
        senderId: expect.any(String),
        firstName: expect.any(String),
        lastName: expect.any(String),
        photoUrl: expect.any(String),
        text: expect.any(String),
        createdAt: expect.any(String),
        status: expect.any(String)
      });
      
      // Check specific values
      expect(message._id).toBe(message1._id.toString());
      expect(message.chatId).toBe(chat._id.toString());
      expect(message.text).toBe("Hello Rahul!");
      expect(message.status).toBe("sent");
    });

    test("should handle invalid chat ID format", async () => {
      const res = await request(app)
        .get("/api/chat/invalid-id")
        .set("Cookie", `accessToken=${token1}`);

      expect(res.statusCode).toBe(500);
    });
  });

  describe("GET /api/chat/last-messages/all", () => {
    test("should reject unauthorized request", async () => {
      const res = await request(app)
        .get("/api/chat/last-messages/all");
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should return empty object when user has no accepted connections", async () => {
      // Clear connections for user3
      await Connection.deleteMany({});
      
      const res = await request(app)
        .get("/api/chat/last-messages/all")
        .set("Cookie", `accessToken=${token3}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("lastMessages");
      expect(res.body.data.lastMessages).toEqual({});
      expect(res.body.message).toBe("Last messages fetched successfully");
    });

    test("should return null when chat has no messages", async () => {
      const res = await request(app)
        .get("/api/chat/last-messages/all")
        .set("Cookie", `accessToken=${token2}`);

      const lastMessages = res.body.data.lastMessages;
      
      // chat3 has no messages, so it won't be in the response
      expect(lastMessages[chat3._id.toString()]).toBeUndefined();
    });

    test("should return last message for each connection", async () => {
      const res = await request(app)
        .get("/api/chat/last-messages/all")
        .set("Cookie", `accessToken=${token1}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      
      const lastMessages = res.body.data.lastMessages;
      
      // Should have last messages for both chats with messages
      expect(Object.keys(lastMessages)).toHaveLength(2);
      
      // Check chat1 last message
      expect(lastMessages[chat._id.toString()]).toBeDefined();
      expect(lastMessages[chat._id.toString()].text).toBe("I'm good, thanks!");
      expect(lastMessages[chat._id.toString()].senderId).toBe(user1._id.toString());
      
      // Check chat2 last message
      expect(lastMessages[chat2._id.toString()]).toBeDefined();
      expect(lastMessages[chat2._id.toString()].text).toBe("Hello from Priya!");
      expect(lastMessages[chat2._id.toString()].senderId).toBe(user3._id.toString());
    });

    test("should return latest message only", async () => {
      // Add more messages to chat1
      await Message.create({
        chatId: chat._id,
        senderId: user2._id,
        text: "Older message",
        status: "sent"
      });

      const latestMessage = await Message.create({
        chatId: chat._id,
        senderId: user1._id,
        text: "Latest message",
        status: "sent"
      });

      // Update chat last message
      chat.lastMessage = latestMessage._id;
      chat.lastMessageAt = latestMessage.createdAt;
      chat.lastMessageSender = user1._id;
      await chat.save();

      const res = await request(app)
        .get("/api/chat/last-messages/all")
        .set("Cookie", `accessToken=${token1}`);

      const lastMessages = res.body.data.lastMessages;
      expect(lastMessages[chat._id.toString()].text).toBe("Latest message");
      expect(lastMessages[chat._id.toString()]._id).toBe(latestMessage._id.toString());
    });

    test("should return last messages for multiple connections", async () => {
      const res = await request(app)
        .get("/api/chat/last-messages/all")
        .set("Cookie", `accessToken=${token1}`);

      const lastMessages = res.body.data.lastMessages;
      
      // Should have messages for both chats
      expect(Object.keys(lastMessages)).toHaveLength(2);
      
      // Verify each message has the correct structure
      Object.values(lastMessages).forEach(message => {
        expect(message).toMatchObject({
          _id: expect.any(String),
          chatId: expect.any(String),
          senderId: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
          photoUrl: expect.any(String),
          text: expect.any(String),
          createdAt: expect.any(String),
          status: expect.any(String)
        });
      });
    });

    test("should format last message correctly with sender details", async () => {
      const res = await request(app)
        .get("/api/chat/last-messages/all")
        .set("Cookie", `accessToken=${token1}`);

      const lastMessages = res.body.data.lastMessages;
      const chat1LastMessage = lastMessages[chat._id.toString()];
      
      // Verify sender details are populated for chat1
      expect(chat1LastMessage.senderId).toBe(user1._id.toString());
      expect(chat1LastMessage.firstName).toBe("Sadaan");
      expect(chat1LastMessage.lastName).toBe("Ansari");
      expect(chat1LastMessage.photoUrl).toBe("https://example.com/photo1.jpg");
      
      const chat2LastMessage = lastMessages[chat2._id.toString()];
      expect(chat2LastMessage.senderId).toBe(user3._id.toString());
      expect(chat2LastMessage.firstName).toBe("Priya");
      expect(chat2LastMessage.lastName).toBe("Patel");
      expect(chat2LastMessage.photoUrl).toBe("https://example.com/photo3.jpg");
    });

    test("should sort chats by lastMessageAt descending", async () => {
      // Create a newer message in chat2
      const newerMessage = await Message.create({
        chatId: chat2._id,
        senderId: user1._id,
        text: "Newer message in chat2",
        status: "sent"
      });

      // Update chat2's lastMessageAt
      chat2.lastMessage = newerMessage._id;
      chat2.lastMessageAt = newerMessage.createdAt;
      chat2.lastMessageSender = user1._id;
      await chat2.save();

      const res = await request(app)
        .get("/api/chat/last-messages/all")
        .set("Cookie", `accessToken=${token1}`);

      const lastMessages = res.body.data.lastMessages;
      const chatIds = Object.keys(lastMessages);
      
      // The chat with the newest message should be first
      const messages = Object.values(lastMessages);
      const timestamps = messages.map(msg => new Date(msg.createdAt).getTime());
      
      // Check if timestamps are in descending order
      for (let i = 0; i < timestamps.length - 1; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
      }
    });

    test("should handle user with no chats", async () => {
      // Delete all chats for user3
      await Chat.deleteMany({ participants: user3._id });
      
      const res = await request(app)
        .get("/api/chat/last-messages/all")
        .set("Cookie", `accessToken=${token3}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lastMessages).toEqual({});
    });

    test("should return formatted last message with all required fields", async () => {
      const res = await request(app)
        .get("/api/chat/last-messages/all")
        .set("Cookie", `accessToken=${token1}`);

      const lastMessages = res.body.data.lastMessages;
      const message = lastMessages[chat._id.toString()];
      
      expect(message).toHaveProperty("_id");
      expect(message).toHaveProperty("chatId");
      expect(message).toHaveProperty("senderId");
      expect(message).toHaveProperty("firstName");
      expect(message).toHaveProperty("lastName");
      expect(message).toHaveProperty("photoUrl");
      expect(message).toHaveProperty("text");
      expect(message).toHaveProperty("createdAt");
      expect(message).toHaveProperty("status");
    });

    test("should handle multiple messages in same chat", async () => {
      // Add multiple messages to chat2
      await Message.create({
        chatId: chat2._id,
        senderId: user1._id,
        text: "First message",
        status: "sent"
      });
      await Message.create({
        chatId: chat2._id,
        senderId: user3._id,
        text: "Second message",
        status: "sent"
      });
      const lastMsg = await Message.create({
        chatId: chat2._id,
        senderId: user1._id,
        text: "Third message - latest",
        status: "sent"
      });

      // Update chat2 last message
      chat2.lastMessage = lastMsg._id;
      chat2.lastMessageAt = lastMsg.createdAt;
      chat2.lastMessageSender = user1._id;
      await chat2.save();

      const res = await request(app)
        .get("/api/chat/last-messages/all")
        .set("Cookie", `accessToken=${token1}`);

      const lastMessages = res.body.data.lastMessages;
      expect(lastMessages[chat2._id.toString()].text).toBe("Third message - latest");
      expect(lastMessages[chat2._id.toString()].senderId).toBe(user1._id.toString());
    });
  });

  describe("Integration Tests", () => {
    test("should handle full flow from connection to chat to messages", async () => {
      // 1. Create connection
      await Connection.create({
        users: [user1._id, user2._id]
      });

      // 2. Create chat
      const newChat = await Chat.create({
        participants: [user1._id, user2._id]
      });

      // 3. Send multiple messages
      const msg1 = await Message.create({
        chatId: newChat._id,
        senderId: user1._id,
        text: "First message",
        status: "sent"
      });

      const msg2 = await Message.create({
        chatId: newChat._id,
        senderId: user2._id,
        text: "Second message",
        status: "sent"
      });

      // 4. Update chat last message
      newChat.lastMessage = msg2._id;
      newChat.lastMessageAt = msg2.createdAt;
      newChat.lastMessageSender = user2._id;
      await newChat.save();

      // 5. Fetch chat messages
      const chatRes = await request(app)
        .get(`/api/chat/${newChat._id}`)
        .set("Cookie", `accessToken=${token1}`);

      expect(chatRes.statusCode).toBe(200);
      expect(chatRes.body.data.messages).toHaveLength(2);
      expect(chatRes.body.data.messages[0].text).toBe("First message");
      expect(chatRes.body.data.messages[1].text).toBe("Second message");

      // 6. Fetch last messages
      const lastMsgRes = await request(app)
        .get("/api/chat/last-messages/all")
        .set("Cookie", `accessToken=${token1}`);

      expect(lastMsgRes.statusCode).toBe(200);
      expect(lastMsgRes.body.data.lastMessages[newChat._id.toString()].text).toBe("Second message");
    });
  });
});