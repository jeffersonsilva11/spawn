/**
 * Simple Logger Utility
 */

export class Logger {
  constructor(private context: string) {}

  info(message: string): void {
    console.log(`[${new Date().toISOString()}] [INFO] [${this.context}] ${message}`);
  }

  warn(message: string): void {
    console.warn(
      `[${new Date().toISOString()}] [WARN] [${this.context}] ${message}`,
    );
  }

  error(message: string): void {
    console.error(
      `[${new Date().toISOString()}] [ERROR] [${this.context}] ${message}`,
    );
  }

  debug(message: string): void {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(
        `[${new Date().toISOString()}] [DEBUG] [${this.context}] ${message}`,
      );
    }
  }
}
