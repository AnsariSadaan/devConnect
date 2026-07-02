import React, { useEffect, useState, useMemo }  from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { addConnections } from "../../utils/connectionSlice";
import { setSelectedUser, clearUnread, updateLastMessage  } from "../../utils/chatSlice";
import { BASE_URL } from "../../utils/constants";

const ChatSidebar = () => {
  const dispatch = useDispatch();
  const connections = useSelector((store) => store.connections);
  const {
    selectedUser,
    selectedChatId,
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
        const res = await axios.get(BASE_URL + "/connections", {
          withCredentials: true,
        });

        const connectionsList = res.data.data || [];
        dispatch(addConnections(connectionsList));

        // After fetching connections, fetch their last messages
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
    
      const res = await axios.get(
        BASE_URL + "/chat/last-messages/all",
        { withCredentials: true }
      );

      const data = res.data.data;
      if (data?.lastMessages) {

        // Update each last message in Redux using chatId as key
        Object.keys(data.lastMessages).forEach(chatId => {
          
          const message = data.lastMessages[chatId];
          if (message) {
            dispatch(updateLastMessage({
              chatId: chatId,
              message: message
            }));
          }
        });
      } else {
        console.warn("No last messages data received");
      }
    } catch (err) {
      console.error("Error fetching last messages:", err);
    }
  };


  // Auto-select first connection if no user is selected
  useEffect(() => {
    if (connections && connections.length > 0 && !selectedUser) {
      const firstConnection = connections[0];
      if (firstConnection.chatId) {
        dispatch(setSelectedUser({
          user: firstConnection,
          chatId: firstConnection.chatId
        }));
      }
    }
  }, [connections, selectedUser, dispatch]);


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
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredConnections = useMemo(() => {
    if (!connections) return [];
    const query = search.trim().toLowerCase();
    return connections.filter((connection) => {
      return (
        connection.firstName.toLowerCase().includes(query) ||
        connection.lastName.toLowerCase().includes(query) ||
        `${connection.firstName} ${connection.lastName}`
          .toLowerCase()
          .includes(query)
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
      <div className="flex flex-col justify-center items-center h-full bg-base-200">
        <h2 className="text-xl font-semibold">No Chats Yet</h2>
        <p className="opacity-60 mt-2">
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
    <div className="h-full bg-base-200 border-r border-base-content/10 flex flex-col">

      {/* Header */}
      <div className="p-5 border-b border-base-content/10">
        <h2 className="font-bold text-2xl">
          Chats
        </h2>

        <p className="text-sm opacity-60 mb-3">
          {connections.length} Connections
        </p>

         <input
          type="text"
          placeholder="Search..."
          className="input input-bordered w-full mt-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Users */}

      <div className="flex-1 overflow-y-auto">

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
                  hover:shadow-md 
                  transition-all 
                  duration-300
                  border-b
                  border-base-content/5
                  px-4
                  py-3
                  ${ 
                    isSelected
                      ? "bg-base-300 border-l-4 border-primary shadow-sm"
                      : "hover:bg-base-300"
                  }
                `}
              >

                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={`avatar ${isOnline ? "online" : "offline"}`}>
                    <div className="w-14 rounded-full ring ring-primary/20 ring-offset-2 ring-offset-base-200">

                      <img
                        src={
                          connection.photoUrl ||
                          "https://ui-avatars.com/api/?name=" +
                            connection.firstName
                        }
                        alt={connection.firstName}
                      />

                    </div>
                  </div>

                  {/* Name + Message */}

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold truncate">
                        {connection.firstName}{" "}{connection.lastName}
                      </h3>
                      {lastMessage?.createdAt && (
                        <span className="text-xs opacity-60">
                          {formatTime(lastMessage?.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between mt-1">
                      <p className="text-sm opacity-70 truncate">
                        {lastMessage?.text ||"No messages yet"}
                      </p>
                      {unread > 0 && (
                        <span
                          className={`badge badge-sm ${
                            isSelected ? "badge-neutral" : "badge-primary"
                          }`}
                        >
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