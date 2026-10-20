import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomeScreen from "./screens/HomeScreen";
import ProductScreen from "./screens/ProductScreen";
import Nav from "react-bootstrap/Nav";
import NavDropDown from "react-bootstrap/NavDropdown";
import Container from "react-bootstrap/Container";
import { LinkContainer } from "react-router-bootstrap";
import { useContext, useEffect, useState } from "react";
import { Store } from "./Store";
import CartScreen from "./screens/CartScreen";
import SigninScreen from "./screens/SigninScreen";
import ShippingAddressScreen from "./screens/ShippingAddressScreen";
import SignupScreen from "./screens/SignupScreen";
import PaymentMethodScreen from "./screens/PaymentMethodScreen";
import PlaceOrderScreen from "./screens/PlaceOrderScreen";
import OrderScreen from "./screens/OrderScreen";
import OrderHistoryScreen from "./screens/OrderHistoryScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { getError } from "./utils";
import axios from "axios";
import SearchBox from "./components/SearchBox";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import DashboardScreen from "./screens/DashboardScreen";
import EventListScreen from "./screens/EventListScreen";
import EventEditScreen from "./screens/EventEditScreen";
import OrderListScreen from "./screens/OrderListScreen";
import VendorListScreen from "./screens/VendorListScreen";
import VendorDetails from "./screens/VendorDetails";
import UserListScreen from "./screens/UserListScreen";
import UserEditScreen from "./screens/OrderEditScreen";
import FavouriteList from "./screens/FavouriteList";
import {
  FiShoppingCart, FiUser, FiBell as FiBellLine,
  FiMenu, FiLogOut, FiHeart, FiClock, FiSettings,
  FiCalendar, FiUsers, FiList, FiFileText, FiTrendingUp,
} from "react-icons/fi";
import SearchScreen from "./screens/SearchScreen";
import MessageUI from "./screens/MessageUI";
import BiddingScreen from "./screens/BiddingScreen";
import VendorRequestsScreen from "./screens/VendorRequestsScreen";
import AdminBidsScreen from "./screens/AdminBidsScreen";
import LandingScreen from "./screens/LandingScreen";

// ── Routes that should NOT show the app shell (navbar/sidebar/footer)
const SHELL_HIDDEN_PATHS = ["/"];

// ── AppShell: contains the navbar + sidebar + footer wrapping.
//    Must be inside BrowserRouter to use useLocation.
function AppShell() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;
  const location = useLocation();

  const isShellHidden = SHELL_HIDDEN_PATHS.includes(location.pathname);

  const signoutHandler = () => {
    ctxDispatch({ type: "USER_SIGNOUT" });
    localStorage.removeItem("userInfo");
    localStorage.removeItem("shippingAddress");
    localStorage.removeItem("paymentMethod");
    localStorage.removeItem("cartItems");
    window.location.href = "/";
  };

  // ── Full-page landing (no shell)
  if (isShellHidden) {
    return (
      <>
        <ToastContainer position="bottom-center" limit={1} />
        <Routes>
          <Route path="/" element={<LandingScreen />} />
        </Routes>
      </>
    );
  }

  // ── Normal app shell
  return (
    <div className="d-flex flex-column site-container">
      {" "}
      <ToastContainer position="bottom-center" limit={1} />
      <header className="app-navbar">
        <div className="app-navbar-inner">
          {/* Left: Brand */}
          <div className="app-nav-left">
            <LinkContainer to="/home">
              <a className="app-nav-brand" href="/home">
                <FiCalendar size={20} className="brand-icon" />
                EventOS
              </a>
            </LinkContainer>
          </div>

          {/* Center: Search */}
          <div className="app-nav-search">
            <SearchBox />
          </div>

          {/* Right: Actions */}
          <div className="app-nav-right">
            {userInfo && !userInfo.isAdmin && (
              <Link to="/cart" className="app-nav-icon-btn" title="Cart">
                <FiShoppingCart size={18} />
                {cart.cartItems.length > 0 && (
                  <span className="app-nav-badge">{cart.cartItems.length}</span>
                )}
              </Link>
            )}

            {/* Notifications */}
            <NavDropDown
              title={<span className="app-nav-icon-btn"><FiBellLine size={18} /></span>}
              id="notif-dropdown"
              className="app-nav-dropdown"
              align="end"
            >
              <NavDropDown.Item href="#action/3.1">Notification 1</NavDropDown.Item>
              <NavDropDown.Item href="#action/3.2">Notification 2</NavDropDown.Item>
              <NavDropDown.Divider />
              <NavDropDown.Item href="#action/3.3">See All Notifications</NavDropDown.Item>
            </NavDropDown>

            {userInfo ? (
              <NavDropDown
                title={
                  <span className="app-nav-user-btn">
                    <FiUser size={16} />
                    <span className="app-nav-username">{userInfo.name.split(" ")[0]}</span>
                  </span>
                }
                id="user-dropdown"
                className="app-nav-dropdown"
                align="end"
              >
                <LinkContainer to="/profile">
                  <NavDropDown.Item><FiUser size={14} /> &nbsp;Profile</NavDropDown.Item>
                </LinkContainer>
                <LinkContainer to="/orderhistory">
                  <NavDropDown.Item><FiClock size={14} /> &nbsp;Booking History</NavDropDown.Item>
                </LinkContainer>
                <LinkContainer to="/favouritelist">
                  <NavDropDown.Item><FiHeart size={14} /> &nbsp;Favourites</NavDropDown.Item>
                </LinkContainer>
                <NavDropDown.Divider />
                <Link className="dropdown-item text-danger" to="#signout" onClick={signoutHandler}>
                  <FiLogOut size={14} /> &nbsp;Sign Out
                </Link>
              </NavDropDown>
            ) : (
              <Link className="app-nav-signin-btn" to="/signin">
                Sign In
              </Link>
            )}

            {userInfo && userInfo.isAdmin && (
              <NavDropDown
                title={<span className="app-nav-admin-btn"><FiSettings size={15} /> Admin</span>}
                id="admin-dropdown"
                className="app-nav-dropdown"
                align="end"
              >
                <LinkContainer to="/admin/dashboard">
                  <NavDropDown.Item><FiTrendingUp size={14} /> &nbsp;Dashboard</NavDropDown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/events">
                  <NavDropDown.Item><FiCalendar size={14} /> &nbsp;Venues</NavDropDown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/orders">
                  <NavDropDown.Item><FiFileText size={14} /> &nbsp;Bookings</NavDropDown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/users">
                  <NavDropDown.Item><FiUsers size={14} /> &nbsp;Users</NavDropDown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/vendors">
                  <NavDropDown.Item><FiList size={14} /> &nbsp;Vendors</NavDropDown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/vendorrequests">
                  <NavDropDown.Item><FiList size={14} /> &nbsp;Vendor Requests</NavDropDown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/bids">
                  <NavDropDown.Item><FiTrendingUp size={14} /> &nbsp;Bids</NavDropDown.Item>
                </LinkContainer>
              </NavDropDown>
            )}
          </div>
        </div>
      </header>
      <main className="mainDiv">
        <Container className="mt-3">
          <Routes>
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/event/:slugs" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/signin" element={<SigninScreen />} />
            <Route path="/signup" element={<SignupScreen />} />
            <Route path="/favouritelist" element={<FavouriteList />} />
            <Route path="/messageUi" element={<MessageUI />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileScreen />
                </ProtectedRoute>
              }
            />
            <Route path="/:id/shipping" element={<ShippingAddressScreen />} />
            <Route path="/:id/payment" element={<PaymentMethodScreen />} />
            <Route path="/:id/bidding" element={<BiddingScreen />} />
            <Route path="/:id/placeorder" element={<PlaceOrderScreen />} />
            <Route
              path="/order/:id"
              element={
                <ProtectedRoute>
                  <OrderScreen />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/order/:eventid/:id"
              element={
                <ProtectedRoute>
                  <OrderScreen />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/:vendorID/vendorprofile"
              element={
                <AdminRoute>
                  <VendorDetails />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/vendors"
              element={
                <AdminRoute>
                  <VendorListScreen />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/events"
              element={
                <AdminRoute>
                  <EventListScreen />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/orderhistory"
              element={
                <ProtectedRoute>
                  <OrderHistoryScreen />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <DashboardScreen />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/event/:id"
              element={
                <AdminRoute>
                  <EventEditScreen />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <OrderListScreen />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UserListScreen />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/vendorrequests"
              element={
                <AdminRoute>
                  <VendorRequestsScreen />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/user/:id"
              element={
                <AdminRoute>
                  <UserEditScreen />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/bids"
              element={
                <AdminRoute>
                  <AdminBidsScreen />
                </AdminRoute>
              }
            ></Route>
          </Routes>
        </Container>
      </main>
      <footer className="footerClass">
        <div className="footerDiv">All Rights Reserved</div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
