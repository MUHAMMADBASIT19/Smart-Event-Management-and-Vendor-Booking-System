import React, { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Message.css";
import { Store } from "../Store";

const MessageUI = (props) => {
  const { state } = useContext(Store);
  // Sequelize returns integer `id`, not MongoDB `_id`
  const userId = state.userInfo?.id || state.userInfo?._id;
  const userName = state.userInfo?.name || "You";

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for messages every 3 seconds (only when both IDs are known)
  useEffect(() => {
    if (!userId || !props.vendorId) return;

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `/api/messages/${userId}/${props.vendorId}`
        );
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [userId, props.vendorId]);

  const sendMessage = async () => {
    if (!messageInput.trim() || sending) return;
    setSending(true);

    // Optimistic update
    const optimistic = {
      sender: userId,
      message: messageInput.trim(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    const text = messageInput.trim();
    setMessageInput("");

    try {
      await axios.post("/api/messages/send", {
        message: text,
        sender: userId,
        receiver: props.vendorId,
        time: Date.now(),
        name: userName,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m !== optimistic));
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Vendor name initial for avatar (first letter)
  const vendorInitial = "V";

  return (
    <div className="chat-overlay" onClick={(e) => e.target === e.currentTarget && props.close()}>
      <div className="chat-window">

        {/* ── Header ── */}
        <div className="chat-header">
          <div className="chat-header-avatar">{vendorInitial}</div>
          <div className="chat-header-info">
            <p className="chat-header-name">Venue Vendor</p>
            <p className="chat-header-status">● Online</p>
          </div>
          <button
            className="chat-close-btn"
            onClick={props.close}
            title="Close"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "50%",
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              fontSize: "1.1rem",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
          >
            ✕
          </button>
        </div>

        {/* ── Messages ── */}
        <div className="chat-messages">
          {!props.vendorId ? (
            <div className="chat-empty">
              <span className="chat-empty-icon">⏳</span>
              <p>Loading vendor info…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <span className="chat-empty-icon">💬</span>
              <p>No messages yet</p>
              <p style={{ fontSize: "0.8rem" }}>Send a message to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const senderId =
                msg.sender?.id ||
                msg.sender?.["_id"] ||
                msg.sender;
              const isMe = String(senderId) === String(userId);

              return (
                <div key={index} className={`msg-row ${isMe ? "mine" : "theirs"}`}>
                  <span className="msg-label">{isMe ? "You" : "Vendor"}</span>
                  <div className={`msg-bubble ${isMe ? "mine" : "theirs"}`}>
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input area ── */}
        <div className="chat-input-area">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            rows={1}
            placeholder="Type a message…"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!props.vendorId}
          />
          <button
            className="chat-send-btn"
            onClick={sendMessage}
            disabled={!messageInput.trim() || sending || !props.vendorId}
            title="Send (Enter)"
          >
            {/* Paper plane SVG icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default MessageUI;
