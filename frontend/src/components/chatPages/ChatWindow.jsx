import React from "react";
import { useSelector } from "react-redux";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import useChat from "../../hooks/useChat";

const ChatWindow = ({ onBack }) => {
  const selectedUser = useSelector((store) => store.chat.selectedUser);
  const messages = useSelector((store) => store.chat.messages);
  const isMobile = window.innerWidth < 768;
  
  const {
    newMessage,
    setNewMessage,
    sendMessage,
    handleTyping,
  } = useChat();

  if (!selectedUser) {
    return (
      <div className="h-full flex items-center justify-center bg-base-100">
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold">
            Welcome to DevConnect Chat 👋
          </h2>
          <p className="mt-2 opacity-60 text-sm">
            Select a conversation to start messaging.
          </p>
        </div>
      </div>
    );
  }

  // return (
  //   <div className="flex flex-col h-full overflow-hidden bg-base-100">
  //     {/* Chat Header - fixed at top */}
  //     <div className="flex-shrink-0">
  //       {isMobile && onBack ? (
  //         <ChatHeader onBack={onBack} showBack={true} />
  //       ) : (
  //         <ChatHeader />
  //       )}
  //     </div>
      
  //     {/* Message List - takes remaining space */}
  //     <div className="flex-1 min-h-0 overflow-hidden">
  //       <MessageList messages={messages} />
  //     </div>
      
  //     {/* Message Input - fixed at bottom */}
  //     <div className="flex-shrink-0">
  //       <MessageInput
  //         newMessage={newMessage}
  //         setNewMessage={setNewMessage}
  //         sendMessage={sendMessage}
  //       />
  //     </div>
  //   </div>
  // );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-base-100">
      {/* Chat Header - fixed at top */}
      <div className="flex-shrink-0">
        {isMobile && onBack ? (
          <ChatHeader onBack={onBack} showBack={true} />
        ) : (
          <ChatHeader />
        )}
      </div>

      {/* Message List - takes remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageList messages={messages} />
      </div>

      {/* Message Input - fixed at bottom */}
      <div className="flex-shrink-0">
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          handleTyping={handleTyping}
        />
      </div>
    </div>
  );
};

export default ChatWindow;