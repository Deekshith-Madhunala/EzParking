import React, { useState, useEffect, useRef } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { FiClock, FiMapPin, FiDollarSign, FiStar } from "react-icons/fi";
import { FaParking } from "react-icons/fa"; // Add Parking icon
import Header from "../User/Header";
import { dummyParkingLots } from "../../api/restServiceApi";
import { useNavigate } from "react-router-dom";

// Dummy parking lot data with dynamic rating + reviews + spots
dummyParkingLots

// Helper: get badge color based on availability
const getAvailabilityBadge = (spots) => {
    if (spots > 20) return "bg-green-100 text-green-800";
    if (spots > 5) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
};

const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
        return text.slice(0, maxLength) + '...';
    }
    return text;
};

// Find the cheapest parking lot
const getCheapestLot = (lots) => {
    return lots.reduce((cheapest, lot) =>
        lot.pricePerHour < cheapest.pricePerHour ? lot : cheapest
    );
};

// Custom Hook to move map to selected lot
const MoveToSelectedLot = ({ selectedLot }) => {
    const map = useMap(); // Get the map instance

    useEffect(() => {
        if (selectedLot && map) {
            map.flyTo(selectedLot.location, 15, { animate: true, duration: 1 });
        }
    }, [selectedLot, map]);

    return null;
};

const ParkingLotPage = () => {
    const [selectedLot, setSelectedLot] = useState(dummyParkingLots[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // For managing the drawer state
    const [lotDetails, setLotDetails] = useState(null); // To store details of the selected lot
    const listRef = useRef(null);

    const cheapestLot = getCheapestLot(dummyParkingLots);

    const filteredParkingLots = dummyParkingLots.filter((lot) =>
        lot.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const navigate = useNavigate();

    const handleBookNow = () => {
        navigate('/vehicle-info', { state: { lotDetails } });
    };

    useEffect(() => {
        if (!listRef.current) return;
        const card = listRef.current.querySelector(`#lot-${selectedLot.id}`);
        if (card) {
            card.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [selectedLot]);

    // Function to handle the Book Now button click
    const handleBookNowClick = (lot) => {
        setLotDetails(lot); // Set the selected lot details to show in the drawer
        setIsDrawerOpen(true); // Open the drawer
    };

    // Function to close the drawer
    const closeDrawer = () => {
        setIsDrawerOpen(false);
    };

    return (
        <div className="bg-white min-h-screen w-full overflow-hidden">
            <Header />

            <div className="flex h-[calc(100vh-64px)]">
                {/* Left: Parking List */}
                <div
                    className="w-2/6 bg-gray-50 p-5 overflow-y-auto shadow-inner"
                    style={{ maxHeight: "calc(100vh - 64px)" }}
                    ref={listRef}
                    role="list"
                    aria-label="Available parking lots"
                >
                    <h2 className="text-2xl font-bold mb-6">Available Parking Lots</h2>

                    <input
                        type="text"
                        placeholder="Search parking lot..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mb-4 p-3 w-full border border-gray-300 bg-gray-50 text-gray-700 rounded-lg shadow-sm transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:border-gray-400 hover:bg-gray-100"
                        aria-label="Search for a parking lot"
                    />

                    {filteredParkingLots.map((lot) => (
                        <div
                            id={`lot-${lot.id}`}
                            key={lot.id}
                            onClick={() => setSelectedLot(lot)}
                            role="listitem"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") setSelectedLot(lot);
                            }}
                            className={`group bg-white rounded-xl shadow-md cursor-pointer border transition-all mb-6 p-4 flex items-center gap-4 relative
    ${selectedLot.id === lot.id ? "border-2 border-blue-600 shadow-lg scale-105" : "border-gray-200 hover:shadow-lg hover:scale-105"}`}
                            aria-current={selectedLot.id === lot.id}
                        >
                            {lot.id === cheapestLot.id && (
                                <div
                                    className={`absolute top-0 left-0 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full z-10 shadow-lg flex items-center gap-1`}
                                    aria-label="Best Value Parking Lot"
                                    title="Best Value Parking Lot"
                                >
                                    <FiStar className="text-white text-sm" />
                                    Best Value
                                </div>
                            )}

                            <img
                                src="https://images.unsplash.com/photo-1587560699334-bea93391dcef?auto=format&fit=crop&w=80&q=60"
                                alt={`${lot.name} parking lot`}
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />

                            <div className="flex flex-col flex-grow">
                                <div className="flex items-center gap-2 text-gray-700 font-semibold text-lg">
                                    {truncateText(lot.name, 30)}
                                </div>

                                <div className="flex items-center gap-3 mt-1 text-gray-500 text-sm">
                                    <div className="flex items-center gap-1">
                                        <FiStar className="text-yellow-400" />
                                        <span>{lot.rating.toFixed(1)}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <FiClock />
                                        <span>
                                            {lot.openingTime} - {lot.closingTime}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                                    <span
                                        className={`inline-block px-2 py-0.5 rounded ${getAvailabilityBadge(lot.availableSpots)}`}
                                        aria-label={`${lot.availableSpots} spots available`}
                                        title={`${lot.availableSpots} spots available`}
                                    >
                                        {lot.availableSpots} spots left
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 flex-shrink-0 min-w-[100px]">
                                <div className="text-green-600 font-bold text-lg whitespace-nowrap">
                                    ${lot.pricePerHour.toFixed(2)}/hr
                                </div>
                                <button
                                    type="button"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg
        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                                    onClick={() => handleBookNowClick(lot)} // Trigger the drawer on click
                                    aria-label={`Book parking lot ${lot.name}`}
                                    title={`Book parking lot ${lot.name}`}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: Map */}
                <div className="w-4/6 h-full bg-gray-100 flex flex-col relative z-10"> {/* Set z-index for map */}
                    <h2 className="text-2xl font-bold p-4 bg-gray-200 border-b border-gray-300">
                        Parking Lot Location
                    </h2>
                    <div className="flex-grow rounded-b-xl overflow-hidden relative">
                        <MapContainer
                            center={selectedLot.location}
                            zoom={15}
                            scrollWheelZoom={true}
                            style={{ height: "100%", width: "100%" }}
                            aria-label="Parking lots map"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {filteredParkingLots.map((lot) => (
                                <Marker
                                    key={lot.id}
                                    position={lot.location}
                                    eventHandlers={{
                                        click: () => {
                                            setSelectedLot(lot);
                                        },
                                    }}
                                    icon={
                                        selectedLot.id === lot.id
                                            ? new L.Icon({
                                                iconUrl: "https://img.icons8.com/color/48/000000/parking.png", // Selected marker
                                                iconSize: [30, 30],
                                                iconAnchor: [15, 30],
                                                popupAnchor: [1, -34],
                                                shadowUrl:
                                                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                                                shadowSize: [41, 41],
                                            })
                                            : new L.Icon({
                                                iconUrl: "https://img.icons8.com/ios-filled/50/000000/parking.png", // Default marker
                                                iconSize: [30, 30],
                                                iconAnchor: [15, 30],
                                                popupAnchor: [1, -34],
                                                shadowUrl:
                                                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                                                shadowSize: [41, 41],
                                            })
                                    }
                                    keyboard={true}
                                    title={lot.name}
                                    alt={`Marker for ${lot.name}`}
                                >
                                    <Popup>
                                        <div>
                                            <h3 className="font-semibold text-lg">{lot.name}</h3>
                                            <p>{lot.description}</p>
                                            <p>
                                                Spots: {lot.availableSpots} / {lot.totalSpots}
                                            </p>
                                            <p>Price: ${lot.pricePerHour.toFixed(2)} / hour</p>
                                            <p>Type: {lot.type}</p>
                                            <p>City: {lot.city}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                            <MoveToSelectedLot selectedLot={selectedLot} />
                        </MapContainer>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-opacity-30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeDrawer}
            />

            {/* Drawer Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[450px] lg:w-[500px] xl:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full overflow-y-auto">

                    {/* Header Image with Close */}
                    <div className="relative h-56 w-full">
                        <img src={lotDetails?.imageUrl} alt="Parking Lot" className="w-full h-full object-cover" />
                        <button
                            className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                            onClick={closeDrawer}
                        >
                            ❌
                        </button>
                    </div>

                    {/* Title + Rating */}
                    <div className="px-6 pt-4 pb-2 border-b border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{lotDetails?.name}</h2>
                                <div className="mt-1 text-sm text-gray-500 flex items-center gap-2">
                                    <span className="flex items-center gap-1">⭐ {lotDetails?.rating}</span>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">🚶 {lotDetails?.distance} walk</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reservation Info Section */}
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

                    {/* Book Button */}
                    <div className="px-6 py-5">
                        <button
                            className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 font-medium text-lg rounded-lg shadow-md transition-all"
                            onClick={handleBookNow}
                        >
                            Book Now
                        </button>
                    </div>

                    {/* Amenities */}
                    <div className="px-6 py-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                            {lotDetails?.amenities?.map((amenity, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                    <img src={amenity.icon} alt={amenity.name} className="w-5 h-5" />
                                    <span>{amenity.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Access Hours */}
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">🕔 Access Hours</span>
                            <span className="text-gray-800 font-medium">24/7 Open</span>
                        </div>
                    </div>

                    {/* How to Redeem */}
                    <div className="px-6 py-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">🎟 How to Redeem</h3>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            <li>Ensure license plate matches your Parking Pass</li>
                            <li>Do not park in “Reserved” spots</li>
                            <li>You're free to leave at any time</li>
                        </ul>
                    </div>

                    {/* Getting There */}
                    <div className="px-6 py-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">📍 Getting There</h3>
                        <p className="text-sm text-gray-600">
                            Enter this location at <strong>918 Oak St</strong>. Operated by Metropolis. Located between E 9th and 10th St on the west side.
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
            </div>


        </div>
    );
};

export default ParkingLotPage;
