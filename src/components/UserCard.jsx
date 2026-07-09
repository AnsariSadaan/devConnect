import React from 'react'
import { useDispatch } from 'react-redux';
import api from '../utils/axios';
import { removeUserFromFeed } from '../utils/feedSlice.js';

const UserCard = ({ user }) => {
  const { _id, firstName, lastName, age, about, skills, photoUrl, gender, location, currentCompany, experience } = user;
  console.log("USER CARD DATA:", user);
  const dispatch = useDispatch();
  const handleSendRequest = async (status, userId) => {
    try {
      const res = await api.post(`/request/send/${status}${userId}`, {}, { withCredentials: true })
      dispatch(removeUserFromFeed(userId));
    } catch (error) {
      if (error.response?.status === 409) {
        alert("Request already exists. Removing user from feed.");
        dispatch(removeUserFromFeed(userId));
      } else {
        console.error(error);
      }
    }
  }

  return (
    <div className="card bg-base-300 w-96 shadow-xl border border-base-content/10">
      {/*<figure className="relative">
          <img
              src={photoUrl}
              alt={firstName}
              className="h-72 w-full object-cover" 
          />
          <div className="absolute top-3 right-3 badge badge-success">Active</div>
      </figure>*/}
      <figure className="relative">
        <img
          src={photoUrl}
          alt={firstName}
          className="h-72 w-full object-cover"
        />

        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4 bg-gradient-to-t from-black via-black/40 to-transparent">
          {/*left section*/}
          <div>
            <h2 className="text-white text-3xl font-bold leading-tight first-letter:uppercase">
              {firstName} {lastName}
            </h2>

            <p className="text-white/90 text-sm mt-1 uppercase font-bold">
              • {gender}
            </p>
          </div>
          {/*right section*/}
          <p className="text-white/90 text-sm mt-1">
            {age} y/o
          </p>
        </div>
      </figure>
      {/*<div className="card-body">

          <h2 className="card-title">{firstName + " " + lastName}</h2>
          {age && gender && <p>{age + " " + gender}</p>}
          <p>{about}</p>
          <p>{skills}</p>
          <div className="card-actions justify-center my-1">
              <button className="btn btn-primary" onClick={() => handleSendRequest("ignored", _id)}>Ignore</button>
              <button className="btn btn-secondary" onClick={() => handleSendRequest("interested", _id)}>Interested</button>
          </div>
      </div>*/}
      <div className="card-body">
        {/*<div className="flex justify-between items-start">
          <div>
            <h2 className="card-title text-2xl">
              {firstName} {lastName}
            </h2>

            {age && (
              <p className="text-sm opacity-70">
                {age} years old
              </p>
            )}
          </div>
        </div>*/}

        <div className="flex items-end justify-between"> 
        {currentCompany && (
          <p>
            💼 {currentCompany}
          </p>
        )}

        {location && (
          <p>
            📍 {location}
          </p>
        )}
        </div>

        {experience > 0 && (
          <p>
            ⭐ {experience} Years Experience
          </p>
        )}

        <div className="divider my-1"></div>
        <p className="uppercase mb-2">core skills</p>
        <div className="flex flex-wrap gap-2">
          {
            (Array.isArray(skills)
              ? skills
              : skills?.split(",").map(skill => skill.trim())
            )
              ?.slice(0, 5)
              .map((skill) => (
                <div
                  key={skill}
                  className="badge badge-primary badge-outline uppercase"
                >
                  {skill}
                </div>
              ))
          }
        </div>
        <div className="card-actions justify-center mt-4">
          <button
            className="btn btn-outline btn-error"
            onClick={() =>
              handleSendRequest("ignored", _id)
            }
          >
            Ignore
          </button>

          <button
            className="btn btn-primary"
            onClick={() =>
              handleSendRequest("interested", _id)
            }
          >
            Interested
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserCard