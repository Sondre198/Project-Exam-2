/**
 * Gets the value of a URL parameter.
 * @param {string} name Name of the URL parameter
 * @returns {string | null} Value of the URL parameter or null if not found
 */
export function getUrlParameter(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}
