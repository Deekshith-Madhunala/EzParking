import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { createParkingLotWithLocation } from "../../api/restServiceApi";
import Header from "../User/Header";

const CreateParkingLot = () => {
  // Get user from localStorage
  const userId = JSON.parse(localStorage.getItem("user"))?.id;
  const username = JSON.parse(localStorage.getItem("user"))?.username;

  if (!userId) {
    throw new Error("User not found in localStorage");
  }

  const [parkingData, setParkingData] = useState({
    name: "",
    totalSpots: "",
    availableSpots: "",
    pricePerHour: "",
    type: "",
    openingTime: "06:00:00",
    closingTime: "22:00:00",
    createdAt: new Date().toISOString(),
    createdBy: userId, // This will be sent to API, but not shown in UI
  });

  const [locationData, setLocationData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    latitude: "38.930400000",
    longitude: "-94.363600000",
  });

  const [query, setQuery] = useState("");
  const markerRef = useRef(null);

  const validateForm = () => {
    const errors = [];
    if (!parkingData.name.trim()) errors.push("Name is required.");
    if (parkingData.totalSpots <= 0) errors.push("Total spots must be greater than 0.");
    if (parkingData.availableSpots < 0) errors.push("Available spots cannot be negative.");
    if (isNaN(parseFloat(parkingData.pricePerHour))) errors.push("Price per hour must be a number.");
    if (!/^\d{2}:\d{2}:\d{2}$/.test(parkingData.openingTime)) errors.push("Opening time must be in HH:mm:ss format.");
    if (!/^\d{2}:\d{2}:\d{2}$/.test(parkingData.closingTime)) errors.push("Closing time must be in HH:mm:ss format.");
    if (!locationData.latitude || !locationData.longitude) errors.push("Latitude and Longitude are required.");
    return errors;
  };

  const handleAddressSearch = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2`
      );
      const data = await response.json();
      if (data.length > 0) {
        const loc = data[0];
        setLocationData((prev) => ({
          ...prev,
          street: loc.display_name,
          latitude: parseFloat(loc.lat).toFixed(9),
          longitude: parseFloat(loc.lon).toFixed(9),
        }));
      }
    } catch (error) {
      console.error("Address lookup failed", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      alert("Validation Errors:\n" + errors.join("\n"));
      return;
    }

    // Send `createdAt` and `createdBy` along with the parking data to the API
    createParkingLotWithLocation(parkingData, locationData);
  };

  const icon = new L.Icon({
    iconUrl: "https://img.icons8.com/color/48/parking.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  const FlyToMarker = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
      if (lat && lng) {
        map.flyTo([parseFloat(lat), parseFloat(lng)], map.getZoom(), { animate: true });
      }
    }, [lat, lng]);
    return null;
  };

  const MapClickHandler = () => {
    const map = useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`
          );
          const data = await response.json();
          const address = data.address;
          setLocationData({
            street: data.display_name,
            city: address.city || address.town || address.village || "",
            state: address.state || "",
            zipCode: address.postcode || "",
            country: address.country || "",
            latitude: parseFloat(lat).toFixed(9),
            longitude: parseFloat(lng).toFixed(9),
          });
        } catch (error) {
          console.error("Reverse geocoding failed", error);
        }
      },
    });
    return null;
  };

  return (
    <>
      <Header />
      <div className="bg-white mt-7 p-6 max-w-7xl mx-auto rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Parking Lot</h2>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="space-y-4">
              <label className="block text-gray-700 font-medium">Search Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search address..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={handleAddressSearch}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Find
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-800">Parking Lot Info</h3>
                {Object.entries(parkingData).map(([key, val]) => {
                  // Do not display `createdAt` and `createdBy` in the UI
                  if (key === "createdAt" || key === "createdBy") return null;

                  return (
                    <input
                      key={key}
                      type={typeof val === "number" ? "number" : "text"}
                      placeholder={key}
                      value={parkingData[key]}
                      onChange={(e) => setParkingData({ ...parkingData, [key]: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
                    />
                  );
                })}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-800">Location Info</h3>
                {Object.entries(locationData).map(([key, val]) => (
                  <input
                    key={key}
                    type="text"
                    placeholder={key}
                    value={locationData[key]}
                    onChange={(e) => setLocationData({ ...locationData, [key]: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 w-full"
              >
                Submit
              </button>
            </form>
          </div>

          {/* Right Column: Map */}
          <div className="w-full lg:w-1/2 h-[600px] rounded-lg overflow-hidden shadow-lg">
            <MapContainer
              center={[parseFloat(locationData.latitude), parseFloat(locationData.longitude)]}
              zoom={16}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={[parseFloat(locationData.latitude), parseFloat(locationData.longitude)]}
                icon={icon}
              />
              <MapClickHandler />
              <FlyToMarker lat={locationData.latitude} lng={locationData.longitude} />
            </MapContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateParkingLot;
