const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weight: { type: Number, required: true },
    neck: { type: Number },
    waist: { type: Number },
    height: { type: Number },
    bodyFat: { type: Number },
    bmi: { type: Number },
    notes: { type: String, default: '' },
    imageUrl: { type: String, default: null },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', ProgressSchema);
