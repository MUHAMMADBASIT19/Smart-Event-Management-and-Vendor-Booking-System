import React, { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Button from "react-bootstrap/Button";
import { Store } from "../Store";
import { getError } from "../utils";
import { toast } from "react-toastify";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, orders: action.payload, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "DELETE_REQUEST":
      return { ...state, loadingDelete: true, successDelete: false };
    case "DELETE_SUCCESS":
      return { ...state, loadingDelete: false, successDelete: true };
    case "DELETE_FAIL":
      return { ...state, loadingDelete: false, successDelete: false };
    case "DELETE_RESET":
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};

// ── Safe date formatter ──────────────────────────────────────────────────────
function formatDate(val) {
  if (!val) return "—";
  try {
    return new Date(val).toISOString().substring(0, 10);
  } catch {
    return String(val).substring(0, 10);
  }
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ ok, trueLabel, falseLabel }) {
  const base = {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 20,
    fontWeight: 600,
    fontSize: "0.78rem",
  };
  return ok ? (
    <span style={{ ...base, background: "#dcfce7", color: "#15803d" }}>
      {trueLabel}
    </span>
  ) : (
    <span style={{ ...base, background: "#fee2e2", color: "#dc2626" }}>
      {falseLabel}
    </span>
  );
}

export default function OrderHistoryScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, { loading: true, error: "" });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const { data } = await axios.get("/api/orders/mine", {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    if (successDelete) {
      dispatch({ type: "DELETE_RESET" });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const deleteHandler = async (order) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        dispatch({ type: "DELETE_REQUEST" });
        const orderId = order.id || order._id;
        const response = await axios.delete(`/api/orders/${orderId}/mine`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        if (response.data.message === "Booking cannot be deleted after 24 hours") {
          toast.error(response.data.message);
        } else {
          toast.success("Booking deleted successfully");
        }
        dispatch({ type: "DELETE_SUCCESS" });
      } catch (err) {
        toast.error(getError(err));
        dispatch({ type: "DELETE_FAIL" });
      }
    }
  };

  return (
    <div>
      <Helmet>
        <title>Booking History</title>
      </Helmet>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontWeight: 800, color: "#1e293b", margin: 0 }}>Booking History</h1>
      </div>

      {loadingDelete && <LoadingBox />}

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : !orders || orders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            borderRadius: 16,
            background: "#f8fafc",
            border: "1.5px dashed #cbd5e1",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ color: "#64748b", fontWeight: 500, fontSize: "1rem" }}>
            No bookings yet.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff" }}>
                {["ID", "Date", "Total (PKR)", "Paid", "Held", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "14px 16px",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      textAlign: "left",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => {
                const orderId = order.id || order._id;
                return (
                  <tr
                    key={orderId}
                    style={{
                      background: idx % 2 === 0 ? "#fff" : "#f8fafc",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#f8fafc")}
                  >
                    <td style={{ padding: "13px 16px", color: "#64748b", fontSize: "0.85rem", fontFamily: "monospace" }}>
                      #{orderId}
                    </td>
                    <td style={{ padding: "13px 16px", color: "#374151" }}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td style={{ padding: "13px 16px", fontWeight: 700, color: "#1e293b" }}>
                      {Number(order.totalPrice || 0).toLocaleString()}/-
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      {order.isPaid ? (
                        <StatusBadge ok trueLabel={formatDate(order.paidAt)} falseLabel="No" />
                      ) : (
                        <StatusBadge ok={false} trueLabel="" falseLabel="Not Paid" />
                      )}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      {order.isDelivered ? (
                        <StatusBadge ok trueLabel={formatDate(order.deliveredAt)} falseLabel="" />
                      ) : (
                        <StatusBadge ok={false} trueLabel="" falseLabel="Pending" />
                      )}
                    </td>
                    <td style={{ padding: "13px 16px", display: "flex", gap: 8 }}>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        style={{ borderRadius: 20, fontWeight: 600 }}
                        onClick={() => navigate(`/order/${orderId}`)}
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        style={{ borderRadius: 20, fontWeight: 600 }}
                        disabled={order.isPaid}
                        onClick={() => deleteHandler(order)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
