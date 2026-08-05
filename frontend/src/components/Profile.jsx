import React from 'react';
import { useSelector } from 'react-redux';
import EditProfile from './EditProfile';

const Profile = () => {
  const user = useSelector((store) => store.user);
  
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  return <EditProfile user={user} />;
};

export default Profile;