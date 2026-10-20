import React, { useContext, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import EventContainer from "./Event";
import { Store } from "../Store";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(4),
    fontWeight: 700,
    color: "#1e293b",
    textAlign: "center",
  },
  paper: {
    height: "100%",
    backgroundColor: "transparent",
    boxShadow: "none",
  },

  // ── Status page wrapper ──────────────────────────────────────────────
  statusWrapper: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(3),
  },

  // ── Shared card ──────────────────────────────────────────────────────
  statusCard: {
    maxWidth: 520,
    width: "100%",
    borderRadius: 20,
    padding: theme.spacing(6, 5),
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
  },

  // ── Icon circle ──────────────────────────────────────────────────────
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
    marginBottom: theme.spacing(3),
    fontSize: 36,
  },

  // ── Rejected (get verified) ───────────────────────────────────────────
  rejectedCard: {
    background: "linear-gradient(135deg, #fff 0%, #fef3f2 100%)",
    border: "1.5px solid #fecaca",
  },
  rejectedIcon: {
    background: "linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)",
  },
  rejectedTitle: {
    fontWeight: 700,
    color: "#991b1b",
    marginBottom: theme.spacing(1),
  },
  rejectedSubtitle: {
    color: "#6b7280",
    marginBottom: theme.spacing(4),
    lineHeight: 1.6,
  },
  verifyButton: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "#fff",
    fontWeight: 700,
    borderRadius: 30,
    padding: "12px 36px",
    fontSize: "1rem",
    textTransform: "none",
    boxShadow: "0 4px 15px rgba(239,68,68,0.4)",
    "&:hover": {
      background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
      boxShadow: "0 6px 20px rgba(239,68,68,0.5)",
    },
  },

  // ── Pending (waiting) ────────────────────────────────────────────────
  pendingCard: {
    background: "linear-gradient(135deg, #fff 0%, #fffbeb 100%)",
    border: "1.5px solid #fde68a",
  },
  pendingIcon: {
    background: "linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)",
  },
  pendingTitle: {
    fontWeight: 700,
    color: "#92400e",
    marginBottom: theme.spacing(1),
  },
  pendingSubtitle: {
    color: "#6b7280",
    marginBottom: theme.spacing(3),
    lineHeight: 1.6,
  },
  pendingChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#fef3c7",
    border: "1px solid #fcd34d",
    borderRadius: 20,
    padding: "6px 18px",
    color: "#92400e",
    fontWeight: 600,
    fontSize: "0.85rem",
  },

  // ── Loading ───────────────────────────────────────────────────────────
  loadingWrapper: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const Home = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const { state } = useContext(Store);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async (vendorId) => {
    try {
      const response = await axios.get(`/api/events/vendor/${vendorId}`);
      setEvents(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  const getVendor = async (vendorId) => {
    try {
      const res = await axios.get(`/api/vendor/${vendorId}`);
      setVendorInfo(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const id = state.vendorInfo?.id || state.vendorInfo?._id;
    if (id) {
      Promise.all([fetchData(id), getVendor(id)]).finally(() =>
        setLoading(false)
      );
    } else {
      setLoading(false);
    }
  }, []);

  // ── Loading spinner ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={classes.loadingWrapper}>
        <CircularProgress />
      </div>
    );
  }

  // ── Accepted — show events dashboard ──────────────────────────────
  if (vendorInfo && vendorInfo.status === "accepted") {
    return (
      <Container maxWidth="md" className={classes.root}>
        <Typography variant="h4" className={classes.title}>
          Welcome to Your Event Management Page
        </Typography>
        <Grid container spacing={3}>
          {events && events.length > 0 ? (
            events.map((event) => (
              <Grid key={event._id || event.id} item xs={12} sm={6} md={4}>
                <Paper className={classes.paper}>
                  <EventContainer
                    fetchData={() =>
                      fetchData(
                        state.vendorInfo?.id || state.vendorInfo?._id
                      )
                    }
                    title={event.title}
                    description={event.description}
                    image={event.image}
                    price={event.price}
                    category={event.category}
                    _id={event._id || event.id}
                    event={event}
                  />
                </Paper>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper
                style={{
                  padding: 40,
                  textAlign: "center",
                  borderRadius: 16,
                  background: "#f8fafc",
                  boxShadow: "none",
                  border: "1.5px dashed #cbd5e1",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <Typography
                  variant="h6"
                  style={{ color: "#64748b", fontWeight: 600 }}
                >
                  No events yet
                </Typography>
                <Typography
                  variant="body2"
                  style={{ color: "#94a3b8", marginTop: 4 }}
                >
                  Start by adding your first event.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  style={{
                    marginTop: 20,
                    borderRadius: 30,
                    textTransform: "none",
                    fontWeight: 700,
                    padding: "10px 28px",
                  }}
                  onClick={() => navigate("/addEvent")}
                >
                  + Add Event
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    );
  }

  // ── Pending — waiting for admin approval ───────────────────────────
  if (vendorInfo && vendorInfo.status === "pending") {
    return (
      <div className={classes.statusWrapper}>
        <Paper className={`${classes.statusCard} ${classes.pendingCard}`}>
          <div className={`${classes.iconCircle} ${classes.pendingIcon}`}>
            ⏳
          </div>
          <Typography variant="h5" className={classes.pendingTitle}>
            Under Review
          </Typography>
          <Typography variant="body1" className={classes.pendingSubtitle}>
            Your verification documents have been submitted and are currently
            being reviewed by our team. This usually takes 1–2 business days.
          </Typography>
          <div className={classes.pendingChip}>
            <CircularProgress size={14} thickness={5} style={{ color: "#92400e" }} />
            Waiting for approval…
          </div>
        </Paper>
      </div>
    );
  }

  // ── Rejected / unverified — prompt to get verified ─────────────────
  return (
    <div className={classes.statusWrapper}>
      <Paper className={`${classes.statusCard} ${classes.rejectedCard}`}>
        <div className={`${classes.iconCircle} ${classes.rejectedIcon}`}>
          🔐
        </div>
        <Typography variant="h5" className={classes.rejectedTitle}>
          Account Not Verified
        </Typography>
        <Typography variant="body1" className={classes.rejectedSubtitle}>
          Your account hasn't been verified yet. Complete the verification
          process to start listing your services and managing events.
        </Typography>
        <Button
          className={classes.verifyButton}
          onClick={() => navigate("/vendorverification")}
        >
          Get Verified Now →
        </Button>
      </Paper>
    </div>
  );
};

export default Home;
