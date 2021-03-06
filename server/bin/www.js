#!/usr/bin/env node

/**
 * Module dependencies.
 */
import debugLib from 'debug';
import http from 'http';
import winston from '@s-config/winston';
import configKeys from '@server/config/configKeys';
import MongooseODM from '@s-config/odm';
import app from '../app';

const debug = debugLib('expweb-bp:server');

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(configKeys.port || '3000');
app.set('port', port);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      winston.error(`Port: ${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      winston.error(`Port: ${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const host = server.address().address;
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
  winston.info(`Escuchando en ${host}/${bind}`);
}

/*
  Conectando la base de datos
*/

// Trying to connecto to the datbase
const mongooseOdm = new MongooseODM(configKeys.databaseUrl);
(async () => {
  try {
    const mongoClient = await mongooseOdm.connect();
    if (mongoClient) {
      winston.info(
        'Connection to database engine has successfully established ✅',
      );
      /**
       * Listen on provided port, on all network interfaces.
       */
      server.listen(port);
      server.on('error', onError);
      server.on('listening', onListening);
    } else {
      winston.error(
        'error: No se pudo establecer conexión con la base de datos ❌',
      );
    }
  } catch (error) {
    winston.error(`No se pudo iniciar el servidor: ${error.message}`);
  }
})();
