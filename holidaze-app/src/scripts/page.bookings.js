import { showNetworkError } from "./module.messagebox.js";

const user = JSON.parse(sessionStorage.getItem('user'));
const username = user.name;
const accessToken = user.accessToken;
const isVenueManager = user.venueManager;

async function fetchBookings() {
  if (!accessToken) {
    console.error("User is not authenticated.");
    return;
  }

  try {
    let bookings = [];

    if (isVenueManager) {

      const venuesResponse = await fetch(
        `https://api.noroff.dev/api/v1/holidaze/profiles/${username}/venues`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!venuesResponse.ok) {
        throw new Error("Failed to fetch managed venues.");
      }

      const venues = await venuesResponse.json();

      for (const venue of venues) {
        const bookingsResponse = await fetch(
          `https://api.noroff.dev/api/v1/holidaze/bookings?_venue=true&venueId=${venue.id}`,
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
        bookings = [...bookings, ...venueBookings];
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
        throw new Error("Failed to fetch user bookings.");
      }

      bookings = await response.json();
    }

    await displayBookings(bookings);
  } catch (error) {
    showNetworkError(error.message);
  }
}

async function displayBookings(bookings) {
    const bookingsContainer = document.getElementById("bookings-container");
    bookingsContainer.innerHTML = "";

    const bookingList = document.createElement("ul");
    bookingList.className = "list-group";
  
    for (const booking of bookings) {
      try {
        const venueName = booking.venue?.name || "Unknown Venue";

        const listItem = document.createElement("li");
        listItem.className = "list-group-item d-flex justify-content-between align-items-start";
        listItem.innerHTML = `
          <div class="ms-2 me-auto">
            <div class="fw-bold">Venue: ${venueName}</div>
            <p>Date From: ${new Date(booking.dateFrom).toLocaleDateString()}</p>
            <p>Date To: ${new Date(booking.dateTo).toLocaleDateString()}</p>
            <p>Guests: ${booking.guests}</p>
          </div>
        `;

        bookingList.appendChild(listItem);
      } catch (error) {
        console.error("Error displaying booking:", error.message);
      }
    }

    bookingsContainer.appendChild(bookingList);
}  

document.addEventListener("DOMContentLoaded", fetchBookings);
