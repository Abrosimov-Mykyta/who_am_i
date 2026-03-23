import React, { useState, useEffect } from 'react';
import './QuizModal.css';
import LoadingSpinner from './LoadingSpinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const QuizModal = ({ isOpen, onClose, onQuizComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      resetQuiz();
      fetchQuestions();
    }
  }, [isOpen]);

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setError(null);
  };

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/quiz/questions`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get questions');
      }

      setQuestions(data.data);
    } catch (error) {
      console.error('Помилка отримання питань:', error);
      setError('Не вдалося завантажити питання. Спробуй ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (answerIndex) => {
    const newAnswers = [
      ...answers,
      {
        question: questions[currentQuestion].question,
        answer: questions[currentQuestion].options[answerIndex],
        weight: questions[currentQuestion].weights[answerIndex],
      },
    ];

    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Останнє питання — відправляємо результати
      const totalScore = newAnswers.reduce((sum, a) => sum + a.weight, 0);
      setIsSubmitting(true);
      try {
        await onQuizComplete(newAnswers, totalScore);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setAnswers(answers.slice(0, -1));
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleClose = () => {
    resetQuiz();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content quiz-modal">
        <button className="close-button" onClick={handleClose}>×</button>

        {isLoading ? (
          <LoadingSpinner message="AI is generating questions for you..." />
        ) : isSubmitting ? (
          <LoadingSpinner message="AI is analyzing your personality..." />
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button className="retry-button" onClick={fetchQuestions}>
              Try Again
            </button>
          </div>
        ) : questions ? (
          <>
            <div className="question-counter">
              Question {currentQuestion + 1} of {questions.length}
            </div>

            <h2 className="question-text">
              {questions[currentQuestion].question}
            </h2>

            <div className="options-container">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className="option-button"
                  onClick={() => handleAnswer(index)}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="navigation-buttons">
              <button
                className="nav-button"
                onClick={goToPreviousQuestion}
                disabled={currentQuestion === 0}
              >
                ← Back
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default QuizModal;