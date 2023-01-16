import { createServer, IncomingMessage, Server, ServerResponse } from 'http';

import * as SuperTest from 'supertest';
import * as dotenv from 'dotenv';

import requestListener from '../src/requestListener';
import Db from '../src/db.js';

import { API_URL_USERS } from '../src/constants';

dotenv.config();

describe('Scenario 1: POST new user', function () {
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;
  let request;

  const { executeOperation } = Db.initializeDB(
    Db.manageUsers,
    Db.selectUsers,
  ).connect();

  beforeAll((done) => {
    server = createServer(requestListener(executeOperation, Db.isUserValid));
    server.listen(2000);
    request = SuperTest(server);
    done();
  });

  afterAll((done) => {
    server.close();
    done();
  });

  it('should POST /api/users with 400 Bad Request', async () => {
    return await request
      .post(API_URL_USERS)
      .send({
        username: null,
        age: 27,
        hobbies: ['Playing chess', 'solving puzzle games'],
      })
      .set('Accept', 'application/json')
      .expect((response) => {
        expect(response.status).toEqual(400);
        expect(response.text).toEqual(
          '400 - Bad Request - Request Body Does Not Contain Required Fields',
        );
      });
  });

  it('should POST /api/users with 201 Created', async () => {
    return await request
      .post(API_URL_USERS)
      .send({
        username: 'John Doe',
        age: 27,
        hobbies: ['Playing chess', 'solving puzzle games'],
      })
      .set('Accept', 'application/json')
      .expect((response) => {
        expect(response.status).toEqual(201);
      });
  });
});

describe('Scenario 2: GET users', () => {
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;
  let request;
  const users = [
    {
      username: 'Jane Doe',
      age: 27,
      hobbies: ['Hiking and walking', 'Reading books'],
      id: '18361190-95d6-11ed-83e4-750078a09b2b',
    },
    {
      username: 'John  Doe',
      age: 30,
      hobbies: ['Playing chess', 'solving puzzle games'],
      id: '2aefc510-95d6-11ed-83e4-750078a09b2b',
    },
  ];

  const { executeOperation } = Db.initializeDB(Db.manageUsers, Db.selectUsers, {
    users,
  }).connect();

  beforeAll((done) => {
    server = createServer(requestListener(executeOperation, Db.isUserValid));
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
      expect(JSON.stringify(response.body)).toEqual(JSON.stringify(users));
    });
  });

  it('should GET /api/users/18361190-95d6-11ed-83e4-750078a09b2b with 200 OK', async () => {
    return await request
      .get(`${API_URL_USERS}/18361190-95d6-11ed-83e4-750078a09b2b`)
      .expect((response) => {
        expect(response.status).toEqual(200);
        expect(JSON.stringify(response.body)).toEqual(JSON.stringify(users[0]));
      });
  });

  it('should GET /api/users/aaaaa with 400 Bad Request', async () => {
    return await request.get(`${API_URL_USERS}/aaaaa`).expect((response) => {
      expect(response.status).toEqual(400);
      expect(response.text).toEqual(
        '400 - Bad Request - userId aaaaa Is Invalid (Not uuid)',
      );
    });
  });

  it('should GET /api/users/6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b with 404 Not Found', async () => {
    return await request
      .get(`${API_URL_USERS}/6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b`)
      .expect((response) => {
        expect(response.status).toEqual(404);
        expect(response.text).toEqual(
          "404 - Not Found - id === 6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b Doesn't Exist",
        );
      });
  });
});

describe('Scenario 3: DELETE users', () => {
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;
  let request;
  const users = [
    {
      username: 'Jane Doe',
      age: 27,
      hobbies: ['Hiking and walking', 'Reading books'],
      id: '18361190-95d6-11ed-83e4-750078a09b2b',
    },
    {
      username: 'John  Doe',
      age: 30,
      hobbies: ['Playing chess', 'solving puzzle games'],
      id: '2aefc510-95d6-11ed-83e4-750078a09b2b',
    },
  ];

  const { executeOperation } = Db.initializeDB(Db.manageUsers, Db.selectUsers, {
    users,
  }).connect();

  beforeAll((done) => {
    server = createServer(requestListener(executeOperation, Db.isUserValid));
    server.listen(2000);
    request = SuperTest(server);
    done();
  });

  afterAll((done) => {
    server.close();
    done();
  });

  it('should DELETE /api/users/18361190-95d6-11ed-83e4-750078a09b2b with 204 OK', async () => {
    return await request.delete(`${API_URL_USERS}/18361190-95d6-11ed-83e4-750078a09b2b`).expect((response) => {
      expect(response.status).toEqual(204);
    });
  });

  it('should DELETE /api/users/aaaaa with 400 Bad Request', async () => {
    return await request.delete(`${API_URL_USERS}/aaaaa`).expect((response) => {
      expect(response.status).toEqual(400);
      expect(response.text).toEqual(
        '400 - Bad Request - userId aaaaa Is Invalid (Not uuid)',
      );
    });
  });

  it('should DELETE /api/users/6ec0bd7f-11c0-43da-975e-2a6ad9ebae0b with 404 Not Found', async () => {
    return await request
      .delete(`${API_URL_USERS}/6ec0bd7f-11c0-43da-975e-2a6ad9ebae0b`)
      .expect((response) => {
        expect(response.status).toEqual(404);
        expect(response.text).toEqual(
          "404 - Not Found - id === 6ec0bd7f-11c0-43da-975e-2a6ad9ebae0b Doesn't Exist",
        );
      });
  });
});

describe('Scenario 4: Non-Existing API Endpoints', function () {
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;
  let request;

  const { executeOperation } = Db.initializeDB(
    Db.manageUsers,
    Db.selectUsers,
  ).connect();

  beforeAll((done) => {
    server = createServer(requestListener(executeOperation, Db.isUserValid));
    server.listen(2000);
    request = SuperTest(server);
    done();
  });

  afterAll((done) => {
    server.close();
    done();
  });

  it('should GET /api/something with 404 Not Found', async () => {
    return await request
      .get('/api/something')
      .expect((response) => {
        expect(response.status).toEqual(404);
        expect(response.text).toEqual(
          '404 - Resource /api/something Not Found'
        );
      });
  });
});
