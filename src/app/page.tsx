'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import TokenLaunchForm from '@/components/TokenLaunchForm';
import TradingInterface from '@/components/TradingInterface';
import { PoolInfo } from '@/types/flashnet';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPool, setSelectedPool] = useState<PoolInfo | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onPoolSelect={(pool) => {
          setSelectedPool(pool);
          setActiveTab('trade');
        }} />;
      case 'launch':
        return <TokenLaunchForm />;
      case 'trade':
        return selectedPool ? (
          <TradingInterface poolId={selectedPool.poolId} poolInfo={selectedPool} />
        ) : (
          <div className="max-w-4xl mx-auto p-6">
            <div className="glass rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold gradient-text mb-4">Select a Pool to Trade</h2>
              <p className="text-gray-400">Choose a bonding curve pool from the dashboard to start trading.</p>
            </div>
          </div>
        );
      case 'portfolio':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="glass rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold gradient-text mb-4">Portfolio Coming Soon</h2>
              <p className="text-gray-400">Track your LP positions, trading history, and portfolio performance.</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="pb-20 md:pb-6">
        {renderContent()}
      </main>
    </div>
  );
}