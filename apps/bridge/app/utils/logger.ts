import { isDev, isTestnet } from '@/common/consts/env';

// Log levels enum
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    CRITICAL = 4,
}

// Log category enum
export enum LogCategory {
    GENERAL = 'general',
    API = 'api',
    TRANSACTION = 'transaction',
    NETWORK = 'network',
    ERROR = 'error',
    DEBUG = 'debug',
    BRIDGE = 'bridge',
    WALLET = 'wallet',
}

// Log entry interface
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    category: LogCategory;
    title: string;
    message?: string;
    data?: any;
    error?: Error;
    context?: Record<string, any>;
}

// Logger configuration interface
export interface LoggerConfig {
    level: LogLevel;
    enableConsole: boolean;
    enableRemote: boolean;
    remoteEndpoint?: string;
    maxBufferSize: number;
    flushInterval: number;
}

// Default configuration based on environment
const getDefaultConfig = (): LoggerConfig => {
    if (isDev) {
        return {
            level: LogLevel.DEBUG,
            enableConsole: true,
            enableRemote: false,
            maxBufferSize: 100,
            flushInterval: 5000,
        };
    }

    if (isTestnet) {
        return {
            level: LogLevel.INFO,
            enableConsole: true,
            enableRemote: true,
            remoteEndpoint: process.env.NEXT_PUBLIC_LOG_ENDPOINT || undefined,
            maxBufferSize: 50,
            flushInterval: 10000,
        };
    }

    // Production
    return {
        level: LogLevel.WARN,
        enableConsole: false,
        enableRemote: true,
        remoteEndpoint: process.env.NEXT_PUBLIC_LOG_ENDPOINT || undefined,
        maxBufferSize: 100,
        flushInterval: 30000,
    };
};

// Global Logger Singleton
class Logger {
    private static instance: Logger;
    private config: LoggerConfig;
    private buffer: LogEntry[] = [];
    private flushTimer?: NodeJS.Timeout;
    private isInitialized = false;

    private constructor() {
        this.config = getDefaultConfig();
        this.initialize();
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private initialize(): void {
        if (this.isInitialized) return;

        this.isInitialized = true;

        // Start flush timer for remote logging
        if (this.config.enableRemote && this.config.flushInterval > 0) {
            this.flushTimer = setInterval(() => {
                this.flush();
            }, this.config.flushInterval);
        }

        // Log initialization
        this.info(LogCategory.GENERAL, 'Logger initialized', {
            level: LogLevel[this.config.level],
            environment: isDev ? 'development' : isTestnet ? 'testnet' : 'production',
            enableConsole: this.config.enableConsole,
            enableRemote: this.config.enableRemote,
        });
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= this.config.level;
    }

    private formatLogEntry(entry: Omit<LogEntry, 'timestamp'>): LogEntry {
        return {
            ...entry,
            timestamp: new Date().toISOString(),
        };
    }

    private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
        switch (level) {
            case LogLevel.DEBUG:
                return console.debug;
            case LogLevel.INFO:
                return console.info;
            case LogLevel.WARN:
                return console.warn;
            case LogLevel.ERROR:
            case LogLevel.CRITICAL:
                return console.error;
            default:
                return console.log;
        }
    }

    private getEmoji(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG:
                return '🔍';
            case LogLevel.INFO:
                return 'ℹ️';
            case LogLevel.WARN:
                return '⚠️';
            case LogLevel.ERROR:
                return '❌';
            case LogLevel.CRITICAL:
                return '🚨';
            default:
                return '📝';
        }
    }

    private getCategoryEmoji(category: LogCategory): string {
        switch (category) {
            case LogCategory.API:
                return '🌐';
            case LogCategory.TRANSACTION:
                return '📒';
            case LogCategory.NETWORK:
                return '🛜';
            case LogCategory.ERROR:
                return '💥';
            case LogCategory.DEBUG:
                return '🐛';
            case LogCategory.BRIDGE:
                return '🌉';
            case LogCategory.WALLET:
                return '👛';
            default:
                return '📝';
        }
    }

    private logToConsole(entry: LogEntry): void {
        if (!this.config.enableConsole) return;

        const emoji = this.getEmoji(entry.level);
        const categoryEmoji = this.getCategoryEmoji(entry.category);
        const method = this.getConsoleMethod(entry.level);

        const prefix = `${emoji}${categoryEmoji}【${entry.title}】`;

        if (entry.error) {
            method(prefix, entry.message || '', entry.error, entry.data || '');
        } else {
            method(prefix, entry.message || '', entry.data || '');
        }
    }

    private addToBuffer(entry: LogEntry): void {
        this.buffer.push(entry);

        // Flush if buffer is full
        if (this.buffer.length >= this.config.maxBufferSize) {
            this.flush();
        }
    }

    private async flush(): Promise<void> {
        if (!this.config.enableRemote || this.buffer.length === 0) return;

        try {
            const logsToSend = [...this.buffer];
            this.buffer = [];

            if (this.config.remoteEndpoint) {
                await fetch(this.config.remoteEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        logs: logsToSend,
                        environment: isDev ? 'development' : isTestnet ? 'testnet' : 'production',
                        timestamp: new Date().toISOString(),
                    }),
                });
            }
        } catch (error) {
            // Fallback to console if remote logging fails
            console.error('Failed to send logs to remote endpoint:', error);
            this.buffer.push(...this.buffer); // Restore logs to buffer
        }
    }

    // Public logging methods
    public debug(category: LogCategory, title: string, data?: any, context?: Record<string, any>): void {
        this._log(LogLevel.DEBUG, category, title, undefined, data, context);
    }

    public info(category: LogCategory, title: string, data?: any, context?: Record<string, any>): void {
        this._log(LogLevel.INFO, category, title, undefined, data, context);
    }

    public warn(category: LogCategory, title: string, data?: any, context?: Record<string, any>): void {
        this._log(LogLevel.WARN, category, title, undefined, data, context);
    }

    public error(category: LogCategory, title: string, error?: Error, data?: any, context?: Record<string, any>): void {
        this._log(LogLevel.ERROR, category, title, error, data, context);
    }

    public critical(
        category: LogCategory,
        title: string,
        error?: Error,
        data?: any,
        context?: Record<string, any>
    ): void {
        this._log(LogLevel.CRITICAL, category, title, error, data, context);
    }

    // Legacy compatibility methods
    public log(title: string, ...args: any[]): void {
        this._log(LogLevel.INFO, LogCategory.GENERAL, title, undefined, args.length > 0 ? args : undefined);
    }

    public logTx(...args: any[]): void {
        this._log(LogLevel.INFO, LogCategory.TRANSACTION, 'Transaction', undefined, args);
    }

    public logNet(...args: any[]): void {
        this._log(LogLevel.INFO, LogCategory.NETWORK, 'Network', undefined, args);
    }

    public logError(title: string, error: any): void {
        this._log(LogLevel.ERROR, LogCategory.ERROR, title, error instanceof Error ? error : new Error(String(error)));
    }

    // Private main logging method
    private _log(
        level: LogLevel,
        category: LogCategory,
        title: string,
        error?: Error,
        data?: any,
        context?: Record<string, any>
    ): void {
        if (!this.shouldLog(level)) return;

        const entry = this.formatLogEntry({
            level,
            category,
            title,
            message: error?.message,
            error,
            data,
            context,
        });

        // Log to console
        this.logToConsole(entry);

        // Add to buffer for remote logging
        this.addToBuffer(entry);
    }

    // Configuration methods
    public updateConfig(newConfig: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.info(LogCategory.GENERAL, 'Logger config updated', this.config);
    }

    public getConfig(): LoggerConfig {
        return { ...this.config };
    }

    // Cleanup method
    public destroy(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flush();
        this.isInitialized = false;
    }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience functions for backward compatibility
export const log = (title: string, ...args: any[]) => logger.log(title, ...args);
export const logTx = (...args: any[]) => logger.logTx(...args);
export const logNet = (...args: any[]) => logger.logNet(...args);
export const logError = (title: string, error: any) => logger.logError(title, error);

// Export for direct usage
export default logger;
