import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WalletContext = createContext(null);

const AMOY_CHAIN_ID = '0x13882';
const AMOY_NETWORK_NAME = 'Polygon Amoy Testnet';

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [network, setNetwork] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [error, setError] = useState('');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  const formatAddress = (address) =>
    `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  const handleChainChanged = useCallback((chainId) => {
    if (chainId === AMOY_CHAIN_ID) {
      setNetwork(AMOY_NETWORK_NAME);
      setIsCorrectNetwork(true);
      setError('');
    } else {
      setNetwork('Wrong Network');
      setIsCorrectNetwork(false);
      setError(`Please switch to ${AMOY_NETWORK_NAME}`);
    }
  }, []);

  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setWalletAddress(formatAddress(accounts[0]));
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    window.ethereum.request({ method: 'eth_chainId' })
      .then(handleChainChanged)
      .catch(console.error);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [handleAccountsChanged, handleChainChanged]);

  const connect = async () => {
    try {
      if (!window.ethereum) {
        setError('MetaMask not found. Please install the MetaMask extension.');
        return false;
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        setError('No accounts found.');
        return false;
      }
      setWalletAddress(formatAddress(accounts[0]));
      setIsConnected(true);
      setError('');
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      handleChainChanged(chainId);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Wallet connection error:', err);
      return false;
    }
  };

  const disconnect = () => {
    setWalletAddress('');
    setIsConnected(false);
    setNetwork('');
    setIsCorrectNetwork(false);
    setError('');
  };

  const addAmoyNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: AMOY_CHAIN_ID,
          chainName: AMOY_NETWORK_NAME,
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls: ['https://rpc-amoy.polygon.technology'],
          blockExplorerUrls: ['https://amoy.polygonscan.com'],
        }],
      });
    } catch (err) {
      console.error('Network add error:', err);
      setError('Failed to add network. Please try manually.');
    }
  };

  const openWalletModal = (results = null) => {
    setQuizResults(results);
    setIsWalletModalOpen(true);
  };

  const closeWalletModal = () => {
    setIsWalletModalOpen(false);
    setQuizResults(null);
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isConnected,
        network,
        isCorrectNetwork,
        error,
        isWalletModalOpen,
        quizResults,
        connect,
        disconnect,
        addAmoyNetwork,
        openWalletModal,
        closeWalletModal,
        AMOY_NETWORK_NAME,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};