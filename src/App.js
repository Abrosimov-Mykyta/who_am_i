import React, { useState } from 'react';
import { WalletProvider } from './context/WalletContext';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import ResultModal from './components/ResultModal';
import WalletModal from './components/WalletModal';

function App() {
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  return (
    <WalletProvider>
      <div className="App">
        <Header />
        <Hero
          onQuizResultReady={(payload) => {
            setQuizResult(payload);
            setIsResultModalOpen(true);
          }}
        />
        <About />
        <Testimonials />
        <Footer />
        <ResultModal
          isOpen={isResultModalOpen}
          result={quizResult}
          onClose={() => {
            setIsResultModalOpen(false);
            setQuizResult(null);
          }}
        />
        <WalletModal />
      </div>
    </WalletProvider>
  );
}

export default App;