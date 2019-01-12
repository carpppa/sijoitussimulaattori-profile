const express = require('express');
const app = express();
const port = 3000;

const fs = require('fs');

const availableStocks = JSON.parse(
  fs.readFileSync(__dirname + '/data/availableStocks.json')
);
const singleStock = (symbol) =>
  JSON.parse(fs.readFileSync(__dirname + '/data/' + symbol + 'meta.json'));
const singleStockIntra = (symbol) =>
  JSON.parse(fs.readFileSync(__dirname + '/data/' + symbol + 'intra.json'));
const singleStockHistory = (symbol) =>
  JSON.parse(fs.readFileSync(__dirname + '/data/' + symbol + 'history.json'));

app.get('/stocks', (req, res) => {
  console.log('Connected...');
  res.json(availableStocks);
});

app.get('/stocks/:symbol', (req, res) => {
  console.log(req.params.symbol + '-stock metadata being fethced');
  res.json(singleStock(req.params.symbol));
});

app.get('/stocks/:symbol/intraDay', (req, res) => {
  console.log(req.params.symbol + ' intraday being fetched');
  res.json(singleStockIntra(req.params.symbol));
});

app.get('/stocks/:symbol/history', (req, res) => {
  console.log(req.params.symbol + ' history being fetched');
  res.json(singleStockHistory(req.params.symbol));
});

app.listen(port, () => {
  console.log(`Dummy server listening on http://localhost:${port}`);
});
