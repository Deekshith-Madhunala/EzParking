import { useLocation } from 'react-router-dom';
import Header from '../User/Header';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from "react-router-dom";

const WalkinParkingView = () => {
  const location = useLocation();
  const lotDetails = location.state?.lotDetails;
  const navigate = useNavigate();
  
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
            <h2 className="text-2xl font-bold text-gray-800">{lotDetails?.name}</h2>
            <div className="mt-1 text-sm text-gray-500 flex items-center gap-2">
              <span>⭐ {lotDetails?.rating}</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">🚶 {lotDetails?.distance} walk</span>
            </div>
          </div>

          {/* Reservation Info */}
          <div className="px-6 pt-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl shadow-sm">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Start Time</p>
                <p className="text-sm font-medium text-gray-800">🕒 {lotDetails?.startTime}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">End Time</p>
                <p className="text-sm font-medium text-gray-800">⏰ {lotDetails?.endTime}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Total Hours</p>
                <p className="text-sm font-medium text-gray-800">⏳ {lotDetails?.totalHours} hrs</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-sm font-medium text-gray-800">💵 ${lotDetails?.pricePerHour.toFixed(2)} / hr</p>
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
              onClick={() => navigate("/vehicle-info", { state: { lotDetails } })}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-3 px-6 rounded-lg shadow-md transition duration-200"
            >
              Book Now
            </button>
          </div>


          <div className="px-6 py-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📍 Getting There</h3>
            <p className="text-sm text-gray-600">
              Enter this location at <strong>918 Oak St</strong>. Operated by Metropolis.
              Located between E 9th and 10th St on the west side.
            </p>
          </div>

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
