import { showMessageBox, showNetworkError } from "./module.messagebox.js";
import { getCurrentUser, saveUser, register } from "./module.user.js";

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) {
        console.error("Registration form not found.");
        return;
    }

    registerForm.onsubmit = async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const avatar = document.getElementById("avatar").value.trim();
        const isVenueManager = document.getElementById("registerAsManager").checked;

        if (!name || !email || !password) {
            console.error("Please fill out all required fields.");
            return;
        }

        const userDetails = {
            name,
            email,
            password,
            avatar: avatar || undefined,
            venueManager: isVenueManager,
        };

        try {
            const response = await register(userDetails);
            if (response.ok) {
                console.log("User registered successfully.");
                location.href = "./feed";
            } else {
                const errorData = await response.json();
                showMessageBox(`Error: ${errorData.message || 'Registration failed.'}`);
            }
        } catch (error) {
            console.error("Error during registration:", error);
            showMessageBox("An error occurred. Please try again.");
        }
    };
});

