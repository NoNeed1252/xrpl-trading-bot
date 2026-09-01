import XRPLTradingBot from './src/bot';
import { startTelemetryServer, telemetry, setExecutionMode } from './src/telemetry';

const args = process.argv.slice(2);
const requestedMode = args.includes('--sniper') ? 'sniper' : args.includes('--copy') ? 'copyTrading' : 'both';
const userId = args.find(arg => arg.startsWith('--user='))?.split('=')[1] || 'default';
const configuredMode = String(process.env.EXECUTION_MODE || '').toLowerCase();
const safeMode = !process.env.WALLET_SEED || configuredMode === 'mock' || configuredMode === 'dry_run';
setExecutionMode(safeMode ? 'mock' : 'live');

// Bind telemetry/C2 before database, wallet, or trading initialization.
startTelemetryServer();
const bot = new XRPLTradingBot({ userId, mode: requestedMode });

if (safeMode) {
  console.warn('Starting in MOCK mode: no WALLET_SEED or a non-live EXECUTION_MODE was configured.');
  telemetry.status = process.env.WALLET_SEED ? 'MOCK' : 'UNFUNDED';
} else {
  bot.start().catch(error => console.error('Bot startup degraded; telemetry remains online:', error));
}

const shutdown = () => void bot.stop();
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', error => console.error('Uncaught exception (kept non-fatal):', error));
process.on('unhandledRejection', reason => console.error('Unhandled rejection (kept non-fatal):', reason));
