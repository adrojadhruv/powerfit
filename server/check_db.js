require('dotenv').config();
const mongoose = require('mongoose');
const WorkoutPlan = require('./models/WorkoutPlan');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/mygym';

mongoose.connect(MONGO_URI)
    .then(async () => {
        const plan = await WorkoutPlan.findOne({ "title": { $regex: /AI Plan/ } });
        console.dir(plan.exercises[0], { depth: null });
        mongoose.connection.close();
    });
