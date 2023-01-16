import http, { IncomingMessage, ServerResponse } from 'http';
import * as dotenv from 'dotenv';

import { API_URL_USERS } from './constants.js';

dotenv.config();

const requestListener = function (
  req: IncomingMessage,
  res: ServerResponse,
): void {
  console.log('Request: ', req.method);
  console.log('Request: ', req.url);

  if (req.url.includes(API_URL_USERS)) {
    res.writeHead(200);
    res.end('Hello from Server!');
  } else {
    res.statusCode = 404;
    res.end();
  }
};

const server = http.createServer(requestListener);

server.listen(Number(process.env.PORT), process.env.HOST, () => {
  console.log(
    `Server is running on http://${process.env.HOST}:${process.env.PORT}`,
  );
});
