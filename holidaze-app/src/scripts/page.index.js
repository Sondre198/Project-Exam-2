import { login } from "./module.user.js";
import { getCurrentUser } from "./module.user.js";

const user = getCurrentUser(false);
if (user) location.href = "./feed";

document.querySelector("form").onsubmit = async event => {

    event.preventDefault();

    await login(
        document.getElementById("email").value, 
        document.getElementById("password").value
    );
};
