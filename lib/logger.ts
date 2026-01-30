/**
 * Frontend logging system for CMO AI
 * Provides structured logging with different log levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
  userAgent?: string;
  url?: string;
  userId?: string;
}

class Logger {
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private enableConsole: boolean = true;
  private enableStorage: boolean = true;

  constructor() {
    // Set log level from environment or default to INFO
    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL?.toUpperCase();
    this.logLevel = envLevel ? (LogLevel[envLevel as keyof typeof LogLevel] ?? LogLevel.INFO) : LogLevel.INFO;
    
    // Enable storage in browser
    this.enableStorage = typeof window !== 'undefined';
    
    // Load existing logs from localStorage
    if (this.enableStorage) {
      this.loadLogs();
    }
  }

  private loadLogs(): void {
    try {
      const stored = localStorage.getItem('cmo_ai_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load logs from storage:', e);
    }
  }

  private saveLogs(): void {
    if (!this.enableStorage) return;
    
    try {
      // Keep only recent logs
      const recentLogs = this.logs.slice(-this.maxLogs);
      localStorage.setItem('cmo_ai_logs', JSON.stringify(recentLogs));
    } catch (e) {
      console.warn('Failed to save logs to storage:', e);
    }
  }

  private log(level: LogLevel, levelName: string, message: string, data?: any): void {
    if (level < this.logLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: levelName,
      message,
      data,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userId: this.getUserId(),
    };

    // Add to logs array
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console output
    if (this.enableConsole) {
      const style = this.getLogStyle(level);
      console.log(
        `%c[${levelName}] ${entry.timestamp} ${message}`,
        style,
        data || ''
      );
    }

    // Save to storage
    this.saveLogs();

    // Send error logs to backend (optional)
    if (level === LogLevel.ERROR && typeof window !== 'undefined') {
      this.sendErrorToBackend(entry);
    }
  }

  private getLogStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: 'color: #666; font-size: 11px;',
      [LogLevel.INFO]: 'color: #2196F3; font-weight: bold;',
      [LogLevel.WARN]: 'color: #FF9800; font-weight: bold;',
      [LogLevel.ERROR]: 'color: #F44336; font-weight: bold; background: #ffebee;',
    };
    return styles[level] || '';
  }

  private getUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    try {
      // Try to get user info from token or localStorage
      const token = localStorage.getItem('token');
      if (token) {
        // Decode JWT token to get user ID (simple base64 decode)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.sub || payload.user_id || undefined;
        } catch {
          return undefined;
        }
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  private async sendErrorToBackend(entry: LogEntry): Promise<void> {
    try {
      // Only send critical errors to backend
      if (entry.level === 'ERROR') {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await fetch(`${API_BASE_URL}/api/v1/logs/error`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry),
        }).catch(() => {
          // Silently fail - don't log logging errors
        });
      }
    } catch {
      // Silently fail
    }
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, data);
  }

  error(message: string, error?: Error | any, data?: any): void {
    const errorData = {
      ...data,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };
    this.log(LogLevel.ERROR, 'ERROR', message, errorData);
  }

  // API request logging
  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method} ${url}`, data);
  }

  apiResponse(method: string, url: string, status: number, duration?: number): void {
    const message = `API Response: ${method} ${url} | Status: ${status}${duration ? ` | Duration: ${duration}ms` : ''}`;
    if (status >= 500) {
      this.error(message);
    } else if (status >= 400) {
      this.warn(message);
    } else {
      this.info(message);
    }
  }

  // User action logging
  userAction(action: string, data?: any): void {
    this.info(`User Action: ${action}`, data);
  }

  // Get all logs
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => {
        const logLevel = LogLevel[log.level as keyof typeof LogLevel] ?? LogLevel.INFO;
        return logLevel >= level;
      });
    }
    return [...this.logs];
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    if (this.enableStorage) {
      localStorage.removeItem('cmo_ai_logs');
    }
  }

  // Export logs
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Download logs as file
  downloadLogs(): void {
    const blob = new Blob([this.exportLogs()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cmo_ai_logs_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
export const logger = new Logger();

// Export default
export default logger;

