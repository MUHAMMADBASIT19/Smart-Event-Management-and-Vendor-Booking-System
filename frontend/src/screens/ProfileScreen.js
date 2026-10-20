import React, { useContext, useReducer, useState } from "react";
import { Helmet } from "react-helmet-async";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Store } from "../Store";
import { toast } from "react-toastify";
import { getError } from "../utils";
import axios from "axios";

const reducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};

export default function ProfileScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const [name, setName] = useState(userInfo.name);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const submitHandler = async (e) => {
    e.preventDefault();

    // Password confirmation guard
    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const { data } = await axios.put(
        "/api/users/profile",
        { name, email, password },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: "UPDATE_SUCCESS" });
      ctxDispatch({ type: "USER_SIGNIN", payload: data });
      localStorage.setItem("userInfo", JSON.stringify(data));
      toast.success("Profile updated successfully");
    } catch (err) {
      dispatch({ type: "UPDATE_FAIL" });
      toast.error(getError(err));
    }
  };

  // Avatar initials
  const initials = (userInfo.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div style={{ maxWidth: 520, margin: "40px auto" }}>
      <Helmet>
        <title>User Profile</title>
      </Helmet>

      {/* Card wrapper */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Header strip */}
        <div
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            padding: "36px 32px 24px",
            textAlign: "center",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "#fff",
              border: "3px solid rgba(255,255,255,0.5)",
            }}
          >
            {initials}
          </div>
          <h2 style={{ color: "#fff", margin: 0, fontWeight: 700 }}>{userInfo.name}</h2>
          <p style={{ color: "rgba(255,255,255,0.75)", margin: "4px 0 0", fontSize: "0.9rem" }}>
            {userInfo.email}
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: "32px" }}>
          <h5 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 24 }}>
            Update Profile
          </h5>
          <form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="profileName">
              <Form.Label style={{ fontWeight: 600, color: "#374151" }}>Full Name</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ borderRadius: 10 }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="profileEmail">
              <Form.Label style={{ fontWeight: 600, color: "#374151" }}>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ borderRadius: 10 }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="profilePassword">
              <Form.Label style={{ fontWeight: 600, color: "#374151" }}>
                New Password{" "}
                <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: "0.8rem" }}>
                  (leave blank to keep current)
                </span>
              </Form.Label>
              <Form.Control
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                style={{ borderRadius: 10 }}
                placeholder="••••••••"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="profileConfirmPassword">
              <Form.Label style={{ fontWeight: 600, color: "#374151" }}>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ borderRadius: 10 }}
                placeholder="••••••••"
                isInvalid={!!password && !!confirmPassword && password !== confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                Passwords do not match
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              type="submit"
              disabled={loadingUpdate}
              style={{
                width: "100%",
                background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                border: "none",
                borderRadius: 30,
                padding: "12px",
                fontWeight: 700,
                fontSize: "1rem",
                color: "#fff",
              }}
            >
              {loadingUpdate ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
