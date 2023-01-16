import { createServer, IncomingMessage, Server, ServerResponse } from 'http';

import * as SuperTest from 'supertest';
import * as dotenv from 'dotenv';

import requestListener from '../src/main';
import { API_URL_USERS } from '../src/constants';

dotenv.config();

describe('Example Test', function () {
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;
  let request;

  beforeAll((done) => {
    server = createServer(requestListener);
    server.listen(2000);
    request = SuperTest(server);
    done();
  });

  afterAll((done) => {
    server.close();
    done();
  });

  it('should GET /api/users with 200 OK', async () => {
    return await request.get(API_URL_USERS).expect((response) => {
      expect(response.status).toEqual(200);
      expect(response.text).toEqual('Hello from Server!');
    });
  });
});
