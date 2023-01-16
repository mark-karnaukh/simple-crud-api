import { createServer, IncomingMessage, ServerResponse } from 'http';
// import { v1 as uuidv1, validate as uuidValidate } from 'uuid';
import * as dotenv from 'dotenv';

import {
  API_URL_USERS_REG_EXP,
  API_URL_USERS_REG_EXP_WITHOUT_ID,
  API_URL_USERS_REG_EXP_WITH_ID,
  DB_CREATE_USER,
  DB_GET_ALL_USERS,
} from './constants.js';

import Db from './db.js';

dotenv.config();
const { executeOperation } = Db.initializeDB(
  Db.manageUsers,
  Db.selectUsers,
).connect();

const requestListener = function (
  req: IncomingMessage,
  res: ServerResponse,
): void {
  if (new RegExp(API_URL_USERS_REG_EXP, 'g').test(req.url)) {
    if (req.method === 'GET') {
      if (new RegExp(API_URL_USERS_REG_EXP_WITHOUT_ID, 'g').test(req.url)) {
        const users = executeOperation({ type: DB_GET_ALL_USERS });

        console.log('Get all users: ', users);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
      }

      if (new RegExp(API_URL_USERS_REG_EXP_WITH_ID, 'g').test(req.url)) {
        console.log('With Id: ', req.url);
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

          if (!Db.isUserValid(parsedData)) {
            const message = `400 - Bad Request - Request Body Does Not Contain Required Fields`;

            console.error(message);

            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.write(message);
            res.end();

            return;
          }

          const newUser = executeOperation({
            type: DB_CREATE_USER,
            payload: { data: JSON.parse(data) },
          });

          res.statusCode = 201;
          res.end(JSON.stringify(newUser));
        });
      // .on('error', (error) => {
      //   const message = `500 - Internal Server Error`;

      //   console.log(error);

      //   res.writeHead(500, { 'Content-Type': 'text/plain' });
      //   res.write(message);
      //   res.end();
      // });
    }

    if (req.method === 'PUT') {
      console.log('PUT method!!!');
    }

    if (req.method === 'DELETE') {
      console.log('DELETE method!!!');
    }
  } else {
    const message = `404 - Resource ${req.url} Not Found\n`;

    console.error(message);

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write(message);
    res.end();
  }
};

const server = createServer(requestListener);

server.listen(Number(process.env.PORT), process.env.HOST, () => {
  console.log(
    `Server is running on http://${process.env.HOST}:${process.env.PORT}`,
  );
});

server.on('error', (err) => console.error(err));

export default requestListener;
