import axios from 'axios';
import * as admin from 'firebase-admin';

interface VerifyCustomTokenResponse {
  kind: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

async function getOrCreateUser(uid: string): Promise<admin.auth.UserRecord> {
  const users = await admin.auth().listUsers();
  const existingUser = users.users.find(u => u.uid === uid);

  if(!existingUser) {
    return await admin.auth().createUser({
      disabled: false,
      uid: uid,
    })
  } else {
    return existingUser;
  }
}

/**
 * Returns IdToken which can be used to login as provided user/uid. Is meant only for testing purposes.
 *
 * @param apiKey Apikey for endpoint where custom tokens can be exchanged for id tokens ( https://firebase.google.com/docs/auth/admin/verify-id-tokens )
 * @param uid UID of user which will be created/found. Does not need to be in form of real UID (e.g. 'test-user-uid' is just fine)
 */
async function getIdTokenForTest(apiKey: string, uid: string): Promise<string> {
  if(!apiKey) {
    throw new Error('ApiKey was not provided');
  }

  return await getIdTokenForUser(apiKey, uid);
}

async function getIdTokenForUser(apiKey: string, uid: string): Promise<string> {
  const customToken = await admin.auth().createCustomToken(uid);

  const response = await axios.post<VerifyCustomTokenResponse>(
    `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${apiKey}`,
    {
      token: customToken,
      returnSecureToken: true
    }
  );

  return response.data.idToken;
}

async function removeUser(uid: string): Promise<void> {
  await admin.auth().deleteUser(uid);
}

export {
  getOrCreateUser,
  getIdTokenForTest,
  removeUser,
}