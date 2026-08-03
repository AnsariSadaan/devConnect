import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiUserPlus } from 'react-icons/fi';
import api from '../utils/axios';
import { addFeed, removeUserFromFeed } from '../utils/feedSlice';
import UserCard from './UserCard';

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(null); // 'left' or 'right'

  const getFeed = async () => {
    try {
      const response = await api.get("/feed");
      let users = response.data?.data || [];
      if (user?._id) {
        users = users.filter(u => u._id !== user._id);
      }
      dispatch(addFeed(users));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  const handleAction = (userId, action) => {
    // Set direction for animation
    setDirection(action === 'ignored' ? 'left' : 'right');
    
    // Remove user from feed after animation
    setTimeout(() => {
      dispatch(removeUserFromFeed(userId));
      setDirection(null);
    }, 400);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Loading developers...</p>
        </div>
      </div>
    );
  }

  if (!feed || feed.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <FiUsers className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Developers Found</h2>
          <p className="text-base-content/60">
            We couldn't find any developers in your area. Check back later or expand your network!
          </p>
          <button 
            className="btn btn-primary mt-4 gap-2"
            onClick={getFeed}
          >
            <FiUserPlus className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const currentUser = feed[0];

  // Animation variants
  const cardVariants = {
    enter: (direction) => ({
      x: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
    }),
    exit: (direction) => ({
      x: direction === 'left' ? -300 : 300,
      opacity: 0,
      scale: 0.8,
      rotate: direction === 'left' ? -10 : 10,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    })
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Discover Developers</h1>
        <p className="text-base-content/60 mt-1">
          Swipe right to connect or left to pass
        </p>
        <div className="mt-2 text-sm text-base-content/40">
          {feed.length} profiles remaining
        </div>
      </div>

      {/* Card Container */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto relative" style={{ height: '600px' }}>
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={currentUser._id}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="enter"
              exit="exit"
              className="absolute inset-0"
            >
              <UserCard 
                user={currentUser} 
                onAction={handleAction}
                isAnimating={!!direction}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Empty state when no more profiles */}
      {feed.length === 0 && (
        <div className="text-center">
          <div className="bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <FiUsers className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
          <p className="text-base-content/60">
            You've viewed all available developers. Check back later for new connections!
          </p>
          <button 
            className="btn btn-primary mt-4 gap-2"
            onClick={getFeed}
          >
            <FiUserPlus className="w-4 h-4" />
            Refresh Feed
          </button>
        </div>
      )}
    </div>
  );
};

export default Feed;