import React, { useState } from 'react'
import UserCard from './UserCard';
import axios from 'axios';
// import { BASE_URL } from '../utils/constants';
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';

const EditProfile = ({ user }) => {

    const [firstName, setFirstName] = useState(user?.firstName);
    const [lastName, setLastName] = useState(user?.lastName);
    const [age, setAge] = useState(user?.age);
    const [gender, setGender] = useState(user?.gender);
    const [about, setAbout] = useState(user?.about);
    const [photoUrl, setPhotoUrl] = useState(user?.photoUrl);
    const [error, setError] = useState('');
    const [showToast, setShowToast] = useState(false);
    const dispatch = useDispatch();

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
    ];


    const saveProfile = async () => {
        setError("");
        try {
            const response = await axios.patch("/api/v1/users/profile/edit",
                {
                    firstName,
                    lastName,
                    age: Number(age),
                    gender,
                    about,
                    photoUrl
                },
                { withCredentials: true }
            )
            dispatch(addUser(response?.data?.data));
            setShowToast(true);
            const i = setTimeout(() => {
                setShowToast(false);
            }, 3000);
        } catch (error) {
            setError(error.response?.data?.message || error.message);
        }
    }


    return (
        <>
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
                                    <select value={gender || ""}
                                        onChange={(e) => setGender(e.target.value)} className="select my-2">
                                        <option value={""} disabled>Select Gender</option>
                                        {genderOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="form-control w-full max-w-xs">
                                    <div className="label">
                                        <span className="label-text">About:</span>
                                    </div>
                                    {/* <input type="text" value={about} onChange={(e) => setAbout(e.target.value)} className="input input-bordered w-full max-w-xs my-2" /> */}
                                    <textarea className="textarea my-2" type="text" value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Bio"></textarea>
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
            {showToast && (<div className="toast toast-top toast-end">
                <div className="alert alert-success">
                    <span>{user?.firstName} your profile was save successfully.</span>
                </div>
            </div>)}
        </>
    )
}

export default EditProfile