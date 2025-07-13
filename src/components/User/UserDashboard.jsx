import React from 'react';
import Header from './Header';
import SearchBar from './SearchBar';
import HowToPark from './HowToPark';

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <SearchBar />
        <HowToPark />
      </main>
    </div>
  );
};

export default UserDashboard;