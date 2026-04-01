const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenAI } = require('@google/genai');
const DailyLog = require('../models/DailyLog');
const DietPlan = require('../models/DietPlan');

// POST /api/diet-tracker/analyze
// Analyzes a user's food intake for the day and estimates calories
router.post('/analyze', auth, async (req, res) => {
  try {
    const { foodInput } = req.body;

    if (!foodInput || foodInput.trim() === '') {
      return res.status(400).json({ msg: 'Please provide food input to analyze.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ msg: 'Server configuration error: GEMINI_API_KEY not found.' });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const prompt = `You are an expert nutritionist and calorie tracking assistant. 
Analyze the following food intake description: "${foodInput}"
Please calculate the estimated calories, identify the food items and their individual macronutrients (protein, carbs, fats in grams), estimate the overall daily macronutrients, and provide portion recommendations or general advice based on this input. 

IMPORTANT: Provide your recommendation purely as fitness and dietary advice based on the user's logged intake. Do NOT reference UI elements, tabs, current views, or screen elements in your recommendation text.

Respond ONLY with a valid JSON object strictly matching this schema, without any markdown formatting or extra text:
{
  "totalCalories": 0,
  "macros": {
    "protein": 0,
    "carbs": 0,
    "fats": 0
  },
  "foodItems": [
    {
      "name": "string",
      "estimatedCalories": 0,
      "estimatedQuantity": "string",
      "protein": 0,
      "carbs": 0,
      "fats": 0
    }
  ],
  "recommendation": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const textResponse = response.text; // Fixed: response.text is a property in the new SDK, not a function

    let jsonResponse;
    try {
      // strip out markdown formatting if any
      const cleanedText = textResponse.replace(/^```json/m, '').replace(/```$/m, '').trim();
      jsonResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", textResponse);
      return res.status(500).json({ msg: 'Failed to process AI response into structured data.' });
    }

    // Save to DailyLog
    const today = new Date().toISOString().split('T')[0];
    let dailyLog = await DailyLog.findOne({ user: req.user.id, date: today });

    if (!dailyLog) {
      dailyLog = new DailyLog({
        user: req.user.id,
        date: today,
        completedExercises: [],
        completedMeals: [],
        dietTrackerData: jsonResponse
      });
    } else {
      if (!dailyLog.dietTrackerData) {
        dailyLog.dietTrackerData = jsonResponse;
      } else {
        // Append instead of overwrite
        dailyLog.dietTrackerData.totalCalories = (Number(dailyLog.dietTrackerData.totalCalories) || 0) + (Number(jsonResponse.totalCalories) || 0);

        // Sum macros safely
        if (!dailyLog.dietTrackerData.macros) {
          dailyLog.dietTrackerData.macros = { protein: 0, carbs: 0, fats: 0 };
        }

        dailyLog.dietTrackerData.macros.protein = (Number(dailyLog.dietTrackerData.macros.protein) || 0) + (Number(jsonResponse.macros?.protein) || 0);
        dailyLog.dietTrackerData.macros.carbs = (Number(dailyLog.dietTrackerData.macros.carbs) || 0) + (Number(jsonResponse.macros?.carbs) || 0);
        dailyLog.dietTrackerData.macros.fats = (Number(dailyLog.dietTrackerData.macros.fats) || 0) + (Number(jsonResponse.macros?.fats) || 0);

        // Append food items
        if (jsonResponse.foodItems && jsonResponse.foodItems.length > 0) {
          if (!dailyLog.dietTrackerData.foodItems) {
            dailyLog.dietTrackerData.foodItems = [];
          }
          dailyLog.dietTrackerData.foodItems.push(...jsonResponse.foodItems);
        }

        // Keep the latest recommendation
        if (jsonResponse.recommendation) {
          dailyLog.dietTrackerData.recommendation = jsonResponse.recommendation;
        }
      }
    }

    dailyLog.markModified('dietTrackerData');
    await dailyLog.save();

    res.json(dailyLog.dietTrackerData);

  } catch (err) {
    console.error("Google AI Error:", err.message);
    res.status(500).json({ msg: 'Server Error in Diet Tracker AI' });
  }
});

// GET /api/diet-tracker/today
// Retrieves today's diet tracker data and target calories from the latest Diet Plan
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const log = await DailyLog.findOne({ user: req.user.id, date: today });

    // Find latest diet plan for target calories
    const latestPlan = await DietPlan.findOne({ createdBy: req.user.id }).sort({ createdAt: -1 });

    res.json({
      dietTrackerData: log ? log.dietTrackerData : null,
      targetCalories: latestPlan && latestPlan.targetCalories ? latestPlan.targetCalories : 2500
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
