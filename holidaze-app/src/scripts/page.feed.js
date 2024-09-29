import { showMessageBox, showNetworkError } from "./module.messagebox.js";
import { getCurrentUser, logout, updateUserAvatar } from "./module.user.js";

const user = getCurrentUser(false);

document.addEventListener("DOMContentLoaded", function () {
    if (user) {
        document.getElementById("user_name").innerText = user.name;
        const userAvatar = document.getElementById("user_avatar");
        userAvatar.src = user.avatar;
        console.log("Setting user avatar src to:", user.avatar);

        if (user.venueManager) {
            const createVenueBtn = document.getElementById("createVenueBtn");
            if (createVenueBtn) {
                createVenueBtn.style.display = "block";
                createVenueBtn.addEventListener("click", () => {
                    window.location.href = "./create_venue.html";
                });
            } else {
                console.error("Create Venue button not found.");
            }
        }
    } else {
        document.getElementById("user_name").innerText = "Guest";
        document.getElementById("btn-logout").innerText = "Login";
    }

    document.getElementById("btn-logout").onclick = () => logout();

    const btnSearch = document.getElementById("btn-search");
    if (btnSearch) {
        btnSearch.addEventListener('click', () => {
            const searchQuery = document.getElementById("searchInput").value.toLowerCase();
            loadVenues(searchQuery);
        });
    } else {
        console.error("Search button not found");
    }

    loadVenues();
});

function buildFromTemplate(templateId, modifyBuilder) {
    const template = document.getElementById(templateId);
    if (!template) {
        console.error(`Template with ID "${templateId}" not found.`);
        return null;
    }

    const clone = template.content.cloneNode(true);
    const builder = {
        element: clone,
        withText(selector, text) {
            const el = clone.querySelector(selector);
            if (el) el.textContent = text;
            return this;
        },
        withAttribute(selector, attribute, value) {
            const el = clone.querySelector(selector);
            if (el) el.setAttribute(attribute, value);
            return this;
        },
    };

    return modifyBuilder(builder).element;
}

async function loadVenues(searchQuery = "") {
    const venuesContainer = document.getElementById("venues");
    if (!venuesContainer) {
        console.error("Venues container not found in the document.");
        return;
    }

    venuesContainer.innerHTML = "";

    try {
        const venues = await fetchVenues();

        if (!Array.isArray(venues)) {
            throw new Error("Expected venues to be an array.");
        }

        const filteredVenues = venues.filter(
            (venue) =>
                venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                venue.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filteredVenues.length === 0) {
            venuesContainer.innerHTML =
                '<p class="text-center mt-4">No venues match your search.</p>';
            return;
        }

        filteredVenues.forEach((venue) => {
            const venueElement = buildFromTemplate("venue-template", (builder) => {
                builder
                    .withText(".card-title", venue.name)
                    .withText(".card-text", venue.description)
                    .withText(".venue-price", `$${venue.price}`)
                    .withText(".venue-max-guests", venue.maxGuests)
                    .withText(".venue-rating", venue.rating)
                    .withText(".venue-wifi", venue.meta.wifi ? "Yes" : "No")
                    .withText(".venue-parking", venue.meta.parking ? "Yes" : "No")
                    .withText(".venue-breakfast", venue.meta.breakfast ? "Yes" : "No")
                    .withText(".venue-pets", venue.meta.pets ? "Yes" : "No")
                    .withText(".venue-location", `${venue.location.city}, ${venue.location.country}`)
                    .withAttribute(
                        ".card-img-top",
                        "src",
                        venue.media.length > 0 ? venue.media[0] : "https://via.placeholder.com/150"
                    )
                    .withAttribute(
                        ".card-img-top",
                        "alt",
                        venue.media.length > 0 ? "Venue Image" : "No image available"
                    );

                builder.element.querySelector(".card").addEventListener("click", () => {
                    window.location.href = `venue.html?id=${venue.id}`;
                });

                return builder;
            });
            venuesContainer.appendChild(venueElement);
        });
    } catch (error) {
        showNetworkError(error.message);
        console.error("Error loading venues:", error);
    }
}

const fetchVenues = async () => {
    try {
        const response = await fetch(`https://api.noroff.dev/api/v1/holidaze/venues`);
        if (!response.ok) {
            throw new Error(`Failed to fetch venues: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched venues:", data);

        if (!Array.isArray(data)) {
            throw new Error("Expected venues to be an array.");
        }

        return data;
    } catch (error) {
        console.error("Error fetching venues:", error);
        showNetworkError("An error occurred while fetching venues.");
        return [];
    }
};
