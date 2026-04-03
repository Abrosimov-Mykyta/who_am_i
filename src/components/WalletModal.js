import React from 'react';
import { createPortal } from 'react-dom';
import './WalletModal.css';
import { useWallet } from '../context/WalletContext';
import WalletPanel from './WalletPanel';

function WalletModal() {
  const { isWalletModalOpen, closeWalletModal } = useWallet();

  if (!isWalletModalOpen) return null;

  const modal = (
    <div
      className="wallet-modal-overlay wallet-modal-overlay--portal"
      style={{ zIndex: 2147483646 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-modal-title"
    >
      <WalletPanel onClose={closeWalletModal} />
    </div>
  );

  return createPortal(modal, document.body);
}

WalletModal.displayName = 'WalletModal';

export default WalletModal;
