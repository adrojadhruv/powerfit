const DietPlan = require('../models/DietPlan');

exports.createDietPlan = async (req, res) => {
    try {
        const plan = new DietPlan({
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

exports.getDietPlans = async (req, res) => {
    try {
        const plans = await DietPlan.find().populate('createdBy', 'username');
        res.json(plans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getDietPlanById = async (req, res) => {
    try {
        const plan = await DietPlan.findById(req.params.id).populate('createdBy', 'username');
        if (!plan) return res.status(404).json({ msg: 'Plan not found' });
        res.json(plan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateDietPlan = async (req, res) => {
    try {
        let plan = await DietPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ msg: 'Plan not found' });

        if (plan.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        plan = await DietPlan.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(plan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteDietPlan = async (req, res) => {
    try {
        const plan = await DietPlan.findById(req.params.id);
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

exports.deleteMyDietPlans = async (req, res) => {
    try {
        console.log("deleting ALL diet plans (user requested to overwrite everything)");
        const DietPlan = require('../models/DietPlan');
        await DietPlan.deleteMany({});
        res.json({ msg: 'All diet plans removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
