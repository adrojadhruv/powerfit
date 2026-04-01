const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const exerciseController = require('../controllers/exerciseController');

// @route   GET api/exercises  — all users
router.get('/', auth, exerciseController.getExercises);

// @route   POST api/exercises  — trainer/admin only
router.post('/', auth, role(['trainer', 'admin']), exerciseController.createExercise);

// @route   PUT api/exercises/:id  — trainer/admin only
router.put('/:id', auth, role(['trainer', 'admin']), exerciseController.updateExercise);

// @route   DELETE api/exercises/:id  — trainer/admin only
router.delete('/:id', auth, role(['trainer', 'admin']), exerciseController.deleteExercise);

module.exports = router;
