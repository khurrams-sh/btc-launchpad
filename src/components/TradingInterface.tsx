'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, TrendingUp, TrendingDown, Zap, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { SwapParams, PoolInfo, PriceData } from '@/types/flashnet';
import { launchpadClient } from '@/lib/flashnet';

interface TradingInterfaceProps {
  poolId: string;
  poolInfo: PoolInfo;
}

export default function TradingInterface({ poolId, poolInfo }: TradingInterfaceProps) {
  const [swapDirection, setSwapDirection] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(1); // 1%
  const [isSwapping, setIsSwapping] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [priceData, setPriceData] = useState<PriceData[]>([]);

  // Load real price data for chart
  useEffect(() => {
    const loadPriceData = async () => {
      try {
        // For now, we'll show empty chart until we have historical data API
        // In production, this would fetch from Flashnet's price history API
        setPriceData([]);

        // TODO: Replace with actual price history API call
        // const historicalData = await launchpadClient.getPriceHistory(poolId);
        // setPriceData(historicalData.map(item => ({
        //   timestamp: item.timestamp,
        //   price: item.price,
        //   volume: item.volume
        // })));

      } catch (error) {
        console.error('Failed to load price data:', error);
        setPriceData([]);
      }
    };

    loadPriceData();
    // Refresh every 30 seconds
    const interval = setInterval(loadPriceData, 30000);
    return () => clearInterval(interval);
  }, [poolId]);

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSwapping(true);

    try {
      // 🎯 SWAP EXECUTION - Following Flashnet docs exactly
      // https://docs.flashnet.xyz/products/flashnet-amm/swaps.md#executing-a-swap
      const swapParams: SwapParams = {
        poolId,
        assetIn: swapDirection === 'buy' ? '020202020202020202020202020202020202020202020202020202020202020202' : poolInfo.assetAAddress,
        assetOut: swapDirection === 'buy' ? poolInfo.assetAAddress : '020202020202020202020202020202020202020202020202020202020202020202',
        amountIn: BigInt(Math.floor(parseFloat(amount) * (swapDirection === 'buy' ? 100000000 : 1000000))),
        minAmountOut: BigInt(0), // Will be calculated with slippage protection in executeSwap
        maxSlippageBps: slippage * 100,
      };

      console.log('Executing swap:', {
        direction: swapDirection,
        amount: amount,
        assetIn: swapParams.assetIn,
        assetOut: swapParams.assetOut,
        amountIn: swapParams.amountIn.toString(),
        maxSlippageBps: swapParams.maxSlippageBps
      });

      const result = await launchpadClient.executeSwap(swapParams);

      if (result.success) {
        toast.success(`${swapDirection === 'buy' ? 'Bought' : 'Sold'} tokens successfully! 🎉`);
        setAmount('');
        setQuote(null);
      } else {
        toast.error(result.error || 'Swap failed');
      }
    } catch (error: any) {
      console.error('Swap execution error:', error);
      toast.error('Swap failed: ' + (error.message || error));
    } finally {
      setIsSwapping(false);
    }
  };

  const handleAmountChange = async (value: string) => {
    setAmount(value);

    if (value && parseFloat(value) > 0) {
      try {
        // 🎯 SWAP SIMULATION - Following Flashnet docs
        // https://docs.flashnet.xyz/products/flashnet-amm/swaps.md#simulating-a-swap
        const swapParams: SwapParams = {
          poolId,
          assetIn: swapDirection === 'buy' ? '020202020202020202020202020202020202020202020202020202020202020202' : poolInfo.assetAAddress,
          assetOut: swapDirection === 'buy' ? poolInfo.assetAAddress : '020202020202020202020202020202020202020202020202020202020202020202',
          amountIn: BigInt(Math.floor(parseFloat(value) * (swapDirection === 'buy' ? 100000000 : 1000000))),
          minAmountOut: BigInt(0),
          maxSlippageBps: slippage * 100,
        };

        console.log('Getting swap quote for:', {
          direction: swapDirection,
          amount: value,
          assetIn: swapParams.assetIn,
          assetOut: swapParams.assetOut,
          amountIn: swapParams.amountIn.toString()
        });

        const quoteResult = await launchpadClient.getSwapQuote(swapParams);
        setQuote(quoteResult);
      } catch (error) {
        console.error('Failed to get quote:', error);
        setQuote(null);
      }
    } else {
      setQuote(null);
    }
  };

  const flipSwapDirection = () => {
    setSwapDirection(prev => prev === 'buy' ? 'sell' : 'buy');
    setAmount('');
    setQuote(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Panel */}
        <div className="lg:col-span-1">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Zap className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold gradient-text">Quick Trade</h2>
                <p className="text-gray-400 text-sm">Buy or sell tokens instantly</p>
              </div>
            </div>

            {/* Trade Direction Toggle */}
            <div className="flex rounded-lg bg-gray-800 p-1 mb-6">
              <button
                onClick={() => setSwapDirection('buy')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  swapDirection === 'buy'
                    ? 'bg-emerald-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setSwapDirection('sell')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  swapDirection === 'sell'
                    ? 'bg-red-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sell
              </button>
            </div>

            {/* From Token */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  You {swapDirection === 'buy' ? 'pay' : 'sell'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-4 py-3 pr-20 rounded-lg bg-gray-800 border border-gray-700 focus:border-emerald-500 focus:outline-none transition-colors text-lg"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-sm font-medium text-gray-400">
                      {swapDirection === 'buy' ? 'BTC' : 'TOKEN'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center">
                <button
                  onClick={flipSwapDirection}
                  className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </div>

              {/* To Token */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  You receive
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={quote ? Number(quote.amountOut).toLocaleString() : '0.0'}
                    disabled
                    className="w-full px-4 py-3 pr-20 rounded-lg bg-gray-700 border border-gray-600 text-lg"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-sm font-medium text-gray-400">
                      {swapDirection === 'buy' ? 'TOKEN' : 'BTC'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quote Details */}
              {quote && (
                <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price Impact:</span>
                    <span className={quote.priceImpact > 5 ? 'text-red-400' : 'text-emerald-400'}>
                      {quote.priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">LP Fee:</span>
                    <span className="text-gray-300">{Number(quote.lpFee).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platform Fee:</span>
                    <span className="text-gray-300">{Number(quote.hostFee).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Slippage Settings */}
              <div>
                <label className="block text-sm font-medium mb-2">Slippage Tolerance</label>
                <div className="flex gap-2">
                  {[0.5, 1, 2.5, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSlippage(value)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        slippage === value
                          ? 'bg-emerald-500 text-black'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                disabled={isSwapping || !amount || parseFloat(amount) <= 0}
                className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-200 ${
                  swapDirection === 'buy'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                } text-black disabled:opacity-50 disabled:cursor-not-allowed neon-glow`}
              >
                {isSwapping ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    Swapping...
                  </div>
                ) : (
                  `${swapDirection === 'buy' ? 'Buy' : 'Sell'} Tokens`
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Chart and Pool Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Chart */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Price Chart</h3>
                <p className="text-gray-400 text-sm">24H trading activity</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500 text-sm font-medium">
                    {poolInfo.graduationProgress ? `+${poolInfo.graduationProgress}%` : '--%'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    ${(Number(poolInfo.totalLiquidity || 0) / Number(poolInfo.totalLiquidity || 1) * 0.01).toFixed(4)}
                  </p>
                  <p className="text-gray-400 text-xs">Estimated Price</p>
                </div>
              </div>
            </div>

            <div className="h-64">
              {priceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Price Chart</p>
                    <p className="text-sm">Historical data not available yet</p>
                    <p className="text-xs mt-2">Chart will populate as trading activity increases</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pool Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-emerald-500 font-medium">TOTAL LIQUIDITY</span>
              </div>
              <p className="font-bold text-lg">${(Number(poolInfo.totalLiquidity || 0) / 1000000).toFixed(2)}M</p>
              <p className="text-xs text-gray-400">Available for trading</p>
            </div>

            <div className="glass rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-500 font-medium">24H VOLUME</span>
              </div>
              <p className="font-bold text-lg">${(Number(poolInfo.volume24h || 0) / 1000000).toFixed(2)}M</p>
              <p className="text-xs text-gray-400">Trading volume</p>
            </div>

            <div className="glass rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-500 font-medium">GRADUATION</span>
              </div>
              <p className="font-bold text-lg">{poolInfo.graduationProgress || 0}%</p>
              <p className="text-xs text-gray-400">Progress to AMM</p>
            </div>
          </div>

          {/* Pool Info */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Pool Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-amber-500 mb-2">Pool Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pool ID:</span>
                    <span className="font-mono text-xs">{poolId.slice(0, 8)}...{poolId.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Curve Type:</span>
                    <span className="text-emerald-400">{poolInfo.curveType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">LP Fee:</span>
                    <span>{poolInfo.lpFeeRateBps / 100}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platform Fee:</span>
                    <span>{poolInfo.totalHostFeeRateBps / 100}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-emerald-500 mb-2">Bonding Curve Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={poolInfo.isGraduated ? 'text-emerald-400' : 'text-amber-400'}>
                      {poolInfo.isGraduated ? 'Graduated' : 'Bonding Curve'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Progress:</span>
                    <span>{poolInfo.graduationProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(poolInfo.graduationProgress || 0, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {poolInfo.isGraduated ? 'Pool has graduated to constant product AMM' : 'Tokens will graduate to constant product AMM at completion'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
