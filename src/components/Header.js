import React from 'react';
import './Header.css';
import { useWallet } from '../context/WalletContext';

function Header() {
  const { isConnected, walletAddress, openWalletModal } = useWallet();

  return (
    <header className="header">
      <div className="logo">
        <span className="logo-text">Who Am I</span>
      </div>

      <button className="wallet-button" onClick={openWalletModal}>
        {isConnected ? walletAddress : 'Connect Wallet'}
      </button>
    </header>
  );
}

export default Header;