import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Link, useNavigate } from "react-router-dom";


const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (nameOrEmail) => {
    const name = nameOrEmail || 'U';
    const initials = name.split(' ')[0][0] + (name.split(' ')[1]?.[0] || '');
    return initials.toUpperCase();
  };
  const navigate = useNavigate();

  const handleViewBookings = () => {
    navigate("/bookings");
  };
  const handleCreateParking = () => {
    navigate("/admin");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link to="/" className="text-xl sm:text-2xl font-semibold text-blue-600">
          EZPark
        </Link>

        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                {getInitials(user?.username || user?.email)}
              </div>
              <span className="hidden sm:inline">{user?.username || user?.email}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''
                  }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-50 border border-gray-100">
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={handleCreateParking}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={handleViewBookings}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  View Bookings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="text-sm sm:text-base text-blue-500 font-medium hover:text-blue-600"
            onClick={() => (window.location.href = '/login')}
          >
            Login / Sign Up
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
