import React from "react";
import { useSelector } from "react-redux";

const MessageBubble = ({ message }) => {
  const currentUser = useSelector((store) => store.user);

  if (!message || !message.senderId) {
    console.warn("Invalid message:", message);
    return null;
  }

  const isMine = currentUser?._id?.toString() === message.senderId?.toString();
  
  return (
    <div className={`chat ${isMine ? "chat-end" : "chat-start"}`}>
      {/* Sender Name */}
      <div className="chat-header mb-1">
        {!isMine
          ? `${message.firstName} ${message.lastName}`
          : "You"}

        <time className="text-xs opacity-50 ml-2">
          {message.createdAt
            ? new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </time>
      </div>

      {/* Message Bubble */}
      <div
        className={`chat-bubble max-w-xs lg:max-w-md break-words ${
          isMine
            ? "chat-bubble-primary"
            : "chat-bubble-neutral"
        }`}
      >
        {message.text || "Empty message"}
      </div>

      {/* Footer */}
      <div className="chat-footer opacity-60 text-xs mt-1">
        {isMine ? message.status || "Seen" : ""}
      </div>
    </div>
  );
};

export default MessageBubble;