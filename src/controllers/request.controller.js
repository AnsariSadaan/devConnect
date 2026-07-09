import { ConnectionRequest } from "../models/connectionRequest.model.js";
import { Connection } from "../models/connection.model.js";
import { User } from "../models/user.model.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import mongoose from "mongoose";

import sendEmail from "../utils/sendEmail.js";

const IGNORE_DURATION = 5 * 24 * 60 * 60 * 1000; // 5 days

const sendRequest = AsyncHandler(async (req, res) => {
  const fromUserId = req.user._id;
  const { toUserId, status } = req.params;

  const allowedStatus = ["interested", "ignored"];

  if (!allowedStatus.includes(status)) {
    throw new ApiError(400, "Invalid request status.");
  }

  const toUser = await User.findById(toUserId);

  if (!toUser) {
    throw new ApiError(404, "Recipient user not found.");
  }

  
  // Prevent sending request if users are already connected
  const existingConnection = await Connection.findOne({
    users: {
      $all: [fromUserId, toUserId],
    },
  });

  if (existingConnection) {
    throw new ApiError(409, "You are already connected.");
  }

  // Find existing request in either direction
  const existingRequest = await ConnectionRequest.findOne({
    $or: [
      {
        fromUserId,
        toUserId,
      },
      {
        fromUserId: toUserId,
        toUserId: fromUserId,
      },
    ],
  });

  // Existing request found
  if (existingRequest) {

    //Ignore expired
    if (
      existingRequest.status === "ignored" &&
      existingRequest.ignoredUntil &&
      existingRequest.ignoredUntil <= new Date()
    ) {
      existingRequest.fromUserId = fromUserId;
      existingRequest.toUserId = toUserId;
      existingRequest.status = status;
      existingRequest.ignoredUntil =
        status === "ignored"
          ? new Date(Date.now() + IGNORE_DURATION)
          : null;

      const updatedRequest = await existingRequest.save();

      try {
        await sendEmail.run(
          `A new friend request from ${req.user.firstName}`,
          `${req.user.firstName} is ${status} in ${toUser.firstName}`
        );
      } catch (err) {
        console.error("Email failed:", err.message);
      }

      return res.status(200).json(
        new ApiResponse(200, updatedRequest, `Connection request ${status}`)
      );
    }
    throw new ApiError(409, "Connection request already exists.");
  }
  
  // Create new request
  try {
    const connectionRequest = await ConnectionRequest.create({
      fromUserId,
      toUserId,
      status,
      ignoredUntil:
        status === "ignored"
          ? new Date(Date.now() + IGNORE_DURATION)
          : null,
    });

    try {
      await sendEmail.run(
        `A new friend request from ${req.user.firstName}`,
        `${req.user.firstName} is ${status} in ${toUser.firstName}`
      );
    } catch (err) {
      console.error("Email failed:", err.message);
    }

    return res.status(201).json(
      new ApiResponse(201, connectionRequest, `Connection request ${status}`)
    );
  } catch (err) {
    
    // Handle race condition
    if (err.code === 11000) {
      throw new ApiError(409, "Connection request already exists.");
    }

    throw err;
  }
});

const reviewRequest = AsyncHandler(async (req, res) => {
  const loggedInUser = req.user;
  const { requestId, status } = req.params;

  const allowedStatus = ["accepted", "rejected"];

  if (!allowedStatus.includes(status)) {
    throw new ApiError(400,"Invalid review status.");
  }

  const connectionRequest = await ConnectionRequest.findOne({
    _id: requestId,
    toUserId: loggedInUser._id,
    status: "interested",
  });

  if (!connectionRequest) {
    throw new ApiError(404,"Connection request not found or already reviewed.");
  }

  console.log("Request Found:", connectionRequest);
  console.log("From:",connectionRequest.fromUserId.toString());
  console.log("To:",connectionRequest.toUserId.toString());

  // Reject Request
  if (status === "rejected") {
    connectionRequest.status = "rejected";
    const rejectedRequest = await connectionRequest.save();
    return res.status(200).json(
      new ApiResponse(200,rejectedRequest,"Connection request rejected.")
    );
  }

  // Accept Request
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // Check existing connection
    const existingConnection = await Connection.findOne({
      users: {
        $all: [
          connectionRequest.fromUserId,
          connectionRequest.toUserId,
        ],
      },
    }).session(session);

    if (existingConnection) {

      throw new ApiError(409,"Users are already connected.");
    }

    // Create connection
    const connection = await Connection.create(
      [
        {
          users: [
            connectionRequest.fromUserId,
            connectionRequest.toUserId,
          ],
        },
      ],
      {
        session,
      }
    );

    console.log("Connection created:",connection[0]);

    // Delete accepted request
    await ConnectionRequest.findByIdAndDelete(
      connectionRequest._id,
      {
        session,
      }
    );
    
    // Commit transaction
    await session.commitTransaction();
    return res.status(200).json(
      new ApiResponse(200,connection[0],"Connection accepted successfully.")
    );
  } catch (error) {
    // Rollback all changes
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

export { sendRequest, reviewRequest };