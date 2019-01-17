import app from './src/app';
import { engine } from './src/engine';
import { connect } from './src/firebase';

connect();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('Express server listening on port ' + port);
});

engine.start().then(() => {
  console.log('Transaction engine has started');
});
