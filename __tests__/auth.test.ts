import 'jest';

import * as request from 'supertest';

import app from '../src/app';
import config from '../src/config';
import * as firebase from '../src/firebase';
import { getIdTokenForTest, getOrCreateUser, removeUser } from '../src/utils/firebase-test-utils';
import { randomInt } from '../src/utils/general';

const TEST_TIMEOUT = 10000;

describe('/auth/hello', () => {
  let testUser: string;
  let validToken: string;
  let testUser2: string;
  let validToken2: string;

  beforeAll(async (done) => {
    const apiKey = config.firebase.WEB_API_KEY;

    firebase.connect();

    testUser = 'test-user-' + randomInt().toString();
    testUser2 = 'test-user-' + randomInt().toString();
    await Promise.all([
      getOrCreateUser(testUser),
      getOrCreateUser(testUser2),
    ]);
    [validToken, validToken2] = await Promise.all([
      getIdTokenForTest(apiKey, testUser),
      getIdTokenForTest(apiKey, testUser2)
    ])

    await removeUser(testUser2);
    done();
  })

  afterAll(async (done) => {
    await removeUser(testUser);
    firebase.disconnect();

    done();
  });

  it('GET should return 403 without authentication', async (done) => {
    const result = await request(app)
      .get('/auth/hello');

    expect(result.status).toEqual(403);
    done();
  }, TEST_TIMEOUT);

  it('GET should return 403 with invalid token', async (done) => {

    const invalidToken = "EyJhbGciOiJSUzI1NiIsImtpZCI6IjE4NGM0NWM4ZWJmOGRkYmU1NTY5OTE1YzYzNzk5ZDUxZjMyMzY1OTUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc2lqb2l0dXNzaW11bGFhdHRvcmkiLCJhdWQiOiJzaWpvaXR1c3NpbXVsYWF0dG9yaSIsImF1dGhfdGltZSI6MTU0NTE0Mjg2MywidXNlcl9pZCI6InRlc3QtdXNlci11aWQiLCJzdWIiOiJ0ZXN0LXVzZXItdWlkIiwiaWF0IjoxNTQ1MTQyODYzLCJleHAiOjE1NDUxNDY0NjMsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiY3VzdG9tIn19.Ub5Uai6QcYQZA3CJyhuDiwScTw7bvy0dVn5dR0zTmomioaCBYs2wgmmNuBP0XWRoWQxDUqoOjYwUfHtReZHxzq5tPpyyhAs__3O_A2Fe1klhg1UfV4-VOvbW2qtwyjmXaRBCL2G-kYkopwfr0yp1Ca-OPNhefmZU0zodCnvEhIEkCSQ0JxI5cAdW4ZzcxRmo_SO_jG5XxJ3JAimIl1mkp6w0rD2KSd0P_hf5Csdhss2h5_R4uuyqpiIfCIkwRwyan2mvEdY0BTmSdNERgqEqNEjn0RVsY2KHi5pKJ8acA0B5RVzL0R0siWq3Suco13HJDrDtbw5pLcLXr9ldcpbT4g"

    const result = await request(app)
      .get('/auth/hello')
      .set('authorization', `Bearer ${invalidToken}`);

    expect(result.status).toEqual(403);
    done();
  }, TEST_TIMEOUT);

  it('GET should return hello and uid with proper authentication', async (done) => {

    const result = await request(app)
      .get('/auth/hello')
      .set('authorization', `Bearer ${validToken}`);

    expect(result.body.message).toEqual('Hello!');
    expect(result.body.uid).toEqual(testUser);
    expect(result.status).toEqual(200);
    done();
  }, TEST_TIMEOUT);

  it('GET should return 403 with token for non existing user', async (done) => {

    const result = await request(app)
      .get('/auth/hello')
      .set('authorization', `Bearer ${validToken2}`);

    expect(result.status).toEqual(403);
    done();
  }, TEST_TIMEOUT);

});
