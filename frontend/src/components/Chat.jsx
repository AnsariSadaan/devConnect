import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ChatSidebar from "./chatPages/ChatSidebar";
import ChatWindow from "./chatPages/ChatWindow";
import { FiArrowLeft } from "react-icons/fi";

const Chat = () => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const selectedUser = useSelector((store) => store.chat.selectedUser);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-show chat window when a user is selected on mobile
  useEffect(() => {
    if (isMobileView && selectedUser) {
      setShowChatWindow(true);
    }
  }, [selectedUser, isMobileView]);

  // Handle back button on mobile
  const handleBack = () => {
    setShowChatWindow(false);
  };

  return (
    // <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-8rem)]">
    <div className="h-[calc(100vh-64px)] md:hh-[calc(100vh-64px)] overflow-hidden">
      <div className="h-full bg-base-100 overflow-hidden border-0 rounded-none">
        
        {/* Desktop View */}
        {!isMobileView ? (
          <div className="grid grid-cols-12 h-full overflow-hidden border-r">
            {/* Sidebar - 4 columns */}
            <div className="col-span-4 border-r border-base-content/10 h-full">
              <ChatSidebar />
            </div>
            
            {/* Chat Window - 8 columns */}
            <div className="col-span-8 h-full overflow-hidden">
              <ChatWindow />
            </div>
          </div>
        ) : (
          /* Mobile View - WhatsApp style */
          <div className="relative h-full overflow-hidden">
            {/* Sidebar (Users List) - shown when no chat is open */}
            <div 
              className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                showChatWindow ? '-translate-x-full' : 'translate-x-0'
              }`}
            >
              <ChatSidebar onUserSelect={() => setShowChatWindow(true)} />
            </div>

            {/* Chat Window - slides in from right */}
            <div 
              className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                showChatWindow ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="relative h-full flex flex-col bg-base-100">
                {/* Back button - fixed at top */}
                <div className="absolute top-3 left-3 z-10">
                  <button
                    onClick={handleBack}
                    className="btn btn-circle btn-ghost btn-sm bg-base-100/80 backdrop-blur-sm shadow-lg"
                  >
                    <FiArrowLeft className="w-5 h-5" />
                  </button>
                </div>
                <ChatWindow onBack={handleBack} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;