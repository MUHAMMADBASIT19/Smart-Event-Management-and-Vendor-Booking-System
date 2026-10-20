// HomeScreen.js — Modernized
import { useEffect, useReducer, useState } from "react";
import axios from "axios";
import logger from "use-reducer-logger";
import Event from "../components/Event";
import { Helmet } from "react-helmet-async";
import MessageBox from "../components/MessageBox";
import Map from "../components/Maps";
import Modal from "react-bootstrap/esm/Modal";
import {
  FiMapPin, FiX, FiSearch,
  FiGrid, FiLoader, FiNavigation, FiList, FiCheck
} from "react-icons/fi";
import { toast } from "react-toastify";
import { getError } from "../utils";
import "./HomeScreen.css";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":  return { ...state, loading: true };
    case "FETCH_SUCCESS":  return { ...state, events: action.payload, loading: false };
    case "FETCH_FAIL":     return { ...state, loading: false, error: action.payload };
    default:               return state;
  }
};

function HomeScreen() {
  const [{ loading, error, events }, dispatch] = useReducer(logger(reducer), {
    events: [],
    loading: true,
    error: "",
  });

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const result = await axios.get("/api/events");
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: err.message });
      }
    };
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/events/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchData();
    fetchCategories();
  }, []);

  // Map / location state
  const [showMap, setShowMap]                   = useState(false);
  const [location, setLocation]                 = useState(null);
  const [isLocationSelected, setIsLocationSelected] = useState(false);
  const [locationEvents, setLocationEvents]     = useState([]);
  const [miles, setMiles]                       = useState(10);
  const [loadingLocation, setLoadingLocation]   = useState(false);

  const handleShowMap = () => {
    setShowMap(!showMap);
    if (!showMap) setLocation(null);
  };

  const handleConfirmLocation = async () => {
    setShowMap(false);
    setLoadingLocation(true);
    setLocationEvents([]);
    try {
      const response = await axios.get(
        `/api/events/near/t/${location.lng}/${location.lat}/${miles}`
      );
      setLocationEvents(response.data);
      setIsLocationSelected(true);
    } catch (e) {
      setIsLocationSelected(false);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleCancelFilter = () => {
    setIsLocationSelected(false);
    setLocationEvents([]);
    setLocation(null);
  };

  const baseEvents = isLocationSelected ? locationEvents : events;
  const displayEvents = selectedCategory === "all" 
    ? baseEvents 
    : baseEvents.filter(e => e.category === selectedCategory);

  return (
    <div className="home-wrapper">
      <Helmet>
        <title>Browse Events — EventOS</title>
      </Helmet>

      {/* ── Location Map Modal ── */}
      <Modal show={showMap} onHide={handleShowMap} centered size="lg">
        <Modal.Header closeButton className="home-modal-header">
          <Modal.Title className="home-modal-title">
            <FiMapPin size={18} /> Select Your Location
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Map
            location={location}
            setLocation={setLocation}
            handleConfirmLocation={handleConfirmLocation}
          />
        </Modal.Body>
      </Modal>

      {/* ── Page Header ── */}
      <div className="home-page-header">
        <div className="home-page-header-inner">
          <div>
            <h1 className="home-page-title">
              <FiGrid size={28} />
              Browse Venues
            </h1>
            <p className="home-page-subtitle">
              Discover the perfect venue for your next event
            </p>
          </div>

          {/* ── Filter Bar ── */}
          <div className="home-filter-bar">
            <div className="home-miles-group">
              <label className="miles-label">
                <FiNavigation size={14} /> Radius (mi)
              </label>
              <input
                type="number"
                className="miles-input"
                value={miles}
                min={1}
                max={500}
                onChange={(e) => setMiles(e.target.value)}
              />
            </div>

            <button
              className="btn-set-location"
              onClick={handleShowMap}
            >
              <FiMapPin size={15} />
              {isLocationSelected ? "Change Location" : "Set Location"}
            </button>

            {isLocationSelected && (
              <button className="btn-clear-filter" onClick={handleCancelFilter}>
                <FiX size={15} /> Clear Filter
              </button>
            )}
          </div>
        </div>

        {isLocationSelected && (
          <div className="location-active-banner">
            <FiMapPin size={14} />
            Showing venues within <strong>{miles} miles</strong> of your selected location
            &nbsp;·&nbsp; {locationEvents.length} result{locationEvents.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ── Main Layout (Sidebar + Events) ── */}
      <div className="home-main-layout">
        
        {/* ── Categories Sidebar ── */}
        <aside className="home-sidebar">
          <div className="home-sidebar-header">
            <FiList size={18} />
            <h3>Categories</h3>
          </div>
          <ul className="home-categories-list">
            <li 
              className={selectedCategory === "all" ? "active" : ""}
              onClick={() => {
                setSelectedCategory("all");
                handleCancelFilter();
              }}
            >
              <span>All Categories</span>
              {selectedCategory === "all" && <FiCheck size={16} className="check-icon" />}
            </li>
            {categories.map((c) => (
              <li 
                key={c}
                className={selectedCategory === c ? "active" : ""}
                onClick={() => setSelectedCategory(c)}
              >
                <span>{c}</span>
                {selectedCategory === c && <FiCheck size={16} className="check-icon" />}
              </li>
            ))}
          </ul>
        </aside>

        {/* ── Events Grid ── */}
        <div className="home-events-section">
          {loading || loadingLocation ? (
            <div className="home-loading">
              <FiLoader size={32} className="spin-icon" />
              <p>Loading venues…</p>
            </div>
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : displayEvents.length === 0 ? (
            <div className="home-empty">
              <FiSearch size={48} />
              <h3>No venues found</h3>
              <p>Try adjusting the filters or category.</p>
              {(isLocationSelected || selectedCategory !== "all") && (
                <button className="btn-set-location" onClick={() => {
                  handleCancelFilter();
                  setSelectedCategory("all");
                }}>
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="home-events-grid">
              {displayEvents.map((event) => (
                <Event key={event.slugs} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
