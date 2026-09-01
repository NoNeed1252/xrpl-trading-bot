import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();

const config: Config = {
    // XRPL Network Configuration
    xrpl: {
        server: process.env.XRPL_SERVER || 'wss://xrplcluster.com',
        network: process.env.XRPL_NETWORK || 'mainnet'
    },

    // Storage Configuration
    storage: {
        dataFile: process.env.DATA_FILE || './data/state.json'
    },

    // Trading Configuration
    trading: {
        minLiquidity: parseFloat(process.env.MIN_LIQUIDITY || '100') || 100,
        minHolders: parseInt(process.env.MIN_HOLDERS || '5') || 5,
        minTradingActivity: parseInt(process.env.MIN_TRADING_ACTIVITY || '3') || 3,
        maxSnipeAmount: parseFloat(process.env.MAX_SNIPE_AMOUNT || '5000') || 5000,
        emergencyStopLoss: parseFloat(process.env.EMERGENCY_STOP_LOSS || '0.3') || 0.3,
        defaultSlippage: parseFloat(process.env.DEFAULT_SLIPPAGE || '4.0') || 4.0
    },

    // Sniper Configuration
    sniper: {
        checkInterval: parseInt(process.env.SNIPER_CHECK_INTERVAL || '8000') || 8000,
        maxTokensPerScan: parseInt(process.env.MAX_TOKENS_PER_SCAN || '15') || 15
    },

    // Copy Trading Configuration
    copyTrading: {
        checkInterval: parseInt(process.env.COPY_TRADING_CHECK_INTERVAL || '3000') || 3000,
        maxTransactionsToCheck: parseInt(process.env.MAX_TRANSACTIONS_TO_CHECK || '20') || 20,
        traderAddresses: process.env.COPY_TRADER_ADDRESSES ? process.env.COPY_TRADER_ADDRESSES.split(',').map(addr => addr.trim()) : [],
        tradingAmountMode: process.env.COPY_TRADING_AMOUNT_MODE || 'percentage',
        matchTraderPercentage: parseFloat(process.env.COPY_TRADING_MATCH_PERCENTAGE || '50') || 50,
        maxSpendPerTrade: parseFloat(process.env.COPY_TRADING_MAX_SPEND || '100') || 100,
        fixedAmount: parseFloat(process.env.COPY_TRADING_FIXED_AMOUNT || '10') || 10
    },

    // Sniper User Configuration
    sniperUser: {
        buyMode: process.env.SNIPER_BUY_MODE === 'true' || process.env.SNIPER_BUY_MODE === '1',
        snipeAmount: process.env.SNIPER_AMOUNT || '1',
        customSnipeAmount: process.env.SNIPER_CUSTOM_AMOUNT || '',
        minimumPoolLiquidity: parseFloat(process.env.SNIPER_MIN_LIQUIDITY || '100') || 100,
        riskScore: process.env.SNIPER_RISK_SCORE || 'medium',
        transactionDivides: parseInt(process.env.SNIPER_TRANSACTION_DIVIDES || '1') || 1
    },

    // Wallet Configuration. A seed is intentionally optional: index.ts selects
    // mock mode when it is absent, allowing Render health/startup without a funded account.
    wallet: {
        seed: process.env.WALLET_SEED || '',
        address: process.env.WALLET_ADDRESS
    }
};

// Do not throw here. This module is imported by the Render entrypoint before
// it decides whether to run live or mock mode. Requiring WALLET_SEED here
// makes a no-wallet deployment fail before mock mode can start.

export default config;
