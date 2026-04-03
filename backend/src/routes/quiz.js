const express = require('express');
const quizService = require('../services/openai');
const { saveQuizImagePng } = require('../lib/saveQuizImage');

const router = express.Router();

router.get('/questions', async (req, res) => {
  try {
    const questions = await quizService.generateQuizQuestions();
    res.json({ success: true, data: questions });
  } catch (error) {
    console.error('Error getting quiz questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get quiz questions',
    });
  }
});

router.post('/results', async (req, res) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Answers array is required',
      });
    }

    const personalityResult = await quizService.generatePersonalityResult(answers);
    const imageBuffer = await quizService.generateImage(personalityResult.imageStyle);
    const imageUrl = await saveQuizImagePng(imageBuffer);

    res.json({
      success: true,
      data: {
        imageUrl,
        personalityType: personalityResult.personalityType,
        description: personalityResult.description,
      },
    });
  } catch (error) {
    console.error('Error processing quiz results:', error);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production'
        ? 'Failed to process quiz results'
        : (error.message || 'Failed to process quiz results'),
    });
  }
});

module.exports = router;