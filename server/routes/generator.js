const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ExerciseDB = require('../models/ExerciseDB');
const DietDB = require('../models/DietDB');
const WorkoutPlan = require('../models/WorkoutPlan');
const DietPlan = require('../models/DietPlan');

// Helper to shuffle arrays
const shuffleArray = (array) => {
    let newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

// Generate AI Plan Route
router.post('/generate', auth, async (req, res) => {
    try {
        const { goal, level, dietPref, age, weight, height, gender } = req.body;

        // Wipe old plans
        await WorkoutPlan.deleteMany({ createdBy: req.user.id });
        await DietPlan.deleteMany({ createdBy: req.user.id });

        // Calculate BMR using Mifflin-St Jeor Equation
        // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
        // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
        const w = parseFloat(weight) || 75;
        const h = parseFloat(height) || 170;
        const a = parseFloat(age) || 25;

        let bmr = (10 * w) + (6.25 * h) - (5 * a);
        bmr = gender === 'Female' ? bmr - 161 : bmr + 5;

        // TDEE (Total Daily Energy Expenditure) - Assuming Moderate Activity for gym goers
        const tdee = Math.round(bmr * 1.55);

        let targetCalories = tdee;
        let macros = {};

        if (goal === 'Weight Loss' || goal === 'Cutting') {
            targetCalories = tdee - 500; // 500 kcal deficit
            macros = { p: '40%', c: '30%', f: '30%', extra: `Caloric Deficit (${targetCalories} kcal)` };
        } else if (goal === 'Muscle Gain' || goal === 'Bulking') {
            targetCalories = tdee + 300; // 300 kcal surplus
            macros = { p: '30%', c: '50%', f: '20%', extra: `Caloric Surplus (${targetCalories} kcal)` };
        } else {
            macros = { p: '30%', c: '40%', f: '30%', extra: `Maintenance (${targetCalories} kcal)` };
        }

        const baseReps = level === 'Beginner' ? '12-15' : level === 'Intermediate' ? '8-12' : '6-8';
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Queries
        // Target specific goals or fallback to muscle gain for bulking/cutting logic mapped
        const targetGoal = goal === 'Bulking' ? 'Muscle Gain' : goal === 'Cutting' ? 'Weight Loss' : goal;

        const allAvailableEx = await ExerciseDB.find({
            goal: targetGoal,
            level: { $in: [level, 'Beginner', 'Intermediate'] } // Fallbacks
        });

        // Ensure we always fallback to the entire DB if low on exercises for advanced edge cases
        const backupEx = await ExerciseDB.find({});
        const exercisesPool = allAvailableEx.length >= 10 ? allAvailableEx : backupEx;

        const dietsPool = await DietDB.find({ dietPref: dietPref });

        let allExercises = [];
        let allMeals = [];
        const structuredDays = [];

        days.forEach((d, idx) => {
            // Assign exercises (minimum 4 per day)
            const shuffledEx = shuffleArray(exercisesPool);
            const dailyEx = shuffledEx.slice(0, 4);

            let dayTitle = "Full Body Circuit";
            if (dailyEx.length > 0) dayTitle = dailyEx[0].bodyPart + " Focus";

            dailyEx.forEach(x => {
                allExercises.push({
                    name: `${d}: ${x.name}`,
                    sets: level === 'Advanced' ? 4 : 3,
                    reps: level === 'Advanced' ? '8' : '12',
                    rest: '60s',
                    gifUrl: x.gifUrl
                });
            });

            // Assign meals (Breakfast, Lunch, Dinner, Snack if available)
            const b = shuffleArray(dietsPool.filter(m => m.mealType === 'Breakfast'))[0] || dietsPool[0];
            const l = shuffleArray(dietsPool.filter(m => m.mealType === 'Lunch'))[0] || dietsPool[1];
            const dn = shuffleArray(dietsPool.filter(m => m.mealType === 'Dinner'))[0] || dietsPool[2];

            const dailyMealsArr = [b, l, dn].filter(val => val !== undefined);
            const dailyDietDesc = dailyMealsArr.map(m => m?.name).join(' | ');

            if (b) {
                // Ensure unique name across the system: appending Day to front works nicely
                allMeals.push({ name: `${d} Breakfast`, time: 'Morning', quantity: '1 portion', description: b.description, calories: b.calories });
            }
            if (l) {
                allMeals.push({ name: `${d} Lunch`, time: 'Afternoon', quantity: '1 portion', description: l.description, calories: l.calories });
            }
            if (dn) {
                allMeals.push({ name: `${d} Dinner`, time: 'Evening', quantity: '1 portion', description: dn.description, calories: dn.calories });
            }

            structuredDays.push({
                day: d,
                workout: dayTitle,
                diet: dailyDietDesc || "Mixed plan"
            });
        });

        const newWorkoutPlan = new WorkoutPlan({
            title: `AI Plan: ${goal} (${level})`,
            description: `A custom database-driven AI 6-day split designed for ${goal}. Macros: ${macros.p}P / ${macros.c}C / ${macros.f}F`,
            category: goal === 'Weight Loss' || goal === 'Cutting' ? 'Weight Loss' : 'Muscle Gain',
            exercises: allExercises,
            createdBy: req.user.id
        });

        const newDietPlan = new DietPlan({
            title: `AI Diet: ${goal} (${dietPref})`,
            description: `Custom ${dietPref} ${macros.extra} diet structure dynamically constructed. Target: ${targetCalories} kcal.`,
            category: dietPref === 'Vegan' ? 'Vegan' : dietPref === 'Vegetarian' ? 'Vegetarian' : 'Non-Vegetarian',
            meals: allMeals,
            targetCalories,
            createdBy: req.user.id
        });

        await newWorkoutPlan.save();
        await newDietPlan.save();

        const responsePayload = {
            goal, level, dietPref,
            macros, baseReps, targetCalories,
            days: structuredDays,
            workoutPayload: newWorkoutPlan,
            dietPayload: newDietPlan
        };

        res.json(responsePayload);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error in AI Generator');
    }
});

module.exports = router;
