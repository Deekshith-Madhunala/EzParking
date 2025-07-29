import React, { useState, useRef } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';

// Reuse FloatingInput component
const FloatingInput = ({ label, type = "text", icon: Icon, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const isActive = focused || value;

  return (
    <div className="relative w-full">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
      )}
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full py-4 px-4 ${Icon ? "pl-10" : "pl-4"} pt-6 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`}
      />
      <label
        className={`absolute ${Icon ? "left-10" : "left-4"} ${isActive ? "top-1 text-xs text-gray-700" : "top-4 text-sm text-gray-500"} bg-white px-1 pointer-events-none`}
      >
        {label}
      </label>
    </div>
  );
};

const RegistrationPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    const userData = {
      name: fullName,
      email,
      password,
      phone: contact,
      role: 'USER',
      createdAt: new Date().toISOString(),
    };

    try {
      await register(userData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {/* Left: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <form onSubmit={handleRegister} className="w-full max-w-sm flex flex-col gap-5">
          <h2 className="text-3xl font-semibold text-gray-900">Sign Up</h2>
          <p className="text-sm text-gray-500">Create your account to get started</p>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <FloatingInput
            label="Full Name"
            type="text"
            icon={FiUser}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <FloatingInput
            label="Email"
            type="email"
            icon={FiMail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <FloatingInput
            label="Contact"
            type="text"
            icon={FiPhone}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />

          <FloatingInput
            label="Password"
            type="password"
            icon={FiLock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <FloatingInput
            label="Confirm Password"
            type="password"
            icon={FiLock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="submit"
            className="bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-200"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          <p className="text-sm text-gray-500 text-center">
            Already have an account?{" "}
            <a className="text-blue-500 hover:underline" href="/login">
              Sign in
            </a>
          </p>
        </form>
      </div>

      {/* Right: Image & Info */}
      <div className="w-full md:w-1/2 relative hidden md:block">
        <img
          src="https://images.pexels.com/photos/3770875/pexels-photo-3770875.jpeg"
          alt="Register cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 mt-20 bg-opacity-40 flex flex-col justify-start items-center px-10 text-black text-center">
          <h1 className="text-4xl font-semibold">Park At Ease</h1>
          <p className="text-lg mt-4 max-w-md">
            Organize and manage your Parkings effortlessly with our platform. Let's get you started!
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
