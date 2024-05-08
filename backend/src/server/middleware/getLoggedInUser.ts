import { RequestHandler } from 'express';
import { setError } from './errorLogging/error';
import { ERROR_MESSAGES, STATUS_CODES } from '../../CONSTANTS';

const throwUserUnauthorizedError = (loginName: string, err?: Error) => setError({
  statusCode: STATUS_CODES.FAIL_CODE_USER_UNAUTHORIZED,
  message: ERROR_MESSAGES.FAIL_USER_UNAUTHORIZED,
  httpResponseCode: 401,
  additionalInfo: { loginName },
}, err);

const getLoggedInUser: RequestHandler = (req, res, next) => {
  next();
};

export default getLoggedInUser;
