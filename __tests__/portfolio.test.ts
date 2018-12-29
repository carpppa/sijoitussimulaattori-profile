import 'jest';

import * as admin from 'firebase-admin';
import * as request from 'supertest';

import app from '../src/app';
import config from '../src/config';
import * as firebase from '../src/firebase';
import { DB } from '../src/firebase-constants';
import { Portfolio, PortfolioWithUid } from '../src/models';
import { getIdTokenForTest, getOrCreateUser } from '../src/utils/firebase-test-utils';
import { randomInt } from '../src/utils/general';
import { WithUid } from './../src/utils/firebase-utils';

describe('/profile/portfolio', () => {
  let validToken: string;
  const allPortfolios: { [key: string]: PortfolioWithUid } = { };
  const deletedKeys: string[] = [];

  // Configurations and tracking for cleanup
  let confs: {
    portfolios: {
      create: number,
      delete: number,
      created: string[],
      deleted: string[]
    },
    users: {
      created: string[],
    }
  };

  beforeAll(async (done) => {
    confs = {
      portfolios: {
        create: 5,
        delete: 3,
        created: [],
        deleted: [],
      },
      users: {
        created: []
      }
    }

    firebase.connect();

    const testUser = 'test-user-' + randomInt().toString();
    confs.users.created.push(testUser);

    await getOrCreateUser(testUser);
    validToken = await getIdTokenForTest(config.firebase.WEB_API_KEY, testUser);

    done();
  })

  afterAll(async (done) => {
    const portfolioDocs = confs.portfolios.created.map(puid => {
      return admin.firestore().collection(DB.PORTFOLIOS).doc(puid).delete();
    })
    const userDocs = confs.users.created.map(puid => {
      return admin.firestore().collection(DB.USERS).doc(puid).delete();
    })

    await Promise.all([...portfolioDocs, ...userDocs]);

    firebase.disconnect();
    done();
  });

  it('GET should return 403 without authentication', async (done) => {
    const result = await request(app)
      .get('/profile/portfolio');

    expect(result.status).toEqual(403);
    done();
  });

  it('GET should return 403 with invalid token', async (done) => {

    const invalidToken = "EyJhbGciOiJSUzI1NiIsImtpZCI6IjE4NGM0NWM4ZWJmOGRkYmU1NTY5OTE1YzYzNzk5ZDUxZjMyMzY1OTUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc2lqb2l0dXNzaW11bGFhdHRvcmkiLCJhdWQiOiJzaWpvaXR1c3NpbXVsYWF0dG9yaSIsImF1dGhfdGltZSI6MTU0NTE0Mjg2MywidXNlcl9pZCI6InRlc3QtdXNlci11aWQiLCJzdWIiOiJ0ZXN0LXVzZXItdWlkIiwiaWF0IjoxNTQ1MTQyODYzLCJleHAiOjE1NDUxNDY0NjMsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiY3VzdG9tIn19.Ub5Uai6QcYQZA3CJyhuDiwScTw7bvy0dVn5dR0zTmomioaCBYs2wgmmNuBP0XWRoWQxDUqoOjYwUfHtReZHxzq5tPpyyhAs__3O_A2Fe1klhg1UfV4-VOvbW2qtwyjmXaRBCL2G-kYkopwfr0yp1Ca-OPNhefmZU0zodCnvEhIEkCSQ0JxI5cAdW4ZzcxRmo_SO_jG5XxJ3JAimIl1mkp6w0rD2KSd0P_hf5Csdhss2h5_R4uuyqpiIfCIkwRwyan2mvEdY0BTmSdNERgqEqNEjn0RVsY2KHi5pKJ8acA0B5RVzL0R0siWq3Suco13HJDrDtbw5pLcLXr9ldcpbT4g"

    const result = await request(app)
      .get('/profile/portfolio')
      .set('authorization', `Bearer ${invalidToken}`);

    expect(result.status).toEqual(403);
    done();
  });

  it('GET should return empty list', async (done) => {
    const result = await request(app)
      .get('/profile/portfolio')
      .set('authorization', `Bearer ${validToken}`);

    expect(Array.isArray(result.body)).toBeTruthy();
    const portfolios = result.body as Portfolio[];
    expect(portfolios).toHaveLength(0);
    expect(result.status).toEqual(200);
    done();
  });

  it('POST should return new portfolio', async (done) => {
    const promises: Promise<void>[] = [];

    for(let i = 0; i < confs.portfolios.create; i++) {
      const createPortfolio = async () => {
        const portfolio: Portfolio = {
          name: 'test-portfolio-' + randomInt().toString()
        }

        const result = await request(app)
          .post('/profile/portfolio')
          .set('authorization', `Bearer ${validToken}`)
          .send(portfolio);

        expect(result.body).toBeDefined();
        expect(result.status).toEqual(200);
        const created: Portfolio & WithUid = result.body;
        confs.portfolios.created.push(created.uid);
        expect(created.name).toEqual(portfolio.name);
        allPortfolios[created.uid] = created;

      }
      promises.push(createPortfolio());
    }

    await Promise.all(promises);

    done();
  });

  it('GET should return created portfolios', async (done) => {
    const result = await request(app)
      .get('/profile/portfolio')
      .set('authorization', `Bearer ${validToken}`);

    expect(result.status).toEqual(200);
    expect(result.body).toBeDefined();
    expect(Array.isArray(result.body)).toBeTruthy();
    const portfolios = result.body as PortfolioWithUid[];
    expect(portfolios).toHaveLength(confs.portfolios.create);
    expect(portfolios.map(pf => pf.uid)).toEqual(expect.arrayContaining(Object.keys(allPortfolios)));
    done();
  });

  it('DELETE should return deleted portfolio uid', async (done) => {

    // Get some portfolios to be deleted
    const deletePortfolios = Object.keys(allPortfolios).map(key => allPortfolios[key]).splice(1, confs.portfolios.delete);
    deletedKeys.push(...deletePortfolios.map(pf => pf.uid!));

    const promises: Promise<void>[] = deletePortfolios.map(pf => {
      const createDelete = async () => {
        const result = await request(app)
          .delete(`/profile/portfolio/${pf.uid}`)
          .set('authorization', `Bearer ${validToken}`);

        expect(result.status).toEqual(200);
        expect(result.body).toBeDefined();
        const deleted = result.body as WithUid;
        confs.portfolios.deleted.push(deleted.uid);
        expect(deleted.uid).toBeDefined();
        expect(deleted.uid).toEqual(pf.uid);
      };
      return createDelete();
    });

    await Promise.all(promises);
    done();
  });

  it('GET should not return deleted portfolios', async (done) => {
    const result = await request(app)
      .get('/profile/portfolio')
      .set('authorization', `Bearer ${validToken}`);

    expect(result.status).toEqual(200);
    expect(result.body).toBeDefined();
    expect(Array.isArray(result.body)).toBeTruthy();
    const portfolios = result.body as PortfolioWithUid[];
    expect(portfolios).toHaveLength(confs.portfolios.create - confs.portfolios.delete);

    confs.portfolios.deleted.forEach(key => expect(portfolios.find(pf => pf.uid === key)).toBeUndefined);
    const left = confs.portfolios.created.filter(c => !confs.portfolios.deleted.some(d => d === c));
    left.forEach(key => expect(portfolios.find(pf => pf.uid === key)).toBeDefined());

    done();
  });
});