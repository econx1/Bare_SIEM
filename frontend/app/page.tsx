"use client"

import { useLogs } from "@/hooks/useLogs"
import { LogTable } from "@/components/log-table"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Activity, Wifi, WifiOff, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Home() {
  const { logs, isConnected, error, clearLogs } = useLogs()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">SIEM Log Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Real-time log collection and monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      Connected
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">
                      Disconnected
                    </span>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearLogs}
                disabled={logs.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Logs
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        {/* Stats Bar */}
        <div className="mb-4 flex items-center gap-4">
          <div className="px-4 py-2 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Total Logs: </span>
            <span className="text-sm font-bold">{logs.length}</span>
          </div>
          <div className="px-4 py-2 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Errors: </span>
            <span className="text-sm font-bold text-destructive">
              {logs.filter(log => log.level === 'ERROR').length}
            </span>
          </div>
          <div className="px-4 py-2 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Warnings: </span>
            <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
              {logs.filter(log => log.level === 'WARN').length}
            </span>
          </div>
        </div>

        {/* Log Table */}
        <LogTable logs={logs} />
      </main>
    </div>
  )
}
