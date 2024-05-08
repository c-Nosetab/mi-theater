import { IncomingHttpHeaders } from 'http';
import { STATUS_CODES } from '../CONSTANTS';

interface SuccessResponse {
  statusCode: STATUS_CODES.SUCCESS_CODE;
  message: string;
  timestamp?: Date;
  requestDuration?: string;
  data?: Record<string, any>;
  [key: string]: any; // This allows for any other key/value pairs to be added to the response object
}

interface ErrorResponse {
  success: false;
  message: string;
  requestHeaders: IncomingHttpHeaders;
  stack?: string;
  httpResponseCode?: number;
}

export { SuccessResponse, ErrorResponse };
