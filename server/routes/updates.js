const express = require('express');
const router = express.Router();
const { createGymUpdate, getGymUpdates, deleteGymUpdate } = require('../controllers/updateController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/', auth, role(['admin', 'trainer']), createGymUpdate);
router.get('/', auth, getGymUpdates);
router.delete('/:id', auth, role(['admin', 'trainer']), deleteGymUpdate);

module.exports = router;
