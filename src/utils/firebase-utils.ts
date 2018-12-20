import { DocumentSnapshot } from '@google-cloud/firestore';

export interface WithUid {
  uid: string;
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

export { getData, getDataArray, asUid }
