import React from 'react';
import './WalletModal.css';
import { useWallet } from '../context/WalletContext';

function WalletPanel({ onClose, titleId = 'wallet-modal-title' }) {
  const {
    isConnected,
    walletAddress,
    network,
    isCorrectNetwork,
    error,
    connect,
    disconnect,
    addAmoyNetwork,
  } = useWallet();

  return (
    <div className="wallet-modal">
      <button type="button" className="close-button" onClick={onClose} aria-label="Close">×</button>
      <div className="wallet-content">
        <h2 id={titleId}>Connect Wallet</h2>

        {error && (
          <div className="error-message">
            {typeof error === 'string' && error.includes('MetaMask') ? (
              <p>{error}
                <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="error-link"> Install MetaMask</a>
              </p>
            ) : (
              <p>{error}</p>
            )}
          </div>
        )}

        {!isConnected ? (
          <>
            <p className="wallet-description">
              Connect your wallet to use NFT features on Polygon Amoy.
            </p>
            <div className="wallet-options">
              <button type="button" className="wallet-option" onClick={() => connect()}>
                <div className="wallet-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 7H5C3.89543 7 3 7.89543 3 9V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 9L12 14L21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>MetaMask</span>
              </button>
              <button type="button" className="wallet-option" disabled>
                <div className="wallet-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span>WalletConnect</span>
                <span className="coming-soon">(Coming Soon)</span>
              </button>
            </div>
          </>
        ) : (
          <div className="wallet-connected">
            <div className="wallet-icon connected">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p>Wallet Connected</p>
            <p className="wallet-address">{walletAddress}</p>
            {network && <p className="network-info">Network: {network}</p>}
            {!isCorrectNetwork && (
              <button type="button" className="add-network-button" onClick={addAmoyNetwork}>
                ➕ Add Polygon Amoy Testnet
              </button>
            )}
            <button type="button" className="disconnect-button" onClick={disconnect}>Disconnect Wallet</button>
          </div>
        )}
      </div>
    </div>
  );
}

WalletPanel.displayName = 'WalletPanel';

export default WalletPanel;
