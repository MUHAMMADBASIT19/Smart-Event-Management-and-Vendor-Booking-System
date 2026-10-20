import React, { useContext, useState } from "react";
import { TextField, Button, Grid, Container, Typography, Paper, Box } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MapIcon from '@mui/icons-material/Map';
import TimePicker from "react-time-picker";
import { Store } from "../Store";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Map from "../components/Maps";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useLocation } from "react-router-dom";

const EditEvent = () => {
  const { event } = useLocation().state;
  console.log(event);
  const [name, setName] = useState(event.title);
  const [slugs, setSlugs] = useState(event.slugs);
  const [category, setCategory] = useState(event.category);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState(event.description);
  const [opening, setOpening] = useState(event.opening);
  const [closing, setClosing] = useState(event.closing);
  const [price, setPrice] = useState(event.price);
  const [capacity, setCapacity] = useState(event.stock);
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { vendorInfo } = state;

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const vendorId = vendorInfo._id;
    // Create FormData to send the image file
    const formData = new FormData();
    formData.append("name", name);
    formData.append("slugs", slugs);
    formData.append("category", category);
    formData.append("image", image);
    formData.append("price", price);
    formData.append("vendorId", vendorId);
    formData.append("capacity", capacity);
    formData.append("rating", 0);
    formData.append("numberOfReviews", 0);
    formData.append("description", description);
    formData.append("opening", opening);
    formData.append("closing", closing);
    formData.append("location", JSON.stringify(location));
    formData.append("longitude", location.lng);
    formData.append("latitude", location.lat);
    for (const entry of formData.entries()) {
      console.log(entry[0] + ": " + entry[1]);
    }

    try {
      const response = await axios.put(
        `/api/events//${event._id}/editEvent`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Event added successfully");
      setShowMap(false);
      navigate("/home");
    } catch (err) {
      console.log(err);
    }
  };

  // Working for Google maps
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState(null);
  const [confirmLocation, setConfirmLocation] = useState(false);
  const handleShowMap = () => {
    setShowMap(!showMap);
    if (!showMap) {
      setLocation(null);
    }
  };

  const handleConfirmLocation = () => {
    setShowMap(false);
    setConfirmLocation(true);
  };

  return (
    // ...
    <>
      {showMap && (
        <Map
          location={location}
          setLocation={setLocation}
          handleConfirmLocation={handleConfirmLocation}
        />
      )}

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary.main" sx={{ mb: 4 }}>
            Edit Event
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  fullWidth
                  margin="normal"
                  required
                />
                <TextField
                  label="Slugs"
                  value={slugs}
                  onChange={(event) => setSlugs(event.target.value)}
                  fullWidth
                  margin="normal"
                  required
                />
                <TextField
                  label="Category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  fullWidth
                  margin="normal"
                  required
                />
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ py: 1.5, justifyContent: "flex-start", textTransform: "none" }}
                  >
                    {image ? image.name : "Upload Event Image"}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(event) => setImage(event.target.files[0])}
                    />
                  </Button>
                </Box>

                <Box sx={{ mt: 3, mb: 2 }}>
                  <Button
                    variant={location ? "contained" : "outlined"}
                    color={location ? "success" : "primary"}
                    startIcon={<MapIcon />}
                    onClick={handleShowMap}
                    fullWidth
                    sx={{ py: 1.5 }}
                  >
                    {location ? "Location Selected ✓" : "Update Location on Map"}
                  </Button>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <div style={{ marginBottom: "6px" }}>Opening Time</div>
                  <TimePicker
                    label="Opening Time"
                    value={opening}
                    onChange={(newValue) => {
                      setOpening(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        margin="normal"
                        required
                      />
                    )}
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  multiline
                  rows={4.5}
                  fullWidth
                  margin="normal"
                  required
                />
                <TextField
                  label="Price"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  fullWidth
                  margin="normal"
                  type="number"
                  required
                />
                <TextField
                  label="Event Duration in Minutes"
                  value={capacity}
                  onChange={(event) => setCapacity(event.target.value)}
                  fullWidth
                  margin="normal"
                  type="number"
                  required
                />

                <Box sx={{ mt: 2 }}>
                  <div style={{ marginBottom: "6px" }}>Closing Time</div>
                  <TimePicker
                    label="Closing Time"
                    value={closing}
                    onChange={(newValue) => {
                      setClosing(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        margin="normal"
                        required
                      />
                    )}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Grid container justifyContent="center">
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    size="large"
                    disabled={!location}
                    sx={{ mt: 2, px: 6, py: 1.5, fontWeight: "bold", borderRadius: "30px" }}
                  >
                    Update Event
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </>
  );
  // ...
};

export default EditEvent;
