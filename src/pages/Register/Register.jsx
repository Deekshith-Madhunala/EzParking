import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const RegistrationPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth(); // Destructure register from the context
  const navigate = useNavigate(); // Use navigate hook to navigate programmatically

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
      email: email,
      password: password,
      phone: contact,  // Optional: You can add phone number to the form if needed
      role: 'USER', // default role or change according to your requirement
      createdAt: new Date().toISOString(),
    };

    try {
      const token = await register(userData); // Call register function from context
      console.log('Registration successful:', token);

      // Navigate to the home page after successful registration
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message); // Show the error to the user
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left side with gradient and text, filling the entire height */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-12 py-8 h-full">
        <h1 className="text-4xl font-semibold">Book My Events</h1>
        <p className="text-lg mt-4">Organize and manage your events effortlessly with our platform. Let's get you started!</p>
      </div>

      {/* Right side with form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center h-full">
        <form className="md:w-96 w-80 flex flex-col items-center justify-center" onSubmit={handleRegister}>
          <h2 className="text-4xl text-gray-900 font-medium">Sign up</h2>
          <p className="text-sm text-gray-500/90 mt-3">
            Create your account to get started
          </p>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2 mt-6">
            <input
              type="text"
              placeholder="Full Name"
              className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <input
              type="email"
              placeholder="Email"
              className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <input
              type="text"
              placeholder="Contact"
              className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <input
              type="password"
              placeholder="Confirm Password"
              className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity"
            disabled={loading} // Disable the button while loading
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          <p className="text-gray-500/90 text-sm mt-4">
            Already have an account?{" "}
            <a className="text-indigo-400 hover:underline" href="/login">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;