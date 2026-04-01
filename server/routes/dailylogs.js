const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DailyLog = require('../models/DailyLog');

// Get all user logs
router.get('/all', auth, async (req, res) => {
    try {
        let queryUserId = req.user.id;
        if ((req.user.role === 'admin' || req.user.role === 'trainer') && req.query.userId) {
            queryUserId = req.query.userId;
        }

        const logs = await DailyLog.find({ user: queryUserId }).sort({ date: 1 });
        res.json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get today's log (or specific date)
router.get('/:date', auth, async (req, res) => {
    try {
        const log = await DailyLog.findOne({ user: req.user.id, date: req.params.date });
        if (!log) {
            return res.json({ completedExercises: [], completedMeals: [] });
        }
        res.json(log);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Toggle Exercise Completion
router.post('/exercise', auth, async (req, res) => {
    try {
        const { date, exerciseName } = req.body;

        // Find or create the log
        let log = await DailyLog.findOne({ user: req.user.id, date });
        if (!log) {
            log = new DailyLog({ user: req.user.id, date, completedExercises: [], completedMeals: [] });
        }

        const existingExerciseIndex = log.completedExercises.findIndex(e => e.name === exerciseName);

        if (existingExerciseIndex > -1) {
            // Remove it
            log.completedExercises.splice(existingExerciseIndex, 1);
        } else {
            // Add it
            log.completedExercises.push({ name: exerciseName });
        }

        await log.save();
        res.json(log);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Toggle Meal Completion
router.post('/meal', auth, async (req, res) => {
    try {
        const { date, mealName } = req.body;

        let log = await DailyLog.findOne({ user: req.user.id, date });
        if (!log) {
            log = new DailyLog({ user: req.user.id, date, completedExercises: [], completedMeals: [] });
        }

        const existingMealIndex = log.completedMeals.findIndex(m => m.name === mealName);

        if (existingMealIndex > -1) {
            log.completedMeals.splice(existingMealIndex, 1);
        } else {
            log.completedMeals.push({ name: mealName });
        }

        await log.save();
        res.json(log);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
