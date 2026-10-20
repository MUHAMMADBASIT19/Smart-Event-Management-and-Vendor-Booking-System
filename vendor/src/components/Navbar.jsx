import { makeStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
} from "@material-ui/core";
import {
  AddCircleOutline,
  Message,
  ExitToApp,
  ViewList,
} from "@material-ui/icons";

import { useContext } from "react";
import axios from "axios";
import { Store } from "../Store";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(16px)",
    color: "#333",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    borderBottom: "1px solid #e2e8f0",
  },
  menuButton: {
    marginRight: theme.spacing(1),
    color: "#64748b",
  },
  title: {
    flexGrow: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  navButton: {
    fontWeight: 600,
    color: "#475569",
    "&:hover": {
      color: "#4f46e5",
      backgroundColor: "transparent",
    },
  },
}));

function Navbar() {
  const { dispatch: ctxDispatch } = useContext(Store);
  const [vendorInfo, setVendorInfo] = useState({});
  const navigate = useNavigate();
  const signoutHandler = () => {
    ctxDispatch({ type: "VENDOR_SIGNOUT" });
    localStorage.removeItem("vendorInfo");
    navigate("/");
  };

  const getVendor = async () => {
    const vendorInfo = JSON.parse(localStorage.getItem("vendorInfo")) || null;
    if (vendorInfo) {
      try {
        const res = await axios.get(`/api/vendor/${vendorInfo.id}`);
        setVendorInfo(res.data);
      } catch (e) {
        console.log(e);
      }
    } else {
      setVendorInfo(vendorInfo);
    }
  };
  const vendorInfoStr = localStorage.getItem("vendorInfo");
  useEffect(() => {
    getVendor();
  }, [vendorInfoStr]);

  const getVerifiedHandler = () => {
    navigate("/vendorverification");
  };

  const handleMessageClick = () => {
    navigate("/MessagePlatform");
  };

  const handleAddEventClick = () => {
    navigate("/addEvent");
  };

  const handleHomeClick = () => {
    navigate("/home");
  };

  const bookingHandler = () => {
    navigate("/bookings");
  };

  const classes = useStyles();
  return (
    <div className="App">
      <div className={classes.root}>
        <AppBar position="sticky" elevation={0} className={classes.appBar}>
          <Toolbar>
            <Typography
              variant="h6"
              className={classes.title}
              onClick={handleHomeClick}
            >
              <span className="navbar-brand-modern">EventOS</span>
              <span style={{ marginLeft: "8px", fontSize: "0.85rem", color: "#64748b", fontWeight: 500, paddingTop: "4px" }}>Vendor Portal</span>
            </Typography>

            {vendorInfo && vendorInfo.status === "accepted" && (
              <>
                <Button
                  className={classes.navButton}
                  onClick={() => {
                    navigate("/viewBids");
                  }}
                >
                  View Bids
                </Button>
                <Button
                  className={classes.navButton}
                  onClick={bookingHandler}
                >
                  Bookings
                </Button>
                <IconButton
                  edge="start"
                  className={classes.menuButton}
                  aria-label="messages"
                  onClick={handleMessageClick}
                >
                  <Message />
                </IconButton>
                <IconButton
                  edge="start"
                  className={classes.menuButton}
                  aria-label="add event"
                  onClick={handleAddEventClick}
                >
                  <AddCircleOutline />
                </IconButton>
                <Button
                  className={classes.navButton}
                  endIcon={<ExitToApp />}
                  onClick={signoutHandler}
                  style={{ color: "#ef4444" }}
                >
                  Sign Out
                </Button>
              </>
            )}

            {vendorInfo && vendorInfo.status === "rejected" && (
              <>
                <Button
                  onClick={getVerifiedHandler}
                  style={{
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: 30,
                    padding: "6px 20px",
                    textTransform: "none",
                    boxShadow: "0 3px 10px rgba(245,158,11,0.35)",
                    marginRight: 8,
                  }}
                >
                  🔐 Get Verified
                </Button>
                <Button
                  color="inherit"
                  endIcon={<ExitToApp />}
                  onClick={signoutHandler}
                >
                  Sign Out
                </Button>
              </>
            )}
            {vendorInfo && vendorInfo.status === "pending" && (
              <>
                <Button
                  color="inherit"
                  endIcon={<ExitToApp />}
                  onClick={signoutHandler}
                >
                  Sign Out
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
      </div>
    </div>
  );
}

export default Navbar;
