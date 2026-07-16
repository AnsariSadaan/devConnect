import React from "react";
import { FiSend } from "react-icons/fi";

const MessageInput = ({
  newMessage,
  setNewMessage,
  sendMessage,
}) => {

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="border-t border-base-content/10 bg-base-200 p-4">
      <div className="flex items-center gap-3">

        {/* Emoji Button (Future Use) */}
        <button
          className="btn btn-circle btn-ghost text-xl"
          disabled
          title="Coming Soon"
        >
          😊
        </button>

        {/* Input */}
        <input
          type="text"
          placeholder="Type a message..."
          className="input input-bordered flex-1"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* Send */}
        <button
          className="btn btn-primary btn-circle"
          onClick={sendMessage}
          disabled={!newMessage.trim()}
        >
          <FiSend size={18} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;