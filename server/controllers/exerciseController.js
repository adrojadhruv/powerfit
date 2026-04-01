const ExerciseDB = require('../models/ExerciseDB');

// Get all exercises (with optional search and filtering)
exports.getExercises = async (req, res) => {
    try {
        const { search, bodyPart, level, goal, page = 1, limit = 50 } = req.query;

        // Build matching query
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
        }
        if (bodyPart && bodyPart !== 'All') {
            query.bodyPart = bodyPart;
        }
        if (level && level !== 'All') {
            query.level = level;
        }
        if (goal && goal !== 'All') {
            query.goal = goal;
        }

        // Setup pagination numbers
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Fetch paginated data
        const exercises = await ExerciseDB.find(query)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limitNum);

        // Fetch counts for pagination metadata
        const total = await ExerciseDB.countDocuments(query);

        // Fetch all unique body parts to populate the filter dropdown on frontend
        const bodyPartsList = await ExerciseDB.distinct('bodyPart');

        res.json({
            data: exercises,
            meta: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                bodyPartsList: bodyPartsList.filter(Boolean).sort() // clean undefineds and sort alphabetically
            }
        });
    } catch (err) {
        console.error("Error fetching exercises:", err.message);
        res.status(500).send('Server Error');
    }
};

// Create a new exercise (trainer/admin only)
exports.createExercise = async (req, res) => {
    try {
        const { name, bodyPart, level, goal, gifUrl } = req.body;
        if (!name || !bodyPart || !bodyPart.length || !level || !level.length || !goal || !goal.length || !gifUrl) {
            return res.status(400).json({ msg: 'All fields are required' });
        }
        const exercise = new ExerciseDB({ name, bodyPart, level, goal, gifUrl });
        await exercise.save();
        res.status(201).json(exercise);
    } catch (err) {
        console.error('Error creating exercise:', err.message);
        res.status(500).send('Server Error');
    }
};

// Update an exercise (trainer/admin only)
exports.updateExercise = async (req, res) => {
    try {
        const exercise = await ExerciseDB.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!exercise) return res.status(404).json({ msg: 'Exercise not found' });
        res.json(exercise);
    } catch (err) {
        console.error('Error updating exercise:', err.message);
        res.status(500).send('Server Error');
    }
};

// Delete an exercise (trainer/admin only)
exports.deleteExercise = async (req, res) => {
    try {
        const exercise = await ExerciseDB.findByIdAndDelete(req.params.id);
        if (!exercise) return res.status(404).json({ msg: 'Exercise not found' });
        res.json({ msg: 'Exercise deleted' });
    } catch (err) {
        console.error('Error deleting exercise:', err.message);
        res.status(500).send('Server Error');
    }
};
