import React from "react";
import ChatSidebar from "./chatPages/ChatSidebar";
import ChatWindow from "./chatPages/ChatWindow";

const Chat = () => {
  return (
    <div className="max-w-7xl mx-auto my-6">
      <div className="bg-base-300 rounded-xl shadow-xl overflow-hidden border border-base-content/10">
        <div className="grid grid-cols-12 h-[80vh]">
            
          {/* Sidebar */}
          <div className="col-span-4 border-r border-base-content/10 min-h-0">
            <ChatSidebar />
          </div>
          
          {/* Chat Window */}
          <div className="col-span-8 min-h-0">
            <ChatWindow />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;