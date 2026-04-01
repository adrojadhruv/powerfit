const express = require('express');
const router = express.Router();
const { createDietPlan, getDietPlans, getDietPlanById, updateDietPlan, deleteDietPlan, deleteMyDietPlans } = require('../controllers/dietController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.delete('/my-plans', auth, deleteMyDietPlans);
router.post('/', auth, role(['trainer', 'admin', 'user']), createDietPlan);
router.get('/', auth, getDietPlans);
router.get('/:id', auth, getDietPlanById);
router.put('/:id', auth, role(['trainer', 'admin']), updateDietPlan);
router.delete('/:id', auth, role(['trainer', 'admin']), deleteDietPlan);

module.exports = router;
