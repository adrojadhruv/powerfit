const mongoose = require('mongoose');

const ExerciseDBSchema = new mongoose.Schema({
    name: { type: String, required: true },
    bodyPart: [{ type: String, required: true }], // e.g., 'Chest', 'Legs', 'Full Body', 'Cardio'
    level: [{ type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true }],
    goal: [{ type: String, enum: ['Weight Loss', 'Muscle Gain', 'Bulking', 'Cutting'], required: true }],
    gifUrl: { type: String, required: true }
});

module.exports = mongoose.model('ExerciseDB', ExerciseDBSchema);
