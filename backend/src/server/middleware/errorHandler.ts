import { ErrorRequestHandler } from 'express';
import colors from 'colors';
import {
  HTTP_MESSAGES, ERROR_MESSAGES, STATUS_CODES,
  MAPPED_HTTP_MESSAGES,
} from '../../CONSTANTS';
import { setError } from './errorLogging/error';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const finalError = setError({
    statusCode: err.statusCode || STATUS_CODES.FAIL_CODE_UNKNOWN,
    message: err.message || ERROR_MESSAGES.FAIL_UNKNOWN,
    requestId: res.locals?.requestId,
    requestInfo: {
      route: req.originalUrl,
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
    },
  }, err);

  finalError.addSanitizationEntry([
    {
      label: 'DB_HOST',
      value: process?.env?.DATABASE_HOST,
    },
    {
      label: 'DB_USER',
      value: process?.env?.DATABASE_USER,
    },
    {
      label: 'DB_PASS',
      value: process?.env?.DATABASE_PASSWORD,
    },
    {
      label: 'DB_NAME',
      value: process?.env?.DATABASE,
    },
  ]);

  const statusCode = err.httpResponseCode || 500;

  let formattedMessage: string;

  if (MAPPED_HTTP_MESSAGES.has(res.statusCode)) {
    formattedMessage = MAPPED_HTTP_MESSAGES.get(res.statusCode);
  } else {
    formattedMessage =
      statusCode >= 400 && statusCode < 500
        ? `Client Error: ${statusCode}`
        : `Server Error: ${statusCode}`;
  }

  if (finalError?.message) {
    formattedMessage += `: ${err.message}`;
  } else {
    formattedMessage += `: ${ERROR_MESSAGES.FAIL_UNKNOWN}`;
  }

  if (formattedMessage) {
    finalError.message = formattedMessage;
  }

  if (finalError.stack && process.env.NODE_ENV !== 'test') {
    console.log('\n', colors.red(finalError.stack));
  }

  const sanitizedFinalError = finalError.sanitize();
  res.status(statusCode).send({
    statusCode: sanitizedFinalError.statusCode,
    message: sanitizedFinalError.message,
    requestId: sanitizedFinalError.requestId,
    timestamp: sanitizedFinalError.timestamp,
    ...sanitizedFinalError,
  });
};

export default errorHandler;
