import React, { useState, useEffect, useRef } from "react";
import { getParkingLLMResponse } from "../../api/restServiceApi";


const quickSuggestions = [
    "Available lots",
    "Pricing info",
    "Nearby parking",
    "Reserve a spot",
];

const ParkingChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    // Scroll to bottom whenever messages change
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

            // Remove code block markers if present
            let cleanResponse = response
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            // Parse JSON if possible
            let parsedResponse;
            try {
                parsedResponse = JSON.parse(cleanResponse);
            } catch {
                parsedResponse = cleanResponse; // fallback to string
            }

            setMessages([...newMessages, { role: "bot", content: parsedResponse }]);
        } catch (err) {
            console.error(err);
            setMessages([...newMessages, { role: "bot", content: "Error fetching response." }]);
        }

        setLoading(false);
    };

    return (
        <>
            {/* Floating Button */}
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

            {/* Chat Window */}
            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "90px",
                        right: "20px",
                        width: "350px",
                        height: "450px",
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        backgroundColor: "#fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        zIndex: 999,
                        animation: "slideIn 0.3s ease-out",
                    }}
                >
                    {/* Header */}
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

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            padding: "10px",
                            overflowY: "auto",
                        }}
                    >
                        {messages.map((msg, idx) => {
                            let content = msg.content;

                            if (content && typeof content === "object") {
                                if (Array.isArray(content)) {
                                    // already array → ok
                                } else {
                                    // check for nested array inside object keys
                                    const arrayValues = Object.values(content).find((v) => Array.isArray(v));
                                    if (arrayValues) {
                                        content = arrayValues; // nested array
                                    } else {
                                        // object with only string values → display joined text
                                        content = Object.values(content).join(" "); // "You currently have no active reservations."
                                    }
                                }
                            }

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        textAlign: msg.role === "user" ? "right" : "left",
                                        marginBottom: "10px",
                                    }}
                                >
                                    {Array.isArray(content) ? (
                                        content.map((lot, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    border: "1px solid #ccc",
                                                    borderRadius: "8px",
                                                    padding: "8px",
                                                    marginBottom: "5px",
                                                    backgroundColor:
                                                        lot.availableSpots > 0 ? "#d4edda" : "#f8d7da",
                                                }}
                                            >
                                                {lot.name && <strong>{lot.name}</strong>}
                                                {lot.availableSpots !== undefined && <p>Available Spots: {lot.availableSpots}</p>}
                                                {lot.pricePerHour !== undefined && <p>Price per Hour: ${lot.pricePerHour}</p>}
                                                {lot.openingTime && lot.closingTime && <p>Hours: {lot.openingTime} - {lot.closingTime}</p>}
                                                {lot.type && <p>Type: {lot.type}</p>}
                                                {lot.suggestedAction && <p>Action: {lot.suggestedAction}</p>}
                                            </div>
                                        ))
                                    ) : (
                                        <div
                                            style={{
                                                display: "inline-block",
                                                padding: "8px 12px",
                                                borderRadius: "15px",
                                                backgroundColor: msg.role === "user" ? "#007bff" : "#f1f1f1",
                                                color: msg.role === "user" ? "#fff" : "#000",
                                            }}
                                        >
                                            {content}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {loading && <p>Parking Assistant is typing...</p>}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick suggestions */}
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

                    {/* Input */}
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
