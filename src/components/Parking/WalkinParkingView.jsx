import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../User/Header';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// const fetchSlotStatus = async (slotId) => {
//   try {
//     const response = await fetch(`http://localhost:8080/api/parkingLots/${slotId}/status`);
//     if (!response.ok) {
//       throw new Error('Failed to fetch slot status');
//     }
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching slot status:', error);
//     return null;
//   }
// };

const fetchSlotStatus = async (slotId, parkinglotId) => {
  try {
    const url = `http://localhost:8080/api/parkingLots/${parkinglotId}/slots/${slotId}/status`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch slot status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching slot status:', error);
    return null;
  }
};


const WalkinParkingView = () => {
  const location = useLocation();
  // const lotDetails = location.state?.lotDetails;
  const navigate = useNavigate();
  const [slotStatus, setSlotStatus] = useState(null);

  const { state } = useLocation();
  const { lotDetails, date, startTime, endTime = [] } = state || {};
  console.log("lotDetails", lotDetails);
  console.log("date", date);
  console.log("startTime", startTime);
  console.log("endTime", endTime);



  useEffect(() => {
    const slotId = lotDetails?.slotId || '1'; // You can update this logic
    const parkingLotId = lotDetails?.parkingLotId || '1'; // You can update this logic
    if (slotId && parkingLotId) {
      fetchSlotStatus(slotId, parkingLotId).then((data) => {
        if (data) {
          setSlotStatus(data);
        }
      });
    }
  }, [lotDetails]);

  function formatReadableTime(timeStr) {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <>
      <Header />
      <div className="bg-white min-h-screen w-full flex flex-col md:flex-row gap-10 px-6 py-10">
        {/* Left: Lot Details */}
        <div className="w-full md:w-5/12 bg-white shadow-xl rounded-2xl overflow-y-auto max-h-[90vh]">
          {/* Header Image */}
          <div className="relative h-56 w-full">
            <img
              src={lotDetails?.imageUrl || 'https://images.pexels.com/photos/31685643/pexels-photo-31685643.jpeg'}
              alt="Parking Lot"
              className="w-full h-full object-cover rounded-t-2xl"
            />
          </div>

          {/* Title & Rating */}
          <div className="px-6 pt-4 pb-2 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">{lotDetails?.parkingLotName}</h2>
            <div className="mt-1 text-sm text-gray-500 flex items-center gap-2">
              <span>⭐ {lotDetails?.rating}</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">🚶 {lotDetails?.distance} walk</span>
            </div>
          </div>

          {/* Reservation Info */}
          <div className="px-6 pt-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl shadow-md">
              {/* Start Time */}
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-500">Start Time</p>
                <p className="text-base font-semibold text-gray-800">
                  🕒 {formatReadableTime(startTime)}
                </p>
              </div>

              {/* End Time */}
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-500">End Time</p>
                <p className="text-base font-semibold text-gray-800">
                  ⏰ {formatReadableTime(endTime)}
                </p>
              </div>

              {/* Total Hours */}
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-500">Total Duration</p>
                <p className="text-base font-semibold text-gray-800">⏳ {lotDetails?.totalHours} hrs</p>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-500">Rate</p>
                <p className="text-base font-semibold text-green-700">💵 ${lotDetails?.pricePerHour.toFixed(2)} / hr</p>
              </div>
            </div>
          </div>

          {/* Access & Redeem Info */}
          <div className="px-6 py-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🎟 How to Redeem</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
              <li>Ensure license plate matches your Parking Pass</li>
              <li>Do not park in "Reserved" spots</li>
              <li>You're free to leave at any time</li>
            </ul>

            <button
              onClick={() => navigate("/vehicle-info", { state: { lotDetails, date, startTime, endTime } })}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-3 px-6 rounded-lg shadow-md transition duration-200"
            >
              Book Now
            </button>
          </div>

          {/* Slot Status Info */}
          <div className="px-6 py-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🅿️ Slot Status</h3>
            {slotStatus ? (
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Slot ID:</strong> {slotStatus.slotId}</p>
                <p><strong>Occupied:</strong> {slotStatus.occupied ? 'Yes' : 'No'}</p>
                <p><strong>Lot Name:</strong> {slotStatus.parkingLotName}</p>
                <p><strong>Address:</strong> {`${slotStatus.street}, ${slotStatus.city}, ${slotStatus.state} ${slotStatus.zipCode}, ${slotStatus.country}`}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Loading slot status...</p>
            )}
          </div>

          {/* Getting There Info */}
          <div className="px-6 py-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📍 Getting There</h3>
            <p className="text-sm text-gray-600">
              Enter this location at <strong>918 Oak St</strong>. Operated by Metropolis.
              Located between E 9th and 10th St on the west side.
            </p>
          </div>

          {/* Reviews */}
          <div className="px-6 py-4 border-t border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">⭐ Facility Reviews</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
              <span>4.7/5</span>
              <span className="text-green-600 font-semibold">Excellent</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">(Based on 21 reviews)</p>
          </div>
        </div>

        {/* Right: Map */}
        <div className="w-full md:w-7/12 h-[90vh] bg-gray-100 flex flex-col relative rounded-2xl overflow-hidden">
          <h2 className="text-2xl font-bold p-4 bg-gray-200 border-b border-gray-300">
            Parking Lot Location
          </h2>
          <MapContainer
            center={lotDetails?.location || [39.0997, -94.5786]}
            zoom={17}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={lotDetails?.location || [39.0997, -94.5786]}
              icon={new L.Icon({
                iconUrl: 'https://img.icons8.com/color/48/000000/parking.png',
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [1, -34],
              })}
            >
              <Popup>
                <div>
                  <h3 className="font-semibold text-lg">{lotDetails?.name}</h3>
                  <p>{lotDetails?.description}</p>
                  <p>Price: ${lotDetails?.pricePerHour.toFixed(2)} / hour</p>
                  <p>Available Spots: {lotDetails?.availableSpots}</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </>
  );
};

export default WalkinParkingView;
