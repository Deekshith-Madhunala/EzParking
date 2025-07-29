import { useRef, useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { fetchSlotStatus, getAllCities, getLocationsByCity, getParkingLotsByLocationId } from "../../api/restServiceApi";
import Snackbar from "../../general/Snackbar";

// Updated FloatingInput to support controlled components
const FloatingInput = ({
  label,
  type = "text",
  defaultValue,
  icon: Icon,
  value,
  onChange,
  placeholder,
}) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const isControlled = value !== undefined && onChange !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue || "");

  const isActive = focused || (isControlled ? value : internalValue);

  const handleClick = () => {
    if ((type === "date" || type === "time") && inputRef.current?.showPicker) {
      inputRef.current.showPicker();
    }
  };

  const handleChange = (e) => {
    if (isControlled) {
      onChange(e);
    } else {
      setInternalValue(e.target.value);
    }
  };

  const [snackbar, setSnackbar] = useState({ message: "", type: "", visible: false });

  const showErrorSnackbar = (msg) => {
    setSnackbar({ message: msg, type: "error", visible: true });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, visible: false });
  };

  return (
    <div className="relative w-full" onClick={handleClick}>
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
      )}

      <input
        ref={inputRef}
        type={type}
        value={isControlled ? value : internalValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full py-4 px-4 ${Icon ? "pl-10" : "pl-4"} pt-6 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer`}
      />

      <label
        className={`absolute ${Icon ? "left-10" : "left-4"} ${isActive ? "top-1 text-xs text-gray-700" : "top-4 text-sm text-gray-500"} bg-white px-1 pointer-events-none`}
      >
        {label}
      </label>
    </div>
  );
};

const SearchBar = () => {
  const [formHeight, setFormHeight] = useState(0);
  const [activeTab, setActiveTab] = useState(1);
  const [lotIdInput, setLotIdInput] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("13:00");
  const [endTime, setEndTime] = useState("14:00");

  const formRef = useRef(null);
  const navigate = useNavigate();

  const searchImg =
    "https://assets.estapar.com.br/cms/img_estacione_garagem_destaque_sobre_dffcae110a.webp";

  useEffect(() => {
    if (formRef.current) {
      setFormHeight(formRef.current.offsetHeight);
    }
  }, []);


  const [snackbar, setSnackbar] = useState({ message: "", type: "", visible: false });

  const showErrorSnackbar = (msg) => {
    setSnackbar({ message: msg, type: "error", visible: true });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, visible: false });
  };
  // useEffect(() => {
  //   const now = new Date();
  //   now.setMinutes(0, 0, 0); // round to top of hour
  //   const start = now.toISOString().substring(11, 16);

  //   const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  //   const end = oneHourLater.toISOString().substring(11, 16);

  //   setStartTime(start);
  //   setEndTime(end);
  // }, []);

  const pad = n => n.toString().padStart(2, '0');

  const getLocalTimeHHMM = (date) => {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  useEffect(() => {
    const now = new Date();
    const start = getLocalTimeHHMM(now);

    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const end = getLocalTimeHHMM(oneHourLater);

    setStartTime(start);
    setEndTime(end);
  }, []);


  useEffect(() => {
    if (formRef.current) setFormHeight(formRef.current.offsetHeight);

    const fetchCities = async () => {
      const uniqueCities = await getAllCities();
      setCities(uniqueCities);
    };

    fetchCities();
  }, []);

  const handleFindSpots = async () => {
    if (activeTab === 1) {
      if (!selectedCity) {
        alert("Please select a city.");
        return;
      }
      const locations = await getLocationsByCity(selectedCity);
      console.log("getLocationsByCity", locations);
      const parkingLots = [];
      for (const location of locations) {
        const lotList = await getParkingLotsByLocationId(location.id);
        if (Array.isArray(lotList) && lotList.length > 0) {
          lotList.forEach(lot => parkingLots.push({ ...lot, location }));
        }
      }
      navigate("/results", {
        state: {
          city: selectedCity,
          date,
          startTime,
          endTime,
          parkingLots,
        }
      });
    } else {

      const slotId = lotIdInput.trim();
      const data = await fetchSlotStatus(slotId);
      if (data) {
        if (data.occupied) {
          showErrorSnackbar("This parking spot is currently occupied.");
        } else {
          navigate("/walkin", {
            state: {
              lotDetails: data,
              date,
              startTime,
              endTime,
            },
          });
        }
      } else {
        showErrorSnackbar("No parking lot found with that ID.");
      }
    }
  };


  return (
    <>
      {snackbar.visible && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
        />
      )}
      <div className="flex flex-col md:flex-row w-full gap-25 mt-12 items-start">
        <div ref={formRef} className="w-full md:w-5/12">
          <div className="flex justify-start mb-6 gap-10">
            <button
              onClick={() => setActiveTab(1)}
              className={`px-6 py-2 rounded-lg text-lg font-semibold ${activeTab === 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white"
                }`}
            >
              Reservation
            </button>
            <button
              onClick={() => setActiveTab(2)}
              className={`px-6 py-2 rounded-lg text-lg font-semibold ${activeTab === 2
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white"
                }`}
            >
              Walk-in
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-4xl font-bold text-gray-800 leading-tight">
              Parking made easy,<br />wherever you go
            </h2>
          </div>

          {activeTab === 1 ? (
            <div className="flex flex-col gap-5">
              <div className="relative w-full">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full py-4 px-4 pt-6 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer text-gray-700 appearance-none"
                >
                  <option value="" disabled>Select a city</option>
                  {cities.map((city, idx) => (
                    <option key={idx} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <label className="absolute left-4 top-1 text-xs text-gray-700 bg-white px-1 pointer-events-none">
                  Where are you going?
                </label>
              </div>
              <FloatingInput label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <div className="flex gap-4">
                <FloatingInput
                  label="Start Time"
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setStartTime(newStart);

                    const [hours, minutes] = newStart.split(":").map(Number);
                    const date = new Date();
                    date.setHours(hours);
                    date.setMinutes(minutes);
                    date.setSeconds(0);
                    date.setMilliseconds(0);

                    const newEnd = new Date(date.getTime() + 60 * 60 * 1000);
                    const end = newEnd.toTimeString().slice(0, 5);
                    setEndTime(end);
                  }}
                />
                <FloatingInput label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
              <button
                onClick={handleFindSpots}
                className="bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition duration-200"
              >
                Find Parking Spots
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <FloatingInput
                label="Enter Parking Lot ID - DCP-S01"
                placeholder= "Example : DCP-S01"
                type="text"
                value={lotIdInput}
                onChange={(e) => setLotIdInput(e.target.value)}
              />
              <FloatingInput
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <div className="flex gap-4">
                <FloatingInput
                  label="Start Time"
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setStartTime(newStart);

                    const [hours, minutes] = newStart.split(":").map(Number);
                    const dateObj = new Date();
                    dateObj.setHours(hours);
                    dateObj.setMinutes(minutes);
                    dateObj.setSeconds(0);
                    dateObj.setMilliseconds(0);

                    const newEnd = new Date(dateObj.getTime() + 60 * 60 * 1000);
                    const end = newEnd.toTimeString().slice(0, 5);
                    setEndTime(end);
                  }}
                />
                <FloatingInput
                  label="End Time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <button
                onClick={handleFindSpots}
                className="bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition duration-200"
              >
                Find Parking Lot
              </button>
            </div>
          )}
        </div>

        <div
          className="w-full md:w-8/12 flex justify-center items-center"
          style={{ height: `${formHeight}px` }}
        >
          <img
            src={searchImg}
            alt="Search Parking"
            className="rounded-2xl shadow-md w-full h-full object-cover"
          />
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 toast-slide-in" role="alert" aria-live="assertive">
            <div className="flex items-center gap-3 px-5 py-3 bg-red-500 text-white rounded-lg shadow-lg min-w-[250px]">
              <span className="text-xl">⚠️</span>
              <span className="text-sm font-medium">No parking lot found with that ID.</span>
            </div>
          </div>
        )}
      </div>

      {/* Toast Slide Animation */}
      <style>{`
        .toast-slide-in {
          animation: slideInOutRight 3s ease-in-out forwards;
        }

        @keyframes slideInOutRight {
          0% {
            opacity: 0;
            transform: translateX(100%);
          }
          10% {
            opacity: 1;
            transform: translateX(0%);
          }
          90% {
            opacity: 1;
            transform: translateX(0%);
          }
          100% {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>
    </>
  );
};

export default SearchBar;
