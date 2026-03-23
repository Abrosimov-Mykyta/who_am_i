import React, { useState } from 'react';
import './WalletModal.css';
import { useWallet } from '../context/WalletContext';

function WalletModal() {
  const {
    isWalletModalOpen,
    closeWalletModal,
    isConnected,
    walletAddress,
    network,
    isCorrectNetwork,
    error,
    quizResults,
    connect,
    disconnect,
    addAmoyNetwork,
    AMOY_NETWORK_NAME,
  } = useWallet();

  const [nftMinted, setNftMinted] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState('');

  React.useEffect(() => {
    if (isWalletModalOpen) {
      setNftMinted(false);
      setMintError('');
    }
  }, [isWalletModalOpen]);

  const handleMintNFT = async () => {
    alert('NFT minting coming soon! Smart contract deployment in progress.');
  };

  const handleClose = () => {
    setNftMinted(false);
    setMintError('');
    closeWalletModal();
  };

  if (!isWalletModalOpen) return null;

  // Режим з результатом тесту — широкий двоколонковий layout
  if (isConnected && quizResults && quizResults.imageUrl && !nftMinted) {
    return (
      <div className="wallet-modal-overlay">
        <div className="wallet-modal wallet-modal--wide">
          <button className="close-button" onClick={handleClose}>×</button>
          <div className="wallet-modal--wide-inner">
            <div className="wallet-modal--image-col">
              <h2 className="result-title">{quizResults.personalityType}</h2>
              <div className="nft-image-container">
                <img src={quizResults.imageUrl} alt={quizResults.personalityType} className="nft-image" />
              </div>
            </div>
            <div className="wallet-modal--info-col">
              <p className="nft-description">{quizResults.description}</p>
              <div className="wallet-connected wallet-connected--compact">
                <p className="wallet-address">{walletAddress}</p>
                <p className="network-info">{isCorrectNetwork ? '🟢' : '🔴'} {network}</p>
                <button className="disconnect-button" onClick={disconnect}>Disconnect</button>
              </div>
              {!isCorrectNetwork && (
                <button className="add-network-button" onClick={addAmoyNetwork}>
                  ➕ Add Polygon Amoy Testnet
                </button>
              )}
              {(error || mintError) && (
                <div className="error-message"><p>{error || mintError}</p></div>
              )}
              <button
                className="mint-button"
                onClick={handleMintNFT}
                disabled={!isCorrectNetwork || isMinting}
              >
                {isMinting ? 'Minting...' : !isCorrectNetwork ? `Switch to ${AMOY_NETWORK_NAME}` : '🎨 Mint My NFT'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Стандартний режим
  return (
    <div className="wallet-modal-overlay">
      <div className="wallet-modal">
        <button className="close-button" onClick={handleClose}>×</button>
        <div className="wallet-content">
          <h2>Connect Wallet</h2>

          {(error || mintError) && (
            <div className="error-message">
              {(error || mintError).includes('MetaMask') ? (
                <p>{error || mintError}
                  <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="error-link"> Install MetaMask</a>
                </p>
              ) : (
                <p>{error || mintError}</p>
              )}
            </div>
          )}

          {nftMinted ? (
            <div className="nft-minted">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>NFT Successfully Minted!</h3>
              <p>Your NFT is now available in your wallet.</p>
            </div>
          ) : !isConnected ? (
            <>
              <p className="wallet-description">
                {quizResults ? 'Connect your wallet to receive an NFT with your test result.' : 'Connect your wallet to access all features.'}
              </p>
              <div className="wallet-options">
                <button className="wallet-option" onClick={connect}>
                  <div className="wallet-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 7H5C3.89543 7 3 7.89543 3 9V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 9L12 14L21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>MetaMask</span>
                </button>
                <button className="wallet-option" disabled>
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
                <button className="add-network-button" onClick={addAmoyNetwork}>
                  ➕ Add Polygon Amoy Testnet
                </button>
              )}
              <button className="disconnect-button" onClick={disconnect}>Disconnect Wallet</button>
              <p style={{ color: '#b4b4b4', textAlign: 'center', marginTop: '1rem' }}>
                Take the quiz first to get your NFT!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WalletModal;