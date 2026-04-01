require('dotenv').config();
const mongoose = require('mongoose');
const WorkoutPlan = require('./models/WorkoutPlan');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/mygym';

mongoose.connect(MONGO_URI)
    .then(async () => {
        try {
            const plans = await WorkoutPlan.find();
            console.log(`Total plans: ${plans.length}`);
            if (plans.length > 0) {
                console.log(JSON.stringify(plans[plans.length - 1].exercises, null, 2));
            }
        } catch (e) {
            console.error(e);
        }
        mongoose.connection.close();
    });
