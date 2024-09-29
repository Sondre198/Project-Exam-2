import { showMessageBox, showNetworkError } from "./module.messagebox.js";
import { getCurrentUser } from "./module.user.js";

const user = getCurrentUser();

// Function to fetch all venues created by the current user
async function fetchUserVenues(username) {
    try {
        const options = {
            headers: {
                "Authorization": `Bearer ${user.accessToken}`,
            },
        };
        const response = await fetch(`https://api.noroff.dev/api/v1/holidaze/profiles/${username}/venues`, options);
        if (!response.ok) {
            throw new Error("Failed to fetch user venues.");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching user venues:", error);
        return [];
    }
}

async function loadVenue() {
    const venueId = new URLSearchParams(window.location.search).get("id");
    if (!venueId) {
        showNetworkError("Venue ID is missing.");
        return;
    }

    try {
        const venueResponse = await fetch(`https://api.noroff.dev/api/v1/holidaze/venues/${venueId}`);
        if (!venueResponse.ok) {
            throw new Error("Failed to load venue details.");
        }
        const venue = await venueResponse.json();

        document.getElementById("venue-name").innerText = venue.name;
        document.getElementById("venue-description").innerText = venue.description;
        document.getElementById("venue-price").innerText = `$${venue.price}`;
        document.getElementById("venue-max-guests").innerText = venue.maxGuests;
        document.getElementById("venue-rating").innerText = venue.rating;
        document.getElementById("venue-wifi").innerText = venue.meta.wifi ? 'Yes' : 'No';
        document.getElementById("venue-parking").innerText = venue.meta.parking ? 'Yes' : 'No';
        document.getElementById("venue-breakfast").innerText = venue.meta.breakfast ? 'Yes' : 'No';
        document.getElementById("venue-pets").innerText = venue.meta.pets ? 'Yes' : 'No';
        document.getElementById("venue-location").innerText = `${venue.location.city}, ${venue.location.country}`;

        const mediaContainer = document.getElementById("media");
        mediaContainer.innerHTML = '';
        if (venue.media && venue.media.length > 0) {
            venue.media.forEach((mediaUrl) => {
                const img = document.createElement("img");
                img.src = mediaUrl;
                img.classList.add("img-thumbnail");
                img.style.width = "200px";
                mediaContainer.appendChild(img);
            });
        }

        const userVenues = await fetchUserVenues(user.name);
        const isOwner = userVenues.some(userVenue => userVenue.id === venue.id);

        if (isOwner) {
            document.getElementById("edit-delete-buttons").style.display = 'block';
            document.getElementById("edit-venue").addEventListener("click", () => openEditForm(venue));
            document.getElementById("delete-venue").addEventListener("click", () => deleteVenue(venueId));
        }

        if (!user.venueManager) {
            document.getElementById("book-venue-btn").style.display = 'block';
            document.getElementById("book-venue-btn").addEventListener("click", showBookingForm);
            await loadBookedDates();
        }

    } catch (error) {
        console.error("Error loading venue:", error);
        showNetworkError("Failed to load venue details.");
    }
}

function openEditForm(venue) {

    document.getElementById("edit-name").value = venue.name;
    document.getElementById("edit-description").value = venue.description;
    document.getElementById("edit-price").value = venue.price;
    document.getElementById("edit-max-guests").value = venue.maxGuests;
    document.getElementById("edit-media").value = venue.media.join(", ");
    document.getElementById("edit-wifi").checked = venue.meta.wifi;
    document.getElementById("edit-parking").checked = venue.meta.parking;
    document.getElementById("edit-breakfast").checked = venue.meta.breakfast;
    document.getElementById("edit-pets").checked = venue.meta.pets;
    document.getElementById("edit-city").value = venue.location.city;
    document.getElementById("edit-country").value = venue.location.country;

    document.getElementById("edit-modal").style.display = "block";
}

function showBookingForm() {
    document.getElementById("booking-form").style.display = "block";
}

function areDatesAvailable(selectedRange, bookedRanges) {
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
}

function renderBookedDatesCalendar(bookedDates) {
    const calendarElement = document.getElementById("booked-dates-calendar");
    const bookedRanges = bookedDates.map(booking => ({
        from: booking.dateFrom,
        to: booking.dateTo
    }));

    flatpickr(calendarElement, {
        mode: "range",
        inline: true,
        minDate: "today",
        disable: bookedRanges,
        dateFormat: "Y-m-d",
        onChange: (selectedDates) => {
            if (selectedDates.length === 2) {
                const selectedRange = {
                    from: selectedDates[0].toISOString().split('T')[0],
                    to: selectedDates[1].toISOString().split('T')[0]
                };

                if (!areDatesAvailable(selectedRange, bookedRanges)) {
                    alert("The selected dates are not available for booking. Please choose a different range.");
                    calendarElement._flatpickr.clear();
                }
            }
        }
    });
}

async function loadBookedDates(venueId) {
    try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const accessToken = user?.accessToken;

        if (!accessToken) {
            throw new Error("User is not authenticated");
        }

        const options = {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        };

        const response = await fetch(`https://api.noroff.dev/api/v1/holidaze/bookings?venueId=${venueId}`, options);

        if (!response.ok) {
            throw new Error("Failed to fetch booked dates.");
        }

        const bookings = await response.json();
        const bookedDates = bookings.map(booking => {
            const date = new Date(booking.dateFrom);
            return date.toISOString().split('T')[0];
        });

        initializeCalendar(bookedDates);
    } catch (error) {
        showNetworkError(error.message);
    }
}

function initializeCalendar(bookedDates) {
    flatpickr("#calendar", {
        inline: true,
        enable: [
            function (date) {

                return !bookedDates.includes(date.toISOString().split('T')[0]);
            }
        ],
        disable: bookedDates.map(date => new Date(date)),
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadBookedDates();
});

async function submitEditForm(event) {
    event.preventDefault();

    const venueId = new URLSearchParams(window.location.search).get("id");
    const formData = new FormData(event.target);

    const updatedVenue = {
        name: formData.get("edit-name"),
        description: formData.get("edit-description"),
        price: parseFloat(formData.get("edit-price")),
        maxGuests: parseInt(formData.get("edit-max-guests")),
        media: formData.get("edit-media").split(",").map(url => url.trim()),
        meta: {
            wifi: formData.get("edit-wifi") === "on",
            parking: formData.get("edit-parking") === "on",
            breakfast: formData.get("edit-breakfast") === "on",
            pets: formData.get("edit-pets") === "on",
        },
        location: {
            city: formData.get("edit-city"),
            country: formData.get("edit-country"),
        },
    };

    try {
        const response = await fetch(`https://api.noroff.dev/api/v1/holidaze/venues/${venueId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.accessToken}`,
            },
            body: JSON.stringify(updatedVenue),
        });

        if (!response.ok) {
            throw new Error("Failed to update venue.");
        }

        alert("Venue updated successfully.");
        location.reload();
    } catch (error) {
        showNetworkError("Error updating venue: " + error.message);
        console.error("Error updating venue:", error);
    }
}

document.getElementById("create-booking-form").onsubmit = async function (event) {
    event.preventDefault();
    const startDate = document.getElementById("booking-start-date").value;
    const endDate = document.getElementById("booking-end-date").value;

    try {
        const venueId = new URLSearchParams(window.location.search).get("id");
        const response = await fetch(`https://api.noroff.dev/api/v1/holidaze/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.accessToken}`
            },
            body: JSON.stringify({
                dateFrom: startDate,
                dateTo: endDate,
                venueId: venueId,
                guests: 1
            })
        });

        if (!response.ok) throw new Error('Failed to create booking.');
        showMessageBox('Booking confirmed!');
        await loadBookedDates();
    } catch (error) {
        showNetworkError(error.message);
        console.error("Error creating booking:", error);
    }
};

async function deleteVenue(venueId) {
    if (!confirm("Are you sure you want to delete this venue?")) return;

    try {
        const response = await fetch(`https://api.noroff.dev/api/v1/holidaze/venues/${venueId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${user.accessToken}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to delete venue.");
        }
        alert("Venue deleted successfully.");
        window.location.href = "./feed.html";
    } catch (error) {
        showNetworkError("Error deleting venue: " + error.message);
        console.error("Error deleting venue:", error);
    }
}

document.getElementById("edit-form").addEventListener("submit", submitEditForm);
document.addEventListener("DOMContentLoaded", loadVenue);
