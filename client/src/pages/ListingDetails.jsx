import { useEffect, useState } from "react";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import StripeCheckout from "react-stripe-checkout";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [reviews, setReviews] = useState([]);

  const { listingId } = useParams();
  const [listing, setListing] = useState(null);

  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const getListingDetails = async () => {
    try {
      const response = await fetch(
        `https://dream-nest.onrender.com/properties/${listingId}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      setListing(data);
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listing Details Failed", err.message);
    }
  };

  useEffect(() => {
    getListingDetails();
  }, []);

  const handleReviewChange = (event) => {
    setUserReview(event.target.value);
  };

  const handleRatingChange = (event) => {
    setUserRating(parseInt(event.target.value));
  };

  const handleSubmitReview = async () => {
    try {
      if (!userReview || userRating === 0) {
        alert("Please provide both review and rating.");
        return;
      }

      const newReview = {
        id: reviews.length + 1,
        user: "You", // You can replace this with the actual user's name
        comment: userReview,
        rating: userRating,
      };

      setReviews([...reviews, newReview]);

      setUserReview("");
      setUserRating(0);

      // You can send the review data to the backend for storage or processing here
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  /* BOOKING CALENDAR */
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleSelect = (ranges) => {
    const selectedStartDate = ranges.selection.startDate;
    const today = new Date();

    if (selectedStartDate < today) {
      // Alert the user that they cannot book for past dates
      alert("Please select a future date for booking.");
    } else {
      // Update the selected date range when user selects a valid future date
      setDateRange([ranges.selection]);
    }
  };

  const start = new Date(dateRange[0].startDate);
  const end = new Date(dateRange[0].endDate);
  const dayCount = Math.round(end - start) / (1000 * 60 * 60 * 24); // Calculate the difference in day unit

  /* SUBMIT BOOKING */
  const customerId = useSelector((state) => state?.user?._id);

  const navigate = useNavigate();

  //  for payment button
  const onToken = (token) => {
    console.log(token);
    setPaymentCompleted(true);
  };

  const handleSubmit = async () => {
    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing.creator._id,
        startDate: dateRange[0].startDate.toDateString(),
        endDate: dateRange[0].endDate.toDateString(),
        totalPrice: listing.price * dayCount,
      };
      const response = await fetch("https://dream-nest.onrender.com/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingForm),
      });

      if (response.ok) {
        navigate(`/${customerId}/trips`);
      }
    } catch (err) {
      console.log("Submit Booking Failed", err.message);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />

      <div className="listing-details">
        <div className="title">
          <h1>{listing.title}</h1>
          <div></div>
        </div>

        <div className="photos">
          {listing.listingPhotoPaths?.map((item) => (
            <img
              src={`https://dream-nest.onrender.com/${item.replace("public", "")}`}
              alt="listing photo"
            />
          ))}
        </div>

        <h2>
          {listing.type} in {listing.city}, {listing.province},{" "}
          {listing.country}
        </h2>

        <p>
          {listing.guestCount} guests - {listing.bedroomCount} bedroom(s) -{" "}
          {listing.bedCount} bed(s) - {listing.bathroomCount} bathroom(s)
        </p>
        <hr />

        <div className="profile">
          <img
            src={`https://dream-nest.onrender.com/${listing.creator.profileImagePath.replace(
              "public",
              ""
            )}`}
          />

          <h3>
            Hosted by {listing.creator.firstName} {listing.creator.lastName}
          </h3>
        </div>
        <hr />

        <h3>Description</h3>
        <p>{listing.description}</p>
        <hr />

        <h3>{listing.highlight}</h3>
        <p>{listing.highlightDesc}</p>
        <hr />

        <div className="booking">
          <div>
            <h2>What this place offers?</h2>
            <div className="amenities">
              {listing.amenities[0].split(",").map((item, index) => (
                <div className="facility" key={index}>
                  <div className="facility_icon">
                    {
                      facilities.find((facility) => facility.name === item)
                        ?.icon
                    }
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2>How long do you want to stay?</h2>
            <div className="date-range-calendar">
              <DateRange ranges={dateRange} onChange={handleSelect} />
              {dayCount > 1 ? (
                <h2>
                  ₹{listing.price} x {dayCount} nights
                </h2>
              ) : (
                <h2>
                  ₹{listing.price} x {dayCount} night
                </h2>
              )}

              <h2>Total price: ₹{listing.price * dayCount}</h2>
              <p>Start Date: {dateRange[0].startDate.toDateString()}</p>
              <p>End Date: {dateRange[0].endDate.toDateString()}</p>

              {/* publishable api key for payment process */}
              <div className="pay_btn">
                <StripeCheckout
                  token={onToken}
                  name="Payment"
                  dollar="American dollar"
                  amount={listing.price * dayCount * 100}
                  stripeKey="pk_test_51OpqqFSBzKYeZJJOwl3Rhr9O2Jssm5c9Lbm20s1skmQka0a6keQHpZKJGrfWZi1KnmlwwWh3ZaKIIJzbSxRe60ie00nIsIcJIc"
                />
              </div>
              
              {/* // Enable the button only if payment is completed */}
              <button className="button" type="submit" onClick={handleSubmit} disabled={!paymentCompleted} >
                BOOK
              </button>
            </div>
          </div>
        </div>

        {/* Dummy Reviews Section */}
        <div className="reviews">
          <h2>Reviews</h2>
          <ul>
            {reviews.map((review) => (
              <li key={review.id}>
                <p><strong>{review.user}:</strong> {review.comment}</p>
                <p>Rating: {review.rating}/5</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Add Your Review Section */}
        <div className="add-review">
        <h3>Add Your Review</h3>
        <textarea
          placeholder="Write your review..."
          value={userReview}
          onChange={(e) => setUserReview(e.target.value)}
        ></textarea>
        <select
          value={userRating}
          onChange={(e) => setUserRating(parseInt(e.target.value))}
        >
          <option value="0">Select Rating</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <button onClick={handleSubmitReview}>Submit Review</button>
      </div>
      </div>
      <Footer />
    </>
  );
};

export default ListingDetails;

