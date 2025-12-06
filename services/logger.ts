type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class LoggerService {
  private static instance: LoggerService;
  private isProduction: boolean;

  private constructor() {
    this.isProduction = import.meta.env.PROD;
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    // In development, log to console
    if (!this.isProduction) {
      const styles = {
        info: 'color: #3b82f6',
        warn: 'color: #eab308',
        error: 'color: #ef4444',
        debug: 'color: #a855f7',
      };
      console.log(`%c[${level.toUpperCase()}]`, styles[level], message, data || '');
    } else {
      // In later production builds, this is where I would send to Sentry, LogRocket, Datadog, etc.
      // For now, we'll keep critical errors in console for Vercel logs
      if (level === 'error') {
        console.error(JSON.stringify(entry));
      }
    }
  }

  public info(message: string, data?: any) { this.log('info', message, data); }
  public warn(message: string, data?: any) { this.log('warn', message, data); }
  public error(message: string, data?: any) { this.log('error', message, data); }
  public debug(message: string, data?: any) { this.log('debug', message, data); }
}

export const logger = LoggerService.getInstance();
