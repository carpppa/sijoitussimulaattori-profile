import 'jest';

import { getTransactionsToFullfilmentDates } from '../src/engine/engine-utils';
import { TransactionEngine } from '../src/engine/transaction-engine';
import { IPriceData, IProfileData, SymbolsPriceData, TransactionWithUid } from '../src/models';
import {
  mockBuyTransactions,
  mockBuyTransactionsShouldExpire,
  mockBuyTransactionsShouldFullFillAt,
  mockDivingPrice,
  mockExpiringBuyTransactions,
} from './mocks/engine-buy.mock';
import {
  mockRisingPrice,
  mockSellTransactions,
  mockSellTransactionsShouldExpire,
  mockSellTransactionsShouldFullFillAt,
} from './mocks/engine-sell.mock';

const TEST_TIMEOUT = 10000;

describe('ENGINE', () => {

  beforeAll(async (done) => {
    done();
  })

  afterAll(async (done) => {
    done();
  });

  it('internal getTransactionsToFullfilmentDates should be able to get SELL transaction fulfillment dates', async (done) => {

    const transactions = getTransactionsToFullfilmentDates(mockSellTransactions, mockRisingPrice, new Date(Date.parse("2018-01-01T01:05:00.000Z")));

    transactions.forEach(t => {
      const fulfilledAt: Date | undefined = t.fulfillment;
      const shouldBe = mockSellTransactionsShouldFullFillAt[t.transaction.uid];
      // console.log(`Transaction ${t.transaction.uid} should be fulfilled at '${shouldBe}' and was '${fulfilledAt}'`);
      expect(fulfilledAt).toEqual(shouldBe);
    })

    done();
  }, TEST_TIMEOUT);

  it('internal getTransactionsToFullfilmentDates should be able to get BUY transaction fulfillment dates', async (done) => {

    const transactions = getTransactionsToFullfilmentDates(mockBuyTransactions, mockDivingPrice, new Date(Date.parse("2018-01-01T01:05:00.000Z")));

    transactions.forEach(t => {
      const fulfilledAt: Date | undefined = t.fulfillment;
      const shouldBe = mockBuyTransactionsShouldFullFillAt[t.transaction.uid];
      // console.log(`Transaction ${t.transaction.uid} should be fulfilled at '${shouldBe}' and was '${fulfilledAt}'`);
      expect(fulfilledAt).toEqual(shouldBe);
    })

    done();
  }, TEST_TIMEOUT);

  it('internal getTransactionsToFullfilmentDates should be able to get expired SELL transactions as expired', async (done) => {

    const transactions = getTransactionsToFullfilmentDates(mockExpiringBuyTransactions, mockRisingPrice, new Date(Date.parse("2018-01-01T01:05:00.000Z")));

    transactions.forEach(t => {
      // console.log(`Transaction ${t.transaction.uid} should and was fulfilled '${t.fulfillment}' and should be expired but was: '${t.expired}'`);
      expect(t.expired).toBeTruthy();
      expect(t.fulfillment).toBeUndefined();
    })

    done();
  }, TEST_TIMEOUT);

  it('internal getTransactionsToFullfilmentDates should be able to get expired BUY transactions as expired', async (done) => {

    const transactions = getTransactionsToFullfilmentDates(mockExpiringBuyTransactions, mockDivingPrice, new Date(Date.parse("2018-01-01T01:05:00.000Z")),);

    transactions.forEach(t => {
      // console.log(`Transaction ${t.transaction.uid} should and was fulfilled '${t.fulfillment}' and should be expired but was: '${t.expired}'`);
      expect(t.expired).toBeTruthy();
      expect(t.fulfillment).toBeUndefined();
    })

    done();
  }, TEST_TIMEOUT);

  it('should be able to fulfill and cancel correct BUY transactions', async (done) => {

    const fullfilledUids: string[] = [];
    const cancelledUids: string[] = [];

    const mockProfileService: IProfileData = {
      async getPendingTransactions(): Promise<TransactionWithUid[]> {
        return mockBuyTransactions;
      },
      async fulfillTransaction(transactionId: string, fulfilled?: Date): Promise<any>{
        expect(fulfilled).toEqual(mockBuyTransactionsShouldFullFillAt[transactionId]);
        fullfilledUids.push(transactionId);
        // Return value does not matter here
        return undefined;
      },
      async cancelTransaction(transactionId: string): Promise<any>{
        expect(mockBuyTransactionsShouldExpire[transactionId]).toBeDefined();
        expect(mockBuyTransactionsShouldExpire[transactionId]).toBeTruthy();
        cancelledUids.push(transactionId);
        return undefined;
      }
    };

    const mockPricesService: IPriceData = {
      async getPrices(symbols: string[], from?: Date, to?: Date): Promise<SymbolsPriceData> {
        return mockDivingPrice;
      }
    };

    const transactionEngine = new TransactionEngine(mockProfileService, mockPricesService);

    await transactionEngine.doCheck(new Date(Date.parse("2018-01-01T01:05:00.000Z")));

    expect(fullfilledUids).toHaveLength(3);
    // Find transactions which was supposed not to fulfill
    const notFulfilledKeys = Object.keys(mockBuyTransactionsShouldFullFillAt).filter(key => mockBuyTransactionsShouldFullFillAt[key] === undefined);
    // Check that none of transactions which should be not fullfilled was actually fulfilled
    notFulfilledKeys.forEach(key => {
      const found = fullfilledUids.find(f => f === key);
      expect(found).toBeUndefined();
    });
    fullfilledUids.forEach(key => {
      const found = notFulfilledKeys.find(f => f === key);
      expect(found).toBeUndefined();
    });

    // Find transactions which was supposed to fulfill
    const expectedFulfilledKeys = Object.keys(mockBuyTransactionsShouldFullFillAt).filter(key => mockBuyTransactionsShouldFullFillAt[key] !== undefined);
    // Check that same amount was fulfilled
    expect(fullfilledUids.length).toEqual(expectedFulfilledKeys.length);
    // Check that all of transactions which should be fullfilled was actually fulfilled
    expectedFulfilledKeys.forEach(key => {
      const found = fullfilledUids.find(f => f === key);
      expect(found).toBeDefined();
    });
    fullfilledUids.forEach(key => {
      const found = expectedFulfilledKeys.find(f => f === key);
      expect(found).toBeDefined();
    });

    // Find transactions which was supposed to expire
    const expectedExpiredKeys = Object.keys(mockBuyTransactionsShouldExpire).filter(key => mockBuyTransactionsShouldExpire[key] === true);
    // Check that same amount was expired
    expect(expectedExpiredKeys.length).toEqual(cancelledUids.length);
    // Check that all of transactions which should be expired was actually cancelled
    expectedExpiredKeys.forEach(key => {
      const found = cancelledUids.find(f => f === key);
      expect(found).toBeDefined();
    });
    cancelledUids.forEach(key => {
      const found = expectedExpiredKeys.find(f => f === key);
      expect(found).toBeDefined();
    });

    done();
  }, TEST_TIMEOUT);

  it('should be able to fulfill and cancel correct SELL transactions', async (done) => {

    const fullfilledUids: string[] = [];
    const cancelledUids: string[] = [];

    const mockProfileService: IProfileData = {
      async getPendingTransactions(): Promise<TransactionWithUid[]> {
        return mockSellTransactions;
      },
      async fulfillTransaction(transactionId: string, fulfilled?: Date): Promise<any>{
        expect(fulfilled).toEqual(mockSellTransactionsShouldFullFillAt[transactionId]);
        fullfilledUids.push(transactionId);
        // Return value does not matter here
        return undefined;
      },
      async cancelTransaction(transactionId: string): Promise<any>{
        expect(mockSellTransactionsShouldExpire[transactionId]).toBeDefined();
        expect(mockSellTransactionsShouldExpire[transactionId]).toBeTruthy();
        cancelledUids.push(transactionId);
        return undefined;
      },
    };

    const mockPricesService: IPriceData = {
      async getPrices(symbols: string[], from?: Date, to?: Date): Promise<SymbolsPriceData> {
        return mockRisingPrice;
      }
    };

    const transactionEngine = new TransactionEngine(mockProfileService, mockPricesService);

    await transactionEngine.doCheck(new Date(Date.parse("2018-01-01T01:05:00.000Z")));

    expect(fullfilledUids).toHaveLength(3);
    // Find transactions which was supposed not to fulfill
    const notFulfilledKeys = Object.keys(mockSellTransactionsShouldFullFillAt).filter(key => mockSellTransactionsShouldFullFillAt[key] === undefined);
    // Check that none of transactions which should be not fullfilled was actually fulfilled
    notFulfilledKeys.forEach(key => {
      const found = fullfilledUids.find(f => f === key);
      expect(found).toBeUndefined();
    });
    fullfilledUids.forEach(key => {
      const found = notFulfilledKeys.find(f => f === key);
      expect(found).toBeUndefined();
    });

    // Find transactions which was supposed to fulfill
    const expectedFulfilledKeys = Object.keys(mockSellTransactionsShouldFullFillAt).filter(key => mockSellTransactionsShouldFullFillAt[key] !== undefined);
    // Check that same amount was fulfilled
    expect(fullfilledUids.length).toEqual(expectedFulfilledKeys.length);
    // Check that all of transactions which should be fullfilled was actually fulfilled
    expectedFulfilledKeys.forEach(key => {
      const found = fullfilledUids.find(f => f === key);
      expect(found).toBeDefined();
    });
    fullfilledUids.forEach(key => {
      const found = expectedFulfilledKeys.find(f => f === key);
      expect(found).toBeDefined();
    });

    // Find transactions which was supposed to expire
    const expectedExpiredKeys = Object.keys(mockSellTransactionsShouldExpire).filter(key => mockSellTransactionsShouldExpire[key] === true);
    // Check that same amount was expired
    expect(expectedExpiredKeys.length).toEqual(cancelledUids.length);
    // Check that all of transactions which should be expired was actually cancelled
    expectedExpiredKeys.forEach(key => {
      const found = cancelledUids.find(f => f === key);
      expect(found).toBeDefined();
    });
    cancelledUids.forEach(key => {
      const found = expectedExpiredKeys.find(f => f === key);
      expect(found).toBeDefined();
    });

    done();
  }, TEST_TIMEOUT);
});
