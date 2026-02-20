/**
 * File Watcher Module
 * Tails a log file and emits events when new lines are added
 */

import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

export class FileWatcher extends EventEmitter {
  constructor(filePath, options = {}) {
    super();
    this.filePath = path.resolve(filePath);
    this.pollInterval = options.pollInterval || 1000; // Poll every 1 second
    this.lastPosition = 0;
    this.watchHandle = null;
    this.isWatching = false;
    this._remainder = '';
    this._isReading = false;
    this._needsRecheck = false;
  }

  /**
   * Start watching the file
   */
  start() {
    if (this.isWatching) {
      return;
    }

    // Check if file exists
    if (!fs.existsSync(this.filePath)) {
      this.emit('error', new Error(`File does not exist: ${this.filePath}`));
      return;
    }

    // Initialize position to end of file (tail behavior)
    try {
      const stats = fs.statSync(this.filePath);
      this.lastPosition = stats.size;
    } catch (error) {
      this.emit('error', error);
      return;
    }

    this.isWatching = true;

    // Use fs.watch for file system events
    this.watchHandle = fs.watch(this.filePath, { persistent: true }, (eventType) => {
      if (eventType === 'change') {
        this.checkForNewLines();
      }
    });

    // Also poll periodically to catch any missed changes
    this.pollTimer = setInterval(() => {
      this.checkForNewLines();
    }, this.pollInterval);

    // Initial check
    this.checkForNewLines();

    this.emit('started', this.filePath);
  }

  /**
   * Stop watching the file
   */
  stop() {
    if (!this.isWatching) {
      return;
    }

    this.isWatching = false;

    if (this.watchHandle) {
      this.watchHandle.close();
      this.watchHandle = null;
    }

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    this.emit('stopped');
  }

  /**
   * Check for new lines in the file
   */
  checkForNewLines() {
    if (this._isReading) {
      this._needsRecheck = true;
      return;
    }

    this._isReading = true;
    
    // Use setImmediate to make this async without blocking
    setImmediate(async () => {
      try {
        // Check if file exists
        try {
          await fs.promises.access(this.filePath);
        } catch {
          this.emit('error', new Error(`File no longer exists: ${this.filePath}`));
          this._isReading = false;
          return;
        }

        const stats = await fs.promises.stat(this.filePath);
        const currentSize = stats.size;

        // File was truncated or rotated (size decreased)
        if (currentSize < this.lastPosition) {
          this.lastPosition = 0;
          this._remainder = '';
        }

        // New content available
        if (currentSize > this.lastPosition) {
          const readLen = currentSize - this.lastPosition;
          const fh = await fs.promises.open(this.filePath, 'r');
          try {
            const buffer = Buffer.allocUnsafe(readLen);
            const result = await fh.read(buffer, 0, readLen, this.lastPosition);

            const chunk = buffer.toString('utf8', 0, result.bytesRead);
            let combined = this._remainder + chunk;

            const endsWithNewline = combined.endsWith('\n');
            const parts = combined.split('\n');

            this._remainder = endsWithNewline ? '' : (parts.pop() ?? '');

            for (const line of parts) {
              if (line.trim()) {
                this.emit('line', line);
              }
            }

            this.lastPosition = currentSize;
          } finally {
            await fh.close();
          }
        }
      } catch (error) {
        this.emit('error', error);
      } finally {
        this._isReading = false;
        if (this._needsRecheck) {
          this._needsRecheck = false;
          this.checkForNewLines();
        }
      }
    });
  }

  /**
   * Read all existing lines from the file (for initial load)
   */
  readExistingLines(maxLines = 100) {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }

      const content = fs.readFileSync(this.filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      // Return last N lines
      return lines.slice(-maxLines);
    } catch (error) {
      this.emit('error', error);
      return [];
    }
  }
}
