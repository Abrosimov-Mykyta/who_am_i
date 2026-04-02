const openaiService = require('../services/openai');

class QuizController {
  /**
   * Gets quiz questions
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  async getQuestions(req, res) {
    try {
      // Generate questions via OpenAI service
      const questions = await openaiService.generateQuizQuestions();
      
      res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      console.error('Error getting quiz questions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get quiz questions'
      });
    }
  }

  /**
   * Processes quiz results and generates an image
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  async processResults(req, res) {
    try {
      const { answers, totalScore } = req.body;

      // Generate an image prompt based on results
      const imagePrompt = await openaiService.generateImagePrompt({
        answers,
        totalScore
      });

      // Generate image using the image service
      const imageUrl = await openaiService.generateImage(imagePrompt);

      res.json({
        success: true,
        data: {
          imageUrl,
          prompt: imagePrompt
        }
      });
    } catch (error) {
      console.error('Error processing quiz results:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process quiz results'
      });
    }
  }
}

module.exports = new QuizController(); 