import { getRoutes } from 'get-routes';

import { RequestHandler } from 'express';
import { Routes } from 'get-routes/build/lib/Routes';
import { requestMethodIsValid, routeIsValid } from '../../utils/serverUtils';
import { ERROR_MESSAGES, STATUS_CODES } from '../../CONSTANTS';
import { setError } from './errorLogging/error';

const badRequestHandler: RequestHandler = (req, res, next) => {
  const routes: Routes = getRoutes(req.app);
  const { url, method } = req;

  const validRoute = routeIsValid({
    appRoutes: routes,
    route: url,
  });
  const validRequestMethod = requestMethodIsValid({
    appRoutes: routes,
    route: url,
    method,
  });

  if (!validRoute) {
    next(setError({
      statusCode: STATUS_CODES.FAIL_CODE_BAD_ROUTE,
      message: ERROR_MESSAGES.FAIL_BAD_ROUTE,
      httpResponseCode: 404,
    }));
  } else if (validRoute && !validRequestMethod) {
    next(setError({
      statusCode: STATUS_CODES.FAIL_CODE_BAD_REQUEST_METHOD,
      message: ERROR_MESSAGES.FAIL_BAD_REQUEST_METHOD,
      httpResponseCode: 405,
    }));
  }
  next();
};

export { badRequestHandler };
