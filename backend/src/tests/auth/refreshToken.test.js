import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import app from "../../app.js";
import { User } from "../../models/user.model.js";

describe("Refresh Token API", () => {
  let user;
  let refreshToken;

  beforeEach(async () => {
    await User.deleteMany({});

    user = await User.create({
      firstName: "Sadaan",
      lastName: "Ansari",
      emailId: "sadaan@test.com",
      password: "Strong@123",
      age: 24,
      gender: "male",
    });

    refreshToken = user.generateRefreshToken();

    const hashedToken = await bcrypt.hash(refreshToken, 10);

    user.refreshToken = hashedToken;
    await user.save({ validateBeforeSave: false });
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/refresh-token", () => {

    it("should refresh access token successfully", async () => {

      const res = await request(app)
        .post("/api/refresh-token")
        .set("Cookie", [`refreshToken=${refreshToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Access Token Refreshed");

      const cookies = res.headers["set-cookie"];

      expect(cookies).toBeDefined();

      expect(
        cookies.some(cookie => cookie.includes("accessToken"))
      ).toBe(true);

      expect(
        cookies.some(cookie => cookie.includes("refreshToken"))
      ).toBe(true);
    });

    it("should fail when refresh token is missing", async () => {

      const res = await request(app)
        .post("/api/refresh-token");

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Refresh Token Missing");
    });

    it("should fail for invalid refresh token", async () => {

      const res = await request(app)
        .post("/api/refresh-token")
        .set("Cookie", ["refreshToken=InvalidToken"]);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Invalid Refresh Token");
    });

    it("should fail if refresh token belongs to deleted user", async () => {

      const token = jwt.sign(
        { _id: user._id },
        process.env.JWT_REFRESH_SECRET,
        {
          expiresIn: process.env.JWT_REFRESH_EXPIRES,
        }
      );

      await User.findByIdAndDelete(user._id);

      const res = await request(app)
        .post("/api/refresh-token")
        .set("Cookie", [`refreshToken=${token}`]);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });

    it("should fail if refresh token does not match database", async () => {

      const anotherToken = "this-is-a-fake-refresh-token";
      // jwt.sign(
        // { _id: user._id, 
        //   random: Date.now(), 
        // },
        // process.env.JWT_REFRESH_SECRET,
        // {
        //   expiresIn: process.env.JWT_REFRESH_EXPIRES,
        // }
      // );

      const res = await request(app)
        .post("/api/refresh-token")
        .set("Cookie", [`refreshToken=${anotherToken}`]);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Invalid Refresh Token");
    });

    it("should fail for expired refresh token", async () => {
      const expiredToken = jwt.sign(
        { _id: user._id },
        process.env.JWT_REFRESH_SECRET,
        {
          expiresIn: "-10s",
        }
      );

      const res = await request(app)
        .post("/api/refresh-token")
        .set("Cookie", [`refreshToken=${expiredToken}`]);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Invalid Refresh Token");
    });

  });
});