import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { BASE_URL } from '../utils/constants'
import { useDispatch, useSelector } from 'react-redux'
import { addFeed } from '../utils/feedSlice'
import UserCard from './userCard'

const Feed = () => {
    const feed = useSelector((store) => store.feed);
    const user = useSelector((store) => store.user);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    const getFeed = async () => {
        try {
            const response = await axios.get(BASE_URL + "/feed", { withCredentials: true })
            let users = response.data?.data || [];
            console.log(response);
            // Filter out the logged-in user 
            if (user?._id) {
                users = users.filter(u => u._id !== user._id);
            }
            dispatch(addFeed(users));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getFeed();
    }, [])

    if (loading) {
        return <h1 className='flex justify-center my-10'>Loading feed...</h1>;
    }

    if (!feed || feed.length === 0) {
        return <h1 className='flex justify-center my-10'>No new users found</h1>;
    }

    return (
        feed && (<div className='flex justify-center my-10'>            
                <UserCard  user={feed[0]} />
        </div>)
    )
}

export default Feed