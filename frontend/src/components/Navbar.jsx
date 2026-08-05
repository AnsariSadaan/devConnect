import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiMessageSquare, 
  FiUserPlus, 
  FiAward,
  FiUser,
  FiLogOut,
  FiSun,
  FiMoon,
  FiMonitor,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { removeUser } from '../utils/userSlice';
import { useTheme } from '../hooks/useTheme';
import api from '../utils/axios';
import RateLimitIndicator from './RateLimitIndicator';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((store) => store.user);
  const { currentTheme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navLinks = [
    { path: '/feed', label: 'Feed', icon: FiHome },
    { path: '/connections', label: 'Connections', icon: FiUsers },
    { path: '/chat', label: 'Chat', icon: FiMessageSquare },
    { path: '/requests', label: 'Requests', icon: FiUserPlus },
    { path: '/premium', label: 'Premium', icon: FiAward },
  ];

  const handleLogout = async () => {
    try {
      await api.post("/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const getThemeLabel = () => {
    if (currentTheme === 'dark') return 'Dark';
    if (currentTheme === 'light') return 'Light';
    return 'System';
  };

  // Render the appropriate theme icon
  const renderThemeIcon = () => {
    if (currentTheme === 'dark') {
      return <FiMoon className="w-5 h-5" />;
    }
    if (currentTheme === 'light') {
      return <FiSun className="w-5 h-5" />;
    }
    return <FiMonitor className="w-5 h-5" />;
  };

  if (!user) {
    return (
      <nav className="bg-base-100 shadow-sm border-b border-base-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/login" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                DevConnect
              </span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-base-100 shadow-sm border-b border-base-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/feed" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DevConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-base-200 text-base-content/70 hover:text-base-content'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-base-200 transition-colors duration-200"
              title={`Switch to ${getThemeLabel()} theme`}
            >
              {renderThemeIcon()}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-base-200 transition-colors duration-200"
              >
                <div className="avatar online">
                  <div className="w-8 h-8 rounded-full ring-2 ring-primary/20">
                    <img
                      src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.firstName}`}
                      alt={user.firstName}
                      className="object-cover"
                    />
                  </div>
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user.firstName}
                </span>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-base-100 rounded-xl shadow-xl border border-base-200 py-2 z-50 animate-slide-up">
                  <div className="px-4 py-3 border-b border-base-200">
                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-base-content/60">{user.emailId}</p>
                  </div>
                  
                  {/* Add Rate Limit Indicator here */}
                  <RateLimitIndicator />
                  
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-base-200 transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FiUser className="w-4 h-4" />
                    Profile
                  </Link>

                  <Link
                    to="/premium"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-base-200 transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FiAward className="w-4 h-4" />
                    Upgrade to Premium
                  </Link>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-error/10 text-error transition-colors duration-200 w-full"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-base-200 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-base-200 bg-base-100 animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-base-200 text-base-content/70 hover:text-base-content'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;