const express = require('express');
const router = express.Router();
const { createWorkoutPlan, getWorkoutPlans, getWorkoutPlanById, updateWorkoutPlan, deleteWorkoutPlan, deleteMyWorkoutPlans } = require('../controllers/workoutController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.delete('/my-plans', auth, deleteMyWorkoutPlans);
router.post('/', auth, role(['trainer', 'admin', 'user']), createWorkoutPlan);
router.get('/', auth, getWorkoutPlans);
router.get('/:id', auth, getWorkoutPlanById);
router.put('/:id', auth, role(['trainer', 'admin']), updateWorkoutPlan);
router.delete('/:id', auth, role(['trainer', 'admin']), deleteWorkoutPlan);

module.exports = router;
