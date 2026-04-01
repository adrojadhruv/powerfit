require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        const trainer = await User.findOne({ email: 'trainer@powerfit.com' });
        if (!trainer) {
            console.log('Trainer not found');
            process.exit(0);
        }

        console.log(`Found Trainer: ${trainer.username} | Email: ${trainer.email}`);
        console.log(`Hashed Password in DB: ${trainer.password}`);

        const testPasswords = ['trainner', 'password123', 'admin123', 'trainer'];
        let matched = false;
        for (let pwd of testPasswords) {
            const isMatch = await bcrypt.compare(pwd, trainer.password);
            if (isMatch) {
                console.log(`✅ MATCH! The password is: ${pwd}`);
                matched = true;
                break;
            } else {
                console.log(`❌ Failed: ${pwd}`);
            }
        }

        if (!matched) {
            console.log('No passwords matched. Let\'s reset the trainer password to "trainner" right now.');
            trainer.password = 'trainner'; // This will trigger pre('save') hook
            await trainer.save();
            console.log('Password reset successfully to "trainner".');
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
