import { isUndefined } from 'util';

import { logger } from './logger';

/** Configuration options for the promise queue */
export interface PromiseQueueOptions {
  /** Enables or disables automatic execution of the queue
   * once new functions are added to the queue. Defaults to `true`*/
  autorun?: boolean;
  /** Enables setting a maximum frequency on how often the
   * functions can be executed. Defaults to `0`.*/
  interval?: number;
}

/** This class enables queuing functions to be executed serially. */
export class PromiseQueue {
  private running: boolean = false;
  private autorun: boolean;
  private interval: number;
  private queue: (Function)[] = [];

  /**
   * Create a new promise queue
   * @param options Configuration options for the queue.
   */
  constructor(options?: PromiseQueueOptions) {
    this.autorun =
      options && !isUndefined(options.autorun) ? options.autorun : true;
    this.interval = (options && options.interval) || 0;
  }

  private async push(callback: Function): Promise<void> {
    this.queue.push(callback);
    if (this.autorun && !this.running) {
      this.dequeue();
    }
  }

  /**
   * Adds the given function to the queue and returns a promise
   * that will be resolved to the return value of the function
   * once it's executed.
   * @param fun Function to enqueue.
   */
  async enqueue<T>(fun: Function): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {
      const resolver = async () => {
        try {
          const ret: T = await fun();
          resolve(ret);
        } catch (error) {
          reject(error);
        }
      };

      this.push(resolver).catch((e) => logger.error(e));
    });
  }

  /**
   * Start dequeuing. If option `autorun` is used, this function
   * does not need to be called manually.
   */
  async dequeue(): Promise<void> {
    this.running = true;
    const func = this.queue.shift();
    if (func) {
      func();
    }

    await new Promise((resolve) => setTimeout(() => resolve(), this.interval));

    if (this.queue.length > 0) {
      this.dequeue();
    } else {
      this.running = false;
    }
  }
}