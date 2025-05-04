import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';

const Navbar = () => {
    const user = useSelector((store) => store.user);
    console.log(user);

    return (
        <div className="navbar bg-base-300 shadow-sm">
            <div className="flex-1">
                <Link to={"/"} className="btn btn-ghost text-xl">DevConnect</Link>
            </div>
            {user && (<div className="flex gap-2 items-center">
                <div className='form-control item-center px-4 text-base'>Welcome, <span className="ml-1 font-medium">{user.data.firstName}</span></div>
                <div className="dropdown dropdown-end mx-5 flex">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img
                                alt="user photo"
                                src={user.data.photoUrl} />
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
                        <li><a>Settings</a></li>
                        <li><a>Logout</a></li>
                    </ul>
                </div>
            </div>)}
        </div>
    )
}

export default Navbar