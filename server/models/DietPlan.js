const mongoose = require('mongoose');

const DietPlanSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, enum: ['Vegan', 'Vegetarian', 'Non-Vegetarian', 'Weight Loss', 'Muscle Gain', 'Keto', 'Maintenance'] },
    meals: [{
        name: { type: String, required: true },
        time: { type: String, required: true },
        quantity: { type: String, required: true },
        description: { type: String, required: true },
        calories: { type: Number }
    }],
    targetCalories: { type: Number },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DietPlan', DietPlanSchema);
