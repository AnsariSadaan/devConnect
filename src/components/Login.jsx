import axios from 'axios';
import React, { useState } from 'react'

const Login = () => {

    const [emailId, setEmailId] = useState("sadaan72@gmail.com");
    const [password, setPassword] = useState("Inf0rmat!0n@4");

    const handleLogin = async () => {
        try {
            const response = await axios.post("http://localhost:3000/api/v1/users/login",  {
                emailId,
                password,
            }, {withCredentials: true})
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='flex justify-center my-10'>
            <div className="card card-border bg-base-300 w-96">
                <div className="card-body">
                    <h2 className="card-title justify-center">Login</h2>
                    <div>
                        <label className="form-control w-full max-w-xs">
                            <div className="label">
                                <span className="label-text">Email Id</span>
                            </div>
                            <input type="text" value={emailId} onChange={(e) => setEmailId(e.target.value)} className="input input-bordered w-full max-w-xs my-2" />
                        </label>
                        <label className="form-control w-full max-w-xs">
                            <div className="label">
                                <span className="label-text">Password</span>
                            </div>
                            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="input input-bordered w-full max-w-xs my-2" />
                        </label>
                    </div>
                    <div className="card-actions justify-center m-2">
                        <button className="btn btn-primary" onClick={handleLogin}>Login</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login