import colors from 'colors/safe';
import { Request, RequestHandler } from 'express';
import { ERROR_MESSAGES, STATUS_CODES } from '../../CONSTANTS';

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { setError, ErrorInfo } from './errorLogging/error';
import ROUTE_VALIDATION_MAP, { RouteValidationObj } from '../../CONSTANTS/routeValidationMap';
import { formatRoute } from '../../utils/serverUtils';

// #region * Validation Options
const validationOptions = {
  validationError: {
    target: false,
    value: true,
  },
  whitelist: true,
  forbidUnknownValues: true,
  forbidNonWhitelisted: true,
};
// #endregion

// #region * Body Validation
const getMappedRoutePropsObj = (req: Request) => {
  const { method, originalUrl } = req;
  const formattedUrl = formatRoute(originalUrl);

  // This is checking if the route is in the bodyValidationMap
  // written more simply: bodyValidationMap[formattedUrl][method]
  // above cannot be used as props may not exist - this will keep the app from crashing
  const requestPropsObj: RouteValidationObj = ROUTE_VALIDATION_MAP[formattedUrl]?.[method];

  if (!requestPropsObj) {
    const errObj: ErrorInfo = {
      message: `No Route Validation found for '${method}: ${formattedUrl}' but is requesting validation.`,
      statusCode: STATUS_CODES.FAIL_CODE_ROUTE_VALIDATION_MISSING,
      httpResponseCode: 500,
    };

    throw setError(errObj);
  }

  return requestPropsObj;
};

const getRequestBody = (req: Request) => {
  if (req.method === 'GET') {
    return req.query;
  }

  return req.body;
};

const assertBodyIsProper = async (requestPropsObj: RouteValidationObj['BODY'], requestBody: any) => {
  try {
    const requestAsClass = plainToInstance(requestPropsObj, requestBody);

    const validationErrorsArr = await validate(requestAsClass, validationOptions);
    if (validationErrorsArr.length > 0) {
      const errObj = {
        message: ERROR_MESSAGES.FAIL_BODY_VALIDATION,
        statusCode: STATUS_CODES.FAIL_CODE_BODY_VALIDATION,
        httpResponseCode: 422,
        additionalInfo: { validationErrorsArr },
      };

      if (process.env.NODE_ENV !== 'local') {
        delete errObj.additionalInfo;
      }

      throw setError(errObj);
    }
  } catch (err) {
    throw setError({
      message: ERROR_MESSAGES.FAIL_BODY_VALIDATION,
      statusCode: STATUS_CODES.FAIL_CODE_BODY_VALIDATION,
    }, err);
  }

  return true;
};

// const validateUserPermission = (curUser: User, routeValidationObj: RouteValidationObj) => {
//   const userPermissions = curUser?.Permissions;
//   const permissionsDisabled =
//     process.env.NODE_ENV === 'local' &&
//     !!process.env.PERMISSIONS_DISABLED;

//   const isAccountHolder = curUser?.id === curUser?.Entity?.Config?.accountOwnerId;

//   const { PERMISSIONS: permissionsNeeded, allRequired } = routeValidationObj;
//   const isSinglePermission = permissionsNeeded.length === 1;

//   if (permissionsDisabled && process.env.NODE_ENV === 'local') {
//     console.log(colors.bgRed('\nALERT: Permissions are disabled. Skipping permission check.'));
//     return true;
//   }

//   if (isSinglePermission && permissionsNeeded.includes(PERMISSION_KIDS.NONE_REQUIRED)) {
//     return true;
//   }

//   if (isSinglePermission && permissionsNeeded.includes(PERMISSION_KIDS.FRONTEND_NOT_USED)) {
//     throw setError({
//       message: ERROR_MESSAGES.FAIL_ROUTE_VALIDATION_SET_FRONTEND_NOT_USED,
//       statusCode: STATUS_CODES.FAIL_CODE_ROUTE_VALIDATION_SET_FRONTEND_NOT_USED,
//     });
//   }

//   // TODO - configure swap president to not have access to internal maintenance pages
//   if (
//     userPermissions?.INT_KALPA_MAINTENANCE === 1 ||
//     isAccountHolder
//   ) {
//     return true;
//   }

//   let hasPermission = false;

//   const method = allRequired ? 'every' : 'some';
//   hasPermission = permissionsNeeded?.[method]?.(permission =>
//     userPermissions?.[permission] === 1);

//   if (hasPermission) {
//     return true;
//   }

//   const err = setError({
//     message: ERROR_MESSAGES.FAIL_USER_PERMISSION_MISSING,
//     statusCode: STATUS_CODES.FAIL_CODE_USER_PERMISSION_MISSING,
//     additionalInfo: {
//       permissionNeeded: permissionsNeeded,
//       userPermissions,
//     },
//   });

//   if (process.env.NODE_ENV !== 'local') {
//     delete err.additionalInfo;
//   }

//   throw err;
// };

// #endregion

const validateRoute: RequestHandler = async (req, res, next) => {
  if (process.env.NODE_ENV === 'test' && !res.locals.isTest) {
    return next();
  }

  try {
    const requestPropsObj = getMappedRoutePropsObj(req);
    const requestBody = getRequestBody(req);
    // const user = res.locals.user as User;

    // if (requestPropsObj?.allowsForSpecialUseCase) {
    //   user.PERMISSION_NEEDED = requestPropsObj;
    //   user.Permissions.NONE_REQUIRED = 1;
    //   user.Permissions.FRONTEND_NOT_USED = 0;
    // } else {
    //   // validateUserPermission(user, requestPropsObj);
    // }

    await assertBodyIsProper(requestPropsObj.BODY, requestBody);
    next();
  } catch (err) {
    next(setError({
      message: ERROR_MESSAGES.FAIL_ROUTE_VALIDATION,
      statusCode: STATUS_CODES.FAIL_CODE_ROUTE_VALIDATION,
    }, err));
  }
};

export default validateRoute;
