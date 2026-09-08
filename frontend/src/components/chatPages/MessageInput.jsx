import React, { useEffect, useRef } from "react";
import { FiSend } from "react-icons/fi";

const MessageInput = ({
  newMessage,
  setNewMessage,
  sendMessage,
  handleTyping,
}) => {
  const typingTimeoutRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    // Handle typing indicator
    if (handleTyping) {
      if (value.trim()) {
        handleTyping(true);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing after 2 seconds of no input
        typingTimeoutRef.current = setTimeout(() => {
          handleTyping(false);
        }, 2000);
      } else {
        handleTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // return (
  //   <div className="border-t border-base-content/10 bg-base-200 px-4 py-3">
  //     <div className="flex items-center gap-2">
  //       <input
  //         type="text"
  //         placeholder="Type a message..."
  //         className="input input-bordered flex-1 text-sm h-10"
  //         value={newMessage}
  //         onChange={(e) => setNewMessage(e.target.value)}
  //         onKeyDown={handleKeyDown}
  //       />
  //       <button
  //         className="btn btn-primary btn-circle btn-sm"
  //         onClick={sendMessage}
  //         disabled={!newMessage.trim()}
  //       >
  //         <FiSend size={16} />
  //       </button>
  //     </div>
  //   </div>
  // );

  return (
    <div className="border-t border-base-content/10 bg-base-200 px-4 py-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="input input-bordered flex-1 text-sm h-10"
          value={newMessage}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <button
          className="btn btn-primary btn-circle btn-sm"
          onClick={sendMessage}
          disabled={!newMessage.trim()}
        >
          <FiSend size={16} />
        </button>
      </div>
    </div>
  );

};


export default MessageInput;