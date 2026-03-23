import React, { useState } from 'react';
import './Hero.css';
import QuizModal from './QuizModal';
import { useWallet } from '../context/WalletContext';
import quizIcon from '../assets/quiz-icon.png';
import aiNftIcon from '../assets/ai-nft-icon.png';
import memeIcon from '../assets/meme-icon.png';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const Hero = () => {
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [apiError, setApiError] = useState(null);
  const { openWalletModal } = useWallet();

  const handleQuizComplete = async (answers, totalScore) => {
    try {
      setApiError(null);
      const response = await fetch(`${API_URL}/api/quiz/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, totalScore }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Помилка обробки результатів');
      }

      setIsQuizModalOpen(false);

      // Передаємо результати прямо в openWalletModal через контекст
      openWalletModal({
        answers,
        totalScore,
        imageUrl: data.data.imageUrl,
        personalityType: data.data.personalityType,
        description: data.data.description,
      });
    } catch (error) {
      console.error('Помилка обробки результатів:', error);
      setApiError('Не вдалося отримати результат. Спробуй ще раз.');
    }
  };

  return (
    <section className="hero" id="home">
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <h1 className="hero-title">
          Who are <span className="highlight">you</span> really?
        </h1>

        <p className="hero-subtitle">
          Take a personality quiz and get a unique NFT image
        </p>

        {apiError && (
          <p style={{ color: '#ff4444', fontSize: '0.9rem' }}>{apiError}</p>
        )}

        <button
          className="cta-button primary"
          onClick={() => setIsQuizModalOpen(true)}
        >
          TAKE THE QUIZ
        </button>

        <div className="hero-features">
          <div className="feature-item">
            <img src={quizIcon} alt="Personality Quiz" className="feature-image" />
            <div className="feature-label">Personality Quiz</div>
          </div>
          <div className="feature-item">
            <img src={aiNftIcon} alt="AI NFT Generation" className="feature-image" />
            <div className="feature-label">AI NFT Generation</div>
          </div>
          <div className="feature-item">
            <img src={memeIcon} alt="Meme Therapy" className="feature-image" />
            <div className="feature-label">Meme Therapy</div>
          </div>
        </div>

        <p className="disclaimer">
          * Quiz results and generated images are stored as NFTs in your wallet
        </p>
      </div>

      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onQuizComplete={handleQuizComplete}
      />
    </section>
  );
};

export default Hero;