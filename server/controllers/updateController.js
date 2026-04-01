const GymUpdate = require('../models/GymUpdate');

exports.createGymUpdate = async (req, res) => {
    try {
        const update = new GymUpdate({
            ...req.body,
            createdBy: req.user.id
        });
        await update.save();
        res.json(update);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getGymUpdates = async (req, res) => {
    try {
        const updates = await GymUpdate.find().populate('createdBy', 'username').sort({ createdAt: -1 });
        res.json(updates);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteGymUpdate = async (req, res) => {
    try {
        const update = await GymUpdate.findById(req.params.id);
        if (!update) return res.status(404).json({ msg: 'Update not found' });

        if (update.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await update.deleteOne();
        res.json({ msg: 'Update removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
