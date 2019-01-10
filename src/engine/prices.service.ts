import { isDefined } from '../utils';
import { IStockData, SymbolsPriceData } from './models';

class PricesService {

  constructor(private stockData: IStockData) { }

  /** Gets history and intraday data for given symbols */
  async getPriceData(symbols: string[], from?: Date, to?: Date): Promise<SymbolsPriceData> {
    // Get prices
    const pricesRaw = await Promise.all(
      symbols.map<Promise<SymbolsPriceData | undefined>>(async (symbol) => {
        try {
          const [history, intraday] = await Promise.all([
            this.stockData.getHistory(symbol),
            this.stockData.getIntraday(symbol)
          ]);

          const data: SymbolsPriceData = {};
          data[symbol] = {
            history,
            intraday,
          }

          return data;
        } catch (err) {
          // TODO: Log error
          return undefined;
        }

      })
    );

    // Combine prices into single dict.
    const prices = pricesRaw
      .filter(isDefined)
      .reduce<SymbolsPriceData>((acc, price) => {
        Object.entries(price).forEach(p => acc[p[0]] = p[1]);
        return acc;
    }, {});

    return prices;
  }

}

export {
  PricesService,
}
