import { RequestHandler } from 'express';
import { CONTENT_TYPE, ERROR_MESSAGES } from '../../CONSTANTS';

const validateHeaders: RequestHandler = (req, res, next) => {
  const { headers } = req;

  if (
    req.method.toLowerCase() !== 'get' &&
    (!headers['content-type'] ||
      !headers['content-type'].includes(CONTENT_TYPE))
  ) {
    next({
      httpResponseCode: 400,
      message: ERROR_MESSAGES.FAIL_MISSING_HEADER,
    });
  } else {
    next();
  }
};

export default validateHeaders;
