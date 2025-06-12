import axios from 'axios'
import React, { useEffect } from 'react'
import { BASE_URL } from '../utils/constants.js'
import { useDispatch, useSelector } from 'react-redux'
import { addRequest } from '../utils/requestSlice'

const Requests = () => {
    const request = useSelector((store) => store.requests); 
    const dispatch = useDispatch();
    const fetchRequest = async ()=> {
        try {
            const response = await axios.get(BASE_URL + '/request/received', 
            {withCredentials: true});
            dispatch(addRequest(response.data.data));
            console.log(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=> {
        fetchRequest();
    }, [])
    if (!request) return;

    if (request.length === 0) return <h1>No Requests Found</h1>;

    return (
    <div className="text-center my-10">
        <h1 className="font-bold text-4xl text-white mb-8">Connection</h1>

        {request.map((request) => {
            const { _id, firstName, lastName, age, photoUrl, gender, about } = request.fromUserId;

            return (
                <div
                    key={_id}
                    className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-base-300 w-11/12 md:w-3/4 lg:w-2/3 mx-auto my-4 p-6 rounded-xl shadow-md"
                >
                    {/* Profile Photo */}
                    <div className="flex-shrink-0">
                        <img
                            src={photoUrl}
                            alt="User profile"
                            className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                        />
                    </div>

                    {/* User Info */}
                    <div className="text-left flex-1">
                        <h2 className="font-semibold text-2xl text-white">
                            {firstName} {lastName}
                        </h2>
                        {age && gender && (
                            <p className="text-sm text-gray-300 mt-1">
                                {age}, {gender}
                            </p>
                        )}
                        <p className="text-sm text-gray-400 mt-2">
                            {about}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                        <button className="btn btn-primary">Accept</button>
                        <button className="btn btn-secondary">Reject</button>
                    </div>
                </div>
            );
        })}
    </div>
    )
}

export default Requests