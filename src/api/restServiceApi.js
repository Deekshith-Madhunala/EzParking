
/**
 * API call to fetch the exact coordinates of the desired location (latitues and longitues)
 * The API only provides the names that are displayed in the map of the Nominatim application as its a free version 
 * for more specific location queries need to purchase licence such as Google Maps Places API 
 */
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/ui/search.html?q=chicago+Auditorium+Parking"


/**
 * 
 * @returns All Cities fromm the locations API
 */
export const getAllCities = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/locations", {
      headers: { accept: "application/json" }
    });
    const data = await res.json();

    // Extract and return unique cities only
    const uniqueCities = Array.from(new Set(data.map(loc => loc.city.trim())));
    return uniqueCities;
  } catch (error) {
    console.error("Error fetching cities:", error);
    return []; // fallback
  }
};

/**
 * Fetches a single user by ID from the users API
 * 
 * @param {string} id - The user ID
 * @returns {Promise<UserDTO | null>} The user data or null on error
 */
export const getUserById = async (id) => {
  try {
    const res = await fetch(`http://localhost:8080/api/users/${id}`, {
      headers: { accept: "application/json" }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch user with ID ${id}: ${res.status}`);
    }

    const user = await res.json();
    return user; // Assumes response matches UserDTO
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};


/**
 * 
 * @param {A city name selected provided from the User} cityName 
 * @returns List of locations which has the provided cityName 
 */
export const getLocationsByCity = async (cityName) => {
  try {
    const res = await fetch(`http://localhost:8080/api/locations/city/${encodeURIComponent(cityName)}`, {
      headers: { accept: "application/json" }
    });
    return await res.json();
  } catch (error) {
    console.error("Error fetching locations by city:", error);
    return [];
  }
};


/**
 * 
 * @param {locationIds of a specific city} locationId 
 * @returns a parking lot information repective to the specific location
 */
export const getParkingLotsByLocationId = async (locationId) => {
  try {
    const res = await fetch(`http://localhost:8080/api/parkingLots/location/${locationId}`, {
      headers: { accept: "application/json" },
    });

    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType || !contentType.includes("application/json")) {
      return [];
    }

    const data = await res.json();
    // Ensure it returns as array
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("Error fetching parking lot by location ID:", error);
    return [];
  }
};

/**
 * 
 * @param {parking lot details entered by the ADMIN} lotData 
 * @param {Location Data fetched from the NOMINATIM API} locationData 
 * @returns creates and returns the parkingLot Data
 */
export const createParkingLotWithLocation = async (parkingData, locationData) => {
  try {
    // Step 1: Create the location
    const locationRes = await fetch("http://localhost:8080/api/locations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...locationData,
        latitude: parseFloat(locationData.latitude),
        longitude: parseFloat(locationData.longitude),
      }),
    });

    if (!locationRes.ok) {
      throw new Error("Failed to create location");
    }

    const location = await locationRes.json();
    console.log("Location response:", location);


    // Step 2: Create the parking lot using location ID
    const parkingLotRes = await fetch("http://localhost:8080/api/parkingLots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...parkingData,
        totalSpots: parseInt(parkingData.totalSpots),
        availableSpots: parseInt(parkingData.availableSpots),
        pricePerHour: parseFloat(parkingData.pricePerHour),
        location: location, // 👈 location ID as string
      }),
    });

    if (!parkingLotRes.ok) {
      throw new Error("Failed to create parking lot");
    }

    const result = await parkingLotRes.json();
    alert("Parking Lot Created Successfully:\n" + JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Failed to create parking lot:", err);
    alert("Error: " + err.message);
  }
};


// // src/api/createReservation.js

// export async function createReservation({ date, startTime, endTime, lotDetails, vehicle }) {
//   try {
//     // Get user from localStorage (adjust key if needed)
//     const user = JSON.parse(localStorage.getItem("user"))?.id;

//     if (!user) {
//       throw new Error("User not found in localStorage");
//     }

//     // Construct start and end datetime strings in ISO format
//     const startDateTime = new Date(`${date}T${startTime}:00`).toISOString();
//     const endDateTime = new Date(`${date}T${endTime}:00`).toISOString();

//     // Calculate total hours and price
//     const startHour = parseFloat(startTime.split(":")[0]);
//     const endHour = parseFloat(endTime.split(":")[0]);
//     const totalHours = endHour - startHour;
//     const pricePaid = (totalHours * parseFloat(lotDetails.pricePerHour)).toFixed(2);

//     // Construct payload
//     const payload = {
//       startTime: startDateTime,
//       endTime: endDateTime,
//       status: "CONFIRMED",
//       pricePaid,
//       createdAt: new Date().toISOString(),
//       user,
//       vehicle,
//       parkingLot: lotDetails.id
//     };

//     // API call
//     const response = await fetch("https://your-api-url.com/reservations", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//         // Add auth headers here if needed
//       },
//       body: JSON.stringify(payload)
//     });

//     if (!response.ok) {
//       throw new Error("Failed to create reservation");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error in createReservation:", error);
//     throw error;
//   }
// }

export async function updateUserVehicle(vehicleData) {
  const userId = JSON.parse(localStorage.getItem("user"))?.id;
  console.log("userId", userId);


  if (!userId) {
    throw new Error("User not found in localStorage");
  }

  const url = `http://localhost:8080/api/users/${userId}/vehicles`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vehicleData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update vehicle: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Vehicle update successful:', result);
    alert('Vehicle information updated successfully!');
    return result;

  } catch (error) {
    console.error('Error updating vehicle:', error);
    alert('Failed to update vehicle. See console for details.');
  }
}



/**
 * Creates a new reservation (booking) using the provided details
 *
 * @param {Object} params - Reservation parameters
 * @param {string} params.date - Date in 'YYYY-MM-DD' format
 * @param {string} params.startTime - Start time in 'HH:mm' format
 * @param {string} params.endTime - End time in 'HH:mm' format
 * @param {Object} params.lotDetails - Parking lot details object (must include id and pricePerHour)
 * @returns {Promise<Object|null>} Reservation response or null on failure
 */
export const createReservation = async ({ date, startTime, endTime, lotDetails }) => {
  try {
    const userToken = localStorage.getItem("token");
    if (!userToken) throw new Error("User token not found in localStorage");

    console.log("date:", date);


    const { id: userId } = JSON.parse(atob(userToken.split(".")[1])); // Assumes JWT with user ID in payload

    // Construct full ISO start and end timestamps
    // const startDateTime = new Date(`${date}T${startTime}:00`);
    // const endDateTime = new Date(`${date}T${endTime}:00`);

    const startDateTimeObj = new Date(`${date}T${startTime}:00`);
    const endDateTimeObj = new Date(`${date}T${endTime}:00`);

    // Calculate duration in hours
    const durationHours = (endDateTimeObj - startDateTimeObj) / (1000 * 60 * 60);
    const pricePaid = (durationHours * parseFloat(lotDetails.pricePerHour)).toFixed(2);

    // Manually build ISO strings without timezone conversion:
    const offset = "-05:00";  // adjust if daylight savings or other zone
    const startDateTime = `${date}T${startTime}:00.000${offset}`;
    const endDateTime = `${date}T${endTime}:00.000${offset}`;

    const reservationPayload = {
      startTime: startDateTime,
      endTime: endDateTime,
      status: "Booked",
      pricePaid,
      createdAt: new Date().toISOString(),
      user: userId,
      parkingLot: lotDetails.id || lotDetails.parkingLotId,
    };

    console.log('reservatino payload', reservationPayload);

    // return;

    const response = await fetch("http://localhost:8080/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(reservationPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to create reservation: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating reservation:", error);
    return null;
  }
};

/**
 * Fetch all reservations for a given user ID
 * 
 * @param {string} userId 
 * @returns {Promise<Array>} List of reservations or []
 */
export const getUserReservationsss = async (userId) => {
  try {
    const res = await fetch(`http://localhost:8080/api/reservations/user/${userId}`, {
      headers: { accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch reservations for user ${userId}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    return [];
  }
};


export const getUserReservations = async (userId) => {
  try {
    // Step 1: Get reservations
    const res = await fetch(`http://localhost:8080/api/reservations/user/${userId}`, {
      headers: { accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch reservations for user ${userId}`);
    }

    const reservations = await res.json();

    // Step 2: Map and fetch user, parking lot, and location
    const detailedReservations = await Promise.all(
      reservations.map(async (reservation) => {
        try {
          // Parallel fetches
          const [userRes, lotRes] = await Promise.all([
            fetch(`http://localhost:8080/api/users/${reservation.user}`),
            fetch(`http://localhost:8080/api/parkingLots/${reservation.parkingLot}`),
          ]);

          const userData = userRes.ok ? await userRes.json() : null;
          const parkingLotData = lotRes.ok ? await lotRes.json() : null;

          // Fetch location if parkingLotData is valid
          let locationData = null;
          if (parkingLotData?.location) {
            const locationRes = await fetch(`http://localhost:8080/api/locations/${parkingLotData.location}`);
            locationData = locationRes.ok ? await locationRes.json() : null;
          }

          return {
            ...reservation,
            userDetails: userData,
            parkingLotDetails: {
              ...parkingLotData,
              locationDetails: locationData,
            },
          };
        } catch (innerErr) {
          console.error("Error enriching reservation:", innerErr);
          return reservation; // fallback to original if fails
        }
      })
    );

    return detailedReservations;
  } catch (error) {
    console.error("Error fetching reservation details:", error);
    return [];
  }
};


export const updateReservationStatus = async (reservationId, newStatus) => {
  try {
    // Step 1: Fetch the reservation details using GET
    const res = await fetch(`http://localhost:8080/api/reservations/${reservationId}`, {
      method: "GET",
      headers: {
        "accept": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch reservation details");
    }

    const reservation = await res.json();

    // Step 2: Check if the reservation status can be updated
    if (reservation.status === newStatus) {
      throw new Error(`Reservation is already ${newStatus}`);
    }

    // Step 3: Update the reservation status
    const updatedReservation = {
      ...reservation,
      status: newStatus
    };

    // Step 4: Send a PUT request to update the reservation status
    const updateRes = await fetch(`http://localhost:8080/api/reservations/${reservationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedReservation),
    });

    if (!updateRes.ok) {
      throw new Error(`Failed to ${newStatus.toLowerCase()} reservation`);
    }

    // Return the updated reservation details
    return await updateRes.json();

  } catch (err) {
    console.error(`Error updating reservation status: ${err}`);
    throw err; // Rethrow the error to handle it in the calling function
  }
};


export const fetchSlotStatus = async (slotId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/parkingLots/${slotId}/status`);
    if (!response.ok) {
      throw new Error('Failed to fetch slot status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching slot status:', error);
    return null;
  }
};


export const deleteParkingLot = async (parkingLotId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/parkingLots/${parkingLotId}`, {
      method: 'DELETE',
      headers: {
        Accept: '*/*',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete parking lot');
    }

    return true; // successful deletion
  } catch (error) {
    console.error('Error deleting parking lot:', error);
    return false;
  }
};

export const updateParkingLot = async (parkingLotData) => {
  try {
    const response = await fetch(`http://localhost:8080/api/parkingLots/${parkingLotData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(parkingLotData),
    });

    if (!response.ok) {
      throw new Error('Failed to update parking lot');
    }

    const updatedLot = await response.json();
    return updatedLot;
  } catch (error) {
    console.error('Error updating parking lot:', error);
    return null;
  }
};


export async function fetchParkingLots() {
  const response = await fetch("http://localhost:8080/api/parkingLots"); // Replace with your real API URL
  
  if (!response.ok) {
    throw new Error("Failed to fetch parking lots");
  }
  const data = await response.json();
  
  // Normalize one or many parking lots
  const lotsArray = Array.isArray(data) ? data : [data];
  console.log("data", data);

  return lotsArray.map(normalizeParkingLot);
}

function normalizeParkingLot(apiData) {
  return {
    id: apiData.id || apiData._id?.["$oid"] || null,  // FIXED
    name: apiData.name,
    totalSpots: apiData.totalSpots,
    availableSpots: apiData.availableSpots,
    pricePerHour: parseFloat(apiData.pricePerHour) || 0, // Optional: convert to number
    type: apiData.type,
    openingTime: apiData.openingTime,
    closingTime: apiData.closingTime,
    createdAt: apiData.createdAt ? new Date(apiData.createdAt) : null,
    locationId: apiData.location || apiData.location?.["$oid"] || null,
    slots: (apiData.slots || []).map((slot) => ({
      slotId: slot?.slotId,
      isOccupied: slot?.occupied,
    })),
    createdBy: apiData.createdBy || apiData.createdBy?.["$oid"] || null,
  };
}



export async function getAllReservations() {
  try {
    const response = await fetch("http://localhost:8080/api/reservations", {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });
    if (!response.ok) throw new Error("Failed to fetch reservations");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return [];
  }
}



export const fallbackAmenities = [
  {
    name: "Covered Parking",
    icon: "https://img.icons8.com/color/48/garage-closed.png",
  },
  {
    name: "EV Charging",
    icon: "https://img.icons8.com/color/48/electric-vehicle.png",
  },
  {
    name: "Security Cameras",
    icon: "https://img.icons8.com/color/48/security-camera.png",
  },
  {
    name: "Handicap Accessible",
    icon: "https://img.icons8.com/color/48/wheelchair.png",
  },
  {
    name: "24/7 Access",
    icon: "https://img.icons8.com/color/48/clock--v1.png",
  },
  {
    name: "Attendant on Site",
    icon: "https://img.icons8.com/color/48/security-guard-male.png",
  },
];


export const dummyParkingLots = [
  {
    id: "1",
    name: "EZPark Lot - Main Street",
    description: "Convenient parking lot on Main Street in Warrensburg",
    totalSpots: 50,
    availableSpots: 36,
    pricePerHour: 3.4,
    type: "LOT",
    openingTime: "08:00",
    closingTime: "22:00",
    city: "Warrensburg",
    location: [38.7629, -93.7361],
    rating: 4.5,
    reviews: 120,
  },
  {
    id: "2",
    name: "EZPark Garage - University Ave",
    description: "Multi-level parking garage near UCM campus",
    totalSpots: 120,
    availableSpots: 8,
    pricePerHour: 2.5,
    type: "GARAGE",
    openingTime: "07:00",
    closingTime: "23:00",
    city: "Warrensburg",
    location: [38.7585, -93.7351],
    rating: 4.2,
    reviews: 98,
  },
  {
    id: "3",
    name: "EZPark Lot - Market Street",
    description: "Open lot next to the Farmers Market",
    totalSpots: 35,
    availableSpots: 3,
    pricePerHour: 1.75,
    type: "LOT",
    openingTime: "06:30",
    closingTime: "21:00",
    city: "Warrensburg",
    location: [38.7612, -93.7394],
    rating: 3.9,
    reviews: 40,
  },
  {
    id: "4",
    name: "EZPark Garage - Holden Street",
    description: "Covered garage near downtown shopping district",
    totalSpots: 100,
    availableSpots: 15,
    pricePerHour: 2.9,
    type: "GARAGE",
    openingTime: "07:00",
    closingTime: "22:00",
    city: "Warrensburg",
    location: [38.7598, -93.7376],
    rating: 4.6,
    reviews: 140,
  },
  {
    id: "5",
    name: "EZPark Lot - Ridgeview Road",
    description: "Small lot with quick access to Ridgeview Park",
    totalSpots: 20,
    availableSpots: 1,
    pricePerHour: 1.5,
    type: "LOT",
    openingTime: "08:00",
    closingTime: "20:00",
    city: "Warrensburg",
    location: [38.7651, -93.7412],
    rating: 3.7,
    reviews: 10,
  },
  {
    id: "6",
    name: "Warrensburg S Main Street - Diamond Club Apartments",
    description: "Apartment complex with parking for residents and guests near Main Street",
    totalSpots: 120,
    availableSpots: 80,
    pricePerHour: 3.5,
    type: "LOT",
    openingTime: "06:00",
    closingTime: "23:00",
    city: "Warrensburg",
    location: [38.7584612, -93.7504618],
    rating: 4.7,
    reviews: 85
  }
];