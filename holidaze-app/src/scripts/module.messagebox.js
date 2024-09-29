/**
 * Displays a network error message to the user.
 * @param {Object} error The error object returned from the API.
 */
export function showNetworkError(error) {
  const message = error?.message || "An unknown error occurred. Please try again.";
  showMessageBox("Network Error", message);
  console.error("Network Error:", error);
}

/**
* Shows a message box with a title and details.
* @param {string} title The title of the message box.
* @param {string} details The details of the message.
*/
export function showMessageBox(message) {

    const messageBox = document.createElement('div');
    messageBox.className = 'modal fade';
    messageBox.id = 'messageBox';
    messageBox.tabIndex = -1;
    messageBox.setAttribute('role', 'dialog');
    messageBox.innerHTML = `
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Message</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(messageBox);

    const bootstrapModal = new bootstrap.Modal(messageBox);
    bootstrapModal.show();
}

