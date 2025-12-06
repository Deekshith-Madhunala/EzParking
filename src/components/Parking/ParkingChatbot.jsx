import React, { useState, useEffect, useRef } from "react";
import { getParkingLLMResponse } from "../../api/restServiceApi";

const quickSuggestions = [
  "Available lots",
  "Pricing info",
  "Nearby parking",
  "Reserve a spot",
  "Cheapest parking",
  "Lots with 2+ free spots",
  "Current bookings",
];

const ParkingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (msgText) => {
    if (!msgText?.trim()) return;

    const newMessages = [...messages, { role: "user", content: msgText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await getParkingLLMResponse(msgText);
      let cleanResponse = response.replace(/```json/g, "").replace(/```/g, "").trim();

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanResponse);
      } catch {
        parsedResponse = cleanResponse;
      }

      if (Array.isArray(parsedResponse)) {
        parsedResponse = applyFiltersAndSorting(parsedResponse, msgText);
      }

      setMessages([...newMessages, { role: "bot", content: parsedResponse }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: "bot", content: "Error fetching response." }]);
    }

    setLoading(false);
  };

  const applyFiltersAndSorting = (lots, query) => {
    let filteredLots = [...lots];
    const lowerQuery = query.toLowerCase();

    const spotsMatch = lowerQuery.match(/(\d+)\+? free spots/);
    if (spotsMatch) {
      const minSpots = parseInt(spotsMatch[1], 10);
      filteredLots = filteredLots.filter((lot) => lot.availableSpots >= minSpots);
    }

    const cityMatch = lowerQuery.match(/in ([a-zA-Z\s]+)/);
    if (cityMatch) {
      const city = cityMatch[1].trim();
      filteredLots = filteredLots.filter(
        (lot) => lot.location?.city?.toLowerCase() === city.toLowerCase()
      );
    }

    if (lowerQuery.includes("cheapest")) {
      filteredLots.sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else if (lowerQuery.includes("expensive")) {
      filteredLots.sort((a, b) => b.pricePerHour - a.pricePerHour);
    }

    if (lowerQuery.includes("most available")) {
      filteredLots.sort((a, b) => b.availableSpots - a.availableSpots);
    }

    return filteredLots;
  };

  const renderParkingLotCard = (lot) => (
    <div
      key={lot.id}
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "8px",
        backgroundColor: lot.availableSpots > 0 ? "#d4edda" : "#f8d7da",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      <h4 style={{ fontWeight: "bold", marginBottom: "5px" }}>{lot.name}</h4>
      <p>
        <strong>Available Spots:</strong> {lot.availableSpots} / {lot.totalSpots}
      </p>
      <p>
        <strong>Price per Hour:</strong> ${lot.pricePerHour}
      </p>
      {lot.type && <p><strong>Type:</strong> {lot.type}</p>}
      {lot.openingTime && lot.closingTime && (
        <p>
          <strong>Hours:</strong> {lot.openingTime} - {lot.closingTime}
        </p>
      )}
      {lot.location && (
        <p>
          <strong>Location:</strong> {lot.location.street}, {lot.location.city}, {lot.location.state} ({lot.location.zipCode})
        </p>
      )}
      {lot.slots && (
        <div style={{ display: "flex", gap: "4px", marginTop: "5px" }}>
          {lot.slots.map((slot) => (
            <div
              key={slot.slotId}
              title={`Slot ${slot.slotId} - ${slot.isOccupied ? "Occupied" : "Free"}`}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: slot.isOccupied ? "#dc3545" : "#28a745",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderReservationCard = (res) => (
    <div
      key={res._id?._oid || Math.random()}
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "8px",
        backgroundColor: "#fff3cd",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      <h4 style={{ fontWeight: "bold", marginBottom: "5px", color: "#856404" }}>Reservation</h4>
      <p><strong>Status:</strong> {res.status}</p>
      <p><strong>Start:</strong> {res.startTime?.dateTime || res.startTime}</p>
      <p><strong>End:</strong> {res.endTime?.dateTime || res.endTime}</p>
      <p><strong>Price Paid:</strong> ${res.pricePaid?._numberDecimal || res.pricePaid}</p>
      <p><strong>Parking Lot ID:</strong> {res.parkingLot?._oid || res.parkingLot}</p>
    </div>
  );

  const renderContent = (content) => {
    if (Array.isArray(content)) {
      return content.map((item, idx) => {
        // Determine if it's a parking lot or reservation
        if (item.availableSpots !== undefined) {
          return renderParkingLotCard(item);
        } else if (item.status && item.startTime && item.endTime) {
          return renderReservationCard(item);
        } else {
          return <div key={idx}>{renderContent(item)}</div>;
        }
      });
    } else if (typeof content === "object" && content !== null) {
      if (content.availableSpots !== undefined) return renderParkingLotCard(content);
      if (content.status && content.startTime && content.endTime) return renderReservationCard(content);
      return Object.entries(content).map(([k, v], idx) => (
        <div key={idx} style={{ marginBottom: "4px" }}>
          <strong>{k}:</strong> {typeof v === "object" ? renderContent(v) : v?.toString()}
        </div>
      ));
    } else {
      return <div>{content?.toString()}</div>;
    }
  };

  return (
    <>
      <button
        onClick={toggleChat}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: "24px",
          zIndex: 999,
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        💬
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "560px",
            height: "500px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              padding: "10px",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Parking Assistant
            <button
              onClick={toggleChat}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>

          <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: msg.role === "user" ? "right" : "left",
                  marginBottom: "10px",
                }}
              >
                {msg.role === "user" ? (
                  <div
                    style={{
                      display: "inline-block",
                      padding: "8px 12px",
                      borderRadius: "15px",
                      backgroundColor: "#007bff",
                      color: "#fff",
                    }}
                  >
                    {msg.content}
                  </div>
                ) : (
                  renderContent(msg.content)
                )}
              </div>
            ))}
            {loading && <p>Parking Assistant is typing...</p>}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "5px",
              padding: "5px 10px",
              borderTop: "1px solid #ccc",
            }}
          >
            {quickSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(suggestion)}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#f1f1f1",
                  border: "none",
                  borderRadius: "15px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", borderTop: "1px solid #ccc" }}>
            <input
              type="text"
              placeholder="Ask about parking..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1, padding: "10px", border: "none" }}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            />
            <button
              onClick={() => sendMessage(input)}
              style={{
                padding: "10px 15px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ParkingChatbot;
