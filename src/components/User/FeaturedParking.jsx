import React from 'react';

const FeaturedParking = () => {
  const lots = [
    { name: "Downtown Garage", price: "$10/hr", distance: "0.3 miles" },
    { name: "City Center Lot", price: "$8/hr", distance: "0.5 miles" },
    { name: "Main Street Parking", price: "$12/hr", distance: "0.2 miles" }
  ];

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold mb-4">Featured Parking Near You</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {lots.map((lot, idx) => (
          <div key={idx} className="border rounded-lg p-4 shadow hover:shadow-md">
            <h3 className="text-lg font-bold">{lot.name}</h3>
            <p>{lot.price}</p>
            <p className="text-gray-500">{lot.distance} away</p>
            <button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Reserve</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedParking;
