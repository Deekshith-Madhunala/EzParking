import { useEffect } from "react";

const Snackbar = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Hide the snackbar after 3 seconds

    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 transition-all duration-300
        animate-slide-in ${type === "error" ? "bg-red-500 text-white" : type === "success" ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}
    >
      <span className="font-semibold">{message}</span>
      <style>{`
        @keyframes slideIn {
          0% {
            transform: translateY(100%) translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0) translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Snackbar;
