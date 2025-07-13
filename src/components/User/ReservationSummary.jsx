import React from 'react';

const ReservationSummary = () => {
  // mock data
  const reservations = [
    { location: "City Center Lot", date: "2025-07-15", time: "10:00 AM", status: "Upcoming" }
  ];

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold mb-4">Your Reservations</h2>
      <ul className="space-y-4">
        {reservations.map((res, idx) => (
          <li key={idx} className="border p-4 rounded shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{res.location}</p>
                <p className="text-sm text-gray-500">{res.date} at {res.time}</p>
              </div>
              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">{res.status}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReservationSummary;
