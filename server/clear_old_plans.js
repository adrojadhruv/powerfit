require('dotenv').config();
const mongoose = require('mongoose');
const WorkoutPlan = require('./models/WorkoutPlan');
const DietPlan = require('./models/DietPlan');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/mygym';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Delete WorkoutPlans matching titles not starting with "AI Plan:"
        const wRes = await WorkoutPlan.deleteMany({ title: { $not: /^AI Plan:/ } });
        console.log(`Deleted ${wRes.deletedCount} old workout plans.`);

        // Delete DietPlans matching titles not starting with "AI Diet:"
        const dRes = await DietPlan.deleteMany({ title: { $not: /^AI Diet:/ } });
        console.log(`Deleted ${dRes.deletedCount} old diet plans.`);

        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
