const mongoose = require('mongoose');

const DietDBSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mealType: [{ type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Post-Workout'], required: true }],
    dietPref: [{ type: String, enum: ['Vegan', 'Vegetarian', 'Non-Vegetarian'], required: true }],
    calories: { type: Number, required: true },
    description: { type: String, required: true }
});

module.exports = mongoose.model('DietDB', DietDBSchema);
