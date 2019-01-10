import 'jest';

import * as admin from 'firebase-admin';
import * as request from 'supertest';

import app from '../src/app';
import config from '../src/config';
import * as firebase from '../src/firebase';
import { DB } from '../src/firebase-constants';
import { PortfolioWithUid, MoneyTransferWithUid, MoneyTransfer } from '../src/models';
import { getIdTokenForTest, getOrCreateUser, createPortfolioForUser, shuffle, removeUser } from '../src/utils/firebase-test-utils';
import { randomInt } from '../src/utils/general';

describe('/profile/portfolio/balance', () => {
  let validToken: string;
  let validToken2: string;
  let testUser: string;
  let testUser2: string;
  let portfolioId: string;
  let portfolioId2: string;
  let balance = 0;

  // Configurations and tracking for cleanup
  let confs: {
    portfolios: {
      created: string[]
    },
    users: {
      created: string[],
    },
    transfers: {
      create: number,
      created: string[],
    }
  };

  beforeAll(async (done) => {
    
    confs = {
      portfolios: {
        created: [],
      },
      users: {
        created: []
      },
      transfers: {
        create: 4,
        created: []
      }
    }

    firebase.connect();

    // Create users
    testUser = 'test-user-' + randomInt().toString();
    testUser2 = 'test-user-' + randomInt().toString();
    await Promise.all([
      getOrCreateUser(testUser),
      getOrCreateUser(testUser2),
    ]);
    confs.users.created.push(testUser);
    confs.users.created.push(testUser2);

    // Create tokens
    const tokens = await Promise.all([
      getIdTokenForTest(config.firebase.WEB_API_KEY, testUser),
      getIdTokenForTest(config.firebase.WEB_API_KEY, testUser2),
    ]);
    validToken = tokens[0];
    validToken2 = tokens[1];

    // Create portfolios
    const portfolioIds = await Promise.all([
      await createPortfolioForUser(testUser),
      await createPortfolioForUser(testUser2),
    ]);
    portfolioId = portfolioIds[0];
    portfolioId2 = portfolioIds[1];
    confs.portfolios.created.push(portfolioId);
    confs.portfolios.created.push(portfolioId2);

    done();
  })

  afterAll(async (done) => {
    const portfolioDocs = confs.portfolios.created.map(puid => {
      return admin.firestore().collection(DB.PORTFOLIOS).doc(puid).delete();
    });
    const transferDocs = confs.transfers.created.map(tuid => {
      return admin.firestore().collection(DB.MONEY_TRANSFERS).doc(tuid).delete();
    });
    const userDocs = confs.users.created.map(puid => {
      return admin.firestore().collection(DB.USERS).doc(puid).delete();
    });

    const users = confs.users.created.map(uid => {
      return removeUser(uid);
    })

    await Promise.all<any>([...portfolioDocs, ...transferDocs, ...userDocs, ...users]);

    firebase.disconnect();
    done();
  });

  it('GET should return 403 without authentication', async (done) => {
    const result = await request(app)
      .get(`/profile/portfolio/${portfolioId}/balance`);

    expect(result.status).toEqual(403);
    done();
  }, 10000);

  it('GET should return 403 with invalid token', async (done) => {

    const invalidToken = "EyJhbGciOiJSUzI1NiIsImtpZCI6IjE4NGM0NWM4ZWJmOGRkYmU1NTY5OTE1YzYzNzk5ZDUxZjMyMzY1OTUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc2lqb2l0dXNzaW11bGFhdHRvcmkiLCJhdWQiOiJzaWpvaXR1c3NpbXVsYWF0dG9yaSIsImF1dGhfdGltZSI6MTU0NTE0Mjg2MywidXNlcl9pZCI6InRlc3QtdXNlci11aWQiLCJzdWIiOiJ0ZXN0LXVzZXItdWlkIiwiaWF0IjoxNTQ1MTQyODYzLCJleHAiOjE1NDUxNDY0NjMsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiY3VzdG9tIn19.Ub5Uai6QcYQZA3CJyhuDiwScTw7bvy0dVn5dR0zTmomioaCBYs2wgmmNuBP0XWRoWQxDUqoOjYwUfHtReZHxzq5tPpyyhAs__3O_A2Fe1klhg1UfV4-VOvbW2qtwyjmXaRBCL2G-kYkopwfr0yp1Ca-OPNhefmZU0zodCnvEhIEkCSQ0JxI5cAdW4ZzcxRmo_SO_jG5XxJ3JAimIl1mkp6w0rD2KSd0P_hf5Csdhss2h5_R4uuyqpiIfCIkwRwyan2mvEdY0BTmSdNERgqEqNEjn0RVsY2KHi5pKJ8acA0B5RVzL0R0siWq3Suco13HJDrDtbw5pLcLXr9ldcpbT4g"

    const result = await request(app)
      .get(`/profile/portfolio/${portfolioId}/balance`)
      .set('authorization', `Bearer ${invalidToken}`);

    expect(result.status).toEqual(403);
    done();
  }, 10000);

  it('GET should return 404 without ownership to portfolio', async (done) => {
    const result = await request(app)
      .get(`/profile/portfolio/${portfolioId}/balance`)
      .set('authorization', `Bearer ${validToken2}`);

    expect(result.status).toEqual(404);
    done();
  }, 10000);

  it('GET should return empty list', async (done) => {
    const result = await request(app)
      .get(`/profile/portfolio/${portfolioId}/balance`)
      .set('authorization', `Bearer ${validToken}`);

    expect(result.status).toEqual(200);
    expect(Array.isArray(result.body)).toBeTruthy();
    const portfolios = result.body as MoneyTransferWithUid[];
    expect(portfolios).toHaveLength(0);
    done();
  }, 10000);

  it('POST should create money transfers', async (done) => {
    const requests: Promise<void>[] = [];

    const createRequest = async (sum: number) => {
      const transfer: MoneyTransfer = {
        sum: sum
      };

      const result = await request(app)
        .post(`/profile/portfolio/${portfolioId}/balance`)
        .set('authorization', `Bearer ${validToken}`)
        .send(transfer);

      expect(result.status).toEqual(200);
      expect(result.body).toBeDefined();
      const executed = result.body as MoneyTransferWithUid;
      expect(executed.uid).toBeDefined();
      confs.transfers.created.push(executed.uid);
      expect(executed.portfolioId).toBeDefined();
      expect(executed.portfolioId).toEqual(portfolioId);
      expect(executed.sum).toBeDefined();
      expect(executed.sum).toEqual(transfer.sum);
      expect(executed.newBalance).toBeDefined();
      expect(executed.oldBalance).toBeDefined();
      expect(executed.newBalance).toEqual(executed.oldBalance + executed.sum);
      expect(executed.sum).toEqual(executed.newBalance - executed.oldBalance);
    };

    for(let i = 0; i < confs.transfers.create - 1; i++) {
      const sum = i * 200;
      balance += sum;
      requests.push(createRequest(sum));
    }
    shuffle(requests);

    await Promise.all(requests);
    const minus = -50;
    balance += minus;
    await createRequest(minus);
    done();
  }, 10000);

  it('GET should list money transfers', async (done) => {
    const result = await request(app)
      .get(`/profile/portfolio/${portfolioId}/balance`)
      .set('authorization', `Bearer ${validToken}`);

    expect(result.status).toEqual(200);
    expect(Array.isArray(result.body)).toBeTruthy();
    const transfers = result.body as MoneyTransferWithUid[];
    expect(transfers).toHaveLength(confs.transfers.create);
    expect(result.status).toEqual(200);
    done();
  }, 10000);

  it('POST new transfer should reject if balance would end up negative', async (done) => {
    const transfer: MoneyTransfer = {
      sum: -1000
    };

    const result = await request(app)
      .post(`/profile/portfolio/${portfolioId}/balance`)
      .set('authorization', `Bearer ${validToken}`)
      .send(transfer);

    expect(result.status).toEqual(400)
    done();
  }, 10000);

  it('POST should have altered balance of the portfolio', async (done) => {
    const result = await request(app)
      .get(`/profile/portfolio/${portfolioId}`)
      .set('authorization', `Bearer ${validToken}`);

    expect(result.status).toEqual(200);
    expect(result.body).toBeDefined();
    const pf = result.body as PortfolioWithUid;
    expect(pf.balance).toEqual(balance);
    expect(pf.name).toBeDefined();
    expect(pf.ownerId).toEqual(testUser);
    expect(pf.uid).toBeDefined();
    done();
  }, 10000);

});
