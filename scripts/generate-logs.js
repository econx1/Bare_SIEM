/**
 * Sample Log Generator Script
 * Generates sample log entries to mock_system.log for testing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE = path.join(__dirname, '..', 'logs', 'mock_system.log');

const SOURCES = [
  'auth-service',
  'api-gateway',
  'database',
  'cache-service',
  'payment-processor',
  'notification-service',
  'analytics-engine',
  'security-monitor'
];

const LEVELS = ['INFO', 'WARN', 'ERROR', 'DEBUG'];

const INFO_MESSAGES = [
  'User login successful',
  'Request processed successfully',
  'Cache hit for key: {key}',
  'Database query executed in {ms}ms',
  'Session created for user: {user}',
  'Health check passed',
  'Configuration reloaded',
  'Connection pool initialized',
  'Rate limit check passed',
  'Token validated successfully'
];

const WARN_MESSAGES = [
  'Rate limit approaching threshold',
  'Slow query detected: {ms}ms',
  'Cache miss for key: {key}',
  'Retrying failed request',
  'Connection pool running low',
  'High memory usage detected: {percent}%',
  'Deprecated API endpoint used',
  'SSL certificate expiring soon',
  'Unusual traffic pattern detected',
  'Failed to send notification'
];

const ERROR_MESSAGES = [
  'Authentication failed for user: {user}',
  'Database connection timeout',
  'Payment processing failed',
  'Invalid token provided',
  'Internal server error occurred',
  'Failed to connect to external service',
  'File not found: {file}',
  'Permission denied',
  'Out of memory error',
  'Critical system failure'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatMessage(template) {
  return template
    .replace('{key}', `key_${generateRandomNumber(1000, 9999)}`)
    .replace('{ms}', generateRandomNumber(10, 5000))
    .replace('{user}', `user_${generateRandomNumber(1, 1000)}`)
    .replace('{percent}', generateRandomNumber(60, 95))
    .replace('{file}', `/path/to/file_${generateRandomNumber(1, 100)}.log`);
}

function generateLogEntry() {
  const level = getRandomElement(LEVELS);
  const source = getRandomElement(SOURCES);
  let message;

  switch (level) {
    case 'ERROR':
      message = formatMessage(getRandomElement(ERROR_MESSAGES));
      break;
    case 'WARN':
      message = formatMessage(getRandomElement(WARN_MESSAGES));
      break;
    case 'DEBUG':
      message = `Debug: ${formatMessage(getRandomElement(INFO_MESSAGES))}`;
      break;
    default:
      message = formatMessage(getRandomElement(INFO_MESSAGES));
  }

  const timestamp = new Date().toISOString();
  
  // Format: [ISO_TIMESTAMP] LEVEL [source] message
  return `[${timestamp}] ${level} [${source}] ${message}\n`;
}

function appendLog(logEntry) {
  fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
}

// Generate logs continuously
function startGenerating(intervalMs = 2000) {
  console.log(`Generating logs to ${LOG_FILE} every ${intervalMs}ms`);
  console.log('Press Ctrl+C to stop\n');

  const interval = setInterval(() => {
    const logEntry = generateLogEntry();
    appendLog(logEntry);
    process.stdout.write(logEntry.trim() + '\n');
  }, intervalMs);

  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('\n\nLog generation stopped.');
    process.exit(0);
  });
}

// Parse command line arguments
const args = process.argv.slice(2);
const intervalArg = args.find(arg => arg.startsWith('--interval='));
const interval = intervalArg ? parseInt(intervalArg.split('=')[1]) : 2000;

// Ensure log file exists
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, '', 'utf8');
}

startGenerating(interval);
