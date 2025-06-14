import axios from 'axios';
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

const Login = () => {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emailId, setEmailId] = useState("");
    const [password, setPassword] = useState("");
    const [isLoginForm, setIsLoginForm] = useState(true);
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post(BASE_URL + "/login", {
                emailId,
                password,
            }, { withCredentials: true })
            dispatch(addUser(response?.data?.data));
            navigate('/');
        } catch (error) {
            setError(error?.response?.data?.message);
        }
    }

    const handleSignup = async () => {
        try {
            const response = await axios.post(BASE_URL + "/signup", {
                firstName,
                lastName,
                emailId,
                password,}, {withCredentials: true});
            dispatch(addUser(response?.data?.data));
            return navigate('/profile');
        } catch (error) {
            setError(error?.response?.data?.message);
        }
    }

    return (
        <div className='flex justify-center my-10'>
            <div className="card card-border bg-base-300 w-96">
                <div className="card-body">
                    <h2 className="card-title justify-center">{isLoginForm ? "Login" : "SignUp"}</h2>
                    <div>
                        {!isLoginForm &&
                            <>
                                <label className="form-control w-full max-w-xs">
                                    <div className="label">
                                        <span className="label-text">First Name :</span>
                                    </div>
                                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input input-bordered w-full max-w-xs my-2" />
                                </label>
                                <label className="form-control w-full max-w-xs">
                                    <div className="label">
                                        <span className="label-text">Last Name :</span>
                                    </div>
                                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input input-bordered w-full max-w-xs my-2" />
                                </label>
                            </>
                        }
                        <label className="form-control w-full max-w-xs">
                            <div className="label">
                                <span className="label-text">Email Id :</span>
                            </div>
                            <input type="text" value={emailId} onChange={(e) => setEmailId(e.target.value)} className="input input-bordered w-full max-w-xs my-2" />
                        </label>
                        <label className="form-control w-full max-w-xs">
                            <div className="label">
                                <span className="label-text">Password :</span>
                            </div>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input input-bordered w-full max-w-xs my-2" />
                        </label>
                    </div>
                    <p className='text-red-600'>{error}</p>
                    <div className="card-actions justify-center m-2">
                        <button className="btn btn-primary" onClick={isLoginForm ? handleLogin : handleSignup}>{isLoginForm ? "Login" : "SignUp"}</button>
                    </div>
                    <p className='cursor-pointer m-auto py-2' onClick={()=> setIsLoginForm((value)=> !value) }>{isLoginForm ? 
                    "New User? SignUp Here " : "Existing User? Login Here"} </p>
                </div>
            </div>
        </div>
    )
}

export default Login