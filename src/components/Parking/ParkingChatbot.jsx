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

      setMessages([...newMessages, { role: "bot", content: parsedResponse }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: "bot", content: "Error fetching response." }]);
    }

    setLoading(false);
  };

  const renderParkingLotCard = (lot) => (
    <div
      key={lot.id}
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "12px",
        marginBottom: "10px",
        backgroundColor: lot.availableSpots > 0 ? "#e6f4ea" : "#fdecea",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        transition: "transform 0.2s",
      }}
    >
      <h4 style={{ fontWeight: "600", marginBottom: "6px" }}>{lot.name}</h4>
      <p><strong>Available:</strong> {lot.availableSpots} / {lot.totalSpots}</p>
      <p><strong>Price:</strong> ${lot.pricePerHour}/hr</p>
      {lot.type && <p><strong>Type:</strong> {lot.type}</p>}
      {lot.location && (
        <p>
          <strong>Location:</strong> {lot.location.street}, {lot.location.city}, {lot.location.state} ({lot.location.zipCode})
        </p>
      )}
    </div>
  );

  const renderReservationCard = (res) => (
    <div
      key={res._id?._oid || Math.random()}
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "12px",
        marginBottom: "10px",
        backgroundColor: "#fff8e1",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      }}
    >
      <h4 style={{ fontWeight: "600", marginBottom: "6px", color: "#856404" }}>Reservation</h4>
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
        if (item.availableSpots !== undefined) return renderParkingLotCard(item);
        if (item.status && item.startTime && item.endTime) return renderReservationCard(item);
        return <div key={idx}>{renderContent(item)}</div>;
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
          backgroundColor: "#0a84ff",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: "28px",
          zIndex: 999,
          boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
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
            height: "600px",
            borderRadius: "16px",
            backgroundColor: "#f7f7f8",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 999,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#0a84ff",
              color: "#fff",
              padding: "12px 16px",
              fontWeight: "600",
              fontSize: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Parking Assistant
            <button
              onClick={toggleChat}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: "12px", overflowY: "auto" }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: "10px",
                }}
              >
                {msg.role === "user" ? (
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "10px 16px",
                      borderRadius: "20px",
                      backgroundColor: "#0a84ff",
                      color: "#fff",
                      fontSize: "14px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    {msg.content}
                  </div>
                ) : (
                  <div style={{ maxWidth: "100%", width: "100%" }}>{renderContent(msg.content)}</div>
                )}
              </div>
            ))}
            {loading && <p style={{ color: "#555" }}>Parking Assistant is typing...</p>}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              padding: "8px 12px",
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#fafafa",
            }}
          >
            {quickSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(suggestion)}
                style={{
                  padding: "6px 14px",
                  backgroundColor: "#e0e0e0",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "13px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d0d0d0")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: "flex", borderTop: "1px solid #e0e0e0" }}>
            <input
              type="text"
              placeholder="Ask about parking..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "none",
                fontSize: "14px",
                backgroundColor: "#f7f7f8",
                outline: "none",
              }}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            />
            <button
              onClick={() => sendMessage(input)}
              style={{
                padding: "12px 16px",
                backgroundColor: "#0a84ff",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
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
