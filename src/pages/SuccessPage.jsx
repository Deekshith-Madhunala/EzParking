import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  console.log('SuccessPage received state:', state);

  const { eventData, attendees, total } = state || {};

  // Helper to format date part
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return 'TBD';
    const dateObj = new Date(dateTimeString);
    return dateObj.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper to format time part
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return 'TBD';
    const dateObj = new Date(dateTimeString);
    return dateObj.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!state) {
    // If no state is passed, redirect or show a message
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-center text-lg text-gray-600">
          No booking information found. Please{' '}
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 hover:underline"
          >
            go back to homepage
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-xl shadow-xl flex flex-col xl:flex-row max-w-5xl w-full overflow-hidden animate-fade-in">
        {/* Left panel: QR code + info */}
        <section
          aria-label="QR Code and Check-in Information"
          className="flex flex-col items-center justify-between w-full xl:w-1/3 p-8 border-r border-gray-200 bg-indigo-50"
        >
          <img
            src="https://store-images.s-microsoft.com/image/apps.33967.13510798887182917.246b0a3d-c3cc-46fc-9cea-021069d15c09.392bf5f5-ade4-4b36-aa63-bb15d5c3817a"
            alt="QR Code to check in"
            draggable={false}
            className="w-28 mb-4 select-none"
          />
          <p className="text-center text-sm italic text-indigo-700 mb-6">
            Scan here to check in!
          </p>
          <p className="text-center text-xs text-indigo-500 mb-8">
            Valid until <br />
            <span className="font-semibold text-indigo-800">
              {formatDate(eventData?.endDateTime)} at {formatTime(eventData?.endDateTime)}
            </span>
          </p>
          <img
            src="https://ad-venture.org.uk/wp-content/uploads/2017/05/logo-placeholder.png"
            alt="Powered By Logo"
            draggable={false}
            className="w-32 opacity-60 select-none"
          />
        </section>

        {/* Right panel: Event details + attendees */}
        <section
          className="relative w-full xl:w-2/3 flex flex-col"
          aria-label="Booking Details and Attendees"
        >
          <img
            src={eventData?.coverPhotoUrl || 'https://via.placeholder.com/600x300'}
            alt={eventData?.eventName || 'Event Image'}
            draggable={false}
            className="object-cover h-52 w-full select-none"
          />

          <div className="absolute top-4 left-4 bg-indigo-100 text-indigo-800 font-semibold text-sm px-3 py-1 rounded-md shadow select-none">
            Organizer: Eventify
          </div>

          <div className="absolute top-4 right-4 bg-indigo-600 text-white font-semibold text-sm px-4 py-1 rounded-full shadow select-none">
            Tickets: {attendees?.length || 1}
          </div>

          <div className="bg-white flex flex-col gap-6 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="uppercase text-xs tracking-wide font-semibold text-indigo-500 mb-1">
                  Event Title
                </p>
                <h2 className="text-2xl font-bold text-indigo-900">
                  {eventData?.eventName || 'Untitled Event'}
                </h2>

                <p className="uppercase text-xs tracking-wide font-semibold text-indigo-500 mt-6 mb-1">
                  Date
                </p>
                <p className="text-lg font-semibold text-indigo-700">
                  {formatDate(eventData?.startDateTime)} at {formatTime(eventData?.startDateTime)}
                </p>

                <p className="uppercase text-xs tracking-wide font-semibold text-indigo-500 mt-6 mb-1">
                  Location
                </p>
                <p className="text-md text-indigo-700 max-w-md">
                  {eventData?.venue?.address || 'TBD'}
                </p>
              </div>

              <div>
                <p className="uppercase text-xs tracking-wide font-semibold text-indigo-500 mb-1">
                  Total Paid
                </p>
                <p className="text-3xl font-extrabold text-indigo-800">
                  ${total?.toFixed(2) || '0.00'}
                </p>

                <p className="uppercase text-xs tracking-wide font-semibold text-indigo-500 mt-10 mb-4">
                  Attendees
                </p>

                <ul className="max-h-48 overflow-y-auto space-y-3">
                  {attendees?.length ? (
                    attendees.map((person, i) => (
                      <li
                        key={i}
                        className="p-3 rounded-md border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition cursor-default select-text"
                      >
                        <p className="font-semibold text-indigo-900">{person.name || 'Unnamed'}</p>
                        <p className="text-indigo-700 text-sm">{person.email || 'No email provided'}</p>
                      </li>
                    ))
                  ) : (
                    <li className="text-indigo-600 italic">No attendees listed</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from {opacity: 0; transform: translateY(15px);}
          to {opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default SuccessPage;
