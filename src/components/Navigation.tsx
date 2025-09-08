'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Zap, BarChart3, Wallet, Settings, Menu, X } from 'lucide-react';
import { launchpadClient } from '@/lib/flashnet';
import { useWallet } from '@/hooks/useWallet';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected, address, balance, isLoading, connect, disconnect } = useWallet();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'launch', label: 'Launch', icon: Rocket },
    { id: 'trade', label: 'Trade', icon: Zap },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between p-6 glass rounded-xl mx-6 mt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-500">
            <Rocket className="h-6 w-6 text-black" />
          </div>
          <div>
            <h1 className="font-bold text-xl gradient-text">BTC Launchpad</h1>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 text-xs">Powered by Flashnet AMM</p>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={`text-xs ${isConnected ? 'text-emerald-500' : 'text-red-500'}`}>
                {isConnected ? '⚡ Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-white border border-amber-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to right, rgba(245, 158, 11, 0.1), rgba(16, 185, 129, 0.1))',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
            <Settings className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            {isConnected && address && (
              <div className="text-xs text-gray-400 font-mono">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            )}
            <button
              onClick={isConnected ? disconnect : connect}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                isConnected
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                  : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? '...' : isConnected ? 'Disconnect' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 glass rounded-xl mx-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-500">
              <Rocket className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="font-bold text-lg gradient-text">BTC Launchpad</h1>
            </div>
          </div>

          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={toggleMobileMenu}
          >
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                height: '100%',
                width: '20rem',
                background: '#111827',
                borderLeft: '1px solid #374151',
                padding: '1.5rem'
              }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold gradient-text">Menu</h2>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 mb-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        toggleMobileMenu();
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-white border border-amber-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </button>

                {isConnected && address && (
                  <div className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">Wallet Address</div>
                    <div className="text-xs font-mono text-emerald-400">
                      {address.slice(0, 8)}...{address.slice(-6)}
                    </div>
                  </div>
                )}

                <button
                  onClick={isConnected ? disconnect : connect}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    isConnected
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                      : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Connecting...' : isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
                </button>
              </div>
              </motion.div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'text-amber-500'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
