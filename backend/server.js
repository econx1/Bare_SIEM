/**
 * SIEM Log Collection Dashboard Backend Server
 * Express + Socket.io server that tails log files and streams them to clients
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { FileWatcher } from './fileWatcher.js';
import { parseLogLine } from './logParser.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const LOG_FILE_PATH = path.join(__dirname, '..', 'logs', 'mock_system.log');

// Create file watcher instance
const fileWatcher = new FileWatcher(LOG_FILE_PATH, {
  pollInterval: 500 // Check every 500ms for better responsiveness
});

// Express middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send recent logs to newly connected client
  const recentLines = fileWatcher.readExistingLines(100);
  const recentLogs = recentLines.map(line => parseLogLine(line));
  socket.emit('initial-logs', recentLogs);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// File watcher event handlers
fileWatcher.on('line', (line) => {
  try {
    const parsedLog = parseLogLine(line);
    
    // Broadcast to all connected clients
    io.emit('new-log', parsedLog);
    
    console.log(`[${parsedLog.level}] ${parsedLog.source}: ${parsedLog.message.substring(0, 50)}...`);
  } catch (error) {
    console.error('Error parsing log line:', error);
  }
});

fileWatcher.on('error', (error) => {
  console.error('File watcher error:', error);
  io.emit('error', { message: error.message });
});

fileWatcher.on('started', (filePath) => {
  console.log(`File watcher started for: ${filePath}`);
  io.emit('watcher-started', { filePath });
});

fileWatcher.on('stopped', () => {
  console.log('File watcher stopped');
  io.emit('watcher-stopped');
});

// Start the file watcher
fileWatcher.start();

// Start the server
httpServer.listen(PORT, () => {
  console.log(`SIEM Backend Server running on port ${PORT}`);
  console.log(`Watching log file: ${LOG_FILE_PATH}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  fileWatcher.stop();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  fileWatcher.stop();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
