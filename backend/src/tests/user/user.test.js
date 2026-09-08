import request from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";

import { User } from "../../models/user.model.js";
import { Connection } from "../../models/connection.model.js";
import { ConnectionRequest } from "../../models/connectionRequest.model.js";
import { Chat } from "../../models/chat.model.js";

describe("User API", () => {

  let user1;
  let user2;
  let user3;
  let user4;
  let user5;
  let token;

  beforeEach(async () => {

    await User.deleteMany({});
    await Connection.deleteMany({});
    await ConnectionRequest.deleteMany({});
    await Chat.deleteMany({});

    user1 = await User.create({
      firstName: "Sadaan",
      lastName: "Ansari",
      emailId: "sadaan@test.com",
      password: "Password@123",
      age: 25,
      gender: "male",
      skills: ["Node.js"],
      location: "Mumbai",
      about: "Backend Developer",
      currentCompany: "Tech Corp",
      experience: 3,
      photoUrl: "https://example.com/photo1.jpg"
    });

    user2 = await User.create({
      firstName: "Rahul",
      lastName: "Patil",
      emailId: "rahul@test.com",
      password: "Password@123",
      age: 26,
      gender: "male",
      skills: ["React"],
      location: "Mumbai",
      about: "Frontend Developer",
      currentCompany: "Tech Corp",
      experience: 2,
      photoUrl: "https://example.com/photo2.jpg"
    });

    user3 = await User.create({
      firstName: "Amit",
      lastName: "Sharma",
      emailId: "amit@test.com",
      password: "Password@123",
      age: 27,
      gender: "male",
      skills: ["Python"],
      location: "Delhi",
      about: "Full Stack Developer",
      currentCompany: "Google",
      experience: 4,
      photoUrl: "https://example.com/photo3.jpg"
    });

    user4 = await User.create({
      firstName: "Priya",
      lastName: "Patel",
      emailId: "priya@test.com",
      password: "Password@123",
      age: 24,
      gender: "female",
      skills: ["Java"],
      location: "Bangalore",
      about: "Backend Developer",
      currentCompany: "Microsoft",
      experience: 2,
      photoUrl: "https://example.com/photo4.jpg"
    });

    user5 = await User.create({
      firstName: "Neha",
      lastName: "Singh",
      emailId: "neha@test.com",
      password: "Password@123",
      age: 23,
      gender: "female",
      skills: ["AWS"],
      location: "Pune",
      about: "DevOps Engineer",
      currentCompany: "Amazon",
      experience: 1,
      photoUrl: "https://example.com/photo5.jpg"
    });

    token = user1.generateAccessToken();
  });

  describe("GET /limits", ()=> {

    test("Should reject unauthorized request", async ()=> {
      const res = await request(app)
        .get("/api/limits");
      expect(res.statusCode).toBe(401);
    })

    test("Should get limits for free users", async ()=> {
      const res = await request(app)
        .get("/api/limits")
        .set("Cookie", `accessToken=${token}`)

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isPremium).toBe(false);
      expect(res.body.data.requests).toHaveProperty("used");
      expect(res.body.data.requests).toHaveProperty("max");
      expect(res.body.data.messages).toHaveProperty("used");
      expect(res.body.data.messages).toHaveProperty("max");
      expect(res.body.data.requests.max).toBe(10);
      expect(res.body.data.messages.max).toBe(100);
    })

    test("Should get limits for premium user", async () => {
      user1.isPremium = true;
      user1.membershipType = "gold";
      user1.premiumSince = new Date();
      user1.premiumExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      await user1.save();

      // Generate new token for premium user
      const premiumToken = user1.generateAccessToken();

      const res = await request(app)
        .get("/api/limits")
        .set("Cookie", `accessToken=${premiumToken}`)

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isPremium).toBe(true);
      expect(res.body.data.requests.max).toBe("unlimited");
      expect(res.body.data.messages.max).toBe("unlimited");
    })

    test("Should count today's connection request", async () => {

      // Create some requests for today
      await ConnectionRequest.create({
        fromUserId: user1._id,
        toUserId: user2._id,
        status: "interested"
      });
      await ConnectionRequest.create({
        fromUserId: user1._id,
        toUserId: user3._id,
        status: "interested"
      });

      const res = await request(app)
        .get("/api/limits")
        .set("Cookie", `accessToken=${token}`)

      expect(res.statusCode).toBe(200);
      expect(res.body.data.requests.used).toBe(2);
    })
  });

  describe("GET /api/feed", () => {
    test("should reject unauthorized request", async () => {
      const res = await request(app)
        .get("/api/feed");
      expect(res.statusCode).toBe(401);
    });

    test("should return feed with all users except self", async () => {
      const res = await request(app)
        .get("/api/feed")
        .set("Cookie", `accessToken=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(4); // user2, user3, user4, user5
      
      // Should not include user1 (self)
      const userInFeed = res.body.data.some(user => user._id === user1._id.toString());
      expect(userInFeed).toBe(false);
      
      // Should only return safe data fields
      const firstUser = res.body.data[0];
      expect(firstUser).toHaveProperty("firstName");
      expect(firstUser).toHaveProperty("lastName");
      expect(firstUser).toHaveProperty("photoUrl");
      expect(firstUser).toHaveProperty("age");
      expect(firstUser).toHaveProperty("gender");
      expect(firstUser).toHaveProperty("about");
      expect(firstUser).toHaveProperty("skills");
      expect(firstUser).toHaveProperty("location");
      expect(firstUser).toHaveProperty("currentCompany");
      expect(firstUser).toHaveProperty("experience");
      expect(firstUser).not.toHaveProperty("emailId");
      expect(firstUser).not.toHaveProperty("password");
    });

    test("should exclude users with active connection requests", async () => {
      // Create request from user1 to user2
      await ConnectionRequest.create({
        fromUserId: user1._id,
        toUserId: user2._id,
        status: "interested"
      });

      const res = await request(app)
        .get("/api/feed")
        .set("Cookie", `accessToken=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(3); // user3, user4, user5
      
      const userInFeed = res.body.data.some(user => user._id === user2._id.toString());
      expect(userInFeed).toBe(false);
    });

    test("should exclude users with active ignored requests", async () => {
      // Create ignored request from user1 to user2
      await ConnectionRequest.create({
        fromUserId: user1._id,
        toUserId: user2._id,
        status: "ignored",
        ignoredUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
      });

      const res = await request(app)
        .get("/api/feed")
        .set("Cookie", `accessToken=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(3); // user3, user4, user5
      
      const userInFeed = res.body.data.some(user => user._id === user2._id.toString());
      expect(userInFeed).toBe(false);
    });

    test("should include users with expired ignored requests", async () => {
      // Create ignored request that expired
      await ConnectionRequest.create({
        fromUserId: user1._id,
        toUserId: user2._id,
        status: "ignored",
        ignoredUntil: new Date(Date.now() - 1000) // Expired
      });

      const res = await request(app)
        .get("/api/feed")
        .set("Cookie", `accessToken=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(4); // user2, user3, user4, user5
      
      const userInFeed = res.body.data.some(user => user._id === user2._id.toString());
      expect(userInFeed).toBe(true);
    });

    test("should exclude connected users", async () => {
      // Create connection between user1 and user2
      await Connection.create({
        users: [user1._id, user2._id]
      });

      const res = await request(app)
        .get("/api/feed")
        .set("Cookie", `accessToken=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(3); // user3, user4, user5
      
      const userInFeed = res.body.data.some(user => user._id === user2._id.toString());
      expect(userInFeed).toBe(false);
    });

    test("should exclude both active and connected users", async () => {
      // Create connection between user1 and user2
      await Connection.create({
        users: [user1._id, user2._id]
      });

      // Create request from user1 to user3
      await ConnectionRequest.create({
        fromUserId: user1._id,
        toUserId: user3._id,
        status: "interested"
      });

      const res = await request(app)
        .get("/api/feed")
        .set("Cookie", `accessToken=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(2); // user4, user5
      
      const user2InFeed = res.body.data.some(user => user._id === user2._id.toString());
      const user3InFeed = res.body.data.some(user => user._id === user3._id.toString());
      expect(user2InFeed).toBe(false);
      expect(user3InFeed).toBe(false);
    });

    test("should return empty feed if no users available", async () => {
      // Create connections with all other users
      await Connection.create({
        users: [user1._id, user2._id]
      });
      await Connection.create({
        users: [user1._id, user3._id]
      });
      await Connection.create({
        users: [user1._id, user4._id]
      });
      await Connection.create({
        users: [user1._id, user5._id]
      });

      const res = await request(app)
        .get("/api/feed")
        .set("Cookie", `accessToken=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe("GET /api/request/received", () => {
    test("should reject unauthorized request", async () => {
      const res = await request(app)
        .get("/api/request/received");
      expect(res.statusCode).toBe(401);
    });

    test("should return empty when no requests received", async () => {
      const res = await request(app)
        .get("/api/request/received")
        .set("Cookie", `accessToken=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
      expect(res.body.message).toBe("No requests found.");
    });

    test("should return received connection requests", async () => {
      // Create requests from user2 and user3 to user1
      await ConnectionRequest.create({
        fromUserId: user2._id,
        toUserId: user1._id,
        status: "interested"
      });
      await ConnectionRequest.create({
        fromUserId: user3._id,
        toUserId: user1._id,
        status: "interested"
      });

      const res = await request(app)
        .get("/api/request/received")
        .set("Cookie", `accessToken=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.message).toBe("Requests fetched successfully.");
      
      // Check that fromUserId is populated with safe data
      const firstRequest = res.body.data[0];
      expect(firstRequest.fromUserId).toHaveProperty("firstName");
      expect(firstRequest.fromUserId).toHaveProperty("lastName");
      expect(firstRequest.fromUserId).toHaveProperty("photoUrl");
      expect(firstRequest.fromUserId).not.toHaveProperty("emailId");
      expect(firstRequest.fromUserId).not.toHaveProperty("password");
    });

    test("should only return requests with status 'interested'", async () => {
      // Create different types of requests
      await ConnectionRequest.create({
        fromUserId: user2._id,
        toUserId: user1._id,
        status: "interested"
      });
      await ConnectionRequest.create({
        fromUserId: user3._id,
        toUserId: user1._id,
        status: "accepted"
      });
      await ConnectionRequest.create({
        fromUserId: user4._id,
        toUserId: user1._id,
        status: "rejected"
      });

      const res = await request(app)
        .get("/api/request/received")
        .set("Cookie", `accessToken=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe("interested");
    });

    test("should populate fromUserId with correct user data", async () => {
      await ConnectionRequest.create({
        fromUserId: user2._id,
        toUserId: user1._id,
        status: "interested"
      });

      const res = await request(app)
        .get("/api/request/received")
        .set("Cookie", `accessToken=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data[0].fromUserId.firstName).toBe("Rahul");
      expect(res.body.data[0].fromUserId.lastName).toBe("Patil");
      expect(res.body.data[0].fromUserId.skills).toContain("React");
    });

    test("should not return requests sent by user", async () => {
      // Request sent by user1 to user2
      await ConnectionRequest.create({
        fromUserId: user1._id,
        toUserId: user2._id,
        status: "interested"
      });

      const res = await request(app)
        .get("/api/request/received")
        .set("Cookie", `accessToken=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe("GET /connections",()=>{

    test("should reject unauthorized request", async()=>{
      const res = await request(app)
        .get("/api/connections");
      expect(res.statusCode).toBe(401);
    });

    test("should return empty array when user has no connections", async()=>{
      const res = await request(app)
        .get("/api/connections")
        .set("Cookie", `accessToken=${token}`)
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.message).toBe("No connections found.");
    });

    test("should return connected users", async()=>{
      await Connection.create({
        users:[
          user1._id,
          user2._id
        ]
      });

      const res = await request(app)
        .get("/api/connections")
        .set("Cookie", `accessToken=${token}`)

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(1);

      const connectionUser = res.body.data[0];
      expect(connectionUser.firstName).toBe("Rahul");
      expect(connectionUser.lastName).toBe("Patil");
      expect(connectionUser.emailId).toBeUndefined();
      expect(connectionUser.password).toBeUndefined();
      expect(connectionUser.chatId).toBeDefined();
    });

    test("should create chat when connection has no chat", async()=>{
      await Connection.create({
        users:[
          user1._id,
          user2._id
        ]
      });
      
      let chats = await Chat.find();
      expect(chats.length).toBe(0);
      
      const res = await request(app)
        .get("/api/connections")
        .set("Cookie", `accessToken=${token}`)
      
      expect(res.statusCode).toBe(200);
      chats = await Chat.find();
      
      expect(chats.length).toBe(1);
      expect(chats[0].participants).toContainEqual(user1._id);
      expect(chats[0].participants).toContainEqual(user2._id);
    });

    test("should reuse existing chat instead of creating duplicate", async()=>{
      await Connection.create({
        users:[
          user1._id,
          user2._id
        ]
      });
      
      await Chat.create({
        participants:[
          user1._id,
          user2._id
        ]
      });

      await request(app)
        .get("/api/connections")
        .set("Cookie", `accessToken=${token}`)
      
      const chats = await Chat.find();
      expect(chats.length).toBe(1);
    });

    test("should return multiple connections", async()=>{
      await Connection.insertMany([
        {
          users:[
            user1._id,
            user2._id
          ]
        },
        {
          users:[
            user1._id,
            user3._id
          ]
        }
      ]);

      const res = await request(app)
        .get("/api/connections")
        .set("Cookie", `accessToken=${token}`)

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
    });
  });
});