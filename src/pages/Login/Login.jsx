import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { FiMail, FiLock } from "react-icons/fi";

// Reusable FloatingInput component
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

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Login failed. Please check your email or password.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {/* Left: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-5">
          <h2 className="text-3xl font-semibold text-gray-900">Sign In</h2>
          <p className="text-sm text-gray-500">
            Welcome back! Please sign in to continue
          </p>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <FloatingInput
            label="Email"
            type="email"
            icon={FiMail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <FloatingInput
            label="Password"
            type="password"
            icon={FiLock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-between items-center text-sm text-gray-500">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" />
              Remember me
            </label>
            <a href="#" className="underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>

          <p className="text-sm text-gray-500 text-center">
            Don’t have an account?{" "}
            <a className="text-blue-500 hover:underline" href="/register">
              Sign up
            </a>
          </p>
        </form>
      </div>

      {/* Right: Image */}
      <div className="w-full md:w-1/2 relative hidden md:block">
        <img
          src="https://images.pexels.com/photos/3770875/pexels-photo-3770875.jpeg"
          alt="Login cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 mt-20 bg-opacity-40 flex flex-col justify-start items-center px-10 text-black text-center">
          <h1 className="text-4xl font-semibold">Park At Ease</h1>
          <p className="text-lg mt-4 max-w-md">
            Manage your parkings efficiently with a seamless, easy-to-use platform. Get started now!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
