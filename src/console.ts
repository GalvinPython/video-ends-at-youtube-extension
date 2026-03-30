export type LogLevel = "log" | "debug" | "warn" | "error";

/**
 * Configuration options for a logger instance.
 */
export interface LoggerOptions {
    /**
     * Prefix label to display before all log messages.
     * Default: `"App"`
     */
    label?: string;

    /**
     * Per-log-level colors (CSS background values).
     * Example: `{ log: "purple", warn: "#FF9900" }`
     */
    colors?: Partial<Record<LogLevel, string>>;

    /**
     * Extra base style applied to all levels.
     * You can change font weight, border-radius, etc.
     */
    baseStyle?: string;
}

/**
 * Logger interface with the same API shape as console methods.
 */
export interface Logger {
    log: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
}

/**
 * Creates a namespaced, styled logger instance.
 * Automatically no-ops in non-browser environments (e.g., Node.js, SSR).
 *
 * @param options - Logger configuration
 * @returns Logger with `log`, `debug`, `warn`, and `error` methods
 */
export function createLogger(options: LoggerOptions = {}): Logger {
    // Only run in browser environments (SSR-safe)
    if (typeof window === "undefined" || typeof document === "undefined") {
        // Return a no-op logger (calls plain console.*)
        return {
            log: (...args: unknown[]) => console.log(...args),
            debug: (...args: unknown[]) => console.debug(...args),
            warn: (...args: unknown[]) => console.warn(...args),
            error: (...args: unknown[]) => console.error(...args),
        };
    }

    // Construct base + per-level styles
    const styles = {
        base:
            options.baseStyle ??
            "color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
        log: `background: ${options.colors?.log ?? "#4CAF50"}`, // Green
        debug: `background: ${options.colors?.debug ?? "#2196F3"}`, // Blue
        warn: `background: ${options.colors?.warn ?? "#FF9800"}`, // Orange
        error: `background: ${options.colors?.error ?? "#F44336"}`, // Red
    };

    const prefix = (type: keyof typeof styles) => [
        `%c${options.label ?? "App"}:`,
        `${styles.base} ${styles[type]}`,
    ];

    return {
        log: (...args: unknown[]) => console.log(...prefix("log"), ...args),
        debug: (...args: unknown[]) => console.debug(...prefix("debug"), ...args),
        warn: (...args: unknown[]) => console.warn(...prefix("warn"), ...args),
        error: (...args: unknown[]) => console.error(...prefix("error"), ...args),
    };
}
