require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const WorkoutPlan = require('./models/WorkoutPlan');
const DietPlan = require('./models/DietPlan');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/mygym';

const generatePremiumData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        let admin = await User.findOne({ username: 'OfficialPowerFit' });
        if (!admin) {
            admin = new User({
                username: 'OfficialPowerFit',
                email: 'admin@powerfit.com',
                password: 'password123',
                role: 'admin',
                gender: 'male',
                age: 30
            });
            await admin.save();
        }

        // ==========================================
        // WORKOUT PLANS WITH ANIMATED GIFS
        // ==========================================
        const workoutPlans = [
            {
                title: '30-Day Sparta Shred',
                description: 'A robust, high-intensity workout routine designed to maximize calorie burn and shred body fat.',
                category: 'Weight Loss',
                createdBy: admin._id,
                exercises: [
                    { name: 'Push-Ups (Chest & Core)', sets: 4, reps: 15, rest: '45s', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif' },
                    { name: 'Squats (Legs)', sets: 4, reps: 20, rest: '30s', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Squat.gif' },
                    { name: 'Plank (Core)', sets: 3, reps: 1, rest: '30s', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif' }
                ]
            },
            {
                title: 'Titans Hypertrophy',
                description: 'Advanced push-pull-legs split focused strictly on muscle tearing and optimal growth.',
                category: 'Muscle Gain',
                createdBy: admin._id,
                exercises: [
                    { name: 'Barbell Bench Press', sets: 5, reps: 8, rest: '90s', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif' },
                    { name: 'Dumbbell Bicep Curl', sets: 4, reps: 10, rest: '60s', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Bicep-Curl.gif' },
                    { name: 'Pull-up', sets: 4, reps: 12, rest: '45s', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif' }
                ]
            },
            {
                title: 'Beginner Foundations',
                description: 'The perfect starting point for new members. Focuses on form, mobility, and establishing a mind-muscle connection.',
                category: 'Beginner',
                createdBy: admin._id,
                exercises: [
                    { name: 'Bodyweight Squats', sets: 3, reps: 12, rest: '60s', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Squat.gif' },
                    { name: 'Push-ups (Knees)', sets: 3, reps: 10, rest: '60s', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif' },
                    { name: 'Plank', sets: 3, reps: 1, rest: '30s', gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif' }
                ]
            }
        ];

        // ==========================================
        // DIET PLANS WITH FILTERS & DETAILS
        // ==========================================
        const dietPlans = [
            {
                title: 'Ultimate Vegan Lean',
                description: 'A 100% plant-based meal plan optimized for clean energy, fast recovery, and lean muscle retention.',
                category: 'Vegan',
                createdBy: admin._id,
                meals: [
                    { name: 'Breakfast', time: '08:00 AM', quantity: '2 Bowls', description: 'Overnight oats with almond milk, chia seeds, and fresh berries.', calories: 450 },
                    { name: 'Lunch', time: '01:00 PM', quantity: '1 Large Plate', description: 'Quinoa salad with black beans, roasted corn, avocado, and lime dressing.', calories: 550 },
                    { name: 'Dinner', time: '07:30 PM', quantity: '1 Serving', description: 'Lentil stew with a side of steamed broccoli and sweet potato chunks.', calories: 600 }
                ]
            },
            {
                title: 'Balanced Vegetarian Core',
                description: 'A hearty vegetarian diet packed with essential proteins and healthy fats suitable for intense training days.',
                category: 'Vegetarian',
                createdBy: admin._id,
                meals: [
                    { name: 'Breakfast', time: '07:30 AM', quantity: '3 Eggs & 2 Toast', description: 'Whole-grain toast topped with mashed avocado and poached eggs.', calories: 500 },
                    { name: 'Lunch', time: '01:30 PM', quantity: '1 Servicing', description: 'Paneer tikka wrap using whole wheat roti with mint yogurt sauce.', calories: 650 },
                    { name: 'Dinner', time: '08:00 PM', quantity: '1 Bowl', description: 'Greek salad filled with feta cheese, olives, cucumbers, and olive oil drizzle.', calories: 450 }
                ]
            },
            {
                title: 'Carnivore Mass Booster',
                description: 'High-protein non-vegetarian diet for rapid muscle synthesis and peak strength performance.',
                category: 'Non-Vegetarian',
                createdBy: admin._id,
                meals: [
                    { name: 'Breakfast', time: '08:00 AM', quantity: '2 Servings', description: '4 scrambled eggs with turkey bacon and a protein shake.', calories: 750 },
                    { name: 'Lunch', time: '01:00 PM', quantity: '300g Meat', description: 'Grilled chicken breast served with white rice and asparagus.', calories: 850 },
                    { name: 'Dinner', time: '08:30 PM', quantity: '250g Steak', description: 'Lean ribeye steak with a side of mashed potatoes and green beans.', calories: 950 }
                ]
            }
        ];

        await WorkoutPlan.deleteMany({});
        await DietPlan.deleteMany({});
        console.log('Cleared existing plans.');

        await WorkoutPlan.insertMany(workoutPlans);
        await DietPlan.insertMany(dietPlans);
        console.log('Successfully inserted Workout plans with GIFs & Diet Plans with Vegan/Veg/Non-Veg categories!');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

generatePremiumData();
