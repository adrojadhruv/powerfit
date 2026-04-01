const mongoose = require('mongoose');

const WorkoutPlanSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, enum: ['Beginner', 'Intermediate', 'Advanced', 'Weight Loss', 'Muscle Gain'] },
    exercises: [{
        name: { type: String, required: true },
        sets: { type: Number, required: true },
        reps: { type: Number, required: true },
        rest: { type: String, required: true },
        gifUrl: { type: String }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);
