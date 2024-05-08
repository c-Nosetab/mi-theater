import 'reflect-metadata';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sourceMapSupport from 'source-map-support';

import colors from 'colors/safe';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'local') {
  dotenv.config();
}
sourceMapSupport.install();

if (process.env.NODE_ENV === 'test') {
  console.log = () => {};
}

import appRoutes from './server/routes/index';

// #region ==> Utils / Middleware / Helpers:
import { config } from '../package.json';
import requestIdGenerator from './server/middleware/requestIdGenerator';
import { badRequestHandler } from './server/middleware/badRequestHandler';
import errorHandler from './server/middleware/errorHandler';
import { CONTENT_TYPE } from './CONSTANTS';

import { establishDBConnection } from './db/database';
import generateTimeLog from './server/middleware/timeLogger';

// #region * Settings
const app: Application = express();

app.use((req, res, next) => {
  res.header('Content-Type', CONTENT_TYPE);
  next();
});
app.use(bodyParser.json({ type: CONTENT_TYPE }));
app.use(bodyParser.urlencoded({ extended: true }));
// #endregion

// #region * Middleware
const whitelist = [
  process.env.HOST_ORIGIN,
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin ||
      process.env.NODE_ENV === 'local' ||
      process.env.NODE_ENV === 'test'
    ) {
      return callback(null, true);
    }

    if (whitelist.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: [ 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS' ],
  allowedHeaders: [ 'Content-Type', 'Authorization', 'Accept' ],
}));

app.use(badRequestHandler);
app.use(requestIdGenerator);
app.use(generateTimeLog);
// #endregion

// #region * Routes
app.use(appRoutes);

// #endregion

// #region * Error Handling
app.use(errorHandler);
// #endregion

// #region * Server
let port = config?.port || 3000;

if (process.env.NODE_ENV === 'test') {
  port += 1; // Use a different port for testing
}

const startServer = async () => {
  await establishDBConnection();

  return app.listen(port, () => {
    if (process.env.NODE_ENV === 'local') {
      console.log(colors.green(`Mi-Theater Node.js app is running on ${port}.`));
    }
  });
};

const server = startServer();
// #endregion

export { server, app };
