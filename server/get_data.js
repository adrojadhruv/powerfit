require('dotenv').config();
const mongoose = require('mongoose');
const DailyLog = require('./models/DailyLog');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    const today = new Date().toISOString().split('T')[0];
    const logs = await DailyLog.find({ date: today }).lean();
    console.log(JSON.stringify(logs[0].dietTrackerData, null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
