const HTTP_MESSAGES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  IM_A_TEAPOT: 418,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

const MAPPED_HTTP_MESSAGES = new Map([
  [ 400, 'Bad Request' ],
  [ 401, 'Unauthorized' ],
  [ 404, 'Not Found' ],
  [ 405, 'Method Not Allowed' ],
  [ 418, 'I\'m a teapot' ],
  [ 422, 'Unprocessable Entity' ],
  [ 500, 'Internal Server Error' ],
]);

export { HTTP_MESSAGES, MAPPED_HTTP_MESSAGES };
