import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiUser, 
  FiMapPin, 
  FiBriefcase, 
  FiMessageCircle,
  FiUsers
} from 'react-icons/fi';
import api from '../utils/axios';
import { addConnections } from '../utils/connectionSlice';

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const res = await api.get("/connections", { withCredentials: true });
      dispatch(addConnections(res.data.data));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const filteredConnections = connections?.filter((connection) => {
    const fullName = `${connection.firstName} ${connection.lastName}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || 
           connection.location?.toLowerCase().includes(searchLower) ||
           connection.currentCompany?.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Loading connections...</p>
        </div>
      </div>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <FiUsers className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Connections Yet</h2>
          <p className="text-base-content/60">
            Start connecting with developers on the feed page.
          </p>
          <Link to="/feed" className="btn btn-primary mt-4">
            Find Developers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Network</h1>
          <p className="text-base-content/60 mt-1">
            {connections.length} developers in your network
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 w-4 h-4" />
          <input
            type="text"
            placeholder="Search connections..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Connections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConnections?.map((connection, index) => (
          <motion.div
            key={connection._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="card bg-base-100 shadow-md border border-base-200 hover:shadow-xl transition-shadow duration-200">
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-full ring-2 ring-primary/20">
                      <img 
                        src={connection.photoUrl || `https://ui-avatars.com/api/?name=${connection.firstName}`}
                        alt={connection.firstName}
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">
                      {connection.firstName} {connection.lastName}
                    </h3>
                    {connection.currentCompany && (
                      <p className="text-sm text-base-content/70 flex items-center gap-1 truncate">
                        <FiBriefcase className="w-3 h-3 flex-shrink-0" />
                        {connection.currentCompany}
                      </p>
                    )}
                    {connection.location && (
                      <p className="text-sm text-base-content/60 flex items-center gap-1 truncate">
                        <FiMapPin className="w-3 h-3 flex-shrink-0" />
                        {connection.location}
                      </p>
                    )}
                  </div>
                </div>

                {connection.about && (
                  <p className="text-sm text-base-content/70 line-clamp-2 mt-2">
                    {connection.about}
                  </p>
                )}

                <div className="card-actions justify-end mt-4">
                  <Link to={`/chat`} className="btn btn-primary btn-sm gap-2">
                    <FiMessageCircle className="w-4 h-4" />
                    Chat
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredConnections?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-base-content/60">No connections match your search</p>
        </div>
      )}
    </div>
  );
};

export default Connections;