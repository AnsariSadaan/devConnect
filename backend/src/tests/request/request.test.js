import request from "supertest";
import mongoose from "mongoose";
import { jest } from "@jest/globals";
import { User } from "../../models/user.model.js";
import { Connection } from "../../models/connection.model.js";
import { ConnectionRequest } from "../../models/connectionRequest.model.js";

jest.unstable_mockModule("../../utils/sendEmail.js", () => ({
  default: {
    run: jest.fn().mockResolvedValue(true),
  },
}));

const { default: app } = await import("../../app.js");

describe("Connection Request API", () => {

  let cookie1;
  let cookie2;
  let user1;
  let user2;


  beforeEach(async () => {
    // User 1
    const signup1 = await request(app)
      .post("/api/signup")
      .send({
        firstName: "John",
        lastName: "Doe",
        emailId: `john${Date.now()}@gmail.com`,
        password: "Strong@123",
        age: 25,
        gender: "male"
      });

    cookie1 = signup1.headers["set-cookie"];
    user1 = signup1.body.data;

    // User 2
    const signup2 = await request(app)
      .post("/api/signup")
      .send({
        firstName: "Jane",
        lastName: "Doe",
        emailId: `jane${Date.now()}@gmail.com`,
        password: "Strong@123",
        age: 24,
        gender: "female"
      });

    cookie2 = signup2.headers["set-cookie"];
    user2 = signup2.body.data;
  });

  describe("POST /api/request/send/:status/:toUserId", () => {

    test("should send interested request", async () => {
      const res = await request(app)
        .post(`/api/request/send/interested/${user2._id}`)
        .set("Cookie", cookie1);
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toContain("Connection request interested");
    });

    test("should send ignored request", async () => {
      const res = await request(app)
        .post(`/api/request/send/ignored/${user2._id}`)
        .set("Cookie", cookie1);
      expect(res.statusCode).toBe(201);
      expect(res.body.data.status).toBe("ignored");
    });

    test("should reject unauthorized request", async () => {
      const res = await request(app)
        .post(`/api/request/send/interested/${user2._id}`);
      expect(res.statusCode).toBe(401);
    });

    test("should reject invalid status", async () => {
      const res = await request(app)
        .post(`/api/request/send/random/${user2._id}`)
        .set("Cookie", cookie1);

      expect(res.statusCode).toBe(400);
    });

    test("should reject recipient not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
      	.post(`/api/request/send/interested/${fakeId}`)
        .set("Cookie", cookie1);
      expect(res.statusCode).toBe(404);
    });

    test("should reject self request", async () => {
      const res = await request(app)
        .post(`/api/request/send/interested/${user1._id}`)
        .set("Cookie", cookie1);
      expect(res.statusCode).toBe(403);
    });

    test("should reject duplicate request", async () => {
      await request(app)
        .post(`/api/request/send/interested/${user2._id}`)
        .set("Cookie", cookie1);
      const res = await request(app)
        .post(`/api/request/send/interested/${user2._id}`)
        .set("Cookie", cookie1);
      expect(res.statusCode).toBe(409);
     });

    test("should reject if users already connected", async () => {
      await Connection.create({
        users: [user1._id, user2._id]
      });
   	  const res = await request(app)
        .post(`/api/request/send/interested/${user2._id}`)
        .set("Cookie", cookie1);
      expect(res.statusCode).toBe(409);
     });

    test("should resend expired ignored request", async () => {
      await ConnectionRequest.create({
	      fromUserId: user1._id,
	      toUserId: user2._id,
	      status: "ignored",
	      ignoredUntil: new Date(Date.now() - 10000)
      });
      const res = await request(app)
        .post(`/api/request/send/interested/${user2._id}`)
        .set("Cookie", cookie1);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe("interested");
    });
  });


  describe("POST /api/request/review/:status/:requestId", () => {
    let cookie1;
	  let cookie2;
	  let user1;
	  let user2;
	  let requestId;

    beforeEach(async () => {
			
	    await User.deleteMany({});
	    await Connection.deleteMany({});
	    await ConnectionRequest.deleteMany({});

	    const signup1 = await request(app)
	      .post("/api/signup")
	      .send({
	        firstName: "John",
	        lastName: "Doe",
	        emailId: `john${Date.now()}@gmail.com`,
	        password: "Strong@123",
	      });

	    cookie1 = signup1.headers["set-cookie"];
	    user1 = signup1.body.data;

	    const signup2 = await request(app)
	      .post("/api/signup")
	      .send({
	        firstName: "Jane",
	        lastName: "Doe",
	        emailId: `jane${Date.now()}@gmail.com`,
	        password: "Strong@123",
	      });

	    cookie2 = signup2.headers["set-cookie"];
	    user2 = signup2.body.data;

	    const reqDoc = await ConnectionRequest.create({
	      fromUserId: user1._id,
	      toUserId: user2._id,
	      status: "interested",
	    });

	    requestId = reqDoc._id;
    });

    test("should accept request", async () => {
			const res = await request(app)
			  .post(`/api/request/review/accepted/${requestId}`)
			  .set("Cookie", cookie2);

      expect(res.statusCode).toBe(200);
      expect(res.body.message)
        .toContain("Connection accepted successfully.");
    });

		test("should reject request", async () => {
			const res = await request(app)
				.post(`/api/request/review/rejected/${requestId}`)
				.set("Cookie", cookie2);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe("rejected");
    });

    test("should reject unauthorized review", async () => {
      const res = await request(app)
        .post(`/api/request/review/accepted/${requestId}`);
      expect(res.statusCode).toBe(401);
    });

    test("should reject invalid review status", async () => {
      const res = await request(app)
        .post(`/api/request/review/random/${requestId}`)
        .set("Cookie", cookie2);
      expect(res.statusCode).toBe(400);
    });

    test("should return 404 if request not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/request/review/accepted/${fakeId}`)
        .set("Cookie", cookie2);
      expect(res.statusCode).toBe(404);
    });

	  test("should reject if already connected", async () => {
      await Connection.create({
        users: [user1._id, user2._id]
      });
          
      const res = await request(app)
        .post(`/api/request/review/accepted/${requestId}`)
        .set("Cookie", cookie2);
      expect(res.statusCode).toBe(409);
    });
  });
});