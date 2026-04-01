const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const ctrl = require('../controllers/dietDBController');

// @route   GET /api/dietdb  — all authenticated users
router.get('/', auth, ctrl.getDietDBItems);

// @route   POST /api/dietdb  — trainer/admin only
router.post('/', auth, role(['trainer', 'admin']), ctrl.createDietDBItem);

// @route   PUT /api/dietdb/:id  — trainer/admin only
router.put('/:id', auth, role(['trainer', 'admin']), ctrl.updateDietDBItem);

// @route   DELETE /api/dietdb/:id  — trainer/admin only
router.delete('/:id', auth, role(['trainer', 'admin']), ctrl.deleteDietDBItem);

module.exports = router;
