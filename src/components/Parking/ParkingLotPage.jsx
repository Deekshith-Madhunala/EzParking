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
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { FiClock, FiStar } from "react-icons/fi";
import Header from "../User/Header";
import { useNavigate, useLocation } from "react-router-dom";

import { FiTool, FiMapPin, FiInfo } from "react-icons/fi";
import { fallbackAmenities } from "../../api/restServiceApi";
import {
    MdLocalParking,
    MdEvStation,
    MdSecurity,
    MdAccessible,
    MdAccessTime,
    MdPerson,
    MdAttachMoney
} from "react-icons/md";
import Snackbar from "../../general/Snackbar";


// Helper: get badge color based on availability
const getAvailabilityBadge = (spots) => {
    if (spots > 20) return "bg-green-100 text-green-800";
    if (spots > 5) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
};

const truncateText = (text, maxLength) =>
    text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

const getCheapestLot = (lots) =>
    lots.reduce((cheapest, lot) =>
        parseFloat(lot.pricePerHour) < parseFloat(cheapest.pricePerHour) ? lot : cheapest
    );

const MoveToSelectedLot = ({ selectedLot }) => {
    const map = useMap();
    useEffect(() => {
        if (selectedLot?.location?.latitude && selectedLot?.location?.longitude) {
            map.flyTo(
                [parseFloat(selectedLot.location.latitude), parseFloat(selectedLot.location.longitude)],
                15,
                { animate: true, duration: 1 }
            );
        }
    }, [selectedLot, map]);
    return null;
};

const ParkingLotPage = () => {
    const { state } = useLocation();
    const { city, date, startTime, endTime, parkingLots = [] } = state || {};

    const navigate = useNavigate();

    const [selectedLot, setSelectedLot] = useState(parkingLots[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [lotDetails, setLotDetails] = useState(null);
    const listRef = useRef(null);

    const cheapestLot = getCheapestLot(parkingLots);
    fallbackAmenities

    const filteredParkingLots = parkingLots.filter((lot) =>
        lot.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBookNow = () => {
        if (lotDetails.availableSpots <= 0) {
            showSnackbar("No spots available", "error");
            return;
        } else {

            navigate("/vehicle-info", { state: { city, date, startTime, endTime, lotDetails } });
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        const [hour, minute] = timeStr.split(":").map(Number);
        const date = new Date();
        date.setHours(hour);
        date.setMinutes(minute);
        return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    };

    useEffect(() => {
        if (!listRef.current) return;
        const card = listRef.current.querySelector(`#lot-${selectedLot?.id}`);
        if (card) {
            card.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [selectedLot]);


    const [snackbar, setSnackbar] = useState({
        message: "",
        type: "",
        visible: false,
    });

    const showSnackbar = (message, type = "info") => {
        setSnackbar({ message, type, visible: true });
    };

    const handleSnackbarClose = () => {
        setSnackbar((prev) => ({ ...prev, visible: false }));
    };


    const handleBookNowClick = (lot) => {
        if (lot.availableSpots <= 0) {
            showSnackbar("No spots available", "error");
            return;
        }
        setLotDetails(lot);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
    };

    return (
        <div className="bg-white min-h-screen w-full overflow-hidden">
            <Header />
            {snackbar.visible && (
                <Snackbar
                    message={snackbar.message}
                    type={snackbar.type}
                    onClose={handleSnackbarClose}
                />
            )}

            <div className="flex h-[calc(100vh-64px)]">
                {/* Sidebar */}
                <div
                    className="w-2/6 bg-gray-50 p-5 overflow-y-auto shadow-inner"
                    style={{ maxHeight: "calc(100vh - 64px)" }}
                    ref={listRef}
                >
                    <h2 className="text-2xl font-bold mb-6">Available Parking Lots</h2>

                    <input
                        type="text"
                        placeholder="Search parking lot..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mb-4 p-3 w-full border border-gray-300 bg-gray-50 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    />

                    {filteredParkingLots.map((lot) => (
                        <div
                            id={`lot-${lot.id}`}
                            key={lot.id}
                            onClick={() => setSelectedLot(lot)}
                            className={`group bg-white rounded-xl shadow-md cursor-pointer border transition-all mb-6 p-4 flex items-center gap-4 relative ${selectedLot?.id === lot.id
                                ? "border-2 border-blue-600 shadow-lg scale-105"
                                : "border-gray-200 hover:shadow-lg hover:scale-105"
                                }`}
                        >
                            {lot.id === cheapestLot.id && (
                                <div className="absolute top-0 left-0 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full z-10 shadow-lg flex items-center gap-1">
                                    <FiStar className="text-white text-sm" />
                                    Best Value
                                </div>
                            )}

                            <img
                                src="https://images.unsplash.com/photo-1587560699334-bea93391dcef?auto=format&fit=crop&w=80&q=60"
                                alt={`${lot.name} parking lot`}
                                className="w-20 h-20 rounded-lg object-cover"
                            />

                            <div className="flex flex-col flex-grow">
                                <div className="text-gray-700 font-semibold text-lg">
                                    {truncateText(lot.name, 30)}
                                </div>

                                <div className="flex gap-3 mt-1 text-gray-500 text-sm">
                                    <span className="flex items-center gap-1">
                                        ⭐ {lot?.rating?.toFixed?.(1) || "4.5"}
                                    </span>
                                    {/* <span className="flex items-center gap-1">
                                        <FiClock />
                                        {lot.openingTime} - {lot.closingTime}
                                    </span> */}
                                </div>

                                <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                                    <span
                                        className={`inline-block px-2 py-0.5 rounded ${getAvailabilityBadge(
                                            lot.availableSpots
                                        )}`}
                                    >
                                        {lot.availableSpots} spots left
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 min-w-[100px]">
                                <div className="text-green-600 font-bold text-lg">
                                    ${parseFloat(lot.pricePerHour).toFixed(2)}/hr
                                </div>
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700"
                                    onClick={() => handleBookNowClick(lot)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Map */}
                <div className="w-4/6 h-full bg-gray-100 flex flex-col relative z-10">
                    <h2 className="text-2xl font-bold p-4 bg-gray-200 border-b border-gray-300">
                        Parking Lot Location
                    </h2>
                    <div className="flex-grow overflow-hidden relative">
                        <MapContainer
                            center={[
                                parseFloat(selectedLot?.location?.latitude || 0),
                                parseFloat(selectedLot?.location?.longitude || 0),
                            ]}
                            zoom={15}
                            scrollWheelZoom={true}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {filteredParkingLots.map((lot) => (
                                <Marker
                                    key={lot.id}
                                    position={[
                                        parseFloat(lot.location.latitude),
                                        parseFloat(lot.location.longitude),
                                    ]}
                                    eventHandlers={{ click: () => setSelectedLot(lot) }}
                                    icon={
                                        selectedLot?.id === lot.id
                                            ? new L.Icon({
                                                iconUrl: "https://img.icons8.com/color/48/000000/parking.png",
                                                iconSize: [30, 30],
                                                iconAnchor: [15, 30],
                                                popupAnchor: [1, -34],
                                                shadowUrl:
                                                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                                                shadowSize: [41, 41],
                                            })
                                            : new L.Icon({
                                                iconUrl: "https://img.icons8.com/ios-filled/50/000000/parking.png",
                                                iconSize: [30, 30],
                                                iconAnchor: [15, 30],
                                                popupAnchor: [1, -34],
                                                shadowUrl:
                                                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                                                shadowSize: [41, 41],
                                            })
                                    }
                                >
                                    <Popup>
                                        <div>
                                            <h3 className="font-semibold text-lg">{lot.name}</h3>
                                            <p>
                                                {lot.location?.street}, {lot.location?.city}
                                            </p>
                                            <p>
                                                Spots: {lot.availableSpots} / {lot.totalSpots}
                                            </p>
                                            <p>
                                                Price: ${parseFloat(lot.pricePerHour).toFixed(2)} / hour
                                            </p>
                                            <p>Type: {lot.type}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                            <MoveToSelectedLot selectedLot={selectedLot} />
                        </MapContainer>
                    </div>
                </div>
            </div>

            {/* Drawer Overlay */}
            <div
                className={`fixed inset-0 bg-opacity-30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={closeDrawer}
            />

            {/* Drawer Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[450px] lg:w-[500px] xl:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {lotDetails && (
                    <div className="flex flex-col h-full overflow-y-auto">
                        <div className="relative h-56 w-full">
                            <img
                                src={lotDetails.imageUrl || "https://images.pexels.com/photos/31685643/pexels-photo-31685643.jpeg"}
                                alt="Parking Lot"
                                className="w-full h-full object-cover"
                            />
                            <button
                                className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                                onClick={closeDrawer}
                            >
                                ❌
                            </button>
                        </div>

                        <div className="px-6 pt-4 pb-2 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800">{lotDetails.name}</h2>

                            <div className="mt-2 flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <FiStar className="text-yellow-500" />
                                    <span>{lotDetails?.rating || "4.5"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FiMapPin className="text-blue-600" />
                                    <span>{lotDetails?.location?.street}</span>
                                </div>
                            </div>
                        </div>


                        <div className="px-6 pt-4">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl shadow-sm">

                                {/* Availability & Status */}
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-gray-500">Availability</p>
                                    <span
                                        className={`inline-block w-fit px-2 py-0.5 rounded text-xs font-medium ${lotDetails.availableSpots > 20
                                            ? "bg-green-100 text-green-800"
                                            : lotDetails.availableSpots > 5
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {lotDetails.availableSpots} spots available
                                    </span>
                                    <p
                                        className={`mt-1 text-sm font-semibold ${lotDetails.availableSpots > 0 ? "text-green-700" : "text-red-600"
                                            }`}
                                    >
                                        {lotDetails.availableSpots > 0 ? "Available" : "Full"}
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="flex flex-col gap-1 items-start">
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <MdAttachMoney className="text-green-600" /> Rate
                                    </p>
                                    <p className="text-lg font-bold text-green-700">
                                        ${parseFloat(lotDetails.pricePerHour).toFixed(2)}
                                    </p>
                                    <span className="text-xs text-gray-400">per hour</span>
                                </div>

                                {/* Why Choose This Lot (shortened) */}
                                <div className="col-span-2 mt-4 bg-white rounded-md p-4 shadow-inner">
                                    <h5 className="text-md font-semibold text-gray-800 mb-2">Why Choose This Lot?</h5>
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                        <li>Highly rated by drivers ({lotDetails?.rating || "4.5"} ⭐)</li>
                                        <li>Real-time availability with {lotDetails?.availableSpots} spots open</li>
                                        <li>Affordable & trusted operator: {lotDetails?.location?.operator || "Certified Partner"}</li>
                                    </ul>
                                </div>

                            </div>
                        </div>


                        <div className="px-6 py-5">
                            <button
                                className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 font-medium text-lg rounded-lg shadow-md"
                                onClick={handleBookNow}
                            >
                                Book Now
                            </button>
                        </div>

                        {/* Amenities */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <FiTool className="text-blue-600" /> Amenities
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {(lotDetails?.amenities?.length ? lotDetails.amenities : [
                                    { name: "Covered Parking", icon: <MdLocalParking className="text-gray-700 text-lg" /> },
                                    { name: "EV Charging", icon: <MdEvStation className="text-gray-700 text-lg" /> },
                                    { name: "Security Cameras", icon: <MdSecurity className="text-gray-700 text-lg" /> },
                                    { name: "Handicap Access", icon: <MdAccessible className="text-gray-700 text-lg" /> },
                                    { name: "24/7 Access", icon: <MdAccessTime className="text-gray-700 text-lg" /> },
                                    { name: "Attendant on Site", icon: <MdPerson className="text-gray-700 text-lg" /> }
                                ]).map((amenity, index) => (
                                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                                        {amenity.icon || (
                                            <img src={amenity.icon} alt={amenity.name} className="w-5 h-5" />
                                        )}
                                        <span>{amenity.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>



                        {/* Access Hours */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <FiClock className="text-blue-600" /> Access Hours
                                </span>
                                <span className="text-sm font-medium text-gray-800">
                                    {lotDetails.openingTime === "00:00" && lotDetails.closingTime === "00:00"
                                        ? "Open 24/7"
                                        : `Open from ${formatTime(lotDetails.openingTime)} to ${formatTime(lotDetails.closingTime)}`}
                                </span>
                            </div>
                        </div>


                        {/* How to Redeem */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <FiInfo className="text-blue-600" /> How to Redeem
                            </h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                <li>License plate must match Parking Pass.</li>
                                <li>Avoid reserved spots.</li>
                                <li>Leave anytime during reservation.</li>
                            </ul>
                        </div>

                        {/* Getting There */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <FiMapPin className="text-blue-600" /> Getting There
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {`The parking lot is located at ${lotDetails?.location?.street || "N/A"}, ${lotDetails?.location?.city || ""}, ${lotDetails?.location?.state || ""} ${lotDetails?.location?.zipCode || ""}.`}
                                {lotDetails?.location?.landmark && ` It is situated ${lotDetails.location.landmark}.`}
                                {lotDetails?.location?.directionsNote && ` Please note: it is a ${lotDetails.location.directionsNote.toLowerCase()}.`}
                                {lotDetails?.location?.operator && ` This facility is operated by ${lotDetails.location.operator}.`}
                            </p>
                        </div>


                        {/* Facility Reviews */}
                        <div className="px-6 py-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <FiStar className="text-yellow-500" /> Facility Reviews
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                                <span>4.7/5</span>
                                <span>Excellent</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">(Based on 21 reviews from EZ Park customers)</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParkingLotPage;
