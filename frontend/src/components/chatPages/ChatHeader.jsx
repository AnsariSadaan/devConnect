import React from "react";
import { useSelector } from "react-redux";
import { FiArrowLeft } from "react-icons/fi";

const ChatHeader = ({ onBack, showBack }) => {
  const selectedUser = useSelector(
    (store) => store.chat.selectedUser
  );

  if (!selectedUser) return null;

  return (
    <div className="h-14 border-b border-base-content/10 bg-base-200 px-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="btn btn-circle btn-ghost btn-sm"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="avatar online">
          <div className="w-10 rounded-full">
            <img
              src={selectedUser.photoUrl || `https://ui-avatars.com/api/?name=${selectedUser.firstName}`}
              alt={selectedUser.firstName}
            />
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-sm">
            {selectedUser.firstName} {selectedUser.lastName}
          </h2>
          <p className="text-xs text-success">
            Online
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;