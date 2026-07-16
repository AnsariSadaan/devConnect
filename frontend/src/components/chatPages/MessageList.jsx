import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const MessageList = ({ messages }) => {

  const bottomRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-base-100">

      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">
            Start your conversation 👋
          </p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
            />
          ))}

          {/* Scroll Target */}
          <div ref={bottomRef} />
        </>
      )}

    </div>
  );
};

export default MessageList;