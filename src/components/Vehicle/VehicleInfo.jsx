import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Header from '../User/Header';

const VehicleInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lotDetails = location.state?.lotDetails;

  const [vehicle, setVehicle] = useState({
    licensePlate: '',
    vehicleType: '',
    make: '',
    model: '',
    color: '',
    registeredAt: new Date().toISOString(),
    user: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/confirm-payment', {
      state: { lotDetails, vehicle },
    });
  };

  return (
    <>
      <Header />
      <div className="bg-white w-full min-h-screen px-6 py-12 flex flex-col md:flex-row gap-20 items-start">

        {/* Vehicle Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full md:w-7/12 space-y-6"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-2">🚗 Vehicle Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input
              type="text"
              name="licensePlate"
              placeholder="License Plate"
              value={vehicle.licensePlate}
              onChange={handleChange}
              required
              className="w-full py-4 px-4 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              name="vehicleType"
              placeholder="Vehicle Type (e.g., SUV)"
              value={vehicle.vehicleType}
              onChange={handleChange}
              required
              className="w-full py-4 px-4 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              name="make"
              placeholder="Make (e.g., Toyota)"
              value={vehicle.make}
              onChange={handleChange}
              required
              className="w-full py-4 px-4 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              name="model"
              placeholder="Model (e.g., Camry)"
              value={vehicle.model}
              onChange={handleChange}
              required
              className="w-full py-4 px-4 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              name="color"
              placeholder="Color (e.g., Blue)"
              value={vehicle.color}
              onChange={handleChange}
              required
              className="w-full py-4 px-4 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition duration-200"
          >
            Proceed to Confirmation
          </button>
        </form>

        {/* Parking Info Text */}
        <div className="w-full md:w-5/12 text-gray-800">
          <h2 className="text-4xl font-bold mb-4">🅿️ Parking Summary</h2>
          <p className="text-lg font-semibold mb-1">{lotDetails?.name}</p>
          <p className="text-md text-gray-600 mb-1">📅 Start Time: <span className="font-medium text-gray-800">{lotDetails?.startTime}</span></p>
          <p className="text-md text-gray-600 mb-1">⏰ End Time: <span className="font-medium text-gray-800">{lotDetails?.endTime}</span></p>
          <p className="text-md text-gray-600 mb-1">
            💰 Price: <span className="font-medium text-gray-800">${lotDetails?.pricePerHour.toFixed(2)} / hr</span>
          </p>
          <p className="text-md text-gray-600 mb-1">⏳ Duration: <span className="font-medium text-gray-800">{lotDetails?.totalHours} hrs</span></p>
        </div>
      </div>
    </>
  );
};

export default VehicleInfo;
