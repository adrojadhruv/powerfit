const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: false },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    role: { type: String, enum: ['user', 'trainer', 'admin'], default: 'user' },
    completedDiets: { type: Number, default: 0 },
    completedExercises: { type: Number, default: 0 },
    profilePic: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', UserSchema);
