/**
 * Log Parser Module
 * Parses log lines into structured JSON objects
 */

/**
 * Parses a log line into a structured JSON object
 * @param {string} logLine - Raw log line string
 * @returns {Object} Parsed log object with timestamp, level, message, and source
 */
export function parseLogLine(logLine) {
  if (!logLine || typeof logLine !== 'string') {
    return createDefaultLog(logLine || '');
  }

  const trimmedLine = logLine.trim();
  if (!trimmedLine) {
    return createDefaultLog(logLine);
  }

  // Pattern 1: [ISO_TIMESTAMP] LEVEL [source] message
  // Example: [2026-02-20T13:45:23.123Z] INFO [auth-service] User login successful
  let match = trimmedLine.match(/^\[([^\]]+)\]\s+(INFO|WARN|ERROR|DEBUG)\s+\[([^\]]+)\]\s+(.+)$/);
  if (match) {
    return {
      timestamp: parseTimestamp(match[1]),
      level: match[2],
      source: match[3],
      message: match[4]
    };
  }

  // Pattern 2: ISO_TIMESTAMP LEVEL [source] message
  // Example: 2026-02-20T13:45:23.123Z INFO [auth-service] User login successful
  match = trimmedLine.match(/^([0-9TZ:.\-]+)\s+(INFO|WARN|ERROR|DEBUG)\s+\[([^\]]+)\]\s+(.+)$/);
  if (match) {
    return {
      timestamp: parseTimestamp(match[1]),
      level: match[2],
      source: match[3],
      message: match[4]
    };
  }

  // Pattern 3: DATE TIME LEVEL [source] message
  // Example: 2026-02-20 13:45:23 ERROR [api-gateway] Connection timeout
  match = trimmedLine.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(INFO|WARN|ERROR|DEBUG)\s+\[([^\]]+)\]\s+(.+)$/);
  if (match) {
    return {
      timestamp: parseTimestamp(match[1]),
      level: match[2],
      source: match[3],
      message: match[4]
    };
  }

  // Pattern 4: LEVEL: ISO_TIMESTAMP [source] message
  // Example: INFO: 2026-02-20T13:45:23Z [database] Query executed in 45ms
  match = trimmedLine.match(/^(INFO|WARN|ERROR|DEBUG):\s+([0-9TZ:.\-]+)\s+\[([^\]]+)\]\s+(.+)$/);
  if (match) {
    return {
      timestamp: parseTimestamp(match[2]),
      level: match[1],
      source: match[3],
      message: match[4]
    };
  }

  // Pattern 5: LEVEL [source] message (no timestamp)
  match = trimmedLine.match(/^(INFO|WARN|ERROR|DEBUG)\s+\[([^\]]+)\]\s+(.+)$/);
  if (match) {
    return {
      timestamp: new Date().toISOString(),
      level: match[1],
      source: match[2],
      message: match[3]
    };
  }

  // Fallback: Try to extract level and source if possible
  const levelMatch = trimmedLine.match(/\b(INFO|WARN|ERROR|DEBUG)\b/i);
  const sourceMatch = trimmedLine.match(/\[([^\]]+)\]/);
  
  return {
    timestamp: new Date().toISOString(),
    level: levelMatch ? levelMatch[1].toUpperCase() : 'INFO',
    source: sourceMatch ? sourceMatch[1] : 'unknown',
    message: trimmedLine
  };
}

/**
 * Parses various timestamp formats to ISO string
 * @param {string} timestampStr - Timestamp string in various formats
 * @returns {string} ISO 8601 timestamp string
 */
function parseTimestamp(timestampStr) {
  if (!timestampStr) {
    return new Date().toISOString();
  }

  // Already ISO format
  if (timestampStr.includes('T') && timestampStr.includes('Z')) {
    return new Date(timestampStr).toISOString();
  }

  // Date + Time format: 2026-02-20 13:45:23
  const dateTimeMatch = timestampStr.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/);
  if (dateTimeMatch) {
    const isoStr = `${dateTimeMatch[1]}T${dateTimeMatch[2]}.000Z`;
    return new Date(isoStr).toISOString();
  }

  // Try to parse as-is
  const parsed = new Date(timestampStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  // Fallback to current time
  return new Date().toISOString();
}

/**
 * Creates a default log object for malformed logs
 * @param {string} rawLine - Raw log line
 * @returns {Object} Default log object
 */
function createDefaultLog(rawLine) {
  return {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    source: 'unknown',
    message: rawLine || 'Empty log line'
  };
}
