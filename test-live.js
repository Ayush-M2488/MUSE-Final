const axios = require('axios');

async function test() {
    try {
        // We need a valid token to call the admin/teacher API, but we don't have one.
        // Wait, I can't hit the live API without a JWT token!
        console.log("No token available");
    } catch (e) {
        console.log(e.response ? e.response.data : e.message);
    }
}
test();
