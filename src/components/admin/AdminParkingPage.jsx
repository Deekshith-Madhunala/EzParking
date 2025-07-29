import React, { useEffect, useState } from "react";
import Snackbar from "../../general/Snackbar";
import { fetchParkingLots, getAllReservations } from "../../api/restServiceApi";
import Header from "../User/Header";
import { useNavigate } from "react-router-dom";


export default function AdminParkingPage() {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLot, setSelectedLot] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [snackbar, setSnackbar] = useState({ message: "", type: "", visible: false });

  useEffect(() => {
    async function loadData() {
      try {
        const [lots, resv] = await Promise.all([fetchParkingLots(), getAllReservations()]);
        setParkingLots(lots);
        setReservations(resv);
      } catch (error) {
        setSnackbar({ message: "Failed to load data.", type: "error", visible: true });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

    const navigate = useNavigate();

  const showErrorSnackbar = (msg) => {
    setSnackbar({ message: msg, type: "error", visible: true });
  };
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, visible: false });
  };

  // Toggle slot occupancy logic
  const toggleSlot = (lotId, slotId) => {
    setParkingLots((prevLots) =>
      prevLots.map((lot) => {
        if (lot.id !== lotId) return lot;
        const newSlots = lot.slots.map((slot) =>
          slot.slotId === slotId ? { ...slot, isOccupied: !slot.isOccupied } : slot
        );
        const newAvailable = newSlots.filter((s) => !s.isOccupied).length;
        return { ...lot, slots: newSlots, availableSpots: newAvailable };
      })
    );
  };

  // Calculate total revenue from reservations
  const totalRevenue = reservations.reduce((sum, r) => {
    const price = parseFloat(r.pricePaid) || 0;
    return sum + price;
  }, 0);


  if (loading)
    return (
      <div className="p-6 text-center text-gray-600 font-semibold text-lg">
        Loading parking lots and reservations...
      </div>
    );

  return (
    <>
      {snackbar.visible && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
        />
      )}

      <div className="min-h-screen bg-gray-50 ">
        <Header />
        <header className="m-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Admin Parking Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage parking lots and view reservations summary.
            </p>
          </div>

          <button
            onClick={() => navigate("/create-parking")}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition duration-200 font-semibold"
          >
            Create Parking
          </button>
        </header>


        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <h2 className="text-gray-500 font-semibold mb-2">Total Lots</h2>
            <p className="text-3xl font-extrabold text-blue-600">{parkingLots.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <h2 className="text-gray-500 font-semibold mb-2">Total Reservations</h2>
            <p className="text-3xl font-extrabold text-purple-600">{reservations.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <h2 className="text-gray-500 font-semibold mb-2">Total Revenue</h2>
            <p className="text-3xl font-extrabold text-green-600">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>
        </section>

        {/* Parking Lots Table */}
        <section className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "Name",
                  "Type",
                  "Total Spots",
                  "Available Spots",
                  "Price / Hour",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {parkingLots.map((lot) => (
                <tr
                  key={lot.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{lot.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{lot.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{lot.totalSpots}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                    {lot.availableSpots}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">${lot.pricePerHour.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedLot(lot)}
                      className="text-blue-600 hover:underline font-semibold"
                      type="button"
                      aria-label={`View slots for ${lot.name}`}
                    >
                      View Slots
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Slot Details Modal */}
        {selectedLot && (
          <div
            className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[80vh] overflow-auto p-6 relative">
              <header className="flex justify-between items-center mb-6">
                <h3
                  id="modal-title"
                  className="text-2xl font-semibold text-gray-800"
                >
                  Slots for {selectedLot.name}
                </h3>
                <button
                  onClick={() => setSelectedLot(null)}
                  className="text-gray-500 hover:text-gray-900 text-3xl font-bold leading-none"
                  aria-label="Close slot details modal"
                >
                  &times;
                </button>
              </header>

              <div className="grid grid-cols-10 gap-3">
                {selectedLot.slots.map((slot) => (
                  <button
                    key={slot.slotId}
                    onClick={() => toggleSlot(selectedLot.id, slot.slotId)}
                    className={`p-3 rounded-lg border text-sm font-medium select-none
                      ${slot.isOccupied
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-green-400 text-black border-green-400"
                      }
                      hover:brightness-110 transition`}
                    title={`Slot ${slot.slotId} — ${slot.isOccupied ? "Occupied" : "Available"
                      }`}
                    type="button"
                  >
                    {slot.slotId}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
