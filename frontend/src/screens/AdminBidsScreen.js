import React, { useEffect, useReducer, useContext } from "react";
import axios from "axios";
import { Store } from "../Store";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Badge from "react-bootstrap/Badge";
import Table from "react-bootstrap/Table";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, bids: action.payload, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function AdminBidsScreen() {
  const [{ loading, error, bids }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
    bids: [],
  });
  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchBids = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get("/api/bid", {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({
          type: "FETCH_FAIL",
          payload: err.response?.data?.message || err.message,
        });
      }
    };
    fetchBids();
  }, [userInfo]);

  const statusVariant = (status) => {
    if (status === "accepted") return "success";
    if (status === "rejected") return "danger";
    return "warning";
  };

  return (
    <div>
      <Helmet>
        <title>All Bids — Admin</title>
      </Helmet>
      <h1 className="my-3">All Active Bids</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : bids.length === 0 ? (
        <MessageBox>No bids found.</MessageBox>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Bid ID</th>
              <th>Event ID</th>
              <th>User ID</th>
              <th>Vendor ID</th>
              <th>User Bid (PKR)</th>
              <th>Vendor Bid (PKR)</th>
              <th>Accepted Price (PKR)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid) => (
              <tr key={bid.id}>
                <td>{bid.id}</td>
                <td>{bid.event_id}</td>
                <td>{bid.user_id}</td>
                <td>{bid.vendor_id}</td>
                <td>{bid.UserBid}</td>
                <td>{bid.VendorBid}</td>
                <td>{bid.acceptedPrice || "—"}</td>
                <td>
                  <Badge bg={statusVariant(bid.bidStatus)}>
                    {bid.bidStatus}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
