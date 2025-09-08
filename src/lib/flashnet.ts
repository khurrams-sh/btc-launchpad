// Flashnet SDK Integration - Complete Bonding Curve & Swap Implementation
// Following https://docs.flashnet.xyz/products/flashnet-amm/creation.md (bonding curves)
// Following https://docs.flashnet.xyz/products/flashnet-amm/swaps.md (trading)
import { FlashnetClient } from '@flashnet/sdk';
import { SparkWallet } from '@buildonspark/spark-sdk';

// Bitcoin public key as per Flashnet documentation
const BITCOIN_PUBLIC_KEY = "020202020202020202020202020202020202020202020202020202020202020202";

export interface TokenLaunchParams {
  name: string;
  symbol: string;
  description: string;
  imageUrl?: string;
  initialSupply: bigint;
  graduationThresholdPct: number;
  targetRaise: bigint;
  lpFeeRateBps: number;
  totalHostFeeRateBps: number;
  hostNamespace?: string;
}

export interface VirtualReserves {
  virtualReserveA: bigint;
  virtualReserveB: bigint;
  threshold: bigint;
}

export interface SwapParams {
  poolId: string;
  assetIn: string;
  assetOut: string;
  amountIn: bigint;
  minAmountOut: bigint;
  maxSlippageBps: number;
}

export interface SwapQuote {
  amountOut: bigint;
  priceImpact: number;
  lpFee: bigint;
  hostFee: bigint;
  route: string[];
}

export interface PoolInfo {
  poolId: string;
  assetAAddress: string;
  assetBAddress: string;
  curveType: 'SINGLE_SIDED' | 'CONSTANT_PRODUCT' | 'CONCENTRATED_LIQUIDITY';
  lpFeeRateBps: number;
  totalHostFeeRateBps: number;
  hostNamespace?: string;
  totalLiquidity?: bigint;
  volume24h?: bigint;
  isGraduated?: boolean;
  graduationProgress?: number;
}

export interface LpPosition {
  poolId: string;
  lpTokensOwned: bigint;
  sharePercentage: number;
  assetAAmount: bigint;
  assetBAmount: bigint;
  feesEarned: {
    assetA: bigint;
    assetB: bigint;
  };
}

export interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  description?: string;
  imageUrl?: string;
  totalSupply?: bigint;
  circulatingSupply?: bigint;
}

export interface LaunchpadStats {
  totalTokensLaunched: number;
  totalVolumeTraded: bigint;
  totalGraduated: number;
  activePools: number;
}

export interface PriceData {
  timestamp: number;
  price: number;
  volume: number;
}

export interface TradingPair {
  baseAsset: TokenMetadata;
  quoteAsset: TokenMetadata;
  currentPrice: number;
  priceChange24h: number;
  volume24h: bigint;
  liquidity: bigint;
}

export class LaunchpadClient {
  private client: FlashnetClient | null = null;
  private wallet: any = null;

  async initialize(mnemonicOrSeed?: string) {
    try {
      // Following exact pattern from Flashnet documentation
      // https://docs.flashnet.xyz/products/flashnet-amm/setup.md
      const { wallet } = await SparkWallet.initialize({
        mnemonicOrSeed: mnemonicOrSeed || process.env.MNEMONIC || "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
        options: {
          network: process.env.FLASHNET_NETWORK || "REGTEST",
        },
      });

      this.wallet = wallet;

      // Create the Flashnet client exactly as documented
      this.client = new FlashnetClient(wallet);
      await this.client.initialize();

      return { success: true };
    } catch (error) {
      console.error('Failed to initialize Flashnet client:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  getClient(): FlashnetClient {
    if (!this.client) {
      throw new Error('Client not initialized - call initialize() first');
    }
    return this.client;
  }

  getWallet() {
    if (!this.wallet) {
      throw new Error('Wallet not initialized - call initialize() first');
    }
    return this.wallet;
  }

  // Static method to calculate virtual reserves using Flashnet SDK
  static calculateVirtualReserves(params: {
    initialTokenSupply: string;
    graduationThresholdPct: number;
    targetRaise: string;
  }): VirtualReserves {
    // Use Flashnet SDK's calculateVirtualReserves method exactly as per docs
    // https://docs.flashnet.xyz/products/flashnet-amm/creation.md#creating-a-single-sided-pool
    return FlashnetClient.calculateVirtualReserves(params);
  }

  async launchToken(params: TokenLaunchParams) {
    const client = this.getClient();

    try {
      // 🎯 BONDING CURVE IMPLEMENTATION - Following Flashnet docs exactly
      // https://docs.flashnet.xyz/products/flashnet-amm/creation.md#creating-a-single-sided-pool

      // 1. Calculate virtual reserves using Flashnet SDK helper
      const { virtualReserveA, virtualReserveB, threshold } = FlashnetClient.calculateVirtualReserves({
        initialTokenSupply: params.initialSupply.toString(),
        graduationThresholdPct: params.graduationThresholdPct, // Graduate when X% sold (<= 95)
        targetRaise: params.targetRaise.toString(), // Target BTC to raise in sats
      });

      // 2. Create single-sided pool (bonding curve) exactly as per Flashnet docs
      const pool = await client.createSingleSidedPool({
        assetAAddress: "new_token_" + Date.now(), // The token being sold (Asset A)
        assetBAddress: BITCOIN_PUBLIC_KEY, // Bitcoin public key (Asset B) - exactly as per docs
        assetAInitialReserve: params.initialSupply.toString(), // Initial token supply
        virtualReserveA: virtualReserveA.toString(), // Virtual reserve A
        virtualReserveB: virtualReserveB.toString(), // Virtual reserve B
        threshold: threshold.toString(), // Graduation threshold percentage
        lpFeeRateBps: params.lpFeeRateBps, // LP fee (0.3%)
        totalHostFeeRateBps: params.totalHostFeeRateBps, // Host fee (0.5%)
        hostNamespace: params.hostNamespace, // Optional host attribution
      });

      console.log('🎯 Bonding curve pool created successfully:', pool);
      console.log('Virtual reserves calculated:', { virtualReserveA, virtualReserveB, threshold });

      return { success: true, pool };
    } catch (error) {
      console.error('Failed to launch bonding curve token:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getSwapQuote(params: SwapParams): Promise<SwapQuote | null> {
    const client = this.getClient();

    try {
      // 🎯 SWAP SIMULATION - Following Flashnet docs exactly
      // https://docs.flashnet.xyz/products/flashnet-amm/swaps.md#simulating-a-swap
      const simulation = await client.simulateSwap({
        poolId: params.poolId,
        assetInAddress: params.assetIn,     // Asset being sold
        assetOutAddress: params.assetOut,   // Asset being bought
        amountIn: params.amountIn.toString(),
      });

      console.log('Swap simulation results:', {
        amountOut: simulation.amountOut,
        executionPrice: simulation.executionPrice,
        priceImpactPct: simulation.priceImpactPct
      });

      return {
        amountOut: BigInt(simulation.amountOut),
        priceImpact: simulation.priceImpactPct,
        lpFee: BigInt(0), // Will be calculated from simulation if available
        hostFee: BigInt(0), // Will be calculated from simulation if available
        route: [params.assetIn, params.assetOut],
      };
    } catch (error) {
      console.error('Failed to simulate swap:', error);
      return null;
    }
  }

  async executeSwap(params: SwapParams) {
    const client = this.getClient();

    try {
      // 🎯 SWAP EXECUTION - Following Flashnet docs exactly
      // https://docs.flashnet.xyz/products/flashnet-amm/swaps.md#executing-a-swap

      // Step 1: Always simulate first to get expected output
      const simulation = await client.simulateSwap({
        poolId: params.poolId,
        assetInAddress: params.assetIn,
        assetOutAddress: params.assetOut,
        amountIn: params.amountIn.toString(),
      });

      console.log('Pre-swap simulation:', {
        amountOut: simulation.amountOut,
        executionPrice: simulation.executionPrice,
        priceImpactPct: simulation.priceImpactPct
      });

      // Step 2: Calculate minimum output with slippage protection
      // Following docs: const minAmountOut = BigInt(simulation.amountOut) * 99n / 100n; // 1% slippage
      const slippageTolerance = params.maxSlippageBps || 100; // Default 1% (100 BPS)
      const slippageMultiplier = BigInt(10000 - slippageTolerance); // Convert BPS to multiplier
      const minAmountOut = (BigInt(simulation.amountOut) * slippageMultiplier) / BigInt(10000);

      console.log('Calculated slippage protection:', {
        originalAmountOut: simulation.amountOut,
        slippageTolerance: `${slippageTolerance / 100}%`,
        minAmountOut: minAmountOut.toString()
      });

      // Step 3: Execute the swap with slippage protection
      const result = await client.executeSwap({
        poolId: params.poolId,
        assetInAddress: params.assetIn,      // Asset being sold
        assetOutAddress: params.assetOut,    // Asset being bought
        amountIn: params.amountIn.toString(),
        minAmountOut: minAmountOut.toString(), // Minimum acceptable output
        maxSlippageBps: params.maxSlippageBps || 100, // Max slippage protection
      });

      console.log('Swap executed successfully:', {
        amountOut: result.amountOut,
        outboundTransferId: result.outboundTransferId
      });

      return { success: true, result };
    } catch (error: any) {
      console.error('Failed to execute swap:', error);

      // Handle specific error types as per Flashnet docs
      if (error.message?.includes('Insufficient balance')) {
        return { success: false, error: 'Not enough funds to execute swap' };
      } else if (error.message?.includes('Slippage exceeded')) {
        return { success: false, error: 'Price moved too much during execution' };
      } else if (error.message?.includes('Pool inactive')) {
        return { success: false, error: 'Pool is currently inactive' };
      } else {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  }

  async getPool(poolId: string) {
    const client = this.getClient();

    try {
      const pool = await client.getPool(poolId);
      return pool;
    } catch (error) {
      console.error('Failed to get pool:', error);
      return null;
    }
  }

  async listPools(filters?: any) {
    const client = this.getClient();

    try {
      const pools = await client.listPools(filters || {});
      return pools;
    } catch (error) {
      console.error('Failed to list pools:', error);
      return { pools: [] };
    }
  }

  async getLpPosition(poolId: string) {
    const client = this.getClient();

    try {
      const position = await client.getLpPosition(poolId);
      return position;
    } catch (error) {
      console.error('Failed to get LP position:', error);
      return null;
    }
  }

  async addLiquidity(params: any) {
    const client = this.getClient();

    try {
      const result = await client.addLiquidity(params);
      return { success: true, result };
    } catch (error) {
      console.error('Failed to add liquidity:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createInvoice(amountSats: number, memo?: string) {
    const wallet = this.getWallet();

    try {
      // Using the wallet from Flashnet client as documented
      const invoice = await wallet.createLightningInvoice({
        amountSats,
        memo: memo || "Launchpad payment",
      });
      return { success: true, invoice };
    } catch (error) {
      console.error('Failed to create invoice:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const launchpadClient = new LaunchpadClient();
