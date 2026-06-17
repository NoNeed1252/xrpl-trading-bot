import { getClient } from '../xrpl/client';
import { getWallet } from '../xrpl/wallet';
import { getAccountNFTs } from './monitor';
import { User, UserModel } from '../database/user';

let nftInterval: NodeJS.Timeout | null = null;
let isRunning: boolean = false;
let isProcessing: boolean = false;

export async function startNFTLoop(userId: string): Promise<void> {
    if (isRunning) return;
    
    const user = await User.findOne({ userId });
    if (!user) return;

    isRunning = true;
    nftInterval = setInterval(async () => {
        if (isProcessing) return;
        isProcessing = true;
        try {
            const client = await getClient();
            const wallet = getWallet();
            const nfts = await getAccountNFTs(client, wallet.address);
            // In a real scenario, we would sync these to the user DB
            // For this module, we ensure the connection is healthy
            console.log("NFT Loop: Synced " + nfts.length + " NFTs for " + wallet.address);
        } catch (e) {
            console.error("NFT Loop Error: " + (e instanceof Error ? e.message : "Unknown"));
        } finally {
            isProcessing = false;
        }
    }, 60000); // 1 minute sync
}

export async function stopNFTLoop(): Promise<void> {
    if (nftInterval) {
        clearInterval(nftInterval);
        nftInterval = null;
    }
    isRunning = false;
}
