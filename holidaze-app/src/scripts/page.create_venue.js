import { showNetworkError, showMessageBox } from "./module.messagebox.js";
import { getCurrentUser } from "./module.user.js";

document.getElementById("createVenueForm").onsubmit = async function (event) {
    event.preventDefault();

    const user = getCurrentUser();
    if (!user || !user.venueManager) {
        showMessageBox("You are not authorized to create a venue.");
        return;
    }

    const formData = new FormData(event.target);
    const venueDetails = {
        name: formData.get("name"),
        description: formData.get("description"),
        price: parseFloat(formData.get("price")),
        maxGuests: parseInt(formData.get("maxGuests")),
        media: formData.get("media") ? formData.get("media").split(",").map(url => url.trim()) : [],
        meta: {
            wifi: formData.get("wifi") === "on",
            parking: formData.get("parking") === "on",
            breakfast: formData.get("breakfast") === "on",
            pets: formData.get("pets") === "on"
        },
        location: {
            city: formData.get("city"),
            country: formData.get("country")
        }
    };

    try {
        const response = await fetch(`https://api.noroff.dev/api/v1/holidaze/venues`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.accessToken}`
            },
            body: JSON.stringify(venueDetails)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors.join(", "));
        }

        showMessageBox("Venue created successfully!");
        location.href = "./feed.html";
    } catch (error) {
        showNetworkError(error.message);
        console.error("Error creating venue:", error);
    }
};
