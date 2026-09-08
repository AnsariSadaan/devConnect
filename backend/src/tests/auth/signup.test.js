import request from "supertest";
import app from "../../app.js";
import { User } from "../../models/user.model.js";

describe("Signup API", () => {

  it("should register user successfully", async () => {

    const res = await request(app)
      .post("/api/signup")
      .send({
        firstName: "Sadaan",
        lastName: "Ansari",
        emailId: "sadaan@test.com",
        password: "StrongPass@123"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.emailId)
      .toBe("sadaan@test.com");

    const user = await User.findOne({
      emailId: "sadaan@test.com"
    });

    expect(user).not.toBeNull();
  });

});