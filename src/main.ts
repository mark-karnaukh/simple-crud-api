import { createServer } from 'http';

import * as dotenv from 'dotenv';

import Db from './db.js';
import requestListener from './requestListener.js';

dotenv.config();
const { executeOperation } = Db.initializeDB(
  Db.manageUsers,
  Db.selectUsers,
).connect();

const server = createServer(requestListener(executeOperation, Db.isUserValid));

server.listen(Number(process.env.PORT), process.env.HOST, () => {
  console.log(
    `Server is running on http://${process.env.HOST}:${process.env.PORT}`,
  );
});

server.on('error', (err) => console.error(err));

export default requestListener;
