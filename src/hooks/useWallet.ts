'use client';

import { useState, useEffect } from 'react';
import { launchpadClient } from '@/lib/flashnet';
import toast from 'react-hot-toast';

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<{
    confirmed: bigint;
    unconfirmed: bigint;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if wallet is already initialized
    try {
      const wallet = launchpadClient.getWallet();
      setIsConnected(true);
      setAddress(wallet.getAddress());
    } catch (error) {
      // Wallet not initialized
    }
  }, []);

  const connect = async () => {
    setIsLoading(true);
    try {
      // Use environment variable MNEMONIC or default test mnemonic
      // Following Flashnet documentation exactly
      // https://docs.flashnet.xyz/products/flashnet-amm/setup.md
      const result = await launchpadClient.initialize();

      if (result.success) {
        const wallet = launchpadClient.getWallet();
        setIsConnected(true);
        setAddress(wallet.getAddress());

        // Get balance
        const balanceData = await wallet.getBalance();
        setBalance(balanceData);

        toast.success('Wallet connected successfully!');
      } else {
        toast.error(result.error || 'Failed to connect wallet');
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet: ' + (error.message || error));
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance(null);
    toast.success('Wallet disconnected');
  };

  const refreshBalance = async () => {
    if (!isConnected) return;

    try {
      const wallet = launchpadClient.getWallet();
      const balanceData = await wallet.getBalance();
      setBalance(balanceData);
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  return {
    isConnected,
    address,
    balance,
    isLoading,
    connect,
    disconnect,
    refreshBalance,
  };
}
