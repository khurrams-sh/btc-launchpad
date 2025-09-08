// Utility functions for formatting numbers, currency, and display values

export function formatNumber(num: number | bigint, decimals: number = 2): string {
  const n = typeof num === 'bigint' ? Number(num) : num;
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(amount: number | bigint, currency: 'BTC' | 'SATS' | 'USD' = 'BTC'): string {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;

  if (currency === 'SATS') {
    return `${formatNumber(num)} sats`;
  }

  if (currency === 'BTC') {
    const btcAmount = num / 100000000; // Convert sats to BTC
    return `${formatNumber(btcAmount, 8)} BTC`;
  }

  if (currency === 'USD') {
    return `$${formatNumber(num, 2)}`;
  }

  return formatNumber(num);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatAddress(address: string, chars: number = 8): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const num = Number(amount) / Math.pow(10, decimals);
  return formatNumber(num, Math.min(decimals, 6));
}

export function calculatePriceImpact(amountIn: bigint, amountOut: bigint, reserveIn: bigint, reserveOut: bigint): number {
  const expectedOut = (Number(amountIn) * Number(reserveOut)) / Number(reserveIn);
  const actualOut = Number(amountOut);
  const impact = ((expectedOut - actualOut) / expectedOut) * 100;
  return Math.abs(impact);
}

export function calculateSlippage(amount: bigint, slippageBps: number): bigint {
  const slippagePercent = slippageBps / 10000;
  const slippageAmount = Number(amount) * slippagePercent;
  return amount - BigInt(Math.floor(slippageAmount));
}

export function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export function formatVolume(volume: bigint): string {
  const num = Number(volume);
  if (num >= 1000000) {
    return `${formatNumber(num / 1000000, 1)}M`;
  }
  if (num >= 1000) {
    return `${formatNumber(num / 1000, 1)}K`;
  }
  return formatNumber(num);
}

export function formatMarketCap(marketCap: bigint): string {
  const num = Number(marketCap);
  if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(2)}B`;
  }
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
}

// Token name/symbol generation removed - using real data from Flashnet API
