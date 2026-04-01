require('dotenv').config();
const mongoose = require('mongoose');
const WorkoutPlan = require('./models/WorkoutPlan');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/mygym';

mongoose.connect(MONGO_URI)
    .then(async () => {
        try {
            const plan = await WorkoutPlan.findOne({ "title": { $regex: /AI Plan/ } });
            console.log(JSON.stringify(plan.exercises[0], null, 2));
        } catch (e) {
            console.error(e);
        }
        mongoose.connection.close();
    });
