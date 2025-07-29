import { useEffect, useState } from "react";
import { getUserReservations, updateReservationStatus } from "../../api/restServiceApi";
import { FiMapPin, FiClock, FiDollarSign, FiCalendar, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Header from "../User/Header";
import Timer from "./Timer"; // Import Timer component
import Snackbar from "../../general/Snackbar"; // Import Snackbar component

const ViewBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [actionType, setActionType] = useState(""); // Track the action type (Check-In, Check-Out, Cancel)
    const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message state
    const [snackbarType, setSnackbarType] = useState(""); // Snackbar type (error, success)

    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const userId = JSON.parse(localStorage.getItem("user"))?.id;
                if (!userId) throw new Error("User not found in localStorage");

                const data = await getUserReservations(userId);
                if (!data || data.length === 0) {
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                }

                setBookings(data || []);
            } catch (err) {
                console.error("Failed to fetch bookings:", err);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const isReservationCompleted = (booking) => {
        const currentTime = new Date().getTime();
        const endTime = new Date(booking.endTime).getTime();
        return currentTime > endTime;
    };

    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    };

    const handleStatusChange = async () => {
        try {
            if (actionType && selectedBooking) {
                const updatedReservation = await updateReservationStatus(selectedBooking.id, actionType);
                console.log(`${actionType} successful:`, updatedReservation);

                // Update booking status locally
                setBookings((prev) =>
                    prev.map((b) => (b.id === selectedBooking.id ? { ...b, status: actionType } : b))
                );

                setShowModal(false); // Close modal after successful action
            }
        } catch (err) {
            console.error(`${actionType} failed:`, err);
            setSnackbarMessage(`Failed to ${actionType.toLowerCase()}. Please try again.`);
            setSnackbarType("error");
        }
    };

    const openModal = (booking, action) => {
        setSelectedBooking(booking);
        setActionType(action);
        setShowModal(true);
    };

    const handleCheckInClick = (booking) => {
        const currentTime = new Date().getTime();
        const startTime = new Date(booking.startTime).getTime();

        // Check if the current time is after the start time
        if (currentTime < startTime) {
            const timeDiff = new Date(startTime) - new Date(currentTime);
            const minutesUntilStart = Math.ceil(timeDiff / (1000 * 60)); // Get remaining minutes

            setSnackbarMessage(`You cannot check in yet. Please try again in ${minutesUntilStart} minutes.`);
            setSnackbarType("error");
            return;
        }

        openModal(booking, "Checked In");
    };

    // Function to check if Check-In button should be disabled
    const isCheckInDisabled = (booking) => {
        const currentTime = new Date().getTime();
        const startTime = new Date(booking.startTime).getTime();
        const endTime = new Date(booking.endTime).getTime();

        // Disable if the booking's start time is in the future or the booking's end time has passed
        return currentTime < startTime || currentTime > endTime;
    };

    // Function to check if the Cancel button should be displayed
    const shouldShowCancelButton = (booking) => {
        return booking.status !== "Checked Out" && booking.status !== "Cancelled";
    };


    const handleAutoCheckOut = async (booking) => {
        if (booking.status !== "Checked In") return; // prevent unnecessary calls

        try {
            const updatedReservation = await updateReservationStatus(booking.id, "Checked Out");
            console.log("Auto check-out successful:", updatedReservation);

            // Update local state
            setBookings((prev) =>
                prev.map((b) => (b.id === booking.id ? { ...b, status: "Checked Out" } : b))
            );

            setSnackbarMessage("Reservation automatically checked out.");
            setSnackbarType("success");
        } catch (err) {
            console.error("Auto check-out failed:", err);
            setSnackbarMessage("Auto check-out failed. Please try manually.");
            setSnackbarType("error");
        }
    };

    return (
        <>
            <Header />
            <div className="mt-14 px-4 md:px-12 max-w-7xl mx-auto font-inter">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Your Reservations</h1>

                {loading ? (
                    <p className="text-gray-600 text-lg">Loading your bookings...</p>
                ) : bookings.length === 0 ? (
                    <p className="text-gray-500 text-lg">You have no reservations yet.</p>
                ) : (
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
                        {bookings.map((booking, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-h-[120px] flex items-center justify-between"
                            >
                                {/* Left Side (3/10 ratio) */}
                                <div className="w-1/3 flex justify-center items-center">
                                    <div className="bg-blue-400 text-white rounded-xl w-65 h-65 flex items-center justify-center text-5xl font-bold">
                                        P
                                    </div>
                                </div>

                                {/* Right Side (7/10 ratio) */}
                                <div className="w-2/3 pl-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-2xl font-semibold text-gray-800">
                                            {booking.parkingLotDetails?.name || "Unknown Lot"}
                                        </h2>
                                        <span
                                            className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium
                        ${booking.status === "Booked"
                                                    ? "bg-green-100 text-green-700"
                                                    : booking.status === "Cancelled"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-gray-200 text-gray-700"}`}
                                        >
                                            {booking.status === "Booked" ? <FiCheckCircle /> : <FiAlertCircle />}
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="flex items-start text-gray-600 text-sm mb-4">
                                        <FiMapPin className="mt-0.5 mr-2 text-lg text-blue-500" />
                                        {booking.parkingLotDetails?.locationDetails
                                            ? `${booking.parkingLotDetails.locationDetails.street}, ${booking.parkingLotDetails.locationDetails.city}, ${booking.parkingLotDetails.locationDetails.state}, ${booking.parkingLotDetails.locationDetails.country}`
                                            : "No location available"}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                        <div className="flex items-start gap-2">
                                            <FiCalendar className="mt-1 text-indigo-500" />
                                            <div>
                                                <p className="text-gray-500">Start</p>
                                                <p className="font-medium text-gray-800">{formatDateTime(booking.startTime)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <FiCalendar className="mt-1 text-indigo-500" />
                                            <div>
                                                <p className="text-gray-500">End</p>
                                                <p className="font-medium text-gray-800">{formatDateTime(booking.endTime)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center border-t pt-4 text-sm text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <FiDollarSign className="text-yellow-500" />
                                            <span className="font-bold">${booking.pricePaid}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FiClock className="text-gray-500" />
                                            <span className="text-xs">{formatDateTime(booking.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        {/* Buttons */}
                                        <div className="flex items-center justify-between gap-4">
                                            {/* Check-In Button */}
                                            {booking.status === "Booked" && (
                                                <button
                                                    onClick={() => handleCheckInClick(booking)}
                                                    className={`text-white bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 whitespace-nowrap ${isCheckInDisabled(booking) ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    disabled={isCheckInDisabled(booking)}
                                                >
                                                    Check-In
                                                </button>
                                            )}

                                            {/* Check-Out Button */}
                                            {booking.status === "Checked In" && !isReservationCompleted(booking) && (
                                                <button
                                                    onClick={() => openModal(booking, "Checked Out")}
                                                    className="text-white bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 whitespace-nowrap"
                                                >
                                                    Check-Out
                                                </button>
                                            )}

                                            {/* Cancel Button */}
                                            {shouldShowCancelButton(booking) && !isReservationCompleted(booking) && (
                                                <button
                                                    onClick={() => openModal(booking, "Cancelled")}
                                                    className="text-white bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 whitespace-nowrap"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                        {/* Timer Component */}
                                        {booking.status === "Checked In" && (
                                            <Timer
                                                endTime={booking.endTime}
                                                onExpire={() => handleAutoCheckOut(booking)}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Snackbar Notification */}
                {snackbarMessage && (
                    <Snackbar
                        message={snackbarMessage}
                        type={snackbarType}
                        onClose={() => setSnackbarMessage("")}
                    />
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 z-40 flex justify-center items-center">
                        <div className="bg-white rounded-xl p-8 max-w-sm mx-auto modal-animation">
                            <h2 className="text-2xl font-semibold text-center mb-4">
                                Are you sure you want to {actionType}?
                            </h2>
                            <div className="flex justify-between gap-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-500 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStatusChange}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                >
                                    Confirm {actionType}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {showToast && (
                    <div className="fixed bottom-6 right-6 z-50 toast-slide-in">
                        <div className="flex items-center gap-3 px-5 py-3 bg-yellow-500 text-white rounded-lg shadow-lg min-w-[250px]">
                            <FiAlertCircle className="text-xl" />
                            <span className="text-sm font-medium">No bookings found or error loading.</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ViewBookings;
