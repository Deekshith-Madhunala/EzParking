import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Header from '../User/Header';

const ConfirmPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lotDetails, vehicle } = location.state || {};

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirming(true);

    setTimeout(() => {
      setShowConfirming(false);
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        navigate('/');
      },700);
    }, 2500); // Simulate confirmation
  };

  return (
    <>
      <Header />
      <div className="bg-white w-full min-h-screen px-6 py-12 flex flex-col md:flex-row gap-20 items-start relative">

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="w-full md:w-7/12 space-y-6">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">💳 Payment Details</h2>

          <input
            type="text"
            name="nameOnCard"
            placeholder="Name on Card"
            value={paymentInfo.nameOnCard}
            onChange={handleChange}
            required
            className="w-full py-4 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="cardNumber"
            placeholder="Card Number"
            value={paymentInfo.cardNumber}
            onChange={handleChange}
            required
            maxLength={16}
            className="w-full py-4 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-4">
            <input
              type="text"
              name="expiryDate"
              placeholder="MM/YY"
              value={paymentInfo.expiryDate}
              onChange={handleChange}
              required
              className="w-1/2 py-4 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              name="cvv"
              placeholder="CVV"
              value={paymentInfo.cvv}
              onChange={handleChange}
              required
              maxLength={4}
              className="w-1/2 py-4 px-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition duration-200"
          >
            Confirm & Pay
          </button>
        </form>

        {/* Summary Section */}
        <div className="w-full md:w-5/12 text-gray-800">
          <h2 className="text-4xl font-bold mb-4">🧾 Summary</h2>

          <h3 className="text-xl font-semibold text-gray-700 mb-1">Parking Info</h3>
          <p className="text-md text-gray-600 mb-1">📍 <strong>{lotDetails?.name}</strong></p>
          <p className="text-md text-gray-600 mb-1">🕒 {lotDetails?.startTime} → {lotDetails?.endTime}</p>
          <p className="text-md text-gray-600 mb-4">💵 ${lotDetails?.pricePerHour.toFixed(2)} x {lotDetails?.totalHours} hrs</p>

          <h3 className="text-xl font-semibold text-gray-700 mb-1">Vehicle Info</h3>
          <p className="text-md text-gray-600 mb-1">🚘 {vehicle?.make} {vehicle?.model} ({vehicle?.vehicleType})</p>
          <p className="text-md text-gray-600 mb-1">🎨 Color: {vehicle?.color}</p>
          <p className="text-md text-gray-600 mb-1">🔢 Plate: {vehicle?.licensePlate}</p>
        </div>

        {/* Confirming Overlay with Ticket */}
        {showConfirming && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur bg-opacity-50">
            <div className="bg-white px-10 py-8 rounded-lg shadow-xl flex flex-col items-center space-y-4 animate-fade-in-down">
              <div className="text-6xl text-blue-600 animate-bounce">🎟️</div>
              <p className="text-lg font-semibold text-gray-700">Confirming your booking...</p>
            </div>
          </div>
        )}

        {/* Toast Message */}
        {showToast && (
          <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in">
            🎉 Booking Confirmed! Your parking spot is reserved.
          </div>
        )}
      </div>

      {/* Styles */}
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
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
};

export default ConfirmPayment;
