import React from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { 
  FiMapPin, 
  FiBriefcase, 
  FiAward, 
  FiHeart, 
  FiX,
  FiStar,
  FiCalendar,
  FiCode
} from 'react-icons/fi';
import api from '../utils/axios';
import { removeUserFromFeed } from '../utils/feedSlice';

const UserCard = ({ user, onAction, isAnimating }) => {
  const { 
    _id, 
    firstName, 
    lastName, 
    age, 
    about, 
    skills, 
    photoUrl, 
    gender, 
    location, 
    currentCompany, 
    experience 
  } = user;
  
  const dispatch = useDispatch();

  const handleSendRequest = async (status, userId) => {
    if (isAnimating) return; // Prevent multiple clicks during animation
    
    try {
      const res = await api.post(`/request/send/${status}/${userId}`, {}, { withCredentials: true });
      // Call the parent's onAction callback for animation
      if (onAction) {
        onAction(userId, status);
      } else {
        // Fallback: directly remove from feed
        dispatch(removeUserFromFeed(userId));
      }
    } catch (error) {
      if (error.response?.status === 409) {
        if (onAction) {
          onAction(userId, 'ignored');
        } else {
          dispatch(removeUserFromFeed(userId));
        }
      } else {
        console.error(error);
      }
    }
  };

  const getInitials = () => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getExperienceLevel = () => {
    if (experience >= 10) return { label: 'Senior', color: 'badge-error' };
    if (experience >= 5) return { label: 'Mid-Level', color: 'badge-warning' };
    if (experience >= 2) return { label: 'Junior', color: 'badge-info' };
    return { label: 'Entry Level', color: 'badge-success' };
  };

  return (
    <motion.div
      className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden h-full flex flex-col"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Cover Image / Avatar Section */}
      <div className="relative h-48 bg-gradient-to-r from-primary/20 to-secondary/20 flex-shrink-0">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="avatar ring-4 ring-base-100">
            <div className="w-24 h-24 rounded-full">
              {photoUrl ? (
                <img src={photoUrl} alt={`${firstName} ${lastName}`} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center text-2xl font-bold">
                  {getInitials()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action hint badges */}
        <div className="absolute top-4 left-4">
          <div className="badge badge-primary badge-sm gap-1">
            <FiStar className="w-3 h-3" />
            New
          </div>
        </div>
      </div>

      {/* Card Body - Flex grow to fill space */}
      <div className="card-body pt-16 flex-1 flex flex-col">
        {/* Name & Title */}
        <div className="text-center flex-shrink-0">
          <h2 className="card-title text-2xl font-bold justify-center">
            {firstName} {lastName}
          </h2>
          {currentCompany && (
            <p className="text-base-content/70 flex items-center justify-center gap-1 mt-1 text-sm">
              <FiBriefcase className="w-4 h-4" />
              {currentCompany}
            </p>
          )}
          {location && (
            <p className="text-sm text-base-content/60 flex items-center justify-center gap-1 mt-1">
              <FiMapPin className="w-4 h-4" />
              {location}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-3 flex-shrink-0">
          {age && (
            <div className="badge badge-ghost gap-1">
              <FiCalendar className="w-3 h-3" />
              {age} years
            </div>
          )}
          {gender && (
            <div className="badge badge-ghost">
              {gender.charAt(0).toUpperCase() + gender.slice(1)}
            </div>
          )}
          {experience > 0 && (
            <div className={`badge ${getExperienceLevel().color} gap-1`}>
              <FiAward className="w-3 h-3" />
              {getExperienceLevel().label}
            </div>
          )}
        </div>

        {/* About - Flex grow to take remaining space */}
        {about && (
          <div className="mt-3 flex-1">
            <p className="text-sm text-base-content/80 leading-relaxed line-clamp-3">
              {about}
            </p>
          </div>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className="mt-3 flex-shrink-0">
            <div className="flex items-center gap-2 text-xs font-medium text-base-content/60 mb-2">
              <FiCode className="w-4 h-4" />
              <span>Skills</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 5).map((skill) => (
                <span key={skill} className="badge badge-primary badge-outline">
                  {skill}
                </span>
              ))}
              {skills.length > 5 && (
                <span className="badge badge-ghost">+{skills.length - 5}</span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons - Fixed at bottom */}
        <div className="card-actions justify-center mt-4 gap-4 flex-shrink-0">
          <button
            className="btn btn-outline btn-error gap-2 px-8 hover:scale-105 transition-transform duration-200"
            onClick={() => handleSendRequest("ignored", _id)}
            disabled={isAnimating}
          >
            <FiX className="w-5 h-5" />
            Ignore
          </button>
          <button
            className="btn btn-primary gap-2 px-8 hover:scale-105 transition-transform duration-200"
            onClick={() => handleSendRequest("interested", _id)}
            disabled={isAnimating}
          >
            <FiHeart className="w-5 h-5" />
            Interested
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserCard;