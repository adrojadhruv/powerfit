const DietDB = require('../models/DietDB');

// GET all DietDB entries (with optional filtering)
exports.getDietDBItems = async (req, res) => {
    try {
        const { search, mealType, dietPref, page = 1, limit = 50 } = req.query;
        let query = {};
        if (search) query.name = { $regex: search, $options: 'i' };
        if (mealType && mealType !== 'All') query.mealType = mealType;
        if (dietPref && dietPref !== 'All') query.dietPref = dietPref;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const items = await DietDB.find(query).sort({ name: 1 }).skip(skip).limit(limitNum);
        const total = await DietDB.countDocuments(query);

        res.json({
            data: items,
            meta: { total, page: pageNum, pages: Math.ceil(total / limitNum) }
        });
    } catch (err) {
        console.error('Error fetching DietDB:', err.message);
        res.status(500).send('Server Error');
    }
};

// POST create a new DietDB item
exports.createDietDBItem = async (req, res) => {
    try {
        const { name, mealType, dietPref, calories, description } = req.body;
        if (!name || !mealType || !mealType.length || !dietPref || !dietPref.length || !calories || !description) {
            return res.status(400).json({ msg: 'All fields are required' });
        }
        const item = new DietDB({ name, mealType, dietPref, calories, description });
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        console.error('Error creating DietDB item:', err.message);
        res.status(500).send('Server Error');
    }
};

// PUT update a DietDB item
exports.updateDietDBItem = async (req, res) => {
    try {
        const item = await DietDB.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!item) return res.status(404).json({ msg: 'Diet item not found' });
        res.json(item);
    } catch (err) {
        console.error('Error updating DietDB item:', err.message);
        res.status(500).send('Server Error');
    }
};

// DELETE a DietDB item
exports.deleteDietDBItem = async (req, res) => {
    try {
        const item = await DietDB.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ msg: 'Diet item not found' });
        res.json({ msg: 'Diet item deleted' });
    } catch (err) {
        console.error('Error deleting DietDB item:', err.message);
        res.status(500).send('Server Error');
    }
};
