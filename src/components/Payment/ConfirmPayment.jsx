import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Header from '../User/Header';
import { FiCreditCard, FiClock, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { FaCarSide } from 'react-icons/fa';
import { useEffect } from 'react';
import { createReservation } from '../../api/restServiceApi';

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hour, minute] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const calculateDuration = (startTime, endTime) => {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const start = new Date();
  const end = new Date();

  start.setHours(startH, startM, 0, 0);
  end.setHours(endH, endM, 0, 0);

  if (end <= start) end.setDate(end.getDate() + 1);

  const diff = end - start;
  const mins = Math.floor(diff / (1000 * 60));
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;

  return `${hrs > 0 ? `${hrs} hr${hrs > 1 ? 's' : ''}` : ''} ${remMins > 0 ? `${remMins} min` : ''}`.trim();
};


const ConfirmPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { date, startTime, endTime, lotDetails, vehicle } = location.state || {};

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  });

  const [showConfirming, setShowConfirming] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirming(true);

    try {
      const reservation = await createReservation({ date, startTime, endTime, lotDetails });

      if (!reservation) {
        throw new Error("Reservation creation failed");
      }

      console.log("Reservation successful:", reservation);

      setTimeout(() => {
        setShowConfirming(false);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          navigate('/');
        }, 700);
      }, 1500);
    } catch (error) {
      setShowConfirming(false);
      alert("Something went wrong while processing your reservation.");
      console.error("Error in handleSubmit:", error);
    }
  };


  const duration = calculateDuration(startTime, endTime);
  const totalPrice = (lotDetails?.pricePerHour || 0) * parseFloat(duration.split(' ')[0] || 1);

  return (
    <>
      <Header />
      <div className="w-full min-h-screen px-6 py-12 bg-white flex flex-col md:flex-row gap-20 max-w-7xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="w-full md:w-7/12 bg-white rounded-2xl shadow-md p-10 space-y-8 border border-gray-100"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 flex items-center gap-4">
            <FiCreditCard className="text-blue-600" size={32} />
            Payment Details
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              name="nameOnCard"
              placeholder="Name on Card"
              value={paymentInfo.nameOnCard}
              onChange={handleChange}
              required
              className="w-full py-4 px-5 text-base border rounded-lg shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={paymentInfo.cardNumber}
              onChange={handleChange}
              required
              maxLength={16}
              className="w-full py-4 px-5 text-base border rounded-lg shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <div className="flex gap-4">
              <input
                type="text"
                name="expiryDate"
                placeholder="MM/YY"
                value={paymentInfo.expiryDate}
                onChange={handleChange}
                required
                className="w-1/2 py-4 px-5 text-base border rounded-lg shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="password"
                name="cvv"
                placeholder="CVV"
                value={paymentInfo.cvv}
                onChange={handleChange}
                required
                maxLength={4}
                className="w-1/2 py-4 px-5 text-base border rounded-lg shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition duration-200"
          >
            Confirm & Pay
          </button>
        </form>

        <div className="w-full md:w-5/12 bg-white rounded-2xl shadow-md p-10 border border-gray-100">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">🧾 Summary</h2>

          <div className="space-y-6 text-gray-700 text-base font-medium">
            <div className="flex items-center gap-3">
              <FiClock className="text-gray-500" />
              <span>{formatTime(startTime)} → {formatTime(endTime)}</span>
            </div>

            <div className="flex items-center gap-3">
              <FiClock className="text-gray-500" />
              <span>Duration: {duration}</span>
            </div>

            <div className="flex items-center gap-3">
              <FiDollarSign className="text-green-600" />
              <span>
                ${parseFloat(lotDetails?.pricePerHour || 0).toFixed(2)} / hr
              </span>
            </div>

            <div className="flex items-center gap-3">
              <FiDollarSign className="text-green-600" />
              <span>Total: ${totalPrice.toFixed(2)}</span>
            </div>

            <hr className="my-4" />

            <div className="text-gray-800 font-semibold text-lg mb-2">
              Vehicle Info
            </div>
            <div className="flex items-center gap-3">
              <FaCarSide className="text-blue-600" />
              <span>{vehicle?.make} {vehicle?.model} ({vehicle?.vehicleType})</span>
            </div>
            <div className="text-sm text-gray-500 ml-8">
              Color: {vehicle?.color} | Plate: {vehicle?.licensePlate}
            </div>
          </div>
        </div>

        {showConfirming && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
            <div className="bg-white px-10 py-8 rounded-xl shadow-2xl flex flex-col items-center space-y-4 animate-fade-in-down">
              <FiCheckCircle className="text-blue-600 text-6xl animate-bounce" />
              <p className="text-lg font-semibold text-gray-700">
                Confirming your booking...
              </p>
            </div>
          </div>
        )}

        {showToast && (
          <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in">
            🎉 Booking Confirmed! Your parking spot is reserved.
          </div>
        )}
      </div>

      <style>{`
        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out;
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        .animate-slide-in {
          animation: slideIn 0.4s ease-out;
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
};

export default ConfirmPayment;
