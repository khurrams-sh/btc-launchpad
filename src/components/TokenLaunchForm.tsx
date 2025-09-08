'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Zap, DollarSign, Target, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { TokenLaunchParams } from '@/types/flashnet';
import { launchpadClient } from '@/lib/flashnet';
import { FlashnetClient } from '@flashnet/sdk';

export default function TokenLaunchForm() {
  const [formData, setFormData] = useState<Partial<TokenLaunchParams>>({
    name: '',
    symbol: '',
    description: '',
    imageUrl: '',
    initialSupply: BigInt(1000000),
    graduationThresholdPct: 80,
    targetRaise: BigInt(100000000), // 1 BTC in sats
    lpFeeRateBps: 30, // 0.3%
    totalHostFeeRateBps: 50, // 0.5%
  });

  const [isLaunching, setIsLaunching] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const handleInputChange = (field: keyof TokenLaunchParams, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate preview data
    if (field === 'initialSupply' || field === 'graduationThresholdPct' || field === 'targetRaise') {
      updatePreview();
    }
  };

  const updatePreview = () => {
    if (formData.initialSupply && formData.graduationThresholdPct && formData.targetRaise) {
      try {
        // Use Flashnet SDK's calculateVirtualReserves method exactly as per docs
        // https://docs.flashnet.xyz/products/flashnet-amm/creation.md#creating-a-single-sided-pool
        const preview = FlashnetClient.calculateVirtualReserves({
          initialTokenSupply: formData.initialSupply.toString(),
          graduationThresholdPct: formData.graduationThresholdPct,
          targetRaise: formData.targetRaise.toString(),
        });
        setPreviewData(preview);
      } catch (error) {
        console.error('Preview calculation failed:', error);
      }
    }
  };

  const handleLaunch = async () => {
    if (!formData.name || !formData.symbol || !formData.initialSupply) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLaunching(true);

    try {
      const result = await launchpadClient.launchToken(formData as TokenLaunchParams);

      if (result.success) {
        toast.success('Token launched successfully! 🚀');
        // Reset form or redirect
        setFormData({
          name: '',
          symbol: '',
          description: '',
          imageUrl: '',
          initialSupply: BigInt(1000000),
          graduationThresholdPct: 80,
          targetRaise: BigInt(100000000),
          lpFeeRateBps: 30,
          totalHostFeeRateBps: 50,
        });
      } else {
        toast.error(result.error || 'Failed to launch token');
      }
    } catch (error: any) {
      console.error('Token launch error:', error);
      toast.error('Launch failed: ' + (error.message || error));
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Launch Form */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Rocket className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold gradient-text">Launch Token</h2>
              <p className="text-gray-400">Create your Bitcoin token with bonding curve</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-500">Token Details</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Token Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Super Bitcoin Token"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Symbol *</label>
                <input
                  type="text"
                  value={formData.symbol || ''}
                  onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                  placeholder="e.g., SBT"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your token..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-amber-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl || ''}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Bonding Curve Parameters */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-500">Bonding Curve</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Initial Supply</label>
                <input
                  type="number"
                  value={Number(formData.initialSupply || 0)}
                  onChange={(e) => handleInputChange('initialSupply', BigInt(Math.max(1, parseInt(e.target.value) || 1)))}
                  placeholder="1000000"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-emerald-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">Total tokens to be created</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Graduation Threshold (%)</label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={formData.graduationThresholdPct || 80}
                  onChange={(e) => handleInputChange('graduationThresholdPct', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50%</span>
                  <span className="text-emerald-500 font-medium">{formData.graduationThresholdPct}%</span>
                  <span>95%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">% of tokens sold before graduation to constant product AMM</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Raise (BTC)</label>
                <input
                  type="number"
                  step="0.01"
                  value={Number(formData.targetRaise || 0) / 100000000}
                  onChange={(e) => handleInputChange('targetRaise', BigInt(Math.floor((parseFloat(e.target.value) || 0) * 100000000)))}
                  placeholder="1.0"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-emerald-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">BTC to raise at graduation</p>
              </div>
            </div>

            {/* Fee Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-500">Fees</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">LP Fee (basis points)</label>
                <input
                  type="number"
                  value={formData.lpFeeRateBps || 30}
                  onChange={(e) => handleInputChange('lpFeeRateBps', parseInt(e.target.value) || 30)}
                  placeholder="30"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">Trading fee for liquidity providers (30 = 0.3%)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Host Fee (basis points)</label>
                <input
                  type="number"
                  value={formData.totalHostFeeRateBps || 50}
                  onChange={(e) => handleInputChange('totalHostFeeRateBps', parseInt(e.target.value) || 50)}
                  placeholder="50"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">Additional fee for platform (50 = 0.5%)</p>
              </div>
            </div>

            <button
              onClick={handleLaunch}
              disabled={isLaunching || !formData.name || !formData.symbol}
              className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 text-black font-bold py-4 px-6 rounded-lg hover:from-amber-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 neon-glow"
            >
              {isLaunching ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  Launching...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Launch Token
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold gradient-text">Launch Preview</h2>
              <p className="text-gray-400">Bonding curve parameters</p>
            </div>
          </div>

          {formData.name && formData.symbol ? (
            <div className="space-y-6">
              {/* Token Preview */}
              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 flex items-center justify-center text-black font-bold text-lg">
                    {formData.symbol?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{formData.name}</h3>
                    <p className="text-gray-400">${formData.symbol}</p>
                  </div>
                </div>
                {formData.description && (
                  <p className="mt-3 text-gray-300 text-sm">{formData.description}</p>
                )}
              </div>

              {/* Launch Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-amber-500 font-medium">INITIAL SUPPLY</span>
                  </div>
                  <p className="font-bold">{Number(formData.initialSupply || 0).toLocaleString()}</p>
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-emerald-500 font-medium">TARGET RAISE</span>
                  </div>
                  <p className="font-bold">{(Number(formData.targetRaise || 0) / 100000000).toFixed(4)} BTC</p>
                </div>

                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-blue-500 font-medium">GRADUATION</span>
                  </div>
                  <p className="font-bold">{formData.graduationThresholdPct}% sold</p>
                </div>

                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="text-xs text-purple-500 font-medium">TOTAL FEES</span>
                  </div>
                  <p className="font-bold">{((formData.lpFeeRateBps || 0) + (formData.totalHostFeeRateBps || 0)) / 100}%</p>
                </div>
              </div>

              {/* Bonding Curve Info */}
              {previewData && (
                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <h4 className="font-semibold text-emerald-500 mb-3">Bonding Curve Parameters</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Virtual Reserve A:</span>
                      <span className="font-mono">{previewData.virtualReserveA.toString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Virtual Reserve B:</span>
                      <span className="font-mono">{previewData.virtualReserveB.toString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Graduation Threshold:</span>
                      <span className="font-mono">{previewData.threshold.toString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-semibold text-blue-500 mb-2">How it works</h4>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Tokens start with bonding curve pricing</li>
                  <li>• Price increases as more tokens are sold</li>
                  <li>• At {formData.graduationThresholdPct}% sold, graduates to constant product AMM</li>
                  <li>• Becomes tradeable on regular DEX after graduation</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Rocket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Fill in the form to see preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
