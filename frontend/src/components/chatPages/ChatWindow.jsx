import React from "react";
import { useSelector } from "react-redux";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import useChat from "../../hooks/useChat";

const ChatWindow = () => {
  const selectedUser = useSelector((store) => store.chat.selectedUser);
  const messages = useSelector((store) => store.chat.messages);
  const {
    newMessage,
    setNewMessage,
    sendMessage,
  } = useChat();

  if (!selectedUser) {
    return (
      <div className="h-full flex items-center justify-center bg-base-100">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">
            Welcome to DevConnect Chat 👋
          </h2>

          <p className="mt-2 opacity-60">
            Select a conversation to start messaging.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-base-100">

      <ChatHeader />
      <MessageList messages={messages} />
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
      />

    </div>
  );
};

export default ChatWindow;