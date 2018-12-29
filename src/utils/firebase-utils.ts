import { DocumentSnapshot, DocumentReference } from '@google-cloud/firestore';
import * as admin from 'firebase-admin';

export interface WithUid {
  uid: string;
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
}
