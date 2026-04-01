const mongoose = require('mongoose');

const DailyLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    completedExercises: [{
        name: { type: String, required: true },
        completedAt: { type: Date, default: Date.now }
    }],
    completedMeals: [{
        name: { type: String, required: true },
        completedAt: { type: Date, default: Date.now }
    }],
    dietTrackerData: {
        totalCalories: { type: Number },
        macros: {
            protein: { type: Number },
            carbs: { type: Number },
            fats: { type: Number }
        },
        foodItems: [{
            name: { type: String },
            estimatedCalories: { type: Number },
            estimatedQuantity: { type: String },
            protein: { type: Number },
            carbs: { type: Number },
            fats: { type: Number }
        }],
        recommendation: { type: String }
    },
    createdAt: { type: Date, default: Date.now }
});

// Ensure a user only has one log per date
DailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', DailyLogSchema);
