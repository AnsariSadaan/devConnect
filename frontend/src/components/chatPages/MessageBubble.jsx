import React from "react";
import { useSelector } from "react-redux";

const MessageBubble = ({ message }) => {
  const currentUser = useSelector((store) => store.user);

  if (!message || !message.senderId) {
    return null;
  }

  const isMine = currentUser?._id?.toString() === message.senderId?.toString();
  
  // Format time
  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status icons
  const getStatusIcon = () => {
    if (!isMine) return null;
    switch (message.status) {
      case "sent":
        return <span className="text-xs opacity-40">✓</span>;
      case "delivered":
        return <span className="text-xs opacity-60">✓✓</span>;
      case "seen":
        return <span className="text-xs text-primary">✓✓</span>;
      default:
        return null;
    }
  };

  // return (
  //   <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
  //     {/* Sender Name */}
  //     {!isMine && (
  //       <span className="text-xs font-medium text-base-content/60 mb-0.5 ml-1">
  //         {message.firstName} {message.lastName}
  //       </span>
  //     )}
      
  //     {/* Message Bubble */}
  //     <div className="max-w-[70%] px-4 py-2 rounded-2xl break-words whitespace-pre-wrap text-sm">
  //       <div
  //         className={`px-4 py-2 rounded-2xl break-words text-sm ${
  //           isMine
  //             ? "bg-primary text-primary-content rounded-br-sm"
  //             : "bg-base-200 text-base-content rounded-bl-sm"
  //         }`}
  //       >
  //         {message.text || "Empty message"}
  //       </div>
  //     </div>

  //     {/* Timestamp */}
  //     <span className="text-[10px] opacity-50 mt-0.5 mx-1">
  //       {formatTime(message.createdAt)}
  //       {isMine && (
  //         <span className="ml-1">
  //           • {message.status || "delivered"}
  //         </span>
  //       )}
  //     </span>
  //   </div>
  // );

  return (
    <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
      {!isMine && (
        <span className="text-xs font-medium text-base-content/60 mb-0.5 ml-1">
          {message.firstName} {message.lastName}
        </span>
      )}

      <div className={`max-w-[70%] px-4 py-2 rounded-2xl break-words whitespace-pre-wrap text-sm`}>
        <div
          className={`px-4 py-2 rounded-2xl break-words text-sm ${isMine
              ? "bg-primary text-primary-content rounded-br-sm"
              : "bg-base-200 text-base-content rounded-bl-sm"
            }`}
        >
          {message.text || "Empty message"}
        </div>
      </div>

      <div className="flex items-center gap-1 mt-0.5 mx-1">
        <span className="text-[10px] opacity-50">
          {formatTime(message.createdAt)}
        </span>
        {getStatusIcon()}
      </div>
    </div>
  );
};

export default MessageBubble;