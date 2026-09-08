import React from "react";
import { useSelector } from "react-redux";
import { FiArrowLeft } from "react-icons/fi";

const ChatHeader = ({ onBack, showBack }) => {
  const selectedUser = useSelector((store) => store.chat.selectedUser);
  const onlineUsers = useSelector((store) => store.chat.onlineUsers);
  const isTyping = useSelector((store) => store.chat.isTyping);
  const selectedChatId = useSelector((store) => store.chat.selectedChatId);

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);
  const typingStatus = isTyping[selectedChatId];
  const isUserTyping = typingStatus?.isTyping && typingStatus?.userId === selectedUser._id;

  // return (
  //   <div className="h-14 border-b border-base-content/10 bg-base-200 px-4 flex items-center justify-between flex-shrink-0">
  //     <div className="flex items-center gap-3">
  //       {showBack && (
  //         <button
  //           onClick={onBack}
  //           className="btn btn-circle btn-ghost btn-sm"
  //         >
  //           <FiArrowLeft className="w-5 h-5" />
  //         </button>
  //       )}
  //       <div className="avatar online">
  //         <div className="w-10 rounded-full">
  //           <img
  //             src={selectedUser.photoUrl || `https://ui-avatars.com/api/?name=${selectedUser.firstName}`}
  //             alt={selectedUser.firstName}
  //           />
  //         </div>
  //       </div>
  //       <div>
  //         <h2 className="font-semibold text-sm">
  //           {selectedUser.firstName} {selectedUser.lastName}
  //         </h2>
  //         <p className="text-xs text-success">
  //           Online
  //         </p>
  //       </div>
  //     </div>
  //   </div>
  // );

  // Get status text and color
  
  const getStatusDisplay = () => {
    if (isUserTyping) {
      return {
        text: "Typing...",
        className: "text-primary font-medium animate-pulse"
      };
    }
    if (isOnline) {
      return {
        text: "Online",
        className: "text-success"
      };
    }
    return {
      text: "Offline",
      className: "text-base-content/40"
    };
  };

  const status = getStatusDisplay();


  return (
    <div className="h-14 border-b border-base-content/10 bg-base-200 px-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Back Button - Mobile only */}
        {showBack && (
          <button
            onClick={onBack}
            className="btn btn-circle btn-ghost btn-sm"
            aria-label="Go back"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-10 rounded-full ring ring-primary/20 ring-offset-2 ring-offset-base-200">
            <img
              src={selectedUser.photoUrl || `https://ui-avatars.com/api/?name=${selectedUser.firstName}`}
              alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
              className="object-cover"
            />
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-sm">
            {selectedUser.firstName} {selectedUser.lastName}
          </h2>
          <p className={`text-xs transition-all duration-300 ${status.className}`}>
            {status.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;