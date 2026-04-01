const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const Progress = require('../models/Progress');

// @route   GET api/progress
// @desc    Get user progress history
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let queryUserId = req.user.id;
        if ((req.user.role === 'admin' || req.user.role === 'trainer') && req.query.userId) {
            queryUserId = req.query.userId;
        }

        const progressList = await Progress.find({ user: queryUserId }).sort({ date: 1 });
        res.json(progressList);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/progress
// @desc    Add new progress record
// @access  Private
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { weight, bodyFat, bmi, notes, date, height, neck, waist } = req.body;

        const imageUrl = req.file ? req.file.path : null;

        const newProgress = new Progress({
            user: req.user.id,
            weight,
            bodyFat,
            bmi,
            notes,
            height,
            neck,
            waist,
            imageUrl,
            date: date ? new Date(date) : new Date()
        });

        const progress = await newProgress.save();
        res.json(progress);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/progress/:id
// @desc    Delete a progress record
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const progress = await Progress.findById(req.params.id);

        if (!progress) {
            return res.status(404).json({ msg: 'Progress record not found' });
        }

        // Check user object id vs token user id
        if (progress.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await progress.deleteOne();
        res.json({ msg: 'Progress record removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Progress record not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
