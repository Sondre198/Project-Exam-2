import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { setupNavbar } from '../scripts/module.navbar';
import { getCurrentUser } from '../scripts/module.user';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

function Venue() {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const user = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {

    setupNavbar();


    const loadVenue = async () => {
      try {
        const venueResponse = await fetch(`https://api.noroff.dev/api/v1/holidaze/venues/${id}`);
        if (!venueResponse.ok) {
          throw new Error('Failed to load venue details.');
        }
        const venueData = await venueResponse.json();
        setVenue(venueData);


        const userVenues = await fetchUserVenues(user.name);
        const isOwner = userVenues.some(userVenue => userVenue.id === venueData.id);
        setIsOwner(isOwner);

        if (!isOwner) {
          document.getElementById("book-venue-btn").style.display = 'block';
          loadBookedDates(venueData.id);
        }
      } catch (error) {
        console.error('Error loading venue:', error.message);
      }
    };

    loadVenue();
  }, [id]);

  const fetchUserVenues = async (username) => {
    try {
      const response = await fetch(`https://api.noroff.dev/api/v1/holidaze/venues?owner=${username}`, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user venues.');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user venues:', error.message);
      return [];
    }
  };

  const loadBookedDates = async (venueId) => {
    try {
      const response = await fetch(`https://api.noroff.dev/api/v1/holidaze/bookings?venueId=${venueId}`, {
        headers: { "Authorization": `Bearer ${user.accessToken}` }
      });
      const bookings = await response.json();
      const bookedRanges = bookings.map(booking => ({
        from: booking.dateFrom,
        to: booking.dateTo
      }));
      setBookedDates(bookedRanges);
      renderBookedDatesCalendar(bookedRanges);
    } catch (error) {
      console.error('Error loading booked dates:', error.message);
    }
  };

  const renderBookedDatesCalendar = (bookedRanges) => {
    flatpickr("#calendar", {
      mode: "range",
      inline: true,
      minDate: "today",
      disable: bookedRanges.map(range => ({ from: range.from, to: range.to })),
      dateFormat: "Y-m-d",
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
          const selectedRange = {
            from: selectedDates[0].toISOString().split('T')[0],
            to: selectedDates[1].toISOString().split('T')[0]
          };

          if (!areDatesAvailable(selectedRange, bookedRanges)) {
            alert("The selected dates are not available for booking. Please choose a different range.");
            flatpickr.clear();
          }
        }
      }
    });
  };

  const areDatesAvailable = (selectedRange, bookedRanges) => {
    return !bookedRanges.some(booked => {
      const bookedFrom = new Date(booked.from);
      const bookedTo = new Date(booked.to);
      const selectedFrom = new Date(selectedRange.from);
      const selectedTo = new Date(selectedRange.to);

      return (
        (selectedFrom >= bookedFrom && selectedFrom <= bookedTo) ||
        (selectedTo >= bookedFrom && selectedTo <= bookedTo) ||
        (selectedFrom <= bookedFrom && selectedTo >= bookedTo)
      );
    });
  };

  const submitBookingForm = async (event) => {
    event.preventDefault();
    const startDate = document.getElementById("booking-start-date").value;
    const endDate = document.getElementById("booking-end-date").value;

    try {
      const response = await fetch(`https://api.noroff.dev/api/v1/holidaze/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({
          dateFrom: startDate,
          dateTo: endDate,
          venueId: id,
          guests: 1
        })
      });

      if (!response.ok) throw new Error('Failed to create booking.');
      alert('Booking confirmed!');
      loadBookedDates(id);
    } catch (error) {
      console.error('Error creating booking:', error.message);
      alert('Error creating booking.');
    }
  };

  return (
    <div>

      <nav className="navbar border-bottom">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <img src="" alt="User Avatar" id="user_avatar" className="rounded-circle" style={{ width: '50px', height: '50px' }} />
            <span className="navbar-brand" id="user_name"></span>
            {isOwner && (
              <button id="createVenueBtn" className="btn btn-primary" style={{ display: 'block' }}>Create Venue</button>
            )}
            <button id="viewBookingsBtn" className="btn btn-secondary">View Bookings</button>
          </div>
          <div className="search-group">
            <button className="btn btn-secondary" id="btn-logout">Log out</button>
          </div>
        </div>
      </nav>

      <div className="container mt-5 bg-white p-4 shadow-lg rounded" style={{ maxWidth: '800px' }}>
        <div className="container mt-5 d-flex justify-content-center mb-4" id="media" style={{ maxHeight: '300px', overflow: 'hidden' }}>
          {venue && venue.media && venue.media.map((url, index) => (
            <img key={index} src={url} className="img-thumbnail" style={{ width: '200px' }} alt="Venue" />
          ))}
        </div>

        <h1 className="mb-1">{venue?.name}</h1>
        <p>{venue?.description}</p>

        <div className="row row-cols-2 g-3">
          <div className="col"><p><strong>Price:</strong> ${venue?.price}</p></div>
          <div className="col"><p><strong>Max Guests:</strong> {venue?.maxGuests}</p></div>
          <div className="col"><p><strong>WiFi:</strong> {venue?.meta?.wifi ? 'Yes' : 'No'}</p></div>
          <div className="col"><p><strong>Parking:</strong> {venue?.meta?.parking ? 'Yes' : 'No'}</p></div>
          <div className="col"><p><strong>Breakfast:</strong> {venue?.meta?.breakfast ? 'Yes' : 'No'}</p></div>
          <div className="col"><p><strong>Pets:</strong> {venue?.meta?.pets ? 'Yes' : 'No'}</p></div>
          <div className="col"><p><strong>Location:</strong> {venue?.location?.city}, {venue?.location?.country}</p></div>
        </div>

        <div className="booking-section mt-4 d-flex justify-content-center align-items-center flex-column">
          <button id="book-venue-btn" className="btn btn-primary mb-3" onClick={() => setShowBookingForm(true)}>
            Book this venue
          </button>

          <div id="calendar" className="mt-4"></div>

          {showBookingForm && (
            <div id="booking-form" className="mt-4">
              <h3>Book Venue</h3>
              <form id="create-booking-form" onSubmit={submitBookingForm}>
                <div className="mb-3">
                  <label htmlFor="booking-start-date" className="form-label">Start Date</label>
                  <input type="date" id="booking-start-date" name="startDate" className="form-control" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="booking-end-date" className="form-label">End Date</label>
                  <input type="date" id="booking-end-date" name="endDate" className="form-control" required />
                </div>
                <button type="submit" className="btn btn-success">Confirm Booking</button>
              </form>
            </div>
          )}
        </div>

        <button className="btn btn-secondary mt-4" onClick={() => navigate('/feed')}>
          Back to Venues
        </button>
      </div>
    </div>
  );
}

export default Venue;
