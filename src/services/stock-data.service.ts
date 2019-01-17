import axios, { AxiosError, AxiosResponse } from 'axios';

import config from '../config';
import { DailyQuote, DailyQuoteResponse } from '../models';
import { logger } from '../utils';

const makeStockRequest = async <T>(endpoint: string): Promise<AxiosResponse<T>> => {
  try {
    return await
      axios({
        method: 'get',
        url: `${endpoint}`,
        params: {  },
      });
  } catch (error) {
    const err = error as AxiosError;
    logger.error(`Stock data request failure with error '${err.name}': ${err.message}`);
    logger.debug(`Stock data request failure was from url '${endpoint}'`);
    throw error;
  }
};

async function getSingleStockIntradaily(symbol: string): Promise<DailyQuote[]> {
  const response = await makeStockRequest<DailyQuoteResponse[]>(`${config.stocks.API_URL}/stocks/${symbol}/intraDay`);
  // Turn date-strings into actual date objects.
  const processed = response.data.map<DailyQuote>(d => ({...d, date: new Date(Date.parse(d.date))}));
  return processed;
}

async function getSingleStockHistory(symbol: string): Promise<DailyQuote[]> {
  const response = await makeStockRequest<DailyQuoteResponse[]>(`${config.stocks.API_URL}/stocks/${symbol}/history`);
  // Turn date-strings into actual date objects.
  const processed = response.data.map<DailyQuote>(d => ({...d, date: new Date(Date.parse(d.date))}));
  return processed;
}

export {
  getSingleStockIntradaily,
  getSingleStockHistory,
}
