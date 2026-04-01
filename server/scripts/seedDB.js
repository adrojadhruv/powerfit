const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const ExerciseDB = require('../models/ExerciseDB');
const DietDB = require('../models/DietDB');

const G = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

const exercises = [
    // ================= CARDIO & HIIT =================
    { name: 'Jumping Jacks', bodyPart: 'Cardio', level: 'Beginner', goal: 'Weight Loss', gifUrl: `${G}/Jumping_Jacks/0.jpg` },
    { name: 'Mountain Climbers', bodyPart: 'Cardio', level: 'Beginner', goal: 'Weight Loss', gifUrl: `${G}/Mountain_Climbers/0.jpg` },
    { name: 'High Knees', bodyPart: 'Cardio', level: 'Beginner', goal: 'Weight Loss', gifUrl: `${G}/High_Knee_Jog/0.jpg` },
    { name: 'Burpees', bodyPart: 'Full Body', level: 'Intermediate', goal: 'Weight Loss', gifUrl: `${G}/Burpee/0.jpg` },
    { name: 'Sprints', bodyPart: 'Cardio', level: 'Advanced', goal: 'Weight Loss', gifUrl: `${G}/Bench_Sprint/0.jpg` },
    { name: 'Shadow Boxing', bodyPart: 'Cardio', level: 'Intermediate', goal: 'Weight Loss', gifUrl: `${G}/Punches/0.jpg` },

    // Cutting repeats cardio
    { name: 'Jumping Jacks', bodyPart: 'Cardio', level: 'Beginner', goal: 'Cutting', gifUrl: `${G}/Jumping_Jacks/0.jpg` },
    { name: 'Mountain Climbers', bodyPart: 'Cardio', level: 'Beginner', goal: 'Cutting', gifUrl: `${G}/Mountain_Climbers/0.jpg` },
    { name: 'Burpees', bodyPart: 'Full Body', level: 'Intermediate', goal: 'Cutting', gifUrl: `${G}/Burpee/0.jpg` },
    { name: 'Sprints', bodyPart: 'Cardio', level: 'Advanced', goal: 'Cutting', gifUrl: `${G}/Bench_Sprint/0.jpg` },

    // ================= CHEST & TRICEPS (PUSH) =================
    { name: 'Knee Push-ups', bodyPart: 'Chest', level: 'Beginner', goal: 'Muscle Gain', gifUrl: `${G}/Kneeling_Push-up/0.jpg` },
    { name: 'Push-ups', bodyPart: 'Chest', level: 'Intermediate', goal: 'Muscle Gain', gifUrl: `${G}/Pushups/0.jpg` },
    { name: 'Bench Press', bodyPart: 'Chest', level: 'Intermediate', goal: 'Muscle Gain', gifUrl: `${G}/Barbell_Bench_Press_-_Medium_Grip/0.jpg` },
    { name: 'Overhead Press', bodyPart: 'Shoulders', level: 'Intermediate', goal: 'Muscle Gain', gifUrl: `${G}/Barbell_Shoulder_Press/0.jpg` },
    { name: 'Tricep Extensions', bodyPart: 'Arms', level: 'Beginner', goal: 'Muscle Gain', gifUrl: `${G}/Tricep_Dumbbell_Kickback/0.jpg` },
    { name: 'Incline Bench Press', bodyPart: 'Chest', level: 'Advanced', goal: 'Muscle Gain', gifUrl: `${G}/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg` },
    { name: 'Dips', bodyPart: 'Chest', level: 'Advanced', goal: 'Muscle Gain', gifUrl: `${G}/Chest_Dip/0.jpg` },

    // Bulking push
    { name: 'Push-ups', bodyPart: 'Chest', level: 'Beginner', goal: 'Bulking', gifUrl: `${G}/Pushups/0.jpg` },
    { name: 'Bench Press', bodyPart: 'Chest', level: 'Intermediate', goal: 'Bulking', gifUrl: `${G}/Barbell_Bench_Press_-_Medium_Grip/0.jpg` },
    { name: 'Heavy Overhead Press', bodyPart: 'Shoulders', level: 'Advanced', goal: 'Bulking', gifUrl: `${G}/Barbell_Shoulder_Press/0.jpg` },
    { name: 'Incline Bench Press', bodyPart: 'Chest', level: 'Advanced', goal: 'Bulking', gifUrl: `${G}/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg` },

    // ================= BACK & BICEPS (PULL) =================
    { name: 'Dumbbell Rows', bodyPart: 'Back', level: 'Beginner', goal: 'Muscle Gain', gifUrl: `${G}/Dumbbell_Alternate_Bicep_Curl/0.jpg` },
    { name: 'Pull-ups', bodyPart: 'Back', level: 'Intermediate', goal: 'Muscle Gain', gifUrl: `${G}/Pullups/0.jpg` },
    { name: 'Barbell Rows', bodyPart: 'Back', level: 'Intermediate', goal: 'Muscle Gain', gifUrl: `${G}/Bent_Over_Barbell_Row/0.jpg` },
    { name: 'Bicep Curls', bodyPart: 'Arms', level: 'Beginner', goal: 'Muscle Gain', gifUrl: `${G}/Barbell_Curl/0.jpg` },
    { name: 'Lat Pulldowns', bodyPart: 'Back', level: 'Beginner', goal: 'Muscle Gain', gifUrl: `${G}/Cable_Seated_Row/0.jpg` },
    { name: 'Deadlifts', bodyPart: 'Back', level: 'Advanced', goal: 'Muscle Gain', gifUrl: `${G}/Barbell_Deadlift/0.jpg` },

    // Bulking pull
    { name: 'Pull-ups', bodyPart: 'Back', level: 'Intermediate', goal: 'Bulking', gifUrl: `${G}/Pullups/0.jpg` },
    { name: 'Barbell Rows', bodyPart: 'Back', level: 'Intermediate', goal: 'Bulking', gifUrl: `${G}/Bent_Over_Barbell_Row/0.jpg` },
    { name: 'Heavy Deadlifts', bodyPart: 'Back', level: 'Advanced', goal: 'Bulking', gifUrl: `${G}/Barbell_Deadlift/0.jpg` },
    { name: 'Bicep Curls', bodyPart: 'Arms', level: 'Beginner', goal: 'Bulking', gifUrl: `${G}/Barbell_Curl/0.jpg` },

    // ================= LEGS & CORE =================
    { name: 'Bodyweight Squats', bodyPart: 'Legs', level: 'Beginner', goal: 'Weight Loss', gifUrl: `${G}/Bodyweight_Squat/0.jpg` },
    { name: 'Plank', bodyPart: 'Core', level: 'Beginner', goal: 'Weight Loss', gifUrl: `${G}/Plank/0.jpg` },
    { name: 'Barbell Squat', bodyPart: 'Legs', level: 'Intermediate', goal: 'Muscle Gain', gifUrl: `${G}/Barbell_Squat/0.jpg` },
    { name: 'Leg Press', bodyPart: 'Legs', level: 'Intermediate', goal: 'Muscle Gain', gifUrl: `${G}/Leg_Press/0.jpg` },
    { name: 'Lunges', bodyPart: 'Legs', level: 'Beginner', goal: 'Muscle Gain', gifUrl: `${G}/Barbell_Lunge/0.jpg` },
    { name: 'Crunches', bodyPart: 'Core', level: 'Beginner', goal: 'Weight Loss', gifUrl: `${G}/Crunch/0.jpg` },
    { name: 'Bulgarian Split Squat', bodyPart: 'Legs', level: 'Advanced', goal: 'Muscle Gain', gifUrl: `${G}/Split_Squat_with_Dumbbells/0.jpg` },

    // Bulking legs
    { name: 'Barbell Squat', bodyPart: 'Legs', level: 'Intermediate', goal: 'Bulking', gifUrl: `${G}/Barbell_Squat/0.jpg` },
    { name: 'Leg Press', bodyPart: 'Legs', level: 'Intermediate', goal: 'Bulking', gifUrl: `${G}/Leg_Press/0.jpg` },
    { name: 'Heavy Lunges', bodyPart: 'Legs', level: 'Advanced', goal: 'Bulking', gifUrl: `${G}/Barbell_Lunge/0.jpg` },

    // ================= RECOVERY & FLEXIBILITY =================
    { name: 'Downward Dog', bodyPart: 'Full Body', level: 'Beginner', goal: 'Weight Loss', gifUrl: `${G}/Downward_Facing_Dog/0.jpg` },
    { name: 'Quad Stretch', bodyPart: 'Legs', level: 'Beginner', goal: 'Weight Loss', gifUrl: `${G}/All_Fours_Quad_Stretch/0.jpg` },
    { name: 'Yoga Flow', bodyPart: 'Full Body', level: 'Intermediate', goal: 'Weight Loss', gifUrl: `${G}/Downward_Facing_Dog/0.jpg` },
    { name: 'Stretching', bodyPart: 'Full Body', level: 'Beginner', goal: 'Muscle Gain', gifUrl: `${G}/All_Fours_Quad_Stretch/0.jpg` },
];

const diets = [
    // ================= NON-VEGETARIAN =================
    { name: 'Eggs & Oats', mealType: 'Breakfast', dietPref: 'Non-Vegetarian', calories: 450, description: '3 scrambled eggs with a side of oatmeal and mixed berries.' },
    { name: 'Grilled Chicken Salad', mealType: 'Lunch', dietPref: 'Non-Vegetarian', calories: 550, description: 'Grilled chicken breast over mixed greens, cherry tomatoes, and olive oil dressing.' },
    { name: 'Baked Salmon & Asparagus', mealType: 'Dinner', dietPref: 'Non-Vegetarian', calories: 600, description: 'Wild-caught salmon baked with lemon, served with roasted asparagus and quinoa.' },
    { name: 'Turkey Wrap', mealType: 'Lunch', dietPref: 'Non-Vegetarian', calories: 500, description: 'Whole wheat wrap stuffed with sliced turkey breast, spinach, and hummus.' },
    { name: 'Lean Beef Stir-fry', mealType: 'Dinner', dietPref: 'Non-Vegetarian', calories: 650, description: 'Lean beef strips stir-fried with broccoli, bell peppers, and low-sodium soy sauce.' },
    { name: 'Chicken & Rice Bowl', mealType: 'Dinner', dietPref: 'Non-Vegetarian', calories: 700, description: 'Grilled chicken over jasmine rice with a side of steamed vegetables.' },
    { name: 'Tuna Salad', mealType: 'Lunch', dietPref: 'Non-Vegetarian', calories: 450, description: 'Canned tuna mixed with Greek yogurt, celery, and onions, served over lettuce.' },
    { name: 'Protein Shake (Whey)', mealType: 'Post-Workout', dietPref: 'Non-Vegetarian', calories: 250, description: '1 scoop of whey protein mixed with unsweetened almond milk.' },
    { name: 'Greek Yogurt & Honey', mealType: 'Snack', dietPref: 'Non-Vegetarian', calories: 200, description: 'Plain Greek yogurt topped with a drizzle of honey and a handful of almonds.' },

    // ================= VEGETARIAN =================
    { name: 'Oatmeal & Milk', mealType: 'Breakfast', dietPref: 'Vegetarian', calories: 400, description: 'Rolled oats cooked with whole milk, topped with sliced bananas and walnuts.' },
    { name: 'Paneer Wrap', mealType: 'Lunch', dietPref: 'Vegetarian', calories: 550, description: 'Spiced paneer cubes wrapped in a whole grain tortilla with lettuce and yogurt sauce.' },
    { name: 'Lentil Curry & Rice', mealType: 'Dinner', dietPref: 'Vegetarian', calories: 600, description: 'Hearty lentil dahl served over basmati rice with a side of cucumber salad.' },
    { name: 'Cottage Cheese Bowl', mealType: 'Breakfast', dietPref: 'Vegetarian', calories: 350, description: 'Low-fat cottage cheese topped with pineapple chunks and chia seeds.' },
    { name: 'Greek Yogurt & Berries', mealType: 'Breakfast', dietPref: 'Vegetarian', calories: 300, description: 'Full-fat Greek yogurt mixed with fresh strawberries and blueberries.' },
    { name: 'Paneer Stir-fry', mealType: 'Dinner', dietPref: 'Vegetarian', calories: 650, description: 'Paneer cubes stir-fried with mixed vegetables in a soy-ginger sauce.' },
    { name: 'Cheese & Tomato Sandwich', mealType: 'Lunch', dietPref: 'Vegetarian', calories: 450, description: 'Grilled cheese sandwich with thick tomato slices on whole wheat bread.' },
    { name: 'Protein Shake (Casein)', mealType: 'Post-Workout', dietPref: 'Vegetarian', calories: 250, description: '1 scoop of casein protein powder mixed with milk.' },

    // ================= VEGAN =================
    { name: 'Oatmeal & Berries', mealType: 'Breakfast', dietPref: 'Vegan', calories: 350, description: 'Oatmeal cooked with water, topped with mixed berries and maple syrup.' },
    { name: 'Tofu Wrap', mealType: 'Lunch', dietPref: 'Vegan', calories: 500, description: 'Scrambled tofu with spinach and black beans wrapped in a flour tortilla.' },
    { name: 'Chickpea Stew', mealType: 'Dinner', dietPref: 'Vegan', calories: 550, description: 'Hearty stew made with chickpeas, diced tomatoes, spinach, and coconut milk.' },
    { name: 'Avocado Toast', mealType: 'Breakfast', dietPref: 'Vegan', calories: 400, description: 'Two slices of whole grain bread topped with smashed avocado and red pepper flakes.' },
    { name: 'Vegan Bowl', mealType: 'Lunch', dietPref: 'Vegan', calories: 600, description: 'Quinoa base topped with roasted sweet potatoes, black beans, corn, and avocado dressing.' },
    { name: 'Black Bean Burger', mealType: 'Dinner', dietPref: 'Vegan', calories: 650, description: 'Homemade black bean patty on a whole wheat bun with lettuce and tomato.' },
    { name: 'Chia Pudding', mealType: 'Breakfast', dietPref: 'Vegan', calories: 300, description: 'Chia seeds soaked overnight in almond milk, topped with sliced almonds.' },
    { name: 'Vegan Protein Shake', mealType: 'Post-Workout', dietPref: 'Vegan', calories: 250, description: '1 scoop of pea protein isolate blended with oat milk and half a banana.' },
    { name: 'Roasted Chickpeas', mealType: 'Snack', dietPref: 'Vegan', calories: 200, description: 'Crispy roasted chickpeas seasoned with paprika and sea salt.' }
];

const seedDB = async () => {
    try {
        console.log("Connecting to MongoDB...");
        const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/mygym';
        await mongoose.connect(MONGO_URI);
        console.log("Connected.");

        console.log("Clearing existing dictionaries...");
        await ExerciseDB.deleteMany({});
        await DietDB.deleteMany({});

        console.log("Seeding Exercises...");
        await ExerciseDB.insertMany(exercises);

        console.log("Seeding Diets...");
        await DietDB.insertMany(diets);

        console.log("Database seeded successfully!");
        process.exit();
    } catch (err) {
        console.log("========== ERROR DETAILS ==========");
        console.log(err.stack || err);
        process.exit(1);
    }
};

seedDB();
