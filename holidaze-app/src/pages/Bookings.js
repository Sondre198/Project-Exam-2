import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../scripts/module.user';
import { showNetworkError } from '../scripts/module.messagebox';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [isVenueManager, setIsVenueManager] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    setIsVenueManager(user.venueManager);
    fetchBookings(user);
  }, []);

  const fetchBookings = async (user) => {
    const accessToken = user.accessToken;
    const username = user.name;

    try {
      let bookings = [];
      if (user.venueManager) {

        const venuesResponse = await fetch(
          `https://api.noroff.dev/api/v1/holidaze/profiles/${username}/venues`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!venuesResponse.ok) {
          throw new Error('Failed to fetch managed venues.');
        }

        const venues = await venuesResponse.json();
        
        for (const venue of venues) {
          const bookingsResponse = await fetch(
            `https://api.noroff.dev/api/v1/holidaze/bookings?venueId=${venue.id}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (!bookingsResponse.ok) {
            throw new Error(`Failed to fetch bookings for venue ${venue.name}.`);
          }

          const venueBookings = await bookingsResponse.json();
          bookings = [...bookings, ...venueBookings.map(booking => ({ ...booking, venue }))];
        }
      } else {

        const response = await fetch(
          `https://api.noroff.dev/api/v1/holidaze/profiles/${username}/bookings?_venue=true`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch user bookings.');
        }

        bookings = await response.json();
      }

      setBookings(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error.message);
      setError(error.message);
      showNetworkError(error.message);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">My Upcoming Bookings</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div id="bookings-container">
        {bookings.length > 0 ? (
          <ul className="list-group">
            {bookings.map((booking, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-start">
                <div className="ms-2 me-auto">
                  <div className="fw-bold">Venue: {booking.venue?.name || 'Unknown Venue'}</div>
                  <p>Date From: {new Date(booking.dateFrom).toLocaleDateString()}</p>
                  <p>Date To: {new Date(booking.dateTo).toLocaleDateString()}</p>
                  <p>Guests: {booking.guests}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center">No bookings found.</p>
        )}
      </div>
    </div>
  );
}

export default Bookings;
