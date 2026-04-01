const axios = require('axios');

async function check() {
    try {
        const res = await axios.get('http://localhost:5000/api/workouts', {
            // we will just see what public or whatever it returns.
            // Oh wait, route requires auth.
        });
        console.log("Success");
    } catch (e) {
        console.error("Require auth");
    }
}
check();
