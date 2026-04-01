const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Note: Ensure MongoDB is running before executing this script.
const MONGO_URI = 'mongodb://localhost:27017/mygym';

const User = require('./models/User');
const WorkoutPlan = require('./models/WorkoutPlan');
const DietPlan = require('./models/DietPlan');

async function migrateData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for Migration');

        // Clear existing data to prevent duplicates during testing
        await User.deleteMany({});
        await WorkoutPlan.deleteMany({});
        await DietPlan.deleteMany({});
        console.log('Cleared existing collections');

        // 1. Migrate Users
        console.log('--- Migrating Users ---');
        let adminUser = null;
        let trainerUser = null;

        if (fs.existsSync('./data_exports/users.json')) {
            const usersData = JSON.parse(fs.readFileSync('./data_exports/users.json', 'utf8'));
            for (const u of usersData) {
                // In a real scenario, you'd retain their PHP hashed password and handle validation
                // Or force a password reset. Here we just set a default for testing.
                const hashedPassword = await bcrypt.hash('password123', 10);

                const newUser = new User({
                    username: u.username || u.name,
                    email: u.email,
                    password: hashedPassword, // Defaulting pass
                    role: u.role || 'user',
                    createdAt: u.created_at ? new Date(u.created_at) : Date.now()
                });

                // Save and keep track for relations
                const saved = await newUser.save();
                if (saved.role === 'admin' && !adminUser) adminUser = saved;
                if (saved.role === 'trainer' && !trainerUser) trainerUser = saved;

                console.log(`Migrated user: ${saved.username}`);
            }
        } else {
            // Fallback: Create mock users if export file isn't found
            console.log('users.json not found. Creating mock users for testing...');
            const adminPass = await bcrypt.hash('admin123', 10);
            adminUser = new User({ username: 'superadmin', email: 'admin@mygym.com', password: adminPass, role: 'admin' });
            await adminUser.save();

            const trainerPass = await bcrypt.hash('trainer123', 10);
            trainerUser = new User({ username: 'johntrainer', email: 'john@mygym.com', password: trainerPass, role: 'trainer' });
            await trainerUser.save();
        }


        // 2. Migrate Workouts
        console.log('--- Migrating Workouts ---');
        if (fs.existsSync('./data_exports/workouts.json') && adminUser) {
            const workoutsData = JSON.parse(fs.readFileSync('./data_exports/workouts.json', 'utf8'));
            for (const w of workoutsData) {
                const newWorkout = new WorkoutPlan({
                    title: w.name || w.title,
                    description: w.description || 'Legacy workout plan',
                    category: 'Beginner', // Default mapping
                    exercises: [
                        { name: 'Pushups', sets: 3, reps: 15, rest: '60s' }, // Dummy data fallback
                        { name: 'Squats', sets: 4, reps: 12, rest: '90s' }
                    ],
                    createdBy: adminUser._id
                });
                await newWorkout.save();
                console.log(`Migrated workout: ${newWorkout.title}`);
            }
        } else if (adminUser) {
            console.log('workouts.json not found. Creating mock workout.');
            const newWorkout = new WorkoutPlan({
                title: 'Full Body Starter',
                description: 'A great starting point for beginners.',
                category: 'Beginner',
                exercises: [
                    { name: 'Pushups', sets: 3, reps: 10, rest: '60s' },
                    { name: 'Bodyweight Squats', sets: 3, reps: 15, rest: '60s' }
                ],
                createdBy: adminUser._id
            });
            await newWorkout.save();
        }


        // 3. Migrate Diets
        console.log('--- Migrating Diets ---');
        if (fs.existsSync('./data_exports/diets.json') && adminUser) {
            // Similar logic for diets
            const dietData = JSON.parse(fs.readFileSync('./data_exports/diets.json', 'utf8'));
            for (const d of dietData) {
                const newDiet = new DietPlan({
                    title: d.name || d.title,
                    description: d.description || 'Legacy diet plan',
                    category: 'Maintenance',
                    meals: [
                        { name: 'Breakfast', time: '8:00 AM', items: 'Oatmeal & Eggs' }
                    ],
                    createdBy: adminUser._id
                });
                await newDiet.save();
                console.log(`Migrated diet: ${newDiet.title}`);
            }
        } else if (trainerUser) {
            console.log('diets.json not found. Creating mock diet.');
            const newDiet = new DietPlan({
                title: 'Bulking Guide',
                description: 'High protein for building muscle.',
                category: 'Muscle Gain',
                meals: [
                    { name: 'Breakfast', time: '7:30 AM', items: '4 Eggs, Whole Wheat Toast, Avocado', calories: 600 },
                    { name: 'Lunch', time: '1:00 PM', items: 'Chicken Breast, Rice, Broccoli', calories: 750 }
                ],
                createdBy: trainerUser._id
            });
            await newDiet.save();
        }

        console.log('Migration Complete!');
        process.exit(0);
    } catch (err) {
        console.error('Migration Error:', err);
        process.exit(1);
    }
}

migrateData();
