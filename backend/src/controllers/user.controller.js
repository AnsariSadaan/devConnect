import { ConnectionRequest } from "../models/connectionRequest.model.js";
import { Connection } from "../models/connection.model.js";
import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const USER_SAFE_DATA =
  "firstName lastName photoUrl age gender about skills location currentCompany experience";

const Feed = AsyncHandler(async (req, res) => {
  const loggedInUser = req.user;
  const now = new Date();

  // Active requests
  const requests = await ConnectionRequest.find({
    $and: [
      {
        $or: [
          {
            fromUserId: loggedInUser._id
          },
          {
            toUserId: loggedInUser._id
          }
        ]
      },
      {
        $or: [
          {
            status: "interested"
          },
          {
            status: "ignored",
            ignoredUntil: {
              $gt: now
            }
          }
        ]
      }
    ]
  });

  // Existing connections
  const connections = await Connection.find({
    users: loggedInUser._id,
  });

  const excludedUserIds = new Set();

  excludedUserIds.add(loggedInUser._id.toString());

  // Exclude request users
  requests.forEach((request) => {
    excludedUserIds.add(request.fromUserId.toString());
    excludedUserIds.add(request.toUserId.toString());
  });

  // Exclude connected users
  connections.forEach((connection) => {
    connection.users.forEach((userId) => {
      excludedUserIds.add(userId.toString());
    });
  });

  const users = await User.find({
    _id: {
      $nin: [...excludedUserIds],
    },
  }).select(USER_SAFE_DATA);

  return res.status(200).json(
    new ApiResponse(200, users, "Feed fetched successfully."
    )
  );
});

const userRequestsReceived = AsyncHandler(async (req, res) => {
  const loggedInUser = req.user;

  const requests = await ConnectionRequest.find({
    toUserId: loggedInUser._id,
    status: "interested",
  }).populate("fromUserId", USER_SAFE_DATA);

  return res.status(200).json(
    new ApiResponse(200, requests,requests.length  ? "Requests fetched successfully."  : "No requests found.")
  );
});

const userConnection = AsyncHandler(async (req, res) => {
  const loggedInUser = req.user;

  const connections = await Connection.find({
    users: loggedInUser._id,
  }).populate("users", USER_SAFE_DATA);

  if (!connections.length) {
    return res.status(200).json(
      new ApiResponse(200, [], "No connections found.")
    );
  }

  const data = await Promise.all(
    connections.map(async (connection) => {
      const otherUser = connection.users.find(
        (user) =>
          user._id.toString() !== loggedInUser._id.toString()
      );

      let chat = await Chat.findOne({
        participants: {
          $all: [loggedInUser._id, otherUser._id],
        },
      });

      if (!chat) {
        chat = await Chat.create({
          participants: [
            loggedInUser._id,
            otherUser._id,
          ],
        });
      }

      return {
        _id: otherUser._id,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        photoUrl: otherUser.photoUrl,
        about: otherUser.about,
        skills: otherUser.skills,
        location: otherUser.location,
        currentCompany: otherUser.currentCompany,
        experience: otherUser.experience,
        isOnline: otherUser.isOnline,
        lastSeen: otherUser.lastSeen,
        chatId: chat._id,
        connectedAt: connection.connectedAt,
      };
    })
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      data,
      "Connections fetched successfully."
    )
  );
});

export {
  Feed,
  userRequestsReceived,
  userConnection,
};