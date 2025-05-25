import axios from 'axios'
import React, { useEffect, useState } from 'react'
// import { BASE_URL } from '../utils/constants.js'
import { useDispatch, useSelector } from 'react-redux';
import { addConnections } from '../utils/connectionSlice.js';

const Connections = () => {
    const connections = useSelector((store) => store.connections);
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const fetchConnections = async () => {
        setError('');
        try {
            const res = await axios.get("/api/v1/users/connections", {
                withCredentials: true,
            });
            console.log(res.data.data);
            dispatch(addConnections(res.data.data));
        } catch (error) {
            setError(error.response || error.message);
        }
    }

    useEffect(() => {
        fetchConnections();
    }, []);

    if (!connections) return;

    if (connections.length === 0) return <h1>No Connection Found</h1>;

    return (
        <div className='text-center my-10'>
            <h1 className='font-bold text-white text-3xl'>Connection</h1>
            {connections.map((connection) => {
                const { firstName, lastName, age, photoUrl, gender, about } = connection
                return (
                    <div className='flex m-4 p-4 rounded-lg bg-base-300 w-1/2 mx-auto'>
                        <div>
                            <img src={photoUrl} className='w-20 h-20 rounded-full' alt="photo" />
                        </div>
                        <div className='text-left mx-4'>
                            <h2 className='font-bold text-xl'>{firstName + " " + lastName}</h2>
                            {age && gender && <p>{age + ", " + gender}</p>}
                            <p>{about}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Connections