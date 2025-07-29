import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../User/Header";
import { FaCar } from "react-icons/fa";
import { FiCalendar, FiClock, FiDollarSign } from "react-icons/fi";

import { updateUserVehicle, getUserById } from "../../api/restServiceApi";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hour, minute] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return "";
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let startDate = new Date();
  startDate.setHours(startHour, startMin, 0, 0);

  let endDate = new Date();
  endDate.setHours(endHour, endMin, 0, 0);

  if (endDate <= startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }

  const diffMs = endDate - startDate;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;

  return `${hours > 0 ? `${hours} hr${hours > 1 ? "s" : ""}` : ""} ${
    minutes > 0 ? `${minutes} min${minutes > 1 ? "s" : ""}` : ""
  }`.trim();
};

const VEHICLE_TYPES = [
  "Sedan",
  "SUV",
  "Truck",
  "Van",
  "Motorcycle",
  "Electric",
  "Other",
];

const VehicleInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { city, date, startTime, endTime, lotDetails = {} } = location.state || {};

  const userId = JSON.parse(localStorage.getItem("user"))?.id;
  if (!userId) throw new Error("User not found in localStorage");

  const [vehicle, setVehicle] = useState({
    licensePlate: "",
    vehicleType: "",
    make: "",
    model: "",
    color: "",
    registeredAt: new Date().toISOString(),
  });

  const [initialVehicle, setInitialVehicle] = useState(null);
  const [vehicleExists, setVehicleExists] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await getUserById(userId);
        const userVehicle = response?.vehicles?.length ? response.vehicles[0] : null;

        if (userVehicle) {
          const formatted = {
            licensePlate: userVehicle.licensePlate,
            vehicleType: userVehicle.vehicleType,
            make: userVehicle.make,
            model: userVehicle.model,
            color: userVehicle.color,
            registeredAt: userVehicle.registeredAt,
          };
          setVehicle(formatted);
          setInitialVehicle(formatted);
          setVehicleExists(true);
          setSnackbar("Vehicle information already exists. You may proceed or update if needed.");
          setTimeout(() => setSnackbar(null), 5000);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (!vehicle.licensePlate.trim()) errs.licensePlate = "License plate is required.";
    if (!vehicle.vehicleType.trim()) errs.vehicleType = "Please select vehicle type.";
    if (!vehicle.make.trim()) errs.make = "Make is required.";
    if (!vehicle.model.trim()) errs.model = "Model is required.";
    if (!vehicle.color.trim()) errs.color = "Color is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isVehicleChanged = () => {
    if (!initialVehicle) return true; // No original to compare to
    return Object.keys(vehicle).some((key) => vehicle[key] !== initialVehicle[key]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (!vehicleExists || isVehicleChanged()) {
        await updateUserVehicle(vehicle);
      }

      navigate("/confirm-payment", {
        state: { date, startTime, endTime, lotDetails, vehicle },
      });
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Something went wrong while submitting the form.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Header />
      {snackbar && (
        <div className="fixed bottom-6 right-6 bg-green-300 text-green-900 px-6 py-4 rounded-lg shadow-lg z-50 border border-green-300 animate-slide-in">
          {snackbar}
          <style>{`
            @keyframes slide-in {
              0% { opacity: 0; transform: translateX(100%); }
              100% { opacity: 1; transform: translateX(0); }
            }
            .animate-slide-in {
              animation: slide-in 0.4s ease-out forwards;
            }
          `}</style>
        </div>
      )}

      <div className="bg-white w-full min-h-screen px-10 py-12 flex flex-col md:flex-row gap-24 max-w-9xl mx-auto">
        {/* Vehicle Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full md:w-7/12 space-y-10 bg-white rounded-2xl shadow-lg p-10"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center gap-4">
            <FaCar className="text-blue-600" size={36} />
            Vehicle Information
          </h2>

          {/* License Plate */}
          <div>
            <label htmlFor="licensePlate" className="block text-gray-700 font-semibold mb-3 text-lg">
              License Plate <span className="text-red-500">*</span>
            </label>
            <input
              id="licensePlate"
              name="licensePlate"
              value={vehicle.licensePlate}
              onChange={handleChange}
              placeholder="e.g. ABC-1234"
              className={`w-full py-5 px-5 rounded-lg border shadow-md text-lg font-medium focus:ring-4 transition ${
                errors.licensePlate ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.licensePlate && (
              <p className="text-red-600 mt-2 text-sm italic">{errors.licensePlate}</p>
            )}
          </div>

          {/* Vehicle Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vehicle Type */}
            <div>
              <label htmlFor="vehicleType" className="block text-gray-700 font-semibold mb-3 text-lg">
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={vehicle.vehicleType}
                onChange={handleChange}
                className={`w-full py-5 px-5 rounded-lg border shadow-md text-lg font-medium focus:ring-4 transition ${
                  errors.vehicleType ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="" disabled>Select type</option>
                {VEHICLE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.vehicleType && (
                <p className="text-red-600 mt-2 text-sm italic">{errors.vehicleType}</p>
              )}
            </div>

            {/* Make */}
            <div>
              <label htmlFor="make" className="block text-gray-700 font-semibold mb-3 text-lg">
                Make <span className="text-red-500">*</span>
              </label>
              <input
                id="make"
                name="make"
                value={vehicle.make}
                onChange={handleChange}
                placeholder="e.g. Toyota"
                className={`w-full py-5 px-5 rounded-lg border shadow-md text-lg font-medium focus:ring-4 transition ${
                  errors.make ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.make && <p className="text-red-600 mt-2 text-sm italic">{errors.make}</p>}
            </div>

            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-gray-700 font-semibold mb-3 text-lg">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                id="model"
                name="model"
                value={vehicle.model}
                onChange={handleChange}
                placeholder="e.g. Camry"
                className={`w-full py-5 px-5 rounded-lg border shadow-md text-lg font-medium focus:ring-4 transition ${
                  errors.model ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.model && <p className="text-red-600 mt-2 text-sm italic">{errors.model}</p>}
            </div>

            {/* Color */}
            <div>
              <label htmlFor="color" className="block text-gray-700 font-semibold mb-3 text-lg">
                Color <span className="text-red-500">*</span>
              </label>
              <input
                id="color"
                name="color"
                value={vehicle.color}
                onChange={handleChange}
                placeholder="e.g. Blue"
                className={`w-full py-5 px-5 rounded-lg border shadow-md text-lg font-medium focus:ring-4 transition ${
                  errors.color ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.color && <p className="text-red-600 mt-2 text-sm italic">{errors.color}</p>}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-5 rounded-xl font-extrabold text-xl shadow-lg hover:from-blue-700 hover:to-blue-600 transition duration-300"
          >
            Proceed to Confirmation
          </button>
        </form>

        {/* Summary Panel */}
        <aside className="w-full md:w-5/12 bg-gradient-to-tr from-gray-50 to-white rounded-2xl shadow-lg p-12 border border-gray-200">
          <h2 className="text-3xl font-extrabold mb-10 flex items-center gap-4 text-gray-900">
            <FiCalendar className="text-blue-600" size={32} />
            Parking Summary
          </h2>

          <p className="text-2xl font-bold mb-6 text-gray-800">{lotDetails?.name || "Parking Lot"}</p>

          <dl className="space-y-6 text-gray-700 text-lg font-medium">
            <div className="flex items-center gap-4">
              <FiCalendar size={24} className="text-gray-500" />
              <dt>Date:</dt>
              <dd>{formatDate(date)}</dd>
            </div>
            <div className="flex items-center gap-4">
              <FiClock size={24} className="text-gray-500" />
              <dt>Start Time:</dt>
              <dd>{formatTime(startTime)}</dd>
            </div>
            <div className="flex items-center gap-4">
              <FiClock size={24} className="text-gray-500" />
              <dt>End Time:</dt>
              <dd>{formatTime(endTime)}</dd>
            </div>
            <div className="flex items-center gap-4">
              <FiClock size={24} className="text-gray-500" />
              <dt>Duration:</dt>
              <dd>{calculateDuration(startTime, endTime)}</dd>
            </div>
            <div className="flex items-center gap-4">
              <FiDollarSign size={24} className="text-green-600" />
              <dt>Price:</dt>
              <dd>${parseFloat(lotDetails?.pricePerHour || 0).toFixed(2)} / hr</dd>
            </div>
          </dl>
        </aside>
      </div>
    </>
  );
};

export default VehicleInfo;
