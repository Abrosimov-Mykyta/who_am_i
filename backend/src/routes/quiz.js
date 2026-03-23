const express = require('express');
const quizService = require('../services/openai');

const router = express.Router();

router.get('/questions', async (req, res) => {
  try {
    const questions = await quizService.generateQuizQuestions();
    res.json({ success: true, data: questions });
  } catch (error) {
    console.error('Помилка при отриманні питань:', error);
    res.status(500).json({
      success: false,
      error: 'Не вдалося отримати питання для квізу',
    });
  }
});

router.post('/results', async (req, res) => {
  try {
    const { totalScore } = req.body;
    const personalityType = quizService.getPersonalityType(totalScore);
    const imageUrl = await quizService.generateImage(personalityType);

    res.json({
      success: true,
      data: {
        imageUrl,
        personalityType: personalityType.type,
        description: personalityType.description,
      },
    });
  } catch (error) {
    console.error('Помилка при обробці результатів:', error);
    res.status(500).json({
      success: false,
      error: 'Не вдалося обробити результати квізу',
    });
  }
});

module.exports = router;