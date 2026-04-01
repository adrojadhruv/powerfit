const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mygym')
  .then(async () => {
    const exercises = await mongoose.connection.db.collection('exercisedbs').aggregate([
      { $group: { _id: "$name", count: { $sum: 1 }, docs: { $push: "$$ROOT" } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    const allExercises = await mongoose.connection.db.collection('exercisedbs').find({}).limit(5).toArray();

    const result = {
        duplicateExercises: exercises.length,
        duplicateExerciseExamples: exercises.slice(0, 2),
        sampleExercises: allExercises
    };

    fs.writeFileSync('db_inspect.json', JSON.stringify(result, null, 2));

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
