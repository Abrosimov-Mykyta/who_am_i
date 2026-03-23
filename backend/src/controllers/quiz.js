const openaiService = require('../services/openai');

class QuizController {
  /**
   * Отримує питання для квізу
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  async getQuestions(req, res) {
    try {
      // Генеруємо питання через OpenAI
      const questions = await openaiService.generateQuizQuestions();
      
      res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      console.error('Помилка при отриманні питань:', error);
      res.status(500).json({
        success: false,
        error: 'Не вдалося отримати питання для квізу'
      });
    }
  }

  /**
   * Обробляє результати квізу та генерує зображення
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  async processResults(req, res) {
    try {
      const { answers, totalScore } = req.body;

      // Генеруємо опис для зображення на основі результатів
      const imagePrompt = await openaiService.generateImagePrompt({
        answers,
        totalScore
      });

      // Генеруємо зображення за допомогою DALL-E
      const imageUrl = await openaiService.generateImage(imagePrompt);

      res.json({
        success: true,
        data: {
          imageUrl,
          prompt: imagePrompt
        }
      });
    } catch (error) {
      console.error('Помилка при обробці результатів:', error);
      res.status(500).json({
        success: false,
        error: 'Не вдалося обробити результати квізу'
      });
    }
  }
}

module.exports = new QuizController(); 