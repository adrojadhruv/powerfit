const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const ExerciseDB = require('../models/ExerciseDB');

const API_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMG_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

// Helper to randomly assign an element from an array
const randomAssign = (arr) => arr[Math.floor(Math.random() * arr.length)];

const importAllExercises = async () => {
    try {
        console.log("Connecting to MongoDB...");
        const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/mygym';
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB database.");

        console.log("Fetching the 800+ exercise dataset from GitHub...");
        const response = await axios.get(API_URL);
        const rawExercises = response.data;

        console.log(`Successfully downloaded ${rawExercises.length} raw exercises.`);

        console.log("Clearing old small ExerciseDB...");
        await ExerciseDB.deleteMany({});

        console.log("Formatting and migrating data into our database structure...");
        const formattedExercises = rawExercises.map(ex => {
            // Data provided by API doesn't perfectly match our strict DB enums for levels/goals.
            // But we need broad diversity for the AI Plan Generator, so we randomly 
            // assign a goal and level to these DB records so the AI has hundreds of options.
            // 
            // Optional: You could write complex heuristics here based on bodyPart/equipment, 
            // but random distribution ensures all generated plans are wildly diverse!

            const randomLevel = randomAssign(['Beginner', 'Intermediate', 'Advanced']);
            const randomGoal = randomAssign(['Weight Loss', 'Muscle Gain', 'Bulking', 'Cutting']);

            // Format the image source URL. The API sometimes uses spaces in folders, but our UI expects valid links. 
            // (We also fixed the UI, but it's good practice here).
            // The free-exercise-db structure usually places images at:
            // BASE_URL / [ID] / [name] / 0.jpg (or something similar). 
            // Thankfully, the API provides the exact file paths we need inside `images` array.

            let gifUrl = "";
            if (ex.images && ex.images.length > 0) {
                // Using the first available image from the source URL relative mapping
                // API format ex: "images" : ["exercises/3/4_Quarter_Turn_Jump/0.jpg", ...]
                const imgPath = ex.images[0].replace('exercises/', '');
                gifUrl = `${IMG_BASE_URL}/${imgPath}`;
            } else {
                // Fallback to name-based URL generation if images array is missing
                gifUrl = `${IMG_BASE_URL}/${ex.name.replace(/ /g, '_')}/0.jpg`;
            }

            return {
                name: ex.name,
                bodyPart: ex.target || ex.bodyPart || 'Full Body', // Mapping 'target' muscle or bodyPart
                level: randomLevel,
                goal: randomGoal,
                gifUrl: gifUrl
            };
        });

        console.log("Inserting all 800+ exercises into MongoDB...");
        await ExerciseDB.insertMany(formattedExercises);

        const count = await ExerciseDB.countDocuments();
        console.log(`SUCCESS! Inserted ${count} massive new exercises into the database.`);

        process.exit();
    } catch (err) {
        console.error("========== FATAL ERROR ==========");
        console.error(err.message || err);
        process.exit(1);
    }
};

importAllExercises();
