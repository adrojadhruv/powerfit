const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, updateUserRole, getContacts } = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Get contacts based on the user's role (User->Trainer, Trainer->User, Admin->All)
router.get('/contacts', auth, getContacts);

// Only Admins and Trainers can see the full user list
router.get('/', auth, role(['admin', 'trainer']), getAllUsers);

const { upload } = require('../middleware/upload');

// Only Admins can delete users or change roles
router.delete('/:id', auth, role(['admin']), deleteUser);
router.put('/:id', auth, role(['admin']), updateUserRole);

// Get rich profile statistics for the authenticated user
router.get('/profile-stats', auth, async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const Workout = require('../models/WorkoutPlan');
        const Diet = require('../models/DietPlan');
        const Progress = require('../models/Progress');
        const DailyLog = require('../models/DailyLog');

        const [workouts, diets, progressLogs, dailyLogs] = await Promise.all([
            Workout.find({ user: req.user.id }).sort({ date: -1 }),
            Diet.find({ user: req.user.id }).sort({ date: -1 }),
            Progress.find({ user: req.user.id }).sort({ date: -1 }),
            DailyLog.find({ user: req.user.id }).sort({ date: -1 })
        ]);

        const daysActive = Math.max(1, Math.ceil((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)));
        let achievement = 'Rising Star';
        const totalGenerated = workouts.length + diets.length;
        if (totalGenerated >= 10) achievement = 'Fitness Guru';
        else if (totalGenerated >= 5) achievement = 'Dedicated Athlete';

        let activities = [];
        workouts.forEach(w => activities.push({ action: 'Generated new AI workout plan', time: w._id.getTimestamp(), icon: '🏋️' }));
        diets.forEach(d => activities.push({ action: 'Created new nutrition plan', time: d._id.getTimestamp(), icon: '🥗' }));
        progressLogs.forEach(p => activities.push({ action: `Logged progress metrics: ${p.weight}kg`, time: p._id.getTimestamp(), icon: '📈' }));

        dailyLogs.forEach(dl => {
            const dateObj = new Date(dl.date);
            const daysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayName = daysArr[dateObj.getDay()];

            // Calculate total expected
            let expectedEx = 0;
            if (workouts.length > 0) {
                expectedEx = workouts[0].exercises.filter(ex => ex.name.startsWith(dayName)).length;
            }

            let expectedMeals = 0;
            if (diets.length > 0) {
                expectedMeals = diets[0].meals.filter(m => m.name.startsWith(dayName)).length;
            }

            const compEx = dl.completedExercises.length;
            const compMeals = dl.completedMeals.length;

            if (expectedEx > 0 && compEx === expectedEx) {
                activities.push({ action: `Completed all exercises for ${dayName}`, time: dl._id.getTimestamp(), icon: '🏆' });
            } else if (compEx > 0) {
                activities.push({ action: `Completed ${compEx} exercises for ${dayName}`, time: dl._id.getTimestamp(), icon: '✅' });
            }

            // slightly offset the time so both don't clash on sort if they have the same timestamp
            const mealTime = new Date(dl._id.getTimestamp().getTime() + 1000);
            if (expectedMeals > 0 && compMeals === expectedMeals) {
                activities.push({ action: `Completed full diet for ${dayName}`, time: mealTime, icon: '🌟' });
            } else if (compMeals > 0) {
                activities.push({ action: `Logged ${compMeals} meals for ${dayName}`, time: mealTime, icon: '🍽️' });
            }
        });

        // Ensure the "Joined" event is exactly the user creation time minus a tiny fraction to always place it logically at the bottom if created concurrently
        const joinTime = new Date(user._id.getTimestamp().getTime() - 1000);
        activities.push({ action: 'Joined PowerFit community', time: joinTime, icon: '🎉' });

        activities.sort((a, b) => b.time - a.time);
        const recentActivity = activities.slice(0, 5).map(a => {
            const diffInMinutes = Math.floor((new Date() - a.time) / (1000 * 60));
            const diffInHours = Math.floor(diffInMinutes / 60);
            let timeStr = 'Just now';
            if (diffInHours > 24) {
                const days = Math.floor(diffInHours / 24);
                timeStr = `${days} day${days > 1 ? 's' : ''} ago`;
            } else if (diffInHours > 0) {
                timeStr = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
            } else if (diffInMinutes > 0) {
                timeStr = `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
            }
            return { action: a.action, time: timeStr, icon: a.icon };
        });

        res.json({
            workoutCount: workouts.length,
            dietCount: diets.length,
            daysActive,
            achievement,
            recentActivity,
            joinedDate: user.createdAt
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Allow any authenticated user to update their own profile picture
router.post('/profile-pic', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        // req.user.id is from auth middleware
        const User = require('../models/User');
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePic: req.file.path },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
