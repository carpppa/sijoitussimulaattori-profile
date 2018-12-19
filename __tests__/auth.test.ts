import 'jest';

import * as request from 'supertest';

import app from '../src/app';
import { disconnectFirebase, initializeFirebase } from '../src/firebase';
import { getIdTokenForTest, getOrCreateUser, removeUser } from '../src/utils/firebase-test-utils';
import { getDefinedOrThrow, randomInt } from '../src/utils/general';
import { getServiceAccount } from '../src/utils/get-service-account';

describe('/auth/hello', () => {
  let testUser: string;
  let validToken: string;

  beforeAll(async (done) => {
    const dbUrl = getDefinedOrThrow(process.env.DATABASE_URL);
    const apiKey = getDefinedOrThrow(process.env.WEB_API_KEY);

    const conf = getServiceAccount();

    initializeFirebase(dbUrl, conf);

    testUser = 'test-user-' + randomInt().toString();
    await getOrCreateUser(testUser);
    validToken = await getIdTokenForTest(apiKey, testUser);
    done();
  })

  afterAll(async (done) => {
    await removeUser(testUser);
    disconnectFirebase();
    done();
  });

  it('GET should return 403 without authentication', async (done) => {
    const result = await request(app)
      .get('/auth/hello');

    expect(result.status).toEqual(403);
    done();
  });

  it('GET should return 403 with invalid token', async (done) => {

    const invalidToken = "EyJhbGciOiJSUzI1NiIsImtpZCI6IjE4NGM0NWM4ZWJmOGRkYmU1NTY5OTE1YzYzNzk5ZDUxZjMyMzY1OTUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc2lqb2l0dXNzaW11bGFhdHRvcmkiLCJhdWQiOiJzaWpvaXR1c3NpbXVsYWF0dG9yaSIsImF1dGhfdGltZSI6MTU0NTE0Mjg2MywidXNlcl9pZCI6InRlc3QtdXNlci11aWQiLCJzdWIiOiJ0ZXN0LXVzZXItdWlkIiwiaWF0IjoxNTQ1MTQyODYzLCJleHAiOjE1NDUxNDY0NjMsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiY3VzdG9tIn19.Ub5Uai6QcYQZA3CJyhuDiwScTw7bvy0dVn5dR0zTmomioaCBYs2wgmmNuBP0XWRoWQxDUqoOjYwUfHtReZHxzq5tPpyyhAs__3O_A2Fe1klhg1UfV4-VOvbW2qtwyjmXaRBCL2G-kYkopwfr0yp1Ca-OPNhefmZU0zodCnvEhIEkCSQ0JxI5cAdW4ZzcxRmo_SO_jG5XxJ3JAimIl1mkp6w0rD2KSd0P_hf5Csdhss2h5_R4uuyqpiIfCIkwRwyan2mvEdY0BTmSdNERgqEqNEjn0RVsY2KHi5pKJ8acA0B5RVzL0R0siWq3Suco13HJDrDtbw5pLcLXr9ldcpbT4g"

    const result = await request(app)
      .get('/auth/hello')
      .set('authorization', `Bearer ${invalidToken}`);

    expect(result.status).toEqual(403);
    done();
  });

  it('GET should return hello and uid with proper authentication', async (done) => {

    const result = await request(app)
      .get('/auth/hello')
      .set('authorization', `Bearer ${validToken}`);

    expect(result.body.message).toEqual('Hello!');
    expect(result.body.uid).toEqual(testUser);
    expect(result.status).toEqual(200);
    done();
  });
});
