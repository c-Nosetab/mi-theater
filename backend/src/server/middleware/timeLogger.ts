import { RequestHandler } from 'express';

const generateTimeLog: RequestHandler = (req, res, next) => {
  const time = new Date();
  res.locals.timeLog = time;
  next();
};

export default generateTimeLog;
