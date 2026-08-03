import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiInbox, FiMail, FiAward } from 'react-icons/fi';
import api from '../utils/axios';

const RateLimitIndicator = () => {
  const user = useSelector((store) => store.user);
  const [limits, setLimits] = useState({
    requests: { used: 0, max: 10 },
    messages: { used: 0, max: 100 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLimits();
    }
  }, [user]);

  const fetchLimits = async () => {
    try {
      const res = await api.get("/user/limits", { withCredentials: true });
      setLimits(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) return null;

  const isPremium = user.isPremium;

  const getPercentage = (used, max) => {
    if (max === Infinity) return 0;
    return Math.min((used / max) * 100, 100);
  };

  return (
    <div className="px-4 py-2 border-b border-base-200 bg-base-100">
      <div className="space-y-1.5">
        {/* Requests */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-base-content/70">
            <FiInbox className="w-3 h-3" />
            Requests
          </span>
          {isPremium ? (
            <span className="flex items-center gap-1 text-primary font-medium">
              <FiAward className="w-3 h-3" />
              Unlimited
            </span>
          ) : (
            <span className="text-base-content/70">
              {limits.requests.max - limits.requests.used} / {limits.requests.max} remaining
            </span>
          )}
        </div>
        {!isPremium && (
          <div className="w-full h-1 bg-base-300 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                getPercentage(limits.requests.used, limits.requests.max) > 80 
                  ? 'bg-error' 
                  : 'bg-primary'
              }`}
              style={{ 
                width: `${getPercentage(limits.requests.used, limits.requests.max)}%` 
              }}
            />
          </div>
        )}

        {/* Messages */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-base-content/70">
            <FiMail className="w-3 h-3" />
            Messages
          </span>
          {isPremium ? (
            <span className="flex items-center gap-1 text-primary font-medium">
              <FiAward className="w-3 h-3" />
              Unlimited
            </span>
          ) : (
            <span className="text-base-content/70">
              {limits.messages.max - limits.messages.used} / {limits.messages.max} remaining
            </span>
          )}
        </div>
        {!isPremium && (
          <div className="w-full h-1 bg-base-300 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                getPercentage(limits.messages.used, limits.messages.max) > 80 
                  ? 'bg-error' 
                  : 'bg-primary'
              }`}
              style={{ 
                width: `${getPercentage(limits.messages.used, limits.messages.max)}%` 
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RateLimitIndicator;