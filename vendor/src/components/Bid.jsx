import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import Grid from "@mui/material/Grid";
import axios from "axios";
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");

const BiddingScreen = (props) => {
  const [bidStatus, setBidStatus] = useState(" ");
  const [VendorBid, setVendorBid] = useState(0);
  const [newBid, setNewBid] = useState("");
  const [clientBid, setClientBid] = useState(0);
  const [bidId, setBidId] = useState("");
  const [acceptedPrice, setAcceptedPrice] = useState(0);
  const handleAcceptBid = async () => {
    setBidStatus("accepted");
    await axios.put(`/api/bid/${bidId}`, {
      bidStatus: "accepted",
      acceptedPrice: clientBid,
    });
    props.fetchData();
  };

  const handleRejectBid = async () => {
    setBidStatus("rejected");
    await axios.put(`/api/bid/${bidId}`, {
      bidStatus: "rejected",
    });
    props.fetchData();
  };

  const handlePlaceBid = async () => {
    setVendorBid(newBid);
    await axios.put(`/api/bid/${bidId}`, {
      VendorBid: newBid,
      bidStatus: "ongoing",
    });
    setBidStatus("ongoing");
    props.fetchData();
  };

  useEffect(() => {
    const getBid = async () => {
      setVendorBid(props.bid.VendorBid);
      setBidStatus(props.bid.bidStatus);
      setClientBid(props.bid.UserBid);
      setBidId(props.bid.id);
      setAcceptedPrice(props.bid.acceptedPrice);
    };
    getBid();
    console.log(
      props.bid.VendorBid,
      props.bid.bidStatus,
      props.bid.UserBid,
      props.bid.id
    );
  }, [props.bid.VendorBid, props.bid.UserBid, props.bid.bidStatus, props.bid.acceptedPrice, props.bid.id]);

  useEffect(() => {
    if (props.bid.id) {
      socket.emit("bidUpdate", props.bid.id);
    }
    socket.on("updateBid", (updatedBid) => {
      if (updatedBid.id === props.bid.id) {
        setVendorBid(updatedBid.VendorBid);
        setBidStatus(updatedBid.bidStatus);
        setClientBid(updatedBid.UserBid);
        setAcceptedPrice(updatedBid.acceptedPrice);
      }
    });

    return () => {
      socket.off("updateBid");
    };
  }, [props.bid.id]);

  const renderBidStatus = () => {
    switch (bidStatus) {
      case "accepted":
        return (
          <>
            <CheckCircleOutlineIcon color="success" />
            <Typography variant="h6">Accepted</Typography>
          </>
        );
      case "rejected":
        return (
          <>
            <HighlightOffIcon color="error" />
            <Typography variant="h6">Rejected</Typography>
          </>
        );
      default:
        return (
          <>
            <HourglassEmptyIcon color="action" />
            <Typography variant="h6">Ongoing</Typography>
          </>
        );
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
        {renderBidStatus()}
      </Box>
      {bidStatus === "ongoing" && (
        <>
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="flex-start"
          >
            <Grid item xs={6}>
              <Typography variant="h6">
                <span style={{ fontWeight: "bold" }}>Event ID:</span>{" "}
                {props.bid.event_id}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6">
                <span style={{ fontWeight: "bold" }}>Client ID:</span>{" "}
                {props.bid.user_id}
              </Typography>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="flex-start"
            mt={8}
          >
            <Grid item xs={6}>
              <Typography variant="h6">
                <span style={{ fontWeight: "bold" }}>Current Vendor Bid:</span>{" "}
                {VendorBid} PKR
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6">
                <span style={{ fontWeight: "bold" }}>Current Client Bid:</span>{" "}
                {clientBid} PKR
              </Typography>
            </Grid>
          </Grid>

          <Box my={2}>
            <TextField
              label="Place your bid"
              type="number"
              value={newBid}
              onChange={(e) => setNewBid(e.target.value)}
              fullWidth
              inputProps={{
                min: 0,
              }}
            />
          </Box>
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="flex-start"
          >
            <Grid item>
              <Box mb={2}>
                <Button variant="contained" onClick={handlePlaceBid}>
                  Place Bid
                </Button>
              </Box>
            </Grid>
            <Grid item>
              <Box mb={2}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleAcceptBid}
                >
                  Accept Bid
                </Button>
              </Box>
            </Grid>
            <Grid item>
              <Box mb={2}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleRejectBid}
                >
                  Reject Bid
                </Button>
              </Box>
            </Grid>
          </Grid>
        </>
      )}
      {bidStatus === "accepted" && (
        <>
          {acceptedPrice ? (
            <Box sx={{ backgroundColor: "#d4edda", p: 2, m: 2 }}>
              <Typography variant="h6" color="success">
                The bid is Successfully Placed, Negotiated Price:{" "}
                {acceptedPrice} PKR
              </Typography>
            </Box>
          ) : (
            <Box sx={{ backgroundColor: "#d4edda", p: 2, m: 2 }}>
              <Typography variant="h6" color="success">
                The bid is Successfully Placed, Negotiated Price: {clientBid}{" "}
                PKR
              </Typography>
            </Box>
          )}
        </>
      )}
      {bidStatus === "rejected" && (
        <Box sx={{ backgroundColor: "#ffe4e4", p: 2 }}>
          <Typography variant="h6" color="error">
            The bid was rejected
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BiddingScreen;
