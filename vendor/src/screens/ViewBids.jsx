import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import Bid from "../components/Bid";
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");
const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    padding: theme.spacing(4),
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
  },
  sidebarInner: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    overflow: "hidden",
    height: "100%",
  },
  listHeader: {
    padding: theme.spacing(2, 2, 1, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontWeight: "bold",
    color: "#333",
  },
  listItem: {
    borderRadius: "8px",
    margin: theme.spacing(0.5, 1),
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
      cursor: "pointer",
    },
  },
  selectedListItem: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
    },
    // Fix typography color when selected
    "& .MuiTypography-root": {
      color: "white",
    },
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    color: "white",
    fontWeight: "bold",
  },
  contentContainer: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    padding: theme.spacing(3),
    minHeight: "400px",
  },
}));

const ViewBids = () => {
  const classes = useStyles();
  const [bids, setBids] = useState([]);
  const [selectedBid, setSelectedBid] = useState();

  const fetchData = async () => {
    const vendorInfo = JSON.parse(localStorage.getItem("vendorInfo"));
    const response = await axios.get(
      `/api/bid/vendor/${vendorInfo.id}`
    );
    console.log(response.data);
    setBids(response.data);
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // if (bids) {
    //   socket.emit("bidUpdate", props.bid._id);
    // }
    if (bids.length === 0) {
      console.log("correct");
    } else {
      socket.emit("bidUpdate", bids);
    }

    socket.on("updateBid", (updatedBid) => {
      // Update the local state with the updated bid information
      console.log("socket is working", updatedBid);
      fetchData();
    });

    // Clean up the event listener when the component is unmounted
    return () => {
      socket.off("updateBid");
    };
  }, [bids]);

  const handlePersonSelect = (bid) => {
    //  console.log(bid);
    setSelectedBid(bid);
  };

  // Add a key variable that changes whenever selectedBid changes
  const key = selectedBid ? selectedBid.id : "none";

  return (
    <div className={classes.root}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <div className={classes.sidebarInner}>
            <Typography variant="h6" className={classes.listHeader}>
              Active Bids
            </Typography>
            <List disablePadding>
              {bids.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No bids available" />
                </ListItem>
              ) : (
                bids.map((bid) => (
                  <ListItem
                    key={bid.id}
                    onClick={() => handlePersonSelect(bid)}
                    className={`${classes.listItem} ${
                      selectedBid && selectedBid.id === bid.id
                        ? classes.selectedListItem
                        : ""
                    }`}
                  >
                    <ListItemAvatar>
                      <Avatar className={classes.avatar}>
                        {(bid.user_id && bid.user_id.charAt(0).toUpperCase()) || "C"}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`Client ID: ${bid.user_id.substring(0, 8)}...`}
                      secondary={bid.bidStatus}
                      secondaryTypographyProps={{
                        style: {
                          color:
                            selectedBid && selectedBid.id === bid.id ? "#eee" : "inherit",
                          textTransform: "capitalize",
                          fontWeight: 500,
                        },
                      }}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </div>
        </Grid>
        <Grid item xs={12} md={9}>
          <div className={classes.contentContainer}>
            {selectedBid ? (
              <Bid bid={selectedBid} fetchData={fetchData} key={key} />
            ) : (
              <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                style={{ minHeight: "350px", opacity: 0.6 }}
              >
                <Typography variant="h5" color="textSecondary">
                  Select a bid to view details
                </Typography>
              </Grid>
            )}
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default ViewBids;
