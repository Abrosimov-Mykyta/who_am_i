import React from 'react';
import { WalletProvider } from './context/WalletContext';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import WalletModal from './components/WalletModal';

function App() {
  return (
    <WalletProvider>
      <div className="App">
        <Header />
        <Hero />
        <About />
        <Testimonials />
        <Footer />
        {/* Один єдиний WalletModal для всього додатку */}
        <WalletModal />
      </div>
    </WalletProvider>
  );
}

export default App;