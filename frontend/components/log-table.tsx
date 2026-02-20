"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LogEntry } from "@/hooks/useLogs"
import { AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogTableProps {
  logs: LogEntry[]
}

export function LogTable({ logs }: LogTableProps) {
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
      })
    } catch {
      return timestamp
    }
  }

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case 'WARN':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'INFO':
      case 'DEBUG':
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getLevelBadgeClass = (level: LogEntry['level']) => {
    switch (level) {
      case 'ERROR':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'WARN':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
      case 'INFO':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      case 'DEBUG':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg">
        <p className="text-muted-foreground">No logs available. Waiting for log entries...</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-auto max-h-[calc(100vh-200px)]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 border-b">
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[100px]">Level</TableHead>
              <TableHead className="w-[150px]">Source</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log, index) => (
              <TableRow key={`${log.timestamp}-${index}`} className="hover:bg-muted/50">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {formatTimestamp(log.timestamp)}
                </TableCell>
                <TableCell>
                  <div className={cn(
                    "inline-flex items-center gap-2 px-2 py-1 rounded border text-xs font-medium",
                    getLevelBadgeClass(log.level)
                  )}>
                    {getLevelIcon(log.level)}
                    {log.level}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  <span className="px-2 py-1 bg-muted rounded">{log.source}</span>
                </TableCell>
                <TableCell>
                  <div className="log-message text-sm">{log.message}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
