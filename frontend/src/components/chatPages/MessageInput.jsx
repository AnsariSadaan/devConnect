import React from "react";
import { FiSend } from "react-icons/fi";

const MessageInput = ({
  newMessage,
  setNewMessage,
  sendMessage,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="border-t border-base-content/10 bg-base-200 px-4 py-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="input input-bordered flex-1 text-sm h-10"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
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