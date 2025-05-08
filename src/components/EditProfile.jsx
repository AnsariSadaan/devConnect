import React, { useState } from 'react'
import UserCard from './userCard';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';

const EditProfile = ({ user }) => {

    const [firstName, setFirstName] = useState(user?.data?.firstName);
    const [lastName, setLastName] = useState(user?.data?.lastName);
    const [age, setAge] = useState(user?.data?.age);
    const [gender, setGender] = useState(user?.data?.gender);
    const [about, setAbout] = useState(user?.data?.about);
    const [photoUrl, setPhotoUrl] = useState(user?.data?.photoUrl);
    const [error, setError] = useState('');
    const dispatch = useDispatch();

    const saveProfile = async () => {
        try {
            const response = await axios.patch(BASE_URL + "/profile/edit",
                {
                    firstName,
                    lastName,
                    age,
                    gender,
                    about,
                    photoUrl
                },
                { withCredentials: true }
            )
            dispatch(addUser(response));
        } catch (error) {
            setError(error.message);
        }
    }


    return (
        <div className='flex justify-center my-10'>
            <div className='flex justify-center mx-10'>
                <div className="card card-border bg-base-300 w-96">
                    <div className="card-body">
                        <h2 className="card-title justify-center">Edit Profile</h2>
                        <div>
                            <label className="form-control w-full max-w-xs">
                                <div className="label">
                                    <span className="label-text">First Name:</span>
                                </div>
                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input input-bordered w-full max-w-xs my-2" />
                            </label>
                            <label className="form-control w-full max-w-xs">
                                <div className="label">
                                    <span className="label-text">Last Name:</span>
                                </div>
                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input input-bordered w-full max-w-xs my-2" />
                            </label>
                            <label className="form-control w-full max-w-xs">
                                <div className="label">
                                    <span className="label-text">Age:</span>
                                </div>
                                <input type="text" value={age} onChange={(e) => setAge(e.target.value)} className="input input-bordered w-full max-w-xs my-2" />
                            </label>
                            <label className="form-control w-full max-w-xs">
                                <div className="label">
                                    <span className="label-text">Gender:</span>
                                </div>
                                <input type="text" value={gender} onChange={(e) => setGender(e.target.value)} className="input input-bordered w-full max-w-xs my-2" />
                            </label>
                            <label className="form-control w-full max-w-xs">
                                <div className="label">
                                    <span className="label-text">About:</span>
                                </div>
                                <input type="text" value={about} onChange={(e) => setAbout(e.target.value)} className="input input-bordered w-full max-w-xs my-2" />
                            </label>
                            <label className="form-control w-full max-w-xs">
                                <div className="label">
                                    <span className="label-text">Photo URL:</span>
                                </div>
                                <input type="text" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} className="input input-bordered w-full max-w-xs my-2" />
                            </label>
                        </div>
                        <p className='text-red-600'>{error}</p>
                        <div className="card-actions justify-center m-2">
                            <button className="btn btn-primary" onClick={saveProfile}>Save Profile</button>
                        </div>
                    </div>
                </div>
            </div>

            <UserCard user={{ firstName, lastName, age, gender, about, photoUrl }} />
        </div>
    )
}

export default EditProfile