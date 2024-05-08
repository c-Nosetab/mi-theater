import { CONTENT_TYPE } from '../headers';

const ErrorMessages = {
  // GENERAL
  FAIL_UNKNOWN: 'There was an issue handling your request. Please try again later.',
  FAIL_BAD_REQUEST: 'Bad request',
  FAIL_MISSING_HEADER: `Data must be posted in the JSON format with the 'Content-Type' header set to '${CONTENT_TYPE}'.`,
  FAIL_BAD_ROUTE: 'Route not found',
  FAIL_BAD_REQUEST_METHOD: 'Method not allowed',
  FAIL_BAD_REQUEST_BODY: 'Improperly formatted request payload',
  FAIL_ROUTE_VALIDATION: 'Route validation failed',
  FAIL_ROUTE_VALIDATION_SET_FRONTEND_NOT_USED: 'Route validation failed, this endpoint has not been set up for use in the frontend',
  FAIL_BODY_VALIDATION: 'Validation of Request Body failed',
  FAIL_USER_PERMISSION_MISSING: 'User does not have the required permissions to perform this action',
  FAIL_UNAUTHORIZED: 'Unauthorized',

  // DATABASE
  FAIL_DATABASE_CONNECTION: 'Database connection failed',
  FAIL_DATABASE_QUERY: 'Database query failed',
  FAIL_DATABASE_INVALID_ASSOCIATION: 'Invalid association requested',
  FAIL_DATABASE_UNEDITABLE_FIELD: 'Attempted to update uneditable field',

  // USER
  FAIL_USER_UNKNOWN: 'Unknown user error',
  FAIL_USER_NOT_FOUND: 'User(s) not found',
  FAIL_USER_CREATION: 'User creation failed',
  FAIL_USER_UPDATE: 'User update failed',
  FAIL_USER_UNAUTHORIZED: 'Unauthorized user',
};

export default ErrorMessages;
