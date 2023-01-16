import { IncomingMessage, ServerResponse } from 'http';

import {
  API_URL_USERS_REG_EXP,
  API_URL_USERS_REG_EXP_WITHOUT_ID,
  API_URL_USERS_REG_EXP_WITH_ID,
} from './constants.js';

const requestListener = function (
  req: IncomingMessage,
  res: ServerResponse,
): void {
  console.log('Request: ', req.method);
  console.log('Request: ', req.url);

  if (new RegExp(API_URL_USERS_REG_EXP, 'g').test(req.url)) {
    if (req.method === 'GET') {
      console.log('GET method!!!');
      if (new RegExp(API_URL_USERS_REG_EXP_WITHOUT_ID, 'g').test(req.url)) {
        console.log('Without Id: ', req.url);
      }

      if (new RegExp(API_URL_USERS_REG_EXP_WITH_ID, 'g').test(req.url)) {
        console.log('With Id: ', req.url);
      }
    }

    if (req.method === 'POST') {
      console.log('POST method!!!');
    }

    if (req.method === 'PUT') {
      console.log('PUT method!!!');
    }

    if (req.method === 'DELETE') {
      console.log('DELETE method!!!');
    }

    res.writeHead(200);
    res.end('Hello from Server!');
  } else {
    const message = `Resource ${req.url} Not Found\n`;

    console.error(message);

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write(message);
    res.end();
  }
};

export default requestListener;
