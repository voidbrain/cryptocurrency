const express = require('express');
const db = require('../db');
const Order = require('../models/order');

const router = express.Router();

router.post('/buy', (req, res) => {
  const { amount, price } = req.body;
  const order = new Order('buy', amount, price);

  db.run(
    'INSERT INTO orders (type, amount, price) VALUES (?, ?, ?)',
    [order.type, order.amount, order.price],
    (err) => {
      if (err) {
        res.status(500).send('Error placing buy order');
      } else {
        res.json(order);
      }
    }
  );
});

router.post('/sell', (req, res) => {
  const { amount, price } = req.body;
  const order = new Order('sell', amount, price);

  db.run(
    'INSERT INTO orders (type, amount, price) VALUES (?, ?, ?)',
    [order.type, order.amount, order.price],
    (err) => {
      if (err) {
        res.status(500).send('Error placing sell order');
      } else {
        res.json(order);
      }
    }
  );
});

router.get('/price', (req, res) => {
  db.all('SELECT * FROM orders', (err, rows) => {
    if (err) {
      res.status(500).send('Error retrieving orders');
    } else {
      const buyOrders = rows.filter(order => order.type === 'buy');
      const sellOrders = rows.filter(order => order.type === 'sell');

      const totalBuyAmount = buyOrders.reduce((sum, order) => sum + order.amount, 0);
      const totalSellAmount = sellOrders.reduce((sum, order) => sum + order.amount, 0);

      const marketPrice = calculateMarketPrice(totalBuyAmount, totalSellAmount);
      res.json({ marketPrice });
    }
  });
});

const calculateMarketPrice = (totalBuyAmount, totalSellAmount) => {
  if (totalSellAmount === 0) return 1; // Avoid division by zero
  return totalBuyAmount / totalSellAmount;
};

module.exports = router;
