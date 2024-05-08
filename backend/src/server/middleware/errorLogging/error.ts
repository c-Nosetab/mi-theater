import { Response } from 'express';

interface RequestInfo {
  route: string;
  method: string;
  headers: unknown;
  body?: unknown;
  query?: unknown;
}

interface ErrorInfo {
  statusCode: number;
  message: string;
  errMsg?: string;
  requestId?: string;

  pgErrorInfo?: {
    message: string;
    detail: string;
  };

  httpResponseCode?: Response['statusCode'];
  requestInfo?: RequestInfo;
  additionalInfo?: {
    [key: string]: unknown;
  };
  stack?: Error['stack']
}

interface PGError extends Error {
  parent?: {
    message: string;
    detail: string;
    table: string;
    constraint: string;
  };
}

type SanitizationEntry = { label?: string; value: string; } | string;

class StandardError extends Error implements ErrorInfo {
  statusCode: number;
  defaultMessage: string;
  errMsg: string;
  requestId?: string;
  stackTrace: string[];

  error: Error;
  route: string;
  method: string;

  pgErrorInfo?: { message: string; detail: string; table: string; constraint: string; };

  httpResponseCode?: Response['statusCode'];
  requestInfo?: RequestInfo;
  additionalInfo?: {
    [key: string]: any;
  };

  timestamp: Date;

  sanitizationEntries: SanitizationEntry[];

  constructor (info: ErrorInfo, err?: PGError) {
    super();

    this.statusCode = info?.statusCode;
    this.message = err?.message || info?.message || 'Unknown Error';
    this.defaultMessage = info?.message;

    if (this.defaultMessage === this.message) {
      delete this.defaultMessage;
    }

    if (info?.requestId) {
      this.requestId = info.requestId;
    }

    if (!this?.errMsg) {
      this.errMsg = info?.errMsg;
    }

    if (!this?.errMsg || this?.errMsg === this?.pgErrorInfo?.message) {
      delete this.errMsg;
    }

    this.timestamp = new Date();

    if (info?.httpResponseCode) {
      this.httpResponseCode = info.httpResponseCode;
    }

    if (err?.parent?.message) {
      this.pgErrorInfo = {
        table: err?.parent?.table,
        constraint: err?.parent?.constraint,
        message: err.parent.message,
        detail: err?.parent?.detail,
      };
    }

    if (!this?.errMsg) {
      this.errMsg = info?.errMsg;
    }

    if (info?.requestId) {
      this.requestId = info.requestId;
    }

    if (info?.additionalInfo) {
      this.additionalInfo = info.additionalInfo;
    }
    if (info?.requestInfo) {
      this.requestInfo = info.requestInfo;
    }

    if (err && err?.stack) {
      // @ts-ignore
      info.stack = err?.original || err?.stack;
      this.stackTrace = this.parseStackTrace(info.stack);
    }
  }

  private combineDetails (newInfo: ErrorInfo) {
    Object.keys(newInfo).forEach(key => {
      if (!this[key]) {
        this[key] = newInfo[key];
      }
    });

    if (newInfo?.stack && !this.stackTrace) {
      this.stackTrace = this.parseStackTrace(newInfo.stack);
    }

    return this;
  }

  private formatSanitizeStr (sanitizeStrArr: SanitizationEntry[]) {
    return sanitizeStrArr.map(curr => {
      if (typeof curr === 'string') {
        return { value: new RegExp(curr, 'ig'), label: '[REDACTED]' };
      }
      return { value: new RegExp(curr.value, 'ig'), label: `[REDACTED_${curr.label}]` };
    });
  }

  private parseStackTrace (stackTrace: string) {
    if (typeof stackTrace !== 'string') return [];
    return stackTrace.split('\n')
      .filter(line => !(line.includes('node_modules') || line.includes('node:internal')));
  }

  public sanitize () {
    if (this.sanitizationEntries === undefined) return this;
    const skipSanitizationKeys = [ 'timestamp' ];

    const formattedSanitizeArr = this.formatSanitizeStr(this.sanitizationEntries);
    const errorKeys = Object.keys(this).filter(key => !skipSanitizationKeys.includes(key));

    errorKeys.forEach(key => {
      let needsParse = false;
      let value = this[key];

      if (value === undefined) return;

      if (typeof value === 'number') return;

      if (typeof value === 'object' || Array.isArray(value)) {
        value = JSON.stringify(value);
        needsParse = true;
      }

      value = formattedSanitizeArr.reduce((acc: string, curr) => {
        if (curr.value === undefined) {
          return acc;
        }

        const val = acc.replace(curr.value, curr.label);
        acc = val;
        return acc;
      }, value);

      this[key] = needsParse ? JSON.parse(value) : value;
    });

    delete this.sanitizationEntries;
    return this;
  }

  public addSanitizationEntry (sanitizationTerms: SanitizationEntry | SanitizationEntry[]) {
    const terms = Array.isArray(sanitizationTerms) ? sanitizationTerms : [ sanitizationTerms ];

    const finalSanitizationArr = terms.filter(curr => {
      if (typeof curr === 'string') {
        return !(curr === '' || curr === undefined);
      }
      return !(curr.value === '' || curr.value === undefined);
    });

    if (!this.sanitizationEntries) {
      this.sanitizationEntries = [];
    }

    this.sanitizationEntries.push(...finalSanitizationArr);
  }

  static setError (info: ErrorInfo, err?: Error) {
    if (err && err instanceof StandardError) {
      return err.combineDetails(info);
    }
    return new StandardError({ ...info }, err);
  }
}

const setError = StandardError.setError;

export {
  setError,
  StandardError,
  ErrorInfo,
  RequestInfo,
};
