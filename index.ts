import XRPLTradingBot from './src/bot';
import { startTelemetryServer } from './src/telemetry';

const args = process.argv.slice(2);
const mode = args.includes('--sniper') ? 'sniper' : args.includes('--copy') ? 'copyTrading' : 'both';
const userId = args.find(arg => arg.startsWith('--user='))?.split('=')[1] || 'default';
const bot = new XRPLTradingBot({ userId, mode });
startTelemetryServer();
bot.start().catch(error => { console.error('Error starting bot:', error); process.exit(1); });
process.on('uncaughtException', error => { console.error('Uncaught exception:', error); bot.stop().finally(() => process.exit(1)); });
process.on('unhandledRejection', reason => { console.error('Unhandled rejection:', reason); bot.stop().finally(() => process.exit(1)); });
