import { DocumentReference, DocumentSnapshot, Timestamp } from '@google-cloud/firestore';
import * as admin from 'firebase-admin';

type FirebaseTimestamp = Timestamp | Date;

interface WithUid {
  uid: string;
}

interface CreatedAt {
  createdAt: FirebaseTimestamp;
}

/**
 * This is a hack to make admin.firestore().getAll work more nicely. There is a bug which forces us to use syntax of
 * firestore().getAll(head, ...tail) instead on firestore().getAll(...refs).
 */
function getAll(refs: DocumentReference[]): Promise<DocumentSnapshot[]> {
    // This funny syntax is necessary because getAll typing has some kind of bug disallowing direct use of array.
    const head = refs.shift()!; // non-null assertion because length has been checked earlier
    const tail = refs;
    return admin.firestore().getAll(head, ...tail);
}

function getData<T extends Object>(ref: DocumentSnapshot): T & WithUid {
  const data: T = ref.data() as T;
  const uid: string = ref.id;
  return Object.assign({}, data, {uid});
}

function getDataArray<T extends Object>(refs: DocumentSnapshot[]): (T & WithUid)[] {
  return refs.map(ref => getData(ref));
}

/** Converts FirebaseTimestamp to Date. */
function getDate(item: FirebaseTimestamp): Date {
  if (!(item instanceof Date)) {
    return item.toDate();
  }
  return item;
}

/** Converts FirebaseTimestamp to Timestamp */
function getTimestamp(item: FirebaseTimestamp): Timestamp {
  if (!(item instanceof Date)) {
    return item;
  }
  return admin.firestore.Timestamp.fromDate(item);
}

/** Converts firestore.Timestamp to navite JavaScript Date. */
function createdAtToDate<T extends CreatedAt> (item: T): T {
  item.createdAt = getDate(item.createdAt);
  return item;
}

/** Converts firestore.Timestamp to navite JavaScript Date. */
function createdAtsToDate<T extends CreatedAt> (items: T[]): T[] {
  return items.map(t => createdAtToDate(t));
}

function asUid(refOrUid: DocumentSnapshot | string): WithUid {
  if (typeof refOrUid === 'string') {
    return { uid: refOrUid };
  }
  return { uid: refOrUid.id };
}

export {
  getAll,
  getData,
  getDataArray,
  asUid,
  WithUid,
  CreatedAt,
  createdAtToDate,
  createdAtsToDate,
  FirebaseTimestamp,
  getDate,
  getTimestamp,
}
