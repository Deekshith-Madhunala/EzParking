import React, { useEffect, useState } from "react";
import Snackbar from "../../general/Snackbar";
import {
  fetchParkingLots,
  getAllReservations,
  deleteParkingLot,
  updateParkingLot,
} from "../../api/restServiceApi";
import Header from "../User/Header";
import { useNavigate } from "react-router-dom";

export default function AdminParkingPage() {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLot, setSelectedLot] = useState(null);
  const [editLot, setEditLot] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [snackbar, setSnackbar] = useState({ message: "", type: "", visible: false });

  const navigate = useNavigate();

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

  const showErrorSnackbar = (msg) => {
    setSnackbar({ message: msg, type: "error", visible: true });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, visible: false });
  };

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

  const handleDeleteLot = async (lotId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this parking lot?");
    if (!confirmDelete) return;

    const success = await deleteParkingLot(lotId);
    if (success) {
      setParkingLots((prev) => prev.filter((lot) => lot.id !== lotId));
      setSnackbar({ message: "Parking lot deleted successfully.", type: "success", visible: true });
    } else {
      showErrorSnackbar("Failed to delete parking lot.");
    }
  };

  const handleEditLot = (lot) => {
    setEditLot({ ...lot });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditLot((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    const requiredFields = ["name", "type", "pricePerHour", "openingTime", "closingTime"];
    for (const field of requiredFields) {
      if (!editLot[field]) {
        showErrorSnackbar(`Please fill in ${field}`);
        return;
      }
    }

    const payload = {
      ...editLot,
      location: editLot.locationId, // fix for backend field
    };
    delete payload.locationId; // clean up helper field

    const updatedLot = await updateParkingLot(payload);
    if (updatedLot) {
      // Refetch the parking lots list from backend to get fresh data
      try {
        const freshParkingLots = await fetchParkingLots();
        setParkingLots(freshParkingLots);
      } catch (err) {
        showErrorSnackbar("Failed to refresh parking lots after update.");
      }

      setSnackbar({ message: "Parking lot updated successfully.", type: "success", visible: true });
      setEditLot(null);
    } else {
      showErrorSnackbar("Failed to update parking lot.");
    }
  };


  const totalRevenue = reservations.reduce((sum, r) => {
    const price = parseFloat(r.pricePaid) || 0;
    return sum + price;
  }, 0);

  if (loading)
    return <div className="p-6 text-center text-gray-600 font-semibold text-lg">Loading parking lots and reservations...</div>;

  return (
    <>
      {snackbar.visible && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
        />
      )}

      <div className="min-h-screen bg-gray-50">
        <Header />

        <header className="m-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Admin Parking Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage parking lots and view reservations summary.</p>
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
            <p className="text-3xl font-extrabold text-green-600">${totalRevenue.toFixed(2)}</p>
          </div>
        </section>

        {/* Parking Lots Table */}
        <section className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {["Name", "Type", "Total Spots", "Available Spots", "Price / Hour", "Actions"].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {parkingLots.map((lot) => (
                <tr key={lot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{lot.name}</td>
                  <td className="px-6 py-4">{lot.type}</td>
                  <td className="px-6 py-4">{lot.totalSpots}</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">{lot.availableSpots}</td>
                  <td className="px-6 py-4">${lot.pricePerHour}</td>
                  <td className="px-6 py-4 flex gap-4">
                    <button onClick={() => setSelectedLot(lot)} className="text-blue-600 hover:underline font-semibold">View Slots</button>
                    <button onClick={() => handleEditLot(lot)} className="text-yellow-600 hover:underline font-semibold">Edit</button>
                    <button onClick={() => handleDeleteLot(lot.id)} className="text-red-600 hover:underline font-semibold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Edit Modal */}
        {editLot && (
          <div className="fixed inset-0 backfrop-blur bg-opacity-40 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative">
              <h2 className="text-2xl font-bold mb-4">Edit Parking Lot</h2>

              {["name", "type", "pricePerHour", "openingTime", "closingTime", "locationId"].map((field) => (
                <div key={field} className="mb-4">
                  <label className="block mb-1 capitalize">{field.replace(/([A-Z])/g, " $1")}:</label>
                  <input
                    type={field.includes("Time") ? "time" : "text"}
                    name={field}
                    value={editLot[field] || ""}
                    onChange={handleEditChange}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              ))}

              <div className="flex justify-end gap-4 mt-6">
                <button onClick={() => setEditLot(null)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                <button onClick={handleEditSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Slot Modal */}
        {selectedLot && (
          <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[80vh] overflow-auto p-6 relative">
              <header className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-800">Slots for {selectedLot.name}</h3>
                <button onClick={() => setSelectedLot(null)} className="text-gray-500 hover:text-gray-900 text-3xl font-bold">&times;</button>
              </header>
              <div className="grid grid-cols-10 gap-3">
                {selectedLot.slots.map((slot) => (
                  <button
                    key={slot.slotId}
                    onClick={() => toggleSlot(selectedLot.id, slot.slotId)}
                    className={`p-3 rounded-lg border text-sm font-medium select-none ${slot.isOccupied
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-green-400 text-black border-green-400"} hover:brightness-110 transition`}
                    title={`Slot ${slot.slotId} — ${slot.isOccupied ? "Occupied" : "Available"}`}
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
