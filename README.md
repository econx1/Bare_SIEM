# SIEM Log Collection Dashboard

A high-performance, professional Log Collection Dashboard (SIEM-lite prototype) built with Node.js/Express backend and Next.js frontend.

## Features

- **Real-time Log Streaming**: WebSocket-based streaming of log entries from backend to frontend
- **File Tailing**: Efficient file watching that only reads new lines (tail behavior)
- **Structured Parsing**: Regex-based parser converts raw log lines into structured JSON
- **Professional UI**: Kibana-inspired dashboard with clean, modern design
- **Dark/Light Mode**: Toggle between themes with a single click
- **Performance Optimized**: Maintains only the last 500 logs in memory to prevent browser lag
- **Monospace Font**: Professional cybersecurity aesthetic with monospaced fonts for log messages

## Architecture

### Backend
- **Node.js + Express**: HTTP server on port 3001
- **Socket.io**: WebSocket server for real-time communication
- **File Watcher**: Uses `fs.watch` to monitor log file changes
- **Log Parser**: Regex-based parser supporting multiple log formats

### Frontend
- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: High-quality component library
- **Lucide React**: Professional iconography

## Project Structure

```
siem/
├── backend/
│   ├── server.js              # Express + Socket.io server
│   ├── logParser.js           # Log parsing logic
│   ├── fileWatcher.js         # File tailing implementation
│   └── package.json
├── frontend/
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utility functions
├── logs/
│   └── mock_system.log        # Log file being monitored
└── scripts/
    └── generate-logs.js       # Sample log generator
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Git (optional)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

The backend will start on `http://localhost:3001` and begin watching `./logs/mock_system.log`.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`.

### Generate Sample Logs

To generate sample log entries for testing:

```bash
cd scripts
node generate-logs.js
```

You can customize the interval between log entries:
```bash
node generate-logs.js --interval=1000  # Generate every 1 second
```

## Log Format

The parser supports multiple log formats:

- `[2026-02-20T13:45:23.123Z] INFO [auth-service] User login successful`
- `2026-02-20 13:45:23 ERROR [api-gateway] Connection timeout`
- `INFO: 2026-02-20T13:45:23Z [database] Query executed in 45ms`

The parser extracts:
- **timestamp**: ISO 8601 formatted timestamp
- **level**: INFO, WARN, ERROR, or DEBUG
- **source**: Service or component identifier
- **message**: Log message content

## Usage

1. Start the backend server
2. Start the frontend development server
3. (Optional) Run the log generator script to create sample logs
4. Open `http://localhost:3000` in your browser
5. Watch logs appear in real-time as they're written to `./logs/mock_system.log`

## Configuration

### Backend Port
Set the `PORT` environment variable to change the backend port:
```bash
PORT=3002 npm start
```

### Frontend Socket URL
Set the `NEXT_PUBLIC_SOCKET_URL` environment variable to change the backend URL:
```bash
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002 npm run dev
```

## Performance

- Frontend maintains only the last 500 logs in state
- Efficient file watching with polling fallback
- Real-time updates via WebSocket
- Optimized React rendering with proper state management

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses --watch flag for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Next.js development server with hot reload
```

## License

ISC
