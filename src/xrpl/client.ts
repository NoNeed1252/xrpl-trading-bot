import { Client } from 'xrpl';
import config from '../config';

let persistentClient: Client | null = null;
let connectingPromise: Promise<void> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY_MS = 5000;

export async function getClient(): Promise<Client> {
    if (persistentClient && persistentClient.isConnected()) {
        return persistentClient;
    }

    if (connectingPromise) {
        await connectingPromise;
        return persistentClient!;
    }

    connectingPromise = (async () => {
        persistentClient = new Client(config.xrpl.server, {
            connectionTimeout: 10000
        });
        
        try {
            await persistentClient.connect();
            reconnectAttempts = 0; // Reset on successful connection
            console.log(`Connected to XRPL: ${config.xrpl.server}`);
        } catch (error) {
            persistentClient = null;
            connectingPromise = null;
            throw new Error(`Failed to connect to XRPL server: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        persistentClient.on('disconnected', async (code) => {
            console.warn(`XRPL disconnected (code: ${code}). Attempting to recover...`);
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                setTimeout(async () => {
                    try {
                        if (persistentClient && !persistentClient.isConnected()) {
                            await persistentClient.connect();
                            console.log('XRPL Reconnected.');
                        }
                    } catch (e) {
                        console.error(`Reconnect attempt ${reconnectAttempts} failed.`);
                    }
                }, RECONNECT_DELAY_MS);
            } else {
                console.error('MAX_RECONNECT_ATTEMPTS reached. Manual restart required.');
            }
        });

        // Add heartbeat/ping to keep connection alive
        const heartbeat = setInterval(() => {
            if (persistentClient && persistentClient.isConnected()) {
                persistentClient.request({ command: 'ping' }).catch(() => {
                    console.warn('Ping failed - connection may be stale.');
                });
            } else {
                clearInterval(heartbeat);
            }
        }, 30000);

        connectingPromise = null;
    })();

    await connectingPromise;
    return persistentClient!;
}

export async function disconnect(): Promise<void> {
    if (persistentClient && persistentClient.isConnected()) {
        await persistentClient.disconnect();
        persistentClient = null;
    }
}
