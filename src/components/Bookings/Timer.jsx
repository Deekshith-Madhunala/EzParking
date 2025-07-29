import { useEffect, useState, useRef } from "react";

const Timer = ({ endTime, onExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const prevTimeRef = useRef({ hours: null, minutes: null, secs: null });

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return { hours, minutes, secs };
  };

  const calculateColor = (ms) => {
    const total = new Date(endTime).getTime() - new Date().getTime();
    const percent = Math.max(0, Math.min(1, ms / total));
    const r = Math.floor(255 - percent * 50);
    const g = Math.floor(180 + percent * 60);
    const b = 230;
    return `rgb(${r}, ${g}, ${b})`;
  };

useEffect(() => {
  setFadeIn(true);
  const endTimeMillis = new Date(endTime).getTime();
  const now = Date.now();

  if (isNaN(endTimeMillis)) {
    console.error("Invalid endTime:", endTime);
    return;
  }

  if (now >= endTimeMillis) {
    setTimeRemaining(0);
    setIsTimerActive(false);
    if (typeof onExpire === "function") {
      onExpire();
    }
    return;
  }

  setIsTimerActive(true);

  const interval = setInterval(() => {
    const now = Date.now();
    const remaining = endTimeMillis - now;

    if (remaining <= 0) {
      clearInterval(interval);
      setTimeRemaining(0);
      setIsTimerActive(false);
      if (typeof onExpire === "function") {
        onExpire();
      }
    } else {
      setTimeRemaining(remaining);
    }
  }, 1000);

  return () => clearInterval(interval);
}, [endTime, onExpire]);


  const { hours, minutes, secs } = formatTime(timeRemaining);
  const prev = prevTimeRef.current;

  const digitParts = [
    { label: "Hours", value: hours, prev: prev.hours },
    { label: "Minutes", value: minutes, prev: prev.minutes },
    { label: "Seconds", value: secs, prev: prev.secs },
  ];

  useEffect(() => {
    prevTimeRef.current = { hours, minutes, secs };
  }, [hours, minutes, secs]);

  return (
    // Full width container with flex to align pill right
    <div className="w-full flex justify-end px-4">
      <div
        className={`transition-opacity duration-1000 flex flex-col justify-center ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundColor: calculateColor(timeRemaining),
          borderRadius: "999px",
          padding: "1.2rem 2rem",
          boxShadow: "0 12px 25px rgba(0, 0, 0, 0.1)",
          maxWidth: "250px",
          height: "70px",
          textAlign: "center",
        }}
      >
        {isTimerActive ? (
          <>
            <div className="text-xs font-semibold text-gray-700 mb-0 leading-none" style={{ lineHeight: 1 }}>
              Time Remaining
            </div>
            <div className="flex justify-center items-center space-x-3 flex-grow">
              {digitParts.map((part, idx) => (
                <div key={part.label} className="flex items-end">
                  <div
                    className={`text-4xl font-bold text-gray-800 leading-none ${
                      part.value !== part.prev ? "animate-scrollFade" : ""
                    }`}
                    style={{ minWidth: "32px", textAlign: "center", lineHeight: 1 }}
                  >
                    {String(part.value).padStart(2, "0")}
                  </div>
                  {idx < digitParts.length - 1 && (
                    <div className="text-3xl font-bold text-gray-600 px-1 leading-none">:</div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-lg font-medium text-gray-600">🎉 Time's up!</div>
        )}

        {/* Inline animation */}
        <style>{`
          @keyframes fadeInScroll {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            50% {
              opacity: 0.6;
              transform: translateY(-4px);
            }
            100% {
              opacity: 1;
              transform: translateY(0px);
            }
          }
          .animate-scrollFade {
            animation: fadeInScroll 0.4s ease-in-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Timer;
