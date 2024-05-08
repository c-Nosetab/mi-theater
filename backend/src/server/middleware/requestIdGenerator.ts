import { RequestHandler } from 'express';
import crypto from 'crypto';

const requestIdGenerator: RequestHandler = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    res.locals.requestId = 'TEST';
    return next();
  }

  const id = crypto.randomBytes(8).toString('hex');
  res.locals.requestId = process.env.NODE_ENV === 'local'
    ? `TEST-${id}`
    : id;

  next();
};

export default requestIdGenerator;
