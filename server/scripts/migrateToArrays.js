const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ExerciseDB = require('../models/ExerciseDB');
const DietDB = require('../models/DietDB');

const migrate = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mygym';
        console.log("Connecting to:", uri);
        await mongoose.connect(uri);
        console.log("Connected.");

        // Migration for ExerciseDB (direct standard collection access to avoid schema validation blocks on old string data if reading)
        const rawExercises = await mongoose.connection.db.collection('exercisedbs').find({}).toArray();
        console.log(`Found ${rawExercises.length} raw exercises.`);

        const groupedEx = {};
        for (const ex of rawExercises) {
            if (!groupedEx[ex.name]) {
                groupedEx[ex.name] = { 
                    name: ex.name, 
                    bodyPart: new Set(), 
                    level: new Set(), 
                    goal: new Set(), 
                    gifUrl: ex.gifUrl 
                };
            }
            // Handled both old format (string) and new format (array if run twice)
            const bp = Array.isArray(ex.bodyPart) ? ex.bodyPart : [ex.bodyPart];
            bp.forEach(i => i && groupedEx[ex.name].bodyPart.add(i));

            const lvl = Array.isArray(ex.level) ? ex.level : [ex.level];
            lvl.forEach(i => i && groupedEx[ex.name].level.add(i));

            const gl = Array.isArray(ex.goal) ? ex.goal : [ex.goal];
            gl.forEach(i => i && groupedEx[ex.name].goal.add(i));

            // if any is missing or falsy it avoids adding null/undefined
        }

        const newExDocs = Object.values(groupedEx).map(g => ({
            name: g.name,
            bodyPart: Array.from(g.bodyPart),
            level: Array.from(g.level),
            goal: Array.from(g.goal),
            gifUrl: g.gifUrl
        }));

        console.log(`Grouped into ${newExDocs.length} unique exercises.`);
        
        await mongoose.connection.db.collection('exercisedbs').deleteMany({});
        if (newExDocs.length > 0) {
            await mongoose.connection.db.collection('exercisedbs').insertMany(newExDocs);
        }
        console.log("Exercises migration complete.");


        // Migration for DietDB
        const rawDiet = await mongoose.connection.db.collection('dietdbs').find({}).toArray();
        console.log(`Found ${rawDiet.length} raw diets.`);

        const groupedDiet = {};
        for (const d of rawDiet) {
            if (!groupedDiet[d.name]) {
                groupedDiet[d.name] = { 
                    name: d.name, 
                    mealType: new Set(), 
                    dietPref: new Set(), 
                    calories: d.calories, // Take first parsed one
                    description: d.description
                };
            }
            const mt = Array.isArray(d.mealType) ? d.mealType : [d.mealType];
            mt.forEach(i => i && groupedDiet[d.name].mealType.add(i));

            const dp = Array.isArray(d.dietPref) ? d.dietPref : [d.dietPref];
            dp.forEach(i => i && groupedDiet[d.name].dietPref.add(i));
        }

        const newDietDocs = Object.values(groupedDiet).map(g => ({
            name: g.name,
            mealType: Array.from(g.mealType),
            dietPref: Array.from(g.dietPref),
            calories: g.calories,
            description: g.description
        }));

        console.log(`Grouped into ${newDietDocs.length} unique diets.`);

        await mongoose.connection.db.collection('dietdbs').deleteMany({});
        if (newDietDocs.length > 0) {
            await mongoose.connection.db.collection('dietdbs').insertMany(newDietDocs);
        }
        console.log("Diets migration complete.");

        process.exit(0);

    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();
