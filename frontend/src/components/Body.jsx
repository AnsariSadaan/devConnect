import React, { useEffect } from 'react';
import Navbar from './Navbar';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Footer from './Footer';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../utils/userSlice';
import api from '../utils/axios';

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((store) => store.user);
  const location = useLocation();
  const hideFooter = location.pathname === "/chat";
  
  const fetchUser = async () => {
    if (userData) return;
    try {
      const res = await api.get("/profile/view", {
        withCredentials: true,
      });
      dispatch(addUser(res.data.data));
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
      console.error("Unexpected error:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
      {/*<Footer />*/}
    </div>
  );
};

export default Body;