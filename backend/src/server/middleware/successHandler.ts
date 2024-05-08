import { RequestHandler } from 'express';
import { SuccessResponse } from '../../interfaces';

const parseTimeInSecondsWithDecimal = (initialTime: Date, finalTime: Date): string => {
  const initialTimeInMs = initialTime.getTime();
  const finalTimeInMs = finalTime.getTime();

  const timeInMs = finalTimeInMs - initialTimeInMs;
  const timeInSec = timeInMs / 1000;
  const timeInSecWithDecimal = Number(timeInSec.toFixed(3));

  return `${timeInSecWithDecimal}s`;
};

const onSuccessHandler: RequestHandler = (req, res, next) => {
  const originalSend = res.send;

  res.send = (data: SuccessResponse) => {
    const durationInSec = parseTimeInSecondsWithDecimal(res.locals.timeLog, new Date());

    const response: SuccessResponse = {
      statusCode: data?.statusCode,
      message: data?.message,
      requestId: res.locals.requestId,
      timestamp: res.locals.timeLog,
      requestDuration: durationInSec,
      ...data,
    };

    res.send = originalSend;

    return res.send(response);
  };

  next();
};

export default onSuccessHandler;
