import { runWithAdminContext } from '../firebase';
import { removeUser } from '../utils/firebase-test-utils';

const dbUrl = process.env.DATABASE_URL;
const apiKey = process.env.WEB_API_KEY;

if(!dbUrl || !apiKey) {
  throw new Error('DATABASE_URL, WEB_API_KEY are required in env');
}

function getUid() {
  const args = process.argv.slice(2);

  if(args.length > 0) {
    for(let i = 0; i<args.length; i++) {
      const parts = args[i].split('=');
      const key = parts[0].toLocaleUpperCase();
      const val = parts[1];

      if (key === 'UID') {
        return val;
      }
    }
  }

  return 'test-user-uid';
}

runWithAdminContext(async (admin) => {
  const uid = getUid();
  await removeUser(uid);
  console.log('-----------------------');
  console.log(`User ${uid} deleted.`);
  console.log('-----------------------');
});
