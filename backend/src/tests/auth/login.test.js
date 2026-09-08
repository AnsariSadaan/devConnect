import request from "supertest";
import app from "../../app.js";
import { User } from "../../models/user.model.js";

describe("Login API", () => {

  beforeEach(async () => {
    await User.create({
      firstName: "Sadaan",
      lastName: "Ansari",
      emailId: "sadaan@test.com",
      password: "Strong@123"
    });
  });

  it("should login successfully", async () => {

    const res = await request(app)
      .post("/api/login")
      .send({
        emailId: "sadaan@test.com",
        password: "Strong@123"
      });

    expect(res.statusCode).toBe(200);

    expect(res.body.message)
      .toBe("Login Successfully");

    expect(res.body.data.emailId)
      .toBe("sadaan@test.com");

    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should fail if password is incorrect", async () => {

    const res = await request(app)
      .post("/api/login")
      .send({
        emailId: "sadaan@test.com",
        password: "WrongPassword@123"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should fail if email doesn't exist", async () => {

    const res = await request(app)
      .post("/api/login")
      .send({
        emailId: "unknown@test.com",
        password: "Strong@123"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should fail when email is missing", async () => {

    const res = await request(app)
      .post("/api/login")
      .send({
        password: "Strong@123"
      });

    expect(res.statusCode).toBe(400);
  });

});