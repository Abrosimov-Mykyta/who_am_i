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

  const formatAddress = (address) =>
    `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  const disconnect = useCallback(() => {
    setWalletAddress('');
    setIsConnected(false);
    setNetwork('');
    setIsCorrectNetwork(false);
    setError('');
  }, []);

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

  const applyAccounts = useCallback((accounts) => {
    if (!accounts || accounts.length === 0) {
      disconnect();
      return;
    }
    setWalletAddress(formatAddress(accounts[0]));
    setIsConnected(true);
  }, [disconnect]);

  const handleAccountsChanged = useCallback((accounts) => {
    applyAccounts(accounts);
  }, [applyAccounts]);

  const syncAccountsFromWallet = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      applyAccounts(accounts);
    } catch (e) {
      console.error('eth_accounts sync error:', e);
    }
  }, [applyAccounts]);

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    window.ethereum.request({ method: 'eth_chainId' })
      .then(handleChainChanged)
      .catch(console.error);

    window.ethereum.request({ method: 'eth_accounts' })
      .then((accounts) => {
        applyAccounts(accounts);
        if (accounts.length > 0) {
          return window.ethereum.request({ method: 'eth_chainId' });
        }
        return null;
      })
      .then((chainId) => {
        if (chainId) handleChainChanged(chainId);
      })
      .catch(console.error);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [handleAccountsChanged, handleChainChanged, applyAccounts]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        syncAccountsFromWallet();
      }
    };
    window.addEventListener('focus', syncAccountsFromWallet);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', syncAccountsFromWallet);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [syncAccountsFromWallet]);

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
      applyAccounts(accounts);
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

  const addAmoyNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: AMOY_CHAIN_ID,
          chainName: AMOY_NETWORK_NAME,
          nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
          rpcUrls: ['https://rpc-amoy.polygon.technology'],
          blockExplorerUrls: ['https://amoy.polygonscan.com'],
        }],
      });
    } catch (err) {
      console.error('Network add error:', err);
      setError('Failed to add network. Please try manually.');
    }
  };

  const openWalletModal = () => {
    setIsWalletModalOpen(true);
  };

  const closeWalletModal = () => {
    setIsWalletModalOpen(false);
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
