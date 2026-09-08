import request from "supertest";
import app from "../../app.js";

describe("Logout API", () => {

  const agent = request.agent(app);

  beforeEach(async () => {

    await agent
      .post("/api/signup")
      .send({
        firstName: "Sadaan",
        lastName: "Ansari",
        emailId: "logout@test.com",
        password: "Strong@123"
      });

  });

  it("should logout successfully", async () => {

    const res = await agent
      .post("/api/logout");

    expect(res.statusCode).toBe(200);

    expect(res.body.message)
      .toBe("Logout Successfully");
  });

  it("should return unauthorized without login", async () => {

    const res = await request(app)
      .post("/api/logout");

    expect(res.statusCode).toBe(401);
  });

});