const { env } = process;

const LOG_LEVEL = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const CURRENT_LOG_LEVEL = env?.LOG_LEVEL ? LOG_LEVEL[env.LOG_LEVEL] : LOG_LEVEL.INFO;

class StructuredLog {
  constructor(level, message, data = {}) {
    this.timestamp = new Date().toISOString();
    this.level = level;
    this.message = message;
    this.data = data;
  }

  toJSON() {
    return {
      timestamp: this.timestamp,
      level: this.level,
      message: this.message,
      ...this.data,
    };
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }
}

class Logger {
  static error(message, data = {}) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.ERROR) {
      const log = new StructuredLog('ERROR', message, data);
      console.error(log.toString());
    }
  }

  static warn(message, data = {}) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.WARN) {
      const log = new StructuredLog('WARN', message, data);
      console.warn(log.toString());
    }
  }

  static info(message, data = {}) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.INFO) {
      const log = new StructuredLog('INFO', message, data);
      console.log(log.toString());
    }
  }

  static debug(message, data = {}) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVEL.DEBUG) {
      const log = new StructuredLog('DEBUG', message, data);
      console.log(log.toString());
    }
  }
}

export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = generateRequestId();

  req.requestId = requestId;

  const originalEnd = res.end;

  res.end = function (...args) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    const logData = {
      requestId,
      method: req.method,
      path: req.path,
      statusCode,
      duration: `${duration}ms`,
      companyId: req.user?.companyId || 'unauthenticated',
      userId: req.user?.id || 'unauthenticated',
      ip: req.ip,
    };

    if (duration > 5000) {
      Logger.warn('Slow request detected', {
        ...logData,
        threshold: '5000ms',
      });
    }

    if (statusCode >= 400) {
      Logger.error(`Request failed: ${req.method} ${req.path}`, {
        ...logData,
        responseSize: res.get('content-length') || 0,
      });
    } else {

      Logger.info(`${req.method} ${req.path} - ${statusCode}`, {
        ...logData,
      });
    }

    originalEnd.apply(res, args);
  };

  next();
};

export class AuditLogger {
  static log(action, entityType, entityId, userId, companyId, data = {}) {
    Logger.info(`Audit: ${action}`, {
      action,
      entityType,
      entityId,
      userId,
      companyId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  static created(entity, entityId, userId, companyId, data = {}) {
    this.log(`${entity}_created`, entity, entityId, userId, companyId, data);
  }

  static updated(entity, entityId, userId, companyId, data = {}) {
    this.log(`${entity}_updated`, entity, entityId, userId, companyId, data);
  }

  static deleted(entity, entityId, userId, companyId, data = {}) {
    this.log(`${entity}_deleted`, entity, entityId, userId, companyId, data);
  }

  static accessDenied(resource, userId, companyId, reason = '', data = {}) {
    Logger.warn(`Access denied: ${resource}`, {
      resource,
      userId,
      companyId,
      reason,
      ...data,
    });
  }

  static suspiciousActivity(activity, userId, companyId, details = {}) {
    Logger.warn(`Suspicious activity: ${activity}`, {
      activity,
      userId,
      companyId,
      ...details,
    });
  }
}

export class SecurityLogger {
  static failedAuth(email, reason = '', ip = '') {
    Logger.warn('Authentication failed', {
      email,
      reason,
      ip,
      timestamp: new Date().toISOString(),
    });
  }

  static invalidToken(reason = '', companyId = 'unknown') {
    Logger.warn('Invalid token detected', {
      reason,
      companyId,
      timestamp: new Date().toISOString(),
    });
  }

  static rateLimitExceeded(companyId, endpoint, ip = '') {
    Logger.warn('Rate limit exceeded', {
      companyId,
      endpoint,
      ip,
      timestamp: new Date().toISOString(),
    });
  }

  static dataAccessAttempt(userId, companyId, targetCompanyId, resource = '', success = false) {
    if (success) {
      Logger.info('Data accessed', {
        userId,
        companyId,
        resource,
        timestamp: new Date().toISOString(),
      });
    } else {
      Logger.warn('Unauthorized data access attempt', {
        userId,
        companyId,
        targetCompanyId,
        resource,
        timestamp: new Date().toISOString(),
      });
    }
  }

  static configurationChange(action, userId, companyId, details = {}) {
    Logger.warn(`Configuration changed: ${action}`, {
      action,
      userId,
      companyId,
      ...details,
      timestamp: new Date().toISOString(),
    });
  }
}

export class ErrorLogger {
  static logError(error, context = {}) {
    Logger.error('Error occurred', {
      errorMessage: error.message,
      errorStack: error.stack,
      errorCode: error.code,
      ...context,
      timestamp: new Date().toISOString(),
    });
  }

  static logOperationError(operation, error, companyId = 'unknown', userId = 'unknown', data = {}) {
    Logger.error(`Operation failed: ${operation}`, {
      operation,
      errorMessage: error.message,
      companyId,
      userId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  static logDatabaseError(operation, error, companyId = 'unknown') {
    Logger.error(`Database operation failed: ${operation}`, {
      operation,
      errorMessage: error.message,
      errorCode: error.code,
      companyId,
      timestamp: new Date().toISOString(),
    });
  }
}

function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default {
  Logger,
  AuditLogger,
  SecurityLogger,
  ErrorLogger,
  requestLogger,
};
