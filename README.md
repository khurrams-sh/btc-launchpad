# BTC Launchpad

Bitcoin token launchpad built on Flashnet AMM. Launch tokens with bonding curves that graduate to AMM pools.

## Features

- Bonding Curve AMM - Single-sided pools with gradual price discovery
- Token Launching - One-click deployment with real-time preview
- Trading Interface - Instant swaps with price impact calculations
- Dashboard - Global statistics and trending tokens
- Modern UI - Dark theme with smooth animations

## Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd btc-launchpad

# Install dependencies (Bun recommended)
bun install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
# FLASHNET_MNEMONIC=your_12_word_seed_phrase_here
# FLASHNET_NETWORK=REGTEST  # or MAINNET
# SPARK_API_KEY=your_spark_api_key_here

# Start development server
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## How It Works

1. Launch - Create tokens with bonding curve parameters
2. Trade - Buy/sell on the bonding curve as price increases
3. Graduate - Automatically converts to AMM when threshold reached
4. Earn - Creators and LPs earn fees throughout the process

## Tech Stack

- Framework: Next.js 15 with App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Animations: Framer Motion
- Charts: Recharts
- Notifications: React Hot Toast
- Bitcoin Integration: Flashnet AMM SDK + Spark SDK

## Project Structure

```
src/
├── app/              # Next.js pages and layouts
├── components/       # React components
├── lib/             # Flashnet SDK integration
├── types/           # TypeScript definitions
├── hooks/           # Custom React hooks
└── utils/           # Utility functions
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Flashnet SDK Configuration
FLASHNET_MNEMONIC=your_12_word_seed_phrase_here
FLASHNET_NETWORK=REGTEST  # REGTEST or MAINNET

# Spark SDK Configuration
SPARK_API_KEY=your_spark_api_key_here
SPARK_NETWORK=REGTEST  # REGTEST or MAINNET
```

### Networks

- **REGTEST**: Local development and testing
- **MAINNET**: Production Bitcoin network

## 📜 Available Scripts

```bash
bun run dev      # Start development server
bun run build    # Build for production
bun run start    # Start production server
bun run lint     # Run ESLint
```

## 🔐 Security

- Non-custodial design
- Intent-based transaction execution
- Lightning Network integration
- Flashnet validator network security

## 📚 Documentation

- [Flashnet AMM Documentation](https://docs.flashnet.xyz)
- [Spark SDK Documentation](https://docs.buildonspark.com)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⚠️ Disclaimer

This is a development implementation. Always test thoroughly on REGTEST before MAINNET deployment. Use at your own risk.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

Built for the Bitcoin ecosystem
