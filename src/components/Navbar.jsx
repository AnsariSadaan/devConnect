import axios from 'axios';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';
import { removeUser } from '../utils/userSlice';

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((store) => store.user);

    const handleLogout = async () => {
        try {
            await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
            dispatch(removeUser());
            return navigate("/login");
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="navbar bg-base-300 shadow-sm">
            <div className="flex-1">
                <Link to={"/feed"} className="btn btn-ghost text-xl">DevConnect</Link>
            </div>
            {user && (<div className="flex gap-2 items-center">
                <div className='form-control item-center px-4 text-base'>Welcome, <span className="ml-1 font-medium">{user.firstName || 'User'}</span></div>
                <div className="dropdown dropdown-end mx-5 flex">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img
                                alt="user photo"
                                src={user.photoUrl || "img"} />
                        </div>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <li>
                            <Link to={"/profile"} className="justify-between">
                                Profile
                                <span className="badge">New</span>
                            </Link>
                        </li>
                        <li><Link to={'/connections'}>Connections</Link></li>
                        <li><Link to={'/requests'}>Requests</Link></li>
                        <li><Link to={'/premium'}>Premium</Link></li>
                        <li><Link onClick={handleLogout}>Logout</Link></li>
                    </ul>
                </div>
            </div>)}
        </div>
    )
}

export default Navbar