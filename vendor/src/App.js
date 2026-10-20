import {
  Route,
  Routes,
} from "react-router-dom";
import SignUp from "./screens/SignUp";
import SignIn from "./screens/SignIn";
import Home from "./screens/Home";
import AddEvent from "./screens/AddEvent";
import MessagePlatform from "./screens/MessagePlatform";
import SpecialArrangements from "./screens/SpecialArrangements";
import Bookings from "./screens/Bookings";
import ViewEvent from "./screens/ViewEvent";
import BookingDetail from "./screens/BookingDetails";
import VendorVerification from "./screens/VendorVerification";
import Navbar from "./components/Navbar";
import ViewBids from "./screens/ViewBids";
import EditEvent from "./screens/EditEvent";
import ViewSpecialArrangements from "./screens/ViewSpecialArrangements";
function App() {
  return (
    <div className="App">
      <Navbar />

      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/addEvent" element={<AddEvent />} />
        <Route path="/bookingDetail" element={<BookingDetail />} />
        <Route
          path="/specialArrangements/:id"
          element={<SpecialArrangements />}
        />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/MessagePlatform" element={<MessagePlatform />} />
        <Route path="/viewEvent/:eventId" element={<ViewEvent />} />
        <Route path="/vendorverification" element={<VendorVerification />} />
        <Route path="/viewBids" element={<ViewBids />} />
        <Route path="/editEvent" element={<EditEvent />} />
        <Route
          path="viewArrangements/:id"
          element={<ViewSpecialArrangements />}
        />
      </Routes>
    </div>
  );
}

export default App;
