import { runWithAdminContext } from '../firebase';
import { PromiseQueue } from '../utils/promise-queue';

const dbUrl = process.env.DATABASE_URL;
const apiKey = process.env.WEB_API_KEY;

if(!dbUrl || !apiKey) {
  throw new Error('DATABASE_URL, WEB_API_KEY are required in env');
}

function paginate<T>(array: T[], page_size: number, page_number: number): T[] {
  --page_number; // because pages logically start with 1, but technically with 0
  return array.slice(page_number * page_size, (page_number + 1) * page_size);
}

runWithAdminContext(async (admin) => {

  // Deleting users has free quota of 10 deletes / second. 

  const queue = new PromiseQueue({
    interval: 1000,
    autorun: true
  });

  const users = await admin.auth().listUsers();
  const uids = users.users.map(u => u.uid);
  const amount = uids.length;
  const batchSize = 9;
  const iterations = Math.ceil(amount / batchSize);

  const requests: Promise<void>[] = [];

  for(let i = 1; i <= iterations; i++) {
    const deleteRequest = (iteration: number) => {
      return async () => {
        console.log(`Deleting users ${(iteration-1)*batchSize }-${iteration*batchSize}`)
        const uidsToDelete = paginate(uids, batchSize, iteration);
        await Promise.all(uidsToDelete.map(uid => admin.auth().deleteUser(uid)));
      }
    }
    requests.push(queue.enqueue(deleteRequest(i)));
  }

  console.log(`Users to delete ${amount}, in ${iterations}. `);
  await Promise.all(requests);
  console.log("Delete successful");
});
