import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './WalletModal.css';
import './ResultModal.css';
import { useWallet } from '../context/WalletContext';
import WalletPanel from './WalletPanel';
import { ethers } from 'ethers';
import whoAmINftAbi from '../contracts/whoAmINftAbi.json';
import { resolveQuizImageUrl } from '../utils/resolveQuizImageUrl';

function resolveNftContractAddress() {
  const raw = process.env.REACT_APP_NFT_CONTRACT_ADDRESS?.trim();
  if (!raw) return null;
  if (!ethers.isAddress(raw)) return null;
  try {
    const addr = ethers.getAddress(raw);
    if (addr === ethers.ZeroAddress) return null;
    return addr;
  } catch {
    return null;
  }
}

const NFT_CONTRACT_ADDRESS = resolveNftContractAddress();

function ResultModal({ isOpen, onClose, result }) {
  const {
    isConnected,
    walletAddress,
    network,
    isCorrectNetwork,
    error,
    disconnect,
    addAmoyNetwork,
    AMOY_NETWORK_NAME,
  } = useWallet();

  const [nftMinted, setNftMinted] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState('');
  const [embeddedWalletOpen, setEmbeddedWalletOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNftMinted(false);
      setMintError('');
    } else {
      setEmbeddedWalletOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isConnected && embeddedWalletOpen) {
      setEmbeddedWalletOpen(false);
    }
  }, [isConnected, embeddedWalletOpen]);

  useEffect(() => {
    if (!embeddedWalletOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setEmbeddedWalletOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [embeddedWalletOpen]);

  const handleOpenWalletInResult = () => {
    setMintError('');
    setEmbeddedWalletOpen(true);
  };

  const handleMintNFT = async () => {
    if (!NFT_CONTRACT_ADDRESS) {
      setMintError(
        'Add REACT_APP_NFT_CONTRACT_ADDRESS to the project root .env (your Amoy contract), then restart npm start.'
      );
      return;
    }
    if (!result?.imageUrl) {
      setMintError('No NFT image found. Please take the quiz again.');
      return;
    }
    if (!window.ethereum) {
      setMintError('MetaMask not found.');
      return;
    }

    try {
      setIsMinting(true);
      setMintError('');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, whoAmINftAbi, signer);

      const mintPrice = await contract.mintPrice();
      const imageForMetadata = resolveQuizImageUrl(result.imageUrl);
      const metadata = {
        name: result.personalityType || 'Who Am I NFT',
        description: result.description || 'Generated from Who Am I quiz result.',
        image: imageForMetadata,
        attributes: [
          { trait_type: 'Personality', value: result.personalityType || 'Unknown' },
        ],
      };

      const tokenUri = `data:application/json;base64,${btoa(
        unescape(encodeURIComponent(JSON.stringify(metadata)))
      )}`;

      const feeData = await provider.getFeeData();
      const minTip = ethers.parseUnits('30', 'gwei');
      let maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? minTip;
      if (maxPriorityFeePerGas < minTip) maxPriorityFeePerGas = minTip;
      else maxPriorityFeePerGas = (maxPriorityFeePerGas * 15n) / 10n;

      let maxFeePerGas = feeData.maxFeePerGas;
      if (!maxFeePerGas || maxFeePerGas < maxPriorityFeePerGas * 2n) {
        maxFeePerGas = maxPriorityFeePerGas * 2n;
      }

      const tx = await contract.mint(tokenUri, {
        value: mintPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
      });
      await tx.wait();

      setNftMinted(true);
    } catch (err) {
      console.error('Mint error:', err);
      const msg = err?.shortMessage || err?.message || 'Failed to mint NFT';
      if (
        msg.includes('missing revert data') ||
        err?.code === 'CALL_EXCEPTION'
      ) {
        setMintError(
          'Mint failed (often: no Amoy MATIC for gas, wrong contract address, or network mismatch). Top up test MATIC and confirm REACT_APP_NFT_CONTRACT_ADDRESS matches your Amoy deployment.'
        );
      } else if (msg.includes('tip cap') || msg.includes('maxPriorityFeePerGas') || msg.includes('gas')) {
        setMintError(
          'Network gas fees are higher than the wallet suggested. Try again, or in MetaMask use Edit gas / Aggressive.'
        );
      } else {
        setMintError(msg);
      }
    } finally {
      setIsMinting(false);
    }
  };

  const hasContent =
    result &&
    (result.imageUrl ||
      result.personalityType ||
      result.description);

  if (!isOpen || !hasContent) return null;

  const displayImageUrl = result.imageUrl ? resolveQuizImageUrl(result.imageUrl) : null;

  const modal = (
    <div className="result-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="result-modal-title" data-modal="quiz-result">
      {embeddedWalletOpen && (
        <div
          className="result-modal-wallet-layer"
          role="presentation"
          onClick={() => setEmbeddedWalletOpen(false)}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="result-embedded-wallet-title" onClick={(e) => e.stopPropagation()}>
            <WalletPanel onClose={() => setEmbeddedWalletOpen(false)} titleId="result-embedded-wallet-title" />
          </div>
        </div>
      )}
      <div className="result-modal__surface result-modal__card">
        <button type="button" className="close-button" onClick={onClose} aria-label="Close">×</button>
        <div className="result-modal__layout result-modal__inner">
          <div className="result-modal__media-col result-modal__image-col">
            <h2 id="result-modal-title" className="result-title">{result.personalityType || 'Your result'}</h2>
            <div className="nft-image-container result-modal__nft-frame">
              {displayImageUrl ? (
                <img src={displayImageUrl} alt={result.personalityType || 'Quiz result'} className="nft-image" />
              ) : (
                <div className="result-modal__image-placeholder" aria-hidden>
                  Image loading…
                </div>
              )}
            </div>
          </div>
          <div className="result-modal__info-col">
            {nftMinted ? (
              <div className="nft-minted result-modal__minted">
                <div className="success-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>NFT Successfully Minted!</h3>
                <p>Your NFT is now available in your wallet.</p>
              </div>
            ) : (
              <>
                <p className="nft-description result-modal__description">{result.description}</p>
                <div className="result-modal__actions">
                  {isConnected ? (
                    <>
                      <div className="wallet-connected wallet-connected--compact result-modal__wallet-strip">
                        <p className="wallet-address">{walletAddress}</p>
                        <p className="network-info">{isCorrectNetwork ? '🟢' : '🔴'} {network}</p>
                        <button type="button" className="disconnect-button" onClick={disconnect}>Disconnect</button>
                      </div>
                      {!isCorrectNetwork && (
                        <button type="button" className="add-network-button" onClick={addAmoyNetwork}>
                          ➕ Add Polygon Amoy Testnet
                        </button>
                      )}
                      {isCorrectNetwork && !NFT_CONTRACT_ADDRESS && (
                        <div className="result-modal__config-hint">
                          <p>
                            Mint needs your NFT contract on Amoy. Set{' '}
                            <code>REACT_APP_NFT_CONTRACT_ADDRESS</code> in the project root{' '}
                            <code>.env</code>, then restart <code>npm start</code>. See{' '}
                            <code>.env.example</code>.
                          </p>
                        </div>
                      )}
                      {(error || mintError) && (
                        <div className="error-message"><p>{error || mintError}</p></div>
                      )}
                      <button
                        type="button"
                        className="mint-button result-modal__primary-btn"
                        onClick={handleMintNFT}
                        disabled={!isCorrectNetwork || isMinting || !NFT_CONTRACT_ADDRESS}
                      >
                        {isMinting ? 'Minting...' : !isCorrectNetwork ? `Switch to ${AMOY_NETWORK_NAME}` : !NFT_CONTRACT_ADDRESS ? 'Contract not configured' : '🎨 Mint My NFT'}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="result-modal-hint">
                        Connect your wallet to mint this result as an NFT on Polygon Amoy.
                      </p>
                      {mintError && (
                        <div className="error-message"><p>{mintError}</p></div>
                      )}
                      <button type="button" className="mint-button result-modal__primary-btn" onClick={handleOpenWalletInResult}>
                        Connect Wallet
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

ResultModal.displayName = 'ResultModal';

export default ResultModal;
