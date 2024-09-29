import { showNetworkError } from "./module.messagebox.js";

/**
 * Saves the user data in session storage.
 * @param {Object} user The user data to be saved.
 */
export function saveUser(user) {
    sessionStorage.setItem("user", JSON.stringify(user));
}

/**
 * Signs the user in and returns true if the login was successful.
 * @param {string} email The user's email.
 * @param {string} password The user's password.
 * @returns {Promise}
 */
export async function login(email, password) {
    const response = await fetch(`https://api.noroff.dev/api/v1/holidaze/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        return showNetworkError(await response.json());
    }

    const userData = await response.json();
    console.log("Login response data:", userData);

    if (!userData.accessToken) {
        throw new Error("No access token received during login.");
    }

    saveUser(userData);
    console.log("User saved in session storage:", JSON.parse(sessionStorage.getItem("user")));

    location.href = "./feed";
}

/**
 * Registers a user with the given details.
 * @param {UserDetails & UserCredentials} details User details.
 * @returns {Promise}
 */
export async function register(details) {
    const response = await fetch(`https://api.noroff.dev/api/v1/holidaze/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details)
    });

    if (!response.ok) {
        return showNetworkError(await response.json());
    }

    const userData = await response.json();
    console.log("Register response data:", userData);

    await login(details.email, details.password);
}

/**
 * Gets the currently signed-in user. Redirects to login if not signed in.
 * @param {boolean} navigateToLogin If true, redirects to login if no user is signed in.
 * @returns {UserDetails} Details about the currently signed-in user.
 */
export function getCurrentUser(navigateToLogin = true) {
    const userJson = sessionStorage.getItem("user");

    if (!userJson && !navigateToLogin) {
        return null;
    }

    if (!userJson) {
        location.href = "./";
        throw new Error("Not signed in");
    }

    const user = JSON.parse(userJson);
    console.log("Retrieved user from session storage:", user);

    if (!user.accessToken) {
        throw new Error("No access token found in session storage.");
    }

    return user;
}

/**
 * Updates the user's avatar.
 * @param {string} newAvatarUrl The new URL of the user's avatar.
 * @returns {Promise<UserDetails>}
 */
export async function updateUserAvatar(newAvatarUrl) {
  const user = getCurrentUser(true);
  if (!user || !user.name) throw new Error("User not logged in or user name is missing");

  console.log("Current user data:", user);

  const response = await fetch(`https://api.noroff.dev/api/v1/holidaze/profiles/${user.name}/media`, {
      method: "PUT",
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.accessToken}`
      },
      body: JSON.stringify({ avatar: newAvatarUrl })
  });

  if (!response.ok) {
      console.log("Error response:", await response.json());
      throw await response.json();
  }

  const updatedUser = await response.json();

  updatedUser.accessToken = user.accessToken;
  
  saveUser(updatedUser);
  return updatedUser;
}

export function logout() {
    sessionStorage.removeItem("user");
    location.href = "./";
}
