import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import app from "../../app.js";
import { User } from "../../models/user.model.js";

describe("Profile API", () => {
  let accessToken;
  let userId;

  beforeEach(async () => {
    await User.deleteMany({});

    const hashedPassword = await bcrypt.hash("Strong@123", 10);

    const user = await User.create({
      firstName: "Sadaan",
      lastName: "Ansari",
      emailId: "sadaan@test.com",
      password: hashedPassword,
      age: 24,
      gender: "male",
      about: "Backend Developer",
    });

    userId = user._id;
    accessToken = user.generateAccessToken();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("GET /api/profile/view", () => {
    test("should fetch logged in user profile", async () => {
      const res = await request(app)
        .get("/api/profile/view")
        .set("Cookie", [`accessToken=${accessToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      expect(res.body.data.emailId).toBe("sadaan@test.com");
      expect(res.body.data.firstName).toBe("Sadaan");
    });

    test("should return unauthorized without token", async () => {
      const res = await request(app)
        .get("/api/profile/view");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should return unauthorized for invalid token", async () => {
      const res = await request(app)
        .get("/api/profile/view")
        .set("Cookie", ["accessToken=invalidtoken"]);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PATCH /api/profile/edit", () => {
    test("should update profile successfully", async () => {
      const res = await request(app)
        .patch("/api/profile/edit")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send({
          firstName: "Updated",
          about: "Node.js Backend Developer",
          age: 25,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      expect(res.body.data.firstName).toBe("Updated");
      expect(res.body.data.about).toBe("Node.js Backend Developer");
      expect(res.body.data.age).toBe(25);

      const updatedUser = await User.findById(userId);

      expect(updatedUser.firstName).toBe("Updated");
      expect(updatedUser.age).toBe(25);
    });

    test("should reject unauthorized edit", async () => {
      const res = await request(app)
        .patch("/api/profile/edit")
        .send({
          firstName: "Hack",
        });

      expect(res.statusCode).toBe(401);
    });

    test("should reject invalid token", async () => {
      const res = await request(app)
        .patch("/api/profile/edit")
        .set("Cookie", ["accessToken=invalidtoken"])
        .send({
          firstName: "Hack",
        });

      expect(res.statusCode).toBe(401);
    });

    test("should reject invalid field update", async () => {
      const res = await request(app)
        .patch("/api/profile/edit")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send({
          password: "NewPassword@123",
        });

      expect(res.statusCode).toBe(400);
    });

    test("should reject invalid age", async () => {
      const res = await request(app)
        .patch("/api/profile/edit")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send({
          age: 15,
        });

      expect(res.statusCode).toBe(400);
    });

    test("should reject invalid photo url", async () => {
      const res = await request(app)
        .patch("/api/profile/edit")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send({
          photoUrl: "abc",
        });

      expect(res.statusCode).toBe(400);
    });

    test("should reject invalid github url", async () => {
      const res = await request(app)
        .patch("/api/profile/edit")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send({
          githubUrl: "github",
        });

      expect(res.statusCode).toBe(400);
    });

    test("should reject invalid linkedin url", async () => {
      const res = await request(app)
        .patch("/api/profile/edit")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send({
          linkedinUrl: "linkedin",
        });

      expect(res.statusCode).toBe(400);
    });

    test("should reject invalid portfolio url", async () => {
      const res = await request(app)
        .patch("/api/profile/edit")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send({
          portfolioUrl: "portfolio",
        });

      expect(res.statusCode).toBe(400);
    });

    test("should update multiple fields together", async () => {
      const res = await request(app)
        .patch("/api/profile/edit")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send({
          firstName: "John",
          lastName: "Doe",
          location: "Mumbai",
          currentCompany: "OpenAI",
          experience: 3,
          about: "Full Stack Developer",
        });

      expect(res.statusCode).toBe(200);

      expect(res.body.data.firstName).toBe("John");
      expect(res.body.data.lastName).toBe("Doe");
      expect(res.body.data.location).toBe("Mumbai");
      expect(res.body.data.currentCompany).toBe("OpenAI");
      expect(res.body.data.experience).toBe(3);
    });
  });
});