import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../utils/axios";
import { addConnections, moveConnectionToTop } from "../../utils/connectionSlice";
import { setSelectedUser, clearUnread, updateLastMessage } from "../../utils/chatSlice";

const ChatSidebar = ({ onUserSelect }) => {
  const dispatch = useDispatch();
  const connections = useSelector((store) => store.connections);
  const {
    selectedUser,
    onlineUsers,
    unreadMessages,
    lastMessages,
  } = useSelector((store) => store.chat);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch connections if not available
  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      try {
        const res = await api.get("/connections", {
          withCredentials: true,
        });

        const connectionsList = res.data.data || [];
        dispatch(addConnections(connectionsList));

        if (connectionsList && connectionsList.length > 0) {
          await fetchLastMessages();
        }
      } catch (err) {
        console.error("Error fetching connections:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  // Fetch last messages for ALL connections in ONE API call
  const fetchLastMessages = async () => {
    try {
      const res = await api.get("/chat/last-messages/all", {
        withCredentials: true
      });

      const data = res.data.data;
      // if (data?.lastMessages) {
      //   Object.keys(data.lastMessages).forEach(chatId => {
      //     const message = data.lastMessages[chatId];
      //     if (message) {
      //       dispatch(updateLastMessage({
      //         chatId: chatId,
      //         message: message
      //       }));
      //     }
      //   });
      if (data?.lastMessages) {
      // Sort chatIds by latest message timestamp
      const sortedChatIds = Object.keys(data.lastMessages).sort((a, b) => {
        const msgA = data.lastMessages[a];
        const msgB = data.lastMessages[b];
        return new Date(msgB.createdAt) - new Date(msgA.createdAt);
      });

      // Update last messages and move connections to top
      sortedChatIds.forEach(chatId => {
        const message = data.lastMessages[chatId];
        if (message) {
          dispatch(updateLastMessage({
            chatId: chatId,
            message: message
          }));
          dispatch(moveConnectionToTop(chatId));
        }
      });
      }
    } catch (err) {
      console.error("Error fetching last messages:", err);
    }
  };

  const handleSelect = (user) => {
    if (!user.chatId) {
      console.warn("No chatId for user:", user.firstName);
      return;
    }
    dispatch(setSelectedUser({
      user: user,
      chatId: user.chatId
    }));
    dispatch(clearUnread(user.chatId));
    
    // Call onUserSelect for mobile navigation
    if (onUserSelect) {
      onUserSelect();
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    const now = new Date();
    const msgDate = new Date(date);
    const diff = now - msgDate;
    
    // If less than 24 hours, show time
    if (diff < 24 * 60 * 60 * 1000) {
      return msgDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    // If less than 7 days, show day name
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return msgDate.toLocaleDateString([], { weekday: 'short' });
    }
    // Otherwise show date
    return msgDate.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const filteredConnections = useMemo(() => {
    if (!connections) return [];
    const query = search.trim().toLowerCase();
    return connections.filter((connection) => {
      return (
        connection.firstName.toLowerCase().includes(query) ||
        connection.lastName.toLowerCase().includes(query) ||
        `${connection.firstName} ${connection.lastName}`.toLowerCase().includes(query)
      );
    });
  }, [connections, search]);

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-base-200">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-2 opacity-60">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full bg-base-200 p-4">
        <h2 className="text-xl font-semibold">No Chats Yet</h2>
        <p className="opacity-60 mt-2 text-center">
          Your connections will appear here.
        </p>
        <button 
          className="btn btn-primary btn-sm mt-4"
          onClick={() => window.location.href = '/connections'}
        >
          Find Connections
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-base-200 ">
      {/* Header */}
      <div className="p-4 border-b border-base-content/10 bg-base-200 sticky top-0 z-10 flex-shrink-0">
        <h2 className="font-bold text-xl">Chats</h2>
        <p className="text-xs opacity-60 mb-2">
          {connections.length} Connections
        </p>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="input input-bordered w-full pl-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Users List - scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredConnections.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm opacity-60">
              No matching chats found.
            </p>
          </div>
        ) : (
          filteredConnections.map((connection) => {
            const isSelected = selectedUser?._id === connection._id;
            const isOnline = onlineUsers.includes(connection._id);
            const chatId = connection.chatId;
            const unread = unreadMessages[chatId] || 0;
            const lastMessage = lastMessages[chatId];
            
            return (
              <div
                key={connection._id}
                onClick={() => handleSelect(connection)}
                className={`
                  cursor-pointer
                  hover:bg-base-300 
                  active:bg-base-300
                  transition-all 
                  duration-150
                  border-b
                  border-base-content/5
                  px-4
                  py-3
                  ${isSelected ? "bg-base-300" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={`avatar ${isOnline ? "online" : "offline"}`}>
                    <div className="w-12 rounded-full ring ring-primary/20 ring-offset-2 ring-offset-base-200">
                      <img
                        src={
                          connection.photoUrl ||
                          `https://ui-avatars.com/api/?name=${connection.firstName}`
                        }
                        alt={connection.firstName}
                      />
                    </div>
                  </div>

                  {/* Name + Message */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold truncate text-sm">
                        {connection.firstName} {connection.lastName}
                      </h3>
                      {lastMessage?.createdAt && (
                        <span className="text-xs opacity-50 flex-shrink-0 ml-2">
                          {formatTime(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between mt-0.5">
                      <p className="text-xs opacity-70 truncate">
                        {lastMessage?.text || "No messages yet"}
                      </p>
                      {unread > 0 && (
                        <span className="badge badge-primary badge-sm flex-shrink-0 ml-2">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;