import { IncomingMessage, ServerResponse } from 'http';

import { API_URL_USERS_REG_EXP } from './constants.js';

const requestListener = function (
  req: IncomingMessage,
  res: ServerResponse,
): void {
  console.log('Request: ', req.method);
  console.log('Request: ', req.url);

  if (new RegExp(API_URL_USERS_REG_EXP, 'g').test(req.url)) {
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
