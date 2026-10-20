import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Container,
} from "@material-ui/core";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import DoneIcon from "@mui/icons-material/Done";
import Button from "@material-ui/core/Button";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 700,
  },
  headerCell: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: "bold",
    fontSize: "0.95rem",
  },
  tableRow: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.08)",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    },
  },
  tableContainer: {
    borderRadius: "12px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  titleContainer: {
    padding: theme.spacing(3, 0),
    marginBottom: theme.spacing(2),
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
  doneButton: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
    borderRadius: "20px",
    padding: "6px 16px",
    fontWeight: "bold",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    "&:hover": {
      backgroundColor: theme.palette.success.main,
      transform: "translateY(-1px)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
  },
}));

function OrderTable() {
  const navigate = useNavigate();
  const classes = useStyles();
  const [bookings, setBookings] = useState([]);
  const [open, setOpen] = useState(false);
  const getBookedEvents = async () => {
    const vendorInfo = JSON.parse(localStorage.getItem("vendorInfo"));
    const vendorId = vendorInfo?.id || vendorInfo?._id;
    try {
      const res = await axios.get(`/api/orders/vendor/${vendorId}`);
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Failed to fetch bookings:", e);
      setBookings([]);
    }
  };

  useEffect(() => {
    getBookedEvents();
  }, []);

  const handleRowClick = (booking) => {
    // console.log(booking);
    localStorage.setItem("bookingDetail", JSON.stringify(booking));
    navigate("/bookingDetail");
  };

  const handleMarkAsDone = async (event, booking) => {
    event.stopPropagation();
    console.log(booking);

    const dateString = "06/05/2023";
    const dateParts = booking.bookingDate.split("/");
    const day = dateParts[1];
    const month = dateParts[0] - 1; // months are zero-based in JavaScript
    const year = dateParts[2];
    const targetDate = new Date(year, month, day);

    if (Date.now() > targetDate.getTime()) {
      console.log("The current date is later than the target date.");
      const res = await axios.put(
        `/api/orders/${booking.id || booking._id}/markAsDone/vendor`,
        {}
      );
    } else {
      setOpen(true);
    }

    //const res = await axios.put(
    getBookedEvents();
  };
  return (
    <Container
      maxWidth="lg"
      style={{
        marginTop: "2rem",
        marginBottom: "3rem",
      }}
    >
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography variant="h6" color="error">
            Cannot mark as done before the event date
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <div className={classes.titleContainer}>
        <Typography
          align="center"
          variant="h3"
          color="textPrimary"
          style={{ fontWeight: "bold" }}
        >
          Customer Bookings
        </Typography>
      </div>

      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table className={classes.table} aria-label="Order table">
          <TableHead>
            <TableRow>
              <TableCell className={classes.headerCell}>Event</TableCell>
              <TableCell className={classes.headerCell} align="center">Payment</TableCell>
              <TableCell className={classes.headerCell} align="center">Price</TableCell>
              <TableCell className={classes.headerCell} align="center">Client</TableCell>
              <TableCell className={classes.headerCell} align="center">Paid</TableCell>
              <TableCell className={classes.headerCell} align="center">Held</TableCell>
              <TableCell className={classes.headerCell} align="center">Phone</TableCell>
              <TableCell className={classes.headerCell} align="center">Date</TableCell>
              <TableCell className={classes.headerCell} align="center">Time</TableCell>
              <TableCell className={classes.headerCell} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" style={{ padding: "2rem", color: "#94a3b8", fontSize: "1rem" }}>
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
            bookings.map((booking) => (
              <TableRow
                key={booking.id || booking._id}
                onClick={() => handleRowClick(booking)}
                className={classes.tableRow}
              >
                <TableCell>
                  {booking.orderItems?.[0]?.title ?? "—"}
                </TableCell>

                <TableCell align="center">{booking.paymentMethod}</TableCell>
                <TableCell align="center">{booking.totalPrice}</TableCell>
                <TableCell align="center">
                  {booking.shippingAddress.fullName}
                </TableCell>
                {booking.isPaid ? (
                  <TableCell align="center">Yes</TableCell>
                ) : (
                  <TableCell align="center">No</TableCell>
                )}
                {booking.isDelivered ? (
                  <TableCell align="center">Yes</TableCell>
                ) : (
                  <TableCell align="center">No</TableCell>
                )}

                <TableCell align="center">
                  {booking.shippingAddress.postalCode}
                </TableCell>
                <TableCell align="center">{booking.bookingDate}</TableCell>
                <TableCell align="center">{booking.bookingTime}</TableCell>
                <TableCell align="center">
                  {" "}
                  {!booking.isDelivered ? (
                    <Button
                      size="small"
                      className={classes.doneButton}
                      onClick={(event) => handleMarkAsDone(event, booking)}
                    >
                      Mark done
                    </Button>
                  ) : (
                    <CheckIcon fontSize="large" color="primary" />
                  )}
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default OrderTable;
