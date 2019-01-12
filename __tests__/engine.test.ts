import 'jest';

import { getTransactionsToFullfilmentDates } from '../src/engine/engine-utils';
import {
  mockBuyTransactions,
  mockBuyTransactionsShouldFullFillAt,
  mockDivingPrice,
  mockExpiringBuyTransactions,
} from './mocks/engine-buy.mock';
import { mockRisingPrice, mockSellTransactions, mockSellTransactionsShouldFullFillAt } from './mocks/engine-sell.mock';

const TEST_TIMEOUT = 10000;

describe('ENGINE', () => {

  beforeAll(async (done) => {
    done();
  })

  afterAll(async (done) => {
    done();
  });

  it('should be able to get SELL transaction fulfillment dates', async (done) => {

    const transactions = getTransactionsToFullfilmentDates(mockSellTransactions, mockRisingPrice, new Date(Date.parse("2018-01-01T01:05:00.000Z")));

    transactions.forEach(t => {
      const fulfilledAt: Date | undefined = t.fulfillment;
      const shouldBe = mockSellTransactionsShouldFullFillAt[t.transaction.uid];
      // console.log(`Transaction ${t.transaction.uid} should be fulfilled at '${shouldBe}' and was '${fulfilledAt}'`);
      expect(fulfilledAt).toEqual(shouldBe);
    })

    done();
  }, TEST_TIMEOUT);

  it('should be able to get BUY transaction fulfillment dates', async (done) => {

    const transactions = getTransactionsToFullfilmentDates(mockBuyTransactions, mockDivingPrice, new Date(Date.parse("2018-01-01T01:05:00.000Z")));

    transactions.forEach(t => {
      const fulfilledAt: Date | undefined = t.fulfillment;
      const shouldBe = mockBuyTransactionsShouldFullFillAt[t.transaction.uid];
      // console.log(`Transaction ${t.transaction.uid} should be fulfilled at '${shouldBe}' and was '${fulfilledAt}'`);
      expect(fulfilledAt).toEqual(shouldBe);
    })

    done();
  }, TEST_TIMEOUT);

  it('should be able to get expired SELL transactions as expired', async (done) => {

    const transactions = getTransactionsToFullfilmentDates(mockExpiringBuyTransactions, mockRisingPrice, new Date(Date.parse("2018-01-01T01:05:00.000Z")));

    transactions.forEach(t => {
      // console.log(`Transaction ${t.transaction.uid} should and was fulfilled '${t.fulfillment}' and should be expired but was: '${t.expired}'`);
      expect(t.expired).toBeTruthy();
      expect(t.fulfillment).toBeUndefined();
    })

    done();
  }, TEST_TIMEOUT);

  it('should be able to get expired BUY transactions as expired', async (done) => {

    const transactions = getTransactionsToFullfilmentDates(mockExpiringBuyTransactions, mockDivingPrice, new Date(Date.parse("2018-01-01T01:05:00.000Z")),);

    transactions.forEach(t => {
      // console.log(`Transaction ${t.transaction.uid} should and was fulfilled '${t.fulfillment}' and should be expired but was: '${t.expired}'`);
      expect(t.expired).toBeTruthy();
      expect(t.fulfillment).toBeUndefined();
    })

    done();
  }, TEST_TIMEOUT);
});
