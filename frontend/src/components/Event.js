import { Link } from "react-router-dom";
import { useContext, useReducer } from "react";
import axios from "axios";
import { Store } from "../Store";
import { toast } from "react-toastify";
import Rating from "./Rating";
import {
  FiShoppingCart, FiHeart, FiAlertCircle, FiMapPin,
} from "react-icons/fi";
import "./Event.css";

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_REQUEST": return { ...state, loading: true };
    case "ADD_SUCCESS": return { ...state, loading: false };
    case "ADD_FAIL":    return { ...state, loading: false };
    default:            return state;
  }
};

function Product(props) {
  const [{ loading }, dispatch] = useReducer(reducer, { loading: false, error: "" });
  const { event } = props;

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart: { cartItems }, userInfo } = state;

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === event._id);
    if (existItem) {
      toast.error("This event is already in your cart");
      return;
    }
    ctxDispatch({ type: "CART_ADD_ITEM", payload: { ...item } });
    toast.success("Added to cart!");
  };

  const addToFavouriteHandler = async (item) => {
    try {
      dispatch({ type: "ADD_REQUEST" });
      await axios.post(
        `/api/users/${userInfo._id}/favorites`,
        { item },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      toast.success("Saved to favourites!");
      dispatch({ type: "ADD_SUCCESS" });
    } catch (err) {
      toast.error(err?.response?.data || "Failed to add to favourites");
      dispatch({ type: "ADD_FAIL" });
    }
  };

  return (
    <div className={`event-card${event.suspended ? " event-card--suspended" : ""}`}>
      {/* ── Image ── */}
      <Link to={`/event/${event.slugs}`} className="event-card__img-link">
        <img src={event.image} alt={event.title} className="event-card__img" />
        {event.suspended && (
          <div className="event-card__suspended-badge">
            <FiAlertCircle size={13} /> Unavailable
          </div>
        )}
        <div className="event-card__img-overlay" />
      </Link>

      {/* ── Body ── */}
      <div className="event-card__body">
        <Link to={`/event/${event.slugs}`} className="event-card__title-link">
          <h3 className="event-card__title">{event.title}</h3>
        </Link>

        {event.location && (
          <div className="event-card__location">
            <FiMapPin size={12} />
            <span>{event.location}</span>
          </div>
        )}

        <div className="event-card__rating">
          <Rating rating={event.rating} numReviews={event.numberOfReviews} />
        </div>

        <div className="event-card__footer">
          <div className="event-card__price">
            <span className="price-currency">PKR</span>
            <span className="price-value">{event.price?.toLocaleString()}</span>
          </div>

          <div className="event-card__actions">
            {event.suspended ? (
              <button className="btn-event btn-event--disabled" disabled>
                <FiAlertCircle size={14} /> Unavailable
              </button>
            ) : (
              <button
                className="btn-event btn-event--cart"
                onClick={() => addToCartHandler(event)}
              >
                <FiShoppingCart size={14} /> Add to Cart
              </button>
            )}
            <button
              className="btn-event btn-event--fav"
              onClick={() => addToFavouriteHandler(event)}
              title="Save to favourites"
            >
              <FiHeart size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
