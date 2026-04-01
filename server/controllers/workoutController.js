const WorkoutPlan = require('../models/WorkoutPlan');

exports.createWorkoutPlan = async (req, res) => {
    try {
        const plan = new WorkoutPlan({
            ...req.body,
            createdBy: req.user.id
        });
        await plan.save();
        res.json(plan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getWorkoutPlans = async (req, res) => {
    try {
        const plans = await WorkoutPlan.find().populate('createdBy', 'username');
        res.json(plans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getWorkoutPlanById = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findById(req.params.id).populate('createdBy', 'username');
        if (!plan) return res.status(404).json({ msg: 'Plan not found' });
        res.json(plan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateWorkoutPlan = async (req, res) => {
    try {
        let plan = await WorkoutPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ msg: 'Plan not found' });

        if (plan.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        plan = await WorkoutPlan.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(plan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteWorkoutPlan = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ msg: 'Plan not found' });

        if (plan.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await plan.deleteOne();
        res.json({ msg: 'Plan removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteMyWorkoutPlans = async (req, res) => {
    try {
        console.log("deleting ALL workout plans (user requested to overwrite everything)");
        await WorkoutPlan.deleteMany({});
        res.json({ msg: 'All workout plans removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
