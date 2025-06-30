import React from 'react'
import { BASE_URL } from '../utils/constants.js'
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { removeUserFromFeed } from '../utils/feedSlice.js';

const UserCard = ({ user }) => {
    const { _id, firstName, lastName, age, about, skills, photoUrl, gender } = user;
    const dispatch = useDispatch();
    const handleSendRequest = async (status, userId) => {
        try {
            const res = await axios.post(BASE_URL + "/request/send/" + status + "/" + userId, {}, { withCredentials: true })
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
        <div className="card bg-base-300 w-80 shadow-sm">
            <figure>
                <img
                    src={photoUrl}
                    alt="user photo" />
            </figure>
            <div className="card-body">
                <h2 className="card-title">{firstName + " " + lastName}</h2>
                {age && gender && <p>{age + " " + gender}</p>}
                <p>{about}</p>
                <p>{skills}</p>
                <div className="card-actions justify-center my-1">
                    <button className="btn btn-primary" onClick={() => handleSendRequest("ignored", _id)}>Ignore</button>
                    <button className="btn btn-secondary" onClick={() => handleSendRequest("interested", _id)}>Interested</button>
                </div>
            </div>
        </div>
    )
}

export default UserCard