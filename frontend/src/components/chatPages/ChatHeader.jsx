import React from "react";
import { useSelector } from "react-redux";

const ChatHeader = () => {
  const selectedUser = useSelector(
    (store) => store.chat.selectedUser
  );

  if (!selectedUser) return null;

  return (
    <div className="h-20 border-b border-base-content/10 bg-base-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="avatar online">
          <div className="w-14 rounded-full">
            <img
              src={selectedUser.photoUrl}
              alt={selectedUser.firstName}
            />
          </div>
        </div>
        <div>
          <h2 className="font-bold text-lg">
            {selectedUser.firstName} {selectedUser.lastName}
          </h2>
          <p className="text-sm text-success">
            Online
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;