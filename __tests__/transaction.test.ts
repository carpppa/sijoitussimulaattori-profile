import 'jest';

import * as admin from 'firebase-admin';
import * as request from 'supertest';

import app from '../src/app';
import config from '../src/config';
import * as firebase from '../src/firebase';
import { DB, PORTFOLIO } from '../src/firebase-constants';
import { PortfolioWithUid, TransactionWithUid, Transaction, TransactionType, TransactionStatus } from '../src/models';
import { getIdTokenForTest, getOrCreateUser, createPortfolioForUser, removeUser } from '../src/utils/firebase-test-utils';
import { randomInt } from '../src/utils/general';
import { fulfillTransaction } from '../src/services';

describe('/profile/portfolio/:portfolioId/transaction', () => {
  let validToken: string;
  let validToken2: string;
  let testUser: string;
  let testUser2: string;
  let portfolioId: string;
  let portfolioId2: string;
  const originalBalance1 = 1000;
  let balance = originalBalance1;

  // Configurations and tracking for cleanup
  let confs: {
    portfolios: {
      created: string[]
    },
    users: {
      created: string[],
    },
    transfers: {
      created: string[],
    },
    transactions: {
      created: string[]
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
        created: []
      },
      transactions: {
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
      await createPortfolioForUser(testUser, originalBalance1),
      await createPortfolioForUser(testUser2),
    ]);
    portfolioId = portfolioIds[0];
    portfolioId2 = portfolioIds[1];
    confs.portfolios.created.push(portfolioId);
    confs.portfolios.created.push(portfolioId2);

    done();
  })

  afterAll(async (done) => {
    const deleteStocks: Promise<any>[] = [];

    const stockDocs = confs.portfolios.created.map(
      async puid => (await admin.firestore().collection(DB.PORTFOLIOS).doc(puid).collection(PORTFOLIO.STOCKS).listDocuments()).forEach(t => deleteStocks.push(t.delete()))
    );

    await Promise.all(stockDocs);

    const portfolioDocs = confs.portfolios.created.map(puid => {
      return admin.firestore().collection(DB.PORTFOLIOS).doc(puid).delete();
    });
    const transferDocs = confs.transfers.created.map(tuid => {
      return admin.firestore().collection(DB.MONEY_TRANSFERS).doc(tuid).delete();
    });
    const userDocs = confs.users.created.map(puid => {
      return admin.firestore().collection(DB.USERS).doc(puid).delete();
    });
    const transactionDocs = confs.transactions.created.map(uid => {
      return admin.firestore().collection(DB.TRANSACTIONS).doc(uid).delete();
    })
    const users = confs.users.created.map(uid => {
      return removeUser(uid);
    })
    await Promise.all<any>([ ...deleteStocks, ...portfolioDocs, ...transferDocs, ...userDocs, ...transactionDocs, ...users]);

    firebase.disconnect();
    done();
  });

  it('GET should return 403 without authentication', async (done) => {
    const result = await request(app)
      .get(`/profile/portfolio/${portfolioId}/transaction`);

    expect(result.status).toEqual(403);
    done();
  });

  it('GET should return 403 with invalid token', async (done) => {

    const invalidToken = "EyJhbGciOiJSUzI1NiIsImtpZCI6IjE4NGM0NWM4ZWJmOGRkYmU1NTY5OTE1YzYzNzk5ZDUxZjMyMzY1OTUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc2lqb2l0dXNzaW11bGFhdHRvcmkiLCJhdWQiOiJzaWpvaXR1c3NpbXVsYWF0dG9yaSIsImF1dGhfdGltZSI6MTU0NTE0Mjg2MywidXNlcl9pZCI6InRlc3QtdXNlci11aWQiLCJzdWIiOiJ0ZXN0LXVzZXItdWlkIiwiaWF0IjoxNTQ1MTQyODYzLCJleHAiOjE1NDUxNDY0NjMsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiY3VzdG9tIn19.Ub5Uai6QcYQZA3CJyhuDiwScTw7bvy0dVn5dR0zTmomioaCBYs2wgmmNuBP0XWRoWQxDUqoOjYwUfHtReZHxzq5tPpyyhAs__3O_A2Fe1klhg1UfV4-VOvbW2qtwyjmXaRBCL2G-kYkopwfr0yp1Ca-OPNhefmZU0zodCnvEhIEkCSQ0JxI5cAdW4ZzcxRmo_SO_jG5XxJ3JAimIl1mkp6w0rD2KSd0P_hf5Csdhss2h5_R4uuyqpiIfCIkwRwyan2mvEdY0BTmSdNERgqEqNEjn0RVsY2KHi5pKJ8acA0B5RVzL0R0siWq3Suco13HJDrDtbw5pLcLXr9ldcpbT4g"

    const result = await request(app)
      .get(`/profile/portfolio/${portfolioId}/transaction`)
      .set('authorization', `Bearer ${invalidToken}`);

    expect(result.status).toEqual(403);
    done();
  });

  it('GET should return 404 without ownership to portfolio', async (done) => {
    const result = await request(app)
      .get(`/profile/portfolio/${portfolioId}/transaction`)
      .set('authorization', `Bearer ${validToken2}`);

    expect(result.status).toEqual(404);
    done();
  });

  it('GET should return empty list', async (done) => {
    const result = await request(app)
      .get(`/profile/portfolio/${portfolioId}/transaction`)
      .set('authorization', `Bearer ${validToken}`);

    expect(result.status).toEqual(200);
    expect(Array.isArray(result.body)).toBeTruthy();
    const transactions = result.body as TransactionWithUid[];
    expect(transactions).toHaveLength(0);
    done();
  });

  it('POST should return 400 when balance is too low', async (done) => {
    const transaction: Transaction = {
      type: TransactionType.BUY,
      amount: 11,
      price: 100,
      symbol: 'FAKE-STOCK'
    }

    const result = await request(app)
      .post(`/profile/portfolio/${portfolioId}/transaction`)
      .set('authorization', `Bearer ${validToken}`)
      .send(transaction);

    expect(result.status).toEqual(400);
    done();
  });

  it('POST should return 400 when transaction is misformed', async (done) => {
    const transaction1: Transaction = {
      type: TransactionType.BUY,
      amount: 10,
      price: -100,
      symbol: 'FAKE-STOCK'
    }
    
    const transaction2: Transaction = {
      type: TransactionType.BUY,
      amount: -10,
      price: 100,
      symbol: 'FAKE-STOCK'
    }

    const transaction3: any = {
      type: 'NOT_TRANSACTION_TYPE',
      amount: -10,
      price: 100,
      symbol: 'FAKE-STOCK'
    }

    const transaction4: any = {
      type: TransactionType.BUY,
      amount: 10,
      price: 100,
    }

    const promises = [
      request(app)
        .post(`/profile/portfolio/${portfolioId}/transaction`)
        .set('authorization', `Bearer ${validToken}`)
        .send(transaction1), 
      request(app)
        .post(`/profile/portfolio/${portfolioId}/transaction`)
        .set('authorization', `Bearer ${validToken}`)
        .send(transaction2),
      request(app)
        .post(`/profile/portfolio/${portfolioId}/transaction`)
        .set('authorization', `Bearer ${validToken}`)
        .send(transaction3),
      request(app)
        .post(`/profile/portfolio/${portfolioId}/transaction`)
        .set('authorization', `Bearer ${validToken}`)
        .send(transaction4),
    ]

    const results = await Promise.all(promises);

    expect(results[0].status).toEqual(400);
    expect(results[1].status).toEqual(400);
    expect(results[2].status).toEqual(400);
    expect(results[3].status).toEqual(400);

    done();
  });

  it('POST should return 400 stock under sell is not in portfolio', async (done) => {
    const transaction1: Transaction = {
      type: TransactionType.SELL,
      amount: 10,
      price: 50,
      symbol: 'SELLED-STOCK'
    }

    const result = await request(app)
      .post(`/profile/portfolio/${portfolioId}/transaction`)
      .set('authorization', `Bearer ${validToken}`)
      .send(transaction1);

    expect(result.status).toEqual(400);

    done();
  });

  it('POST should create BUY transaction and alter portfolio balance', async (done) => {
    const transaction1: Transaction = {
      type: TransactionType.BUY,
      amount: 10,
      price: 50,
      symbol: 'WANTED-STOCK'
    }

    const result = await request(app)
      .post(`/profile/portfolio/${portfolioId}/transaction`)
      .set('authorization', `Bearer ${validToken}`)
      .send(transaction1);

    expect(result.status).toEqual(200);

    const inMarket = result.body as TransactionWithUid;
    confs.transactions.created.push(inMarket.uid);
    
    expect(inMarket.amount).toEqual(transaction1.amount);
    expect(inMarket.price).toEqual(transaction1.price);
    expect(inMarket.symbol).toEqual(transaction1.symbol);
    expect(inMarket.type).toEqual(transaction1.type);
    expect(inMarket.portfolioId).toEqual(portfolioId);
    expect(inMarket.status).toEqual(TransactionStatus.MARKET);

    // Check balance

    const portfolioResult = await request(app)
      .get(`/profile/portfolio/${portfolioId}`)
      .set('authorization', `Bearer ${validToken}`)

    expect(portfolioResult.status).toEqual(200);
    const portfolio = portfolioResult.body as PortfolioWithUid;
    expect(portfolio.balance).toEqual(originalBalance1 - transaction1.amount * transaction1.price);

    balance -= transaction1.amount * transaction1.price;

    done();
  });

  it('GET should return list of transactions', async (done) => {
    const result = await request(app)
      .get(`/profile/portfolio/${portfolioId}/transaction`)
      .set('authorization', `Bearer ${validToken}`);

    expect(result.status).toEqual(200);
    expect(Array.isArray(result.body)).toBeTruthy();
    const transactions = result.body as TransactionWithUid[];
    expect(transactions).toHaveLength(1);
    done();
  });

  it('Fulfilling BUY-transaction should add stocks to portfolio and alter transaction state', async (done) => {
    const result1 = await request(app)
      .get(`/profile/portfolio/${portfolioId}/transaction`)
      .set('authorization', `Bearer ${validToken}`);

    expect(result1.status).toEqual(200);
    expect(Array.isArray(result1.body)).toBeTruthy();
    const transactions1 = result1.body as TransactionWithUid[];
    expect(transactions1).toHaveLength(1);

    const transaction1 = transactions1[0];
    expect(transaction1.status).toEqual(TransactionStatus.MARKET);

    await fulfillTransaction(transaction1.uid);

    const result2 = await request(app)
      .get(`/profile/portfolio/${portfolioId}/transaction`)
      .set('authorization', `Bearer ${validToken}`);

    expect(result2.status).toEqual(200);
    expect(Array.isArray(result2.body)).toBeTruthy();
    const transactions2 = result2.body as TransactionWithUid[];
    expect(transactions2).toHaveLength(1);
    
    const transaction2 = transactions2[0];
    expect(transaction2.status).toEqual(TransactionStatus.FULFILLED);
    done();
  })

   it('Selling stocks in portfolio from portfolio should be allowed and alter stock amount.', async (done) => {
    const result1 = await request(app)
      .get(`/profile/portfolio/${portfolioId}/transaction`)
      .set('authorization', `Bearer ${validToken}`);

    expect(result1.status).toEqual(200);
    expect(Array.isArray(result1.body)).toBeTruthy();
    const transactions1 = result1.body as TransactionWithUid[];
    expect(transactions1).toHaveLength(1);

    const transaction1 = transactions1[0];
    expect(transaction1.status).toEqual(TransactionStatus.FULFILLED);
    expect(transaction1.type).toEqual(TransactionType.BUY);

    await fulfillTransaction(transaction1.uid);

    const transaction2: Transaction = {
      type: TransactionType.SELL,
      amount: 5,
      price: 50,
      symbol: 'WANTED-STOCK'
    }

    const result = await request(app)
      .post(`/profile/portfolio/${portfolioId}/transaction`)
      .set('authorization', `Bearer ${validToken}`)
      .send(transaction2);

    expect(result.status).toEqual(200);
    const inMarket = result.body as TransactionWithUid;
    confs.transactions.created.push(inMarket.uid);
    expect(inMarket.type).toEqual(transaction2.type);
    expect(inMarket.amount).toEqual(transaction2.amount);
    expect(inMarket.price).toEqual(transaction2.price);
    expect(inMarket.symbol).toEqual(transaction2.symbol);
    expect(inMarket.uid).toBeDefined();
    expect(inMarket.status).toEqual(TransactionStatus.MARKET);
    done();
  });

  it('Fulfilling SELL transaction should alter balance of portfolio', async (done) => {
    const result1 = await request(app)
      .get(`/profile/portfolio/${portfolioId}/transaction`)
      .set('authorization', `Bearer ${validToken}`);

    expect(result1.status).toEqual(200);
    expect(Array.isArray(result1.body)).toBeTruthy();
    const transactions1 = result1.body as TransactionWithUid[];
    expect(transactions1).toHaveLength(2);

    const transaction1 = transactions1.find(tr => tr.type === TransactionType.SELL)!;
    expect(transaction1.status).toEqual(TransactionStatus.MARKET);

    await fulfillTransaction(transaction1.uid);

    balance += transaction1.amount * transaction1.price;

    const portfolioResult = await request(app)
      .get(`/profile/portfolio/${portfolioId}`)
      .set('authorization', `Bearer ${validToken}`)

    expect(portfolioResult.status).toEqual(200);
    const portfolio = portfolioResult.body as PortfolioWithUid;
    expect(portfolio.balance).toEqual(balance);

    done();
  });

});