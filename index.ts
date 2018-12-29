import app from './src/app';
import { connect } from './src/firebase';

connect();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('Express server listening on port ' + port);
});
