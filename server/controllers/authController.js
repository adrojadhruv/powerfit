const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
    try {
        const { username, email, password, age, gender, role } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Email is already registered. Please login.' });

        let userByName = await User.findOne({ username });
        if (userByName) return res.status(400).json({ msg: 'Username is already taken. Please choose another.' });

        user = new User({ username, email, password, age, gender, role });
        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            return res.status(500).json({ msg: 'Server configuration error' });
        }

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, role: user.role, profilePic: user.profilePic, createdAt: user.createdAt } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find by email or username
        let user = await User.findOne({
            $or: [
                { email: email },
                { username: email }
            ]
        });

        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id, username: user.username, role: user.role } };
        
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            return res.status(500).json({ msg: 'Server configuration error' });
        }

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, role: user.role, profilePic: user.profilePic, createdAt: user.createdAt } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
