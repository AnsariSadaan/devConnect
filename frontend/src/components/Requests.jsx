import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiUserPlus, 
  FiCheck, 
  FiX, 
  FiClock, 
  FiUser,
  FiMail
} from 'react-icons/fi';
import api from '../utils/axios';
import { addRequest, removeRequest } from '../utils/requestSlice';

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const response = await api.get('/request/received', { withCredentials: true });
      dispatch(addRequest(response.data.data));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const reviewRequest = async (status, _id) => {
    try {
      await api.post(`/request/review/${status}/${_id}`, {}, { withCredentials: true });
      dispatch(removeRequest(_id));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <FiUserPlus className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Pending Requests</h2>
          <p className="text-base-content/60">
            You're all caught up! Check back later for new connection requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-2 rounded-lg">
          <FiUserPlus className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Connection Requests</h1>
          <p className="text-base-content/60">
            {requests.length} pending request{requests.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((request, index) => {
          const { _id, firstName, lastName, age, photoUrl, gender, about, location } = request.fromUserId;

          return (
            <motion.div
              key={_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card bg-base-100 shadow-md border border-base-200 hover:shadow-xl transition-shadow duration-200"
            >
              <div className="card-body">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-full ring-2 ring-primary/20">
                      <img 
                        src={photoUrl || `https://ui-avatars.com/api/?name=${firstName}`}
                        alt={firstName}
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg">
                      {firstName} {lastName}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {age && (
                        <span className="text-sm text-base-content/60 flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {age} years
                        </span>
                      )}
                      {gender && (
                        <span className="text-sm text-base-content/60 flex items-center gap-1">
                          <FiUser className="w-3 h-3" />
                          {gender}
                        </span>
                      )}
                      {location && (
                        <span className="text-sm text-base-content/60 flex items-center gap-1">
                          <FiMail className="w-3 h-3" />
                          {location}
                        </span>
                      )}
                    </div>
                    {about && (
                      <p className="text-sm text-base-content/70 mt-2 line-clamp-2">
                        {about}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      className="btn btn-primary btn-sm gap-2 flex-1 sm:flex-none"
                      onClick={() => reviewRequest("accepted", request._id)}
                    >
                      <FiCheck className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      className="btn btn-ghost btn-sm gap-2 flex-1 sm:flex-none hover:bg-error/10 hover:text-error"
                      onClick={() => reviewRequest("rejected", request._id)}
                    >
                      <FiX className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;