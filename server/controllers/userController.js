const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        await user.deleteOne();
        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.role = req.body.role;
        await user.save();
        res.json({ msg: 'User role updated', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getContacts = async (req, res) => {
    try {
        let contacts;
        if (req.user.role === 'user') {
            // Normal users only see Trainers and Admins
            contacts = await User.find({ role: { $in: ['trainer', 'admin'] } }).select('-password');
        } else if (req.user.role === 'trainer') {
            // Trainers see normal users and Admins
            contacts = await User.find({ role: { $in: ['user', 'admin'] } }).select('-password');
        } else if (req.user.role === 'admin') {
            // Admins see everyone
            contacts = await User.find({ _id: { $ne: req.user.id } }).select('-password');
        }
        res.json(contacts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
