import React from 'react';

const Header = () => {
  return (
    <header className="w-full bg-white py-4">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-500 tracking-tight mr-4">EZPark</h1>
        <button className="text-blue-500 font-medium hover:underline text-sm">Login / Sign Up</button>
      </div>
    </header>
  );
};

export default Header;
