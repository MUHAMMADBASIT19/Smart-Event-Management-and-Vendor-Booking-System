import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "80vh",
    padding: theme.spacing(4),
    backgroundColor: "#f8fafc",
  },
  header: {
    textAlign: "center",
    marginBottom: theme.spacing(4),
  },
  headerTitle: {
    fontWeight: 800,
    color: "#1e293b",
    fontSize: "2rem",
  },
  headerSub: {
    color: "#64748b",
    marginTop: theme.spacing(0.5),
  },
  card: {
    borderRadius: 16,
    padding: theme.spacing(4),
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    height: "100%",
  },
  sectionLabel: {
    fontWeight: 700,
    color: "#374151",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: theme.spacing(0.5),
  },
  sectionValue: {
    color: "#1e293b",
    fontWeight: 500,
    fontSize: "1rem",
    marginBottom: theme.spacing(2.5),
  },
  sectionTitle: {
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  arrangementItem: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: theme.spacing(1.5, 2),
    marginBottom: theme.spacing(1),
  },
  arrangementName: {
    fontWeight: 600,
    color: "#334155",
    fontSize: "0.9rem",
  },
  arrangementDetail: {
    color: "#64748b",
    fontSize: "0.82rem",
    marginTop: 2,
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    marginBottom: theme.spacing(3),
    color: "#6366f1",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
    "&:hover": { textDecoration: "underline" },
  },
}));

function StatusChip({ value, yes = "Yes", no = "No" }) {
  return value ? (
    <Chip
      label={yes}
      size="small"
      style={{
        background: "linear-gradient(135deg,#22c55e,#16a34a)",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.78rem",
      }}
    />
  ) : (
    <Chip
      label={no}
      size="small"
      style={{
        background: "linear-gradient(135deg,#f87171,#dc2626)",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.78rem",
      }}
    />
  );
}

function InfoRow({ label, value }) {
  const classes = useStyles();
  return (
    <div>
      <Typography className={classes.sectionLabel}>{label}</Typography>
      <Typography className={classes.sectionValue}>{value ?? "—"}</Typography>
    </div>
  );
}

export default function BookingDetail() {
  const classes = useStyles();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      const booking = JSON.parse(localStorage.getItem("bookingDetail"));
      if (booking) setData(booking);
    } catch {
      // invalid JSON in localStorage — ignore
    }
  }, []);

  if (!data) {
    return (
      <div className={classes.root} style={{ textAlign: "center", paddingTop: 80 }}>
        <Typography variant="h5" style={{ color: "#94a3b8" }}>
          No booking data found.
        </Typography>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      {/* Back link */}
      <div className={classes.backBtn} onClick={() => navigate("/bookings")}>
        ← Back to Bookings
      </div>

      {/* Page header */}
      <div className={classes.header}>
        <Typography className={classes.headerTitle}>Booking Details</Typography>
        <Typography className={classes.headerSub}>
          Full summary of this customer booking
        </Typography>
      </div>

      <Grid container spacing={3}>
        {/* ── Left card: Event info ── */}
        <Grid item xs={12} sm={6}>
          <Paper className={classes.card}>
            <Typography variant="h6" className={classes.sectionTitle}>
              📅 Event Information
            </Typography>
            <Divider className={classes.divider} />

            <InfoRow label="Booking Date" value={data.bookingDate} />
            <InfoRow label="Booking Time" value={data.bookingTime} />
            <InfoRow label="Payment Method" value={data.paymentMethod} />
            <InfoRow
              label="Total Price"
              value={`PKR ${Number(data.totalPrice || 0).toLocaleString()}/-`}
            />

            <Grid container spacing={3} style={{ marginTop: 4 }}>
              <Grid item xs={6}>
                <Typography className={classes.sectionLabel}>Paid</Typography>
                <StatusChip value={data.isPaid} />
              </Grid>
              <Grid item xs={6}>
                <Typography className={classes.sectionLabel}>Event Held</Typography>
                <StatusChip value={data.isDelivered} yes="Yes" no="Pending" />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* ── Right card: Client + arrangements ── */}
        <Grid item xs={12} sm={6}>
          <Paper className={classes.card}>
            <Typography variant="h6" className={classes.sectionTitle}>
              👤 Client Information
            </Typography>
            <Divider className={classes.divider} />

            <InfoRow label="Client Name" value={data.shippingAddress?.fullName} />
            <InfoRow label="Phone Number" value={data.shippingAddress?.postalCode} />

            {data.specialArrangements && data.specialArrangements.length > 0 && (
              <>
                <Divider className={classes.divider} />
                <Typography variant="h6" className={classes.sectionTitle}>
                  🎪 Special Arrangements
                </Typography>
                {data.specialArrangements.map((item, index) => (
                  <div key={index} className={classes.arrangementItem}>
                    <Typography className={classes.arrangementName}>
                      {item[0]}
                    </Typography>
                    <Typography className={classes.arrangementDetail}>
                      Qty: {item[1]} &nbsp;·&nbsp; Price: PKR {item[2]}/-
                    </Typography>
                  </div>
                ))}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
