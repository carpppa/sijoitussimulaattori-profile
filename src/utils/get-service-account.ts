import { ServiceAccount } from 'firebase-admin';

import { ensureNecessaryEnvs } from '../utils/general';

/**
 * Reads ServiceAccount details from ENV and returns ServiceAccount-object.
 */
function getServiceAccount(): ServiceAccount {
  ensureNecessaryEnvs([
    'TYPE',
    'PROJECT_ID',
    'PRIVATE_KEY_ID',
    'PRIVATE_KEY',
    'CLIENT_EMAIL',
    'CLIENT_ID',
    'AUTH_URI',
    'TOKEN_URI',
    'AUTH_PROVIDER_X509_CERT_URL',
    'CLIENT_X509_CERT_URL'
  ]);

  const type = process.env.TYPE;
  const project_id = process.env.PROJECT_ID;
  const private_key_id = process.env.PRIVATE_KEY_ID;
  const private_key = formatPrivateKey(process.env.PRIVATE_KEY as string);
  const client_email = process.env.CLIENT_EMAIL;
  const client_id = process.env.CLIENT_ID;
  const auth_uri = process.env.AUTH_URI;
  const token_uri = process.env.TOKEN_URI;
  const auth_provider_x509_cert_url = process.env.AUTH_PROVIDER_X509_CERT_URL;
  const client_x509_cert_url = process.env.CLIENT_X509_CERT_URL;

  return {
    type,
    project_id,
    private_key_id,
    private_key,
    client_email,
    client_id,
    auth_uri,
    token_uri,
    auth_provider_x509_cert_url,
    client_x509_cert_url
  } as ServiceAccount
}

function formatPrivateKey(key: string) {
  const keyParts = key.split("\\n");
  const fullParts = [
    '-----BEGIN PRIVATE KEY-----',
    ...keyParts,
    '-----END PRIVATE KEY-----\n'
  ]
  return fullParts.join("\n");
}

export { getServiceAccount }
