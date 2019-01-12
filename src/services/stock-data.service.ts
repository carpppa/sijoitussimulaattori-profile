import axios, { AxiosResponse } from 'axios';

import config from '../config';
import { DailyQuote, IStockData } from '../models';
import { logger } from '../utils';

const makeStockRequest = async <T>(endpoint: string): Promise<AxiosResponse<T>> => {
  try {
    return await
      axios({
        method: 'get',
        url: `${config.stocks.API_URL}/${endpoint}`,
        params: {  },
      });
  } catch (error) {
    logger.debug('Stock data request failed', error);
    throw error;
  }
};

async function getSingleStockIntradaily(symbol: string): Promise<DailyQuote[]> {
  const response = await makeStockRequest<DailyQuote[]>(`stock/${symbol}/intraDay`);
  return response.data;
}

async function getSingleStockHistory(symbol: string): Promise<DailyQuote[]> {
  const response = await makeStockRequest<DailyQuote[]>(`stock/${symbol}/history`);
  return response.data;
}

const stockDataService: IStockData = {
  getIntraday: getSingleStockIntradaily,
  getHistory: getSingleStockHistory,
}

export {
  getSingleStockIntradaily,
  getSingleStockHistory,
  stockDataService
}
