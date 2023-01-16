import http from 'http';
// import { v1 as uuidv1, validate as uuidValidate } from 'uuid';
import * as dotenv from 'dotenv';

import requestListener from './requestListener.js';

dotenv.config();

const server = http.createServer(requestListener);

server.listen(Number(process.env.PORT), process.env.HOST, () => {
  console.log(
    `Server is running on http://${process.env.HOST}:${process.env.PORT}`,
  );
});
