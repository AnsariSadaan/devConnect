import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const MessageList = ({ messages }) => {
  const bottomRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {  
    bottomRef.current?.scrollIntoView({
      behavior: messages.length < 5 ? "auto" : "smooth"
    });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-gray-500">
          Start your conversation 👋
        </p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <div className="p-4 space-y-3">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default MessageList;