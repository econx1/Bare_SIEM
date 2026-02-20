"use client"

import { useState, useEffect, useCallback } from 'react'
import { getSocket } from '@/lib/socket'

export interface LogEntry {
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  message: string
  source: string
}

const MAX_LOGS = 500

export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const socket = getSocket()

    socket.on('connect', () => {
      console.log('Connected to backend')
      setIsConnected(true)
      setError(null)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from backend')
      setIsConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err)
      setError('Failed to connect to backend server')
      setIsConnected(false)
    })

    socket.on('initial-logs', (initialLogs: LogEntry[]) => {
      console.log('Received initial logs:', initialLogs.length)
      // Backend sends logs in file-order (oldest -> newest). We render newest first.
      const newestFirst = [...initialLogs].reverse().slice(0, MAX_LOGS)
      setLogs(newestFirst)
    })

    socket.on('new-log', (newLog: LogEntry) => {
      setLogs(prevLogs => {
        const updated = [newLog, ...prevLogs]
        // Keep only the last MAX_LOGS entries
        return updated.slice(0, MAX_LOGS)
      })
    })

    socket.on('error', (err: { message: string }) => {
      console.error('Socket error:', err)
      setError(err.message)
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
      socket.off('initial-logs')
      socket.off('new-log')
      socket.off('error')
    }
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return {
    logs,
    isConnected,
    error,
    clearLogs,
  }
}
