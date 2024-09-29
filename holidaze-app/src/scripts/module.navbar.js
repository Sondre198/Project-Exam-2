import { getCurrentUser, logout } from "./module.user.js";

export function setupNavbar() {
    const user = getCurrentUser(false);
    if (user) {
        const userNameElement = document.getElementById("user_name");
        const userAvatarElement = document.getElementById("user_avatar");

        if (userNameElement && userAvatarElement) {
            userNameElement.innerText = user.name;
            userAvatarElement.src = user.avatar;

            if (user.venueManager) {
                const createVenueBtn = document.getElementById("createVenueBtn");
                if (createVenueBtn) {
                    createVenueBtn.style.display = "block";
                    createVenueBtn.addEventListener("click", () => {
                        window.location.href = "./create_venue.html";
                    });
                }
            }
        }
    } else {
        const userNameElement = document.getElementById("user_name");
        const logoutButton = document.getElementById("btn-logout");

        if (userNameElement && logoutButton) {
            userNameElement.innerText = "Guest";
            logoutButton.innerText = "Login";
        }
    }

    const logoutButton = document.getElementById("btn-logout");
    if (logoutButton) {
        logoutButton.onclick = () => logout();
    }
}
