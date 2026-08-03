import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiUserPlus, FiLogIn, FiCode } from 'react-icons/fi';
import api from '../utils/axios';
import { addUser } from '../utils/userSlice';

const Login = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post("/login", {
        emailId,
        password,
      }, { withCredentials: true });
      dispatch(addUser(response?.data?.data));
      navigate('/feed');
    } catch (error) {
      setError(error?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post("/signup", {
        firstName,
        lastName,
        emailId,
        password,
      }, { withCredentials: true });
      dispatch(addUser(response?.data?.data));
      navigate('/profile');
    } catch (error) {
      setError(error?.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoginForm) {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card bg-base-100 shadow-2xl border border-base-200">
          <div className="card-body">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <FiCode className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">
                {isLoginForm ? 'Welcome Back!' : 'Join DevConnect'}
              </h2>
              <p className="text-base-content/60 mt-1">
                {isLoginForm 
                  ? 'Sign in to connect with developers worldwide' 
                  : 'Create your account and start networking'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {!isLoginForm && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-sm">First Name</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 w-4 h-4" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="input input-bordered w-full pl-10"
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-sm">Last Name</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 w-4 h-4" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="input input-bordered w-full pl-10"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm">Email</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 w-4 h-4" />
                  <input
                    type="email"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                    className="input input-bordered w-full pl-10"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm">Password</span>
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 w-4 h-4" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-bordered w-full pl-10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-error text-sm text-center bg-error/10 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : isLoginForm ? (
                  <>
                    <FiLogIn className="w-4 h-4" />
                    Sign In
                  </>
                ) : (
                  <>
                    <FiUserPlus className="w-4 h-4" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <button
                onClick={() => {
                  setIsLoginForm(!isLoginForm);
                  setError('');
                  setLoading(false);
                }}
                className="text-sm text-primary hover:underline"
              >
                {isLoginForm 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;