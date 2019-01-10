import { MoneyTransferWithUid, TransactionWithUid } from '../models';
import { getDate } from './firebase-utils';

/** PreSerializer transforms possible FirebaseTimestamp fields to Date fields. */
function preSerializeTransaction(item: TransactionWithUid): TransactionWithUid {
  const copied: TransactionWithUid = {
    ...item
  };

  if (copied.cancelledAt) {
    copied.cancelledAt = getDate(copied.cancelledAt);
  }

  if (copied.fulfilledAt) {
    copied.fulfilledAt = getDate(copied.fulfilledAt);
  }

  copied.expiresAt = getDate(copied.expiresAt);
  copied.createdAt = getDate(copied.createdAt);

  return copied;
}


/** PreSerializer transforms possible FirebaseTimestamp fields to Date fields. */
function preSerializeMoneytransfer(item: MoneyTransferWithUid): MoneyTransferWithUid {
  const copied: MoneyTransferWithUid = {
    ...item
  };

  copied.createdAt = getDate(copied.createdAt);

  return copied;
}

export {
  preSerializeTransaction,
  preSerializeMoneytransfer,
}
