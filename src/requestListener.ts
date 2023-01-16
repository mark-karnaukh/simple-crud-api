import { IncomingMessage, ServerResponse } from 'http';
import { validate as uuidValidate } from 'uuid';

import {
  API_URL_USERS_REG_EXP,
  API_URL_USERS_REG_EXP_WITHOUT_ID,
  API_URL_USERS_REG_EXP_WITH_ID,
  DB_CREATE_USER,
  DB_DELETE_USER,
  DB_GET_ALL_USERS,
  DB_GET_USER_BY_ID,
  DB_UPDATE_USER,
} from './constants.js';
import { DbOperationResult, IDbOperation } from './db.js';

const requestListener =
  (
    executeDbOperation: (operation: IDbOperation) => DbOperationResult,
    isUserValid: (user: unknown) => boolean,
  ) =>
  (req: IncomingMessage, res: ServerResponse): void => {
    if (new RegExp(API_URL_USERS_REG_EXP, 'g').test(req.url)) {
      if (req.method === 'GET') {
        if (new RegExp(API_URL_USERS_REG_EXP_WITHOUT_ID, 'g').test(req.url)) {
          const users = executeDbOperation({ type: DB_GET_ALL_USERS });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(users));
        }

        if (new RegExp(API_URL_USERS_REG_EXP_WITH_ID, 'g').test(req.url)) {
          const id = req.url.split('/').filter((urlSubStr) => !!urlSubStr)[2];

          if (!uuidValidate(id)) {
            const message = `400 - Bad Request - userId ${id} Is Invalid (Not uuid)`;

            console.warn(message);

            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.write(message);
            res.end();

            return;
          }

          const user = executeDbOperation({
            type: DB_GET_USER_BY_ID,
            payload: { id },
          });

          if (!user) {
            const message = `404 - Not Found - id === ${id} Doesn't Exist`;

            console.warn(message);

            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.write(message);
            res.end();

            return;
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(user));
        }
      }

      // Note: The request body should be in a form of raw json data
      /**
       * {
       *   "username": "John Doe",
       *   "age": 27,
       *   "hobbies": ["Playing chess", "solving puzzle games", ...]
       * }
       */
      if (req.method === 'POST') {
        const body = [];
        let data: string;

        req
          .on('data', (chunk) => {
            body.push(chunk);
          })
          .on('end', () => {
            data = Buffer.concat(body).toString();

            const parsedData = JSON.parse(data);

            if (!isUserValid(parsedData)) {
              const message = `400 - Bad Request - Request Body Does Not Contain Required Fields`;

              console.warn(message);

              res.writeHead(400, { 'Content-Type': 'text/plain' });
              res.write(message);
              res.end();

              return;
            }

            const newUser = executeDbOperation({
              type: DB_CREATE_USER,
              payload: { data: JSON.parse(data) },
            });

            res.statusCode = 201;
            res.end(JSON.stringify(newUser));
          })
          .on('error', (error) => {
            const message = `500 - Internal Server Error`;

            console.log(error);

            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write(message);
            res.end();
          });
      }

      if (req.method === 'PUT') {
        const id = req.url.split('/').filter((urlSubStr) => !!urlSubStr)[2];

        if (!uuidValidate(id)) {
          const message = `400 - Bad Request - userId ${id} Is Invalid (Not uuid)`;

          console.warn(message);

          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.write(message);
          res.end();

          return;
        }

        const body = [];
        let data: string;

        req
          .on('data', (chunk) => {
            body.push(chunk);
          })
          .on('end', () => {
            data = Buffer.concat(body).toString();

            const parsedData = JSON.parse(data);

            const user = executeDbOperation({
              type: DB_UPDATE_USER,
              payload: { id, data: parsedData },
            });

            if (!user) {
              const message = `404 - Not Found - id === ${id} Doesn't Exist`;

              console.warn(message);

              res.writeHead(400, { 'Content-Type': 'text/plain' });
              res.write(message);
              res.end();

              return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(user));
          })
          .on('error', (error) => {
            const message = `500 - Internal Server Error`;

            console.log(error);

            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write(message);
            res.end();
          });
      }

      if (req.method === 'DELETE') {
        const id = req.url.split('/').filter((urlSubStr) => !!urlSubStr)[2];

        if (!uuidValidate(id)) {
          const message = `400 - Bad Request - userId ${id} Is Invalid (Not uuid)`;

          console.warn(message);

          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.write(message);
          res.end();

          return;
        }

        const user = executeDbOperation({
          type: DB_DELETE_USER,
          payload: { id },
        });

        if (!user) {
          const message = `404 - Not Found - id === ${id} Doesn't Exist`;

          console.warn(message);

          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.write(message);
          res.end();

          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
      }
    } else {
      const message = `404 - Resource ${req.url} Not Found\n`;

      console.warn(message);

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.write(message);
      res.end();
    }
  };

export default requestListener;
