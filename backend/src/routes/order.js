const express = require('express');
const db = require('../db');
const Order = require('../models/order');

const router = express.Router();

router.post('/buy', (req, res) => {
  const { username, amount, price } = req.body;
  console.log(`Buying tokens for username: ${username}, amount: ${amount}, price: ${price}`);

  db.get('SELECT * FROM wallets WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Error retrieving wallet:', err);
      return res.status(500).send('Error retrieving wallet');
    }
    if (!row) {
      console.error('Wallet not found for username:', username);
      return res.status(404).send('Wallet not found');
    }

    db.all('SELECT * FROM orders WHERE type = ? AND price <= ? ORDER BY price ASC', ['sell', price], (err, orders) => {
      if (err) {
        console.error('Error retrieving sell orders:', err);
        return res.status(500).send('Error retrieving sell orders');
      }

      let remainingAmount = amount;
      for (const order of orders) {
        if (remainingAmount <= 0) break;

        const orderAmount = Math.min(order.amount, remainingAmount);
        remainingAmount -= orderAmount;

        db.run('DELETE FROM orders WHERE id = ?', [order.id], (err) => {
          if (err) {
            console.error('Error deleting order:', err);
            return res.status(500).send('Error deleting order');
          }
        });

        const newBalance = row.balance + orderAmount;
        db.run('UPDATE wallets SET balance = ? WHERE username = ?', [newBalance, username], (err) => {
          if (err) {
            console.error('Error updating wallet balance:', err);
            return res.status(500).send('Error updating wallet balance');
          }
        });
      }

      if (remainingAmount > 0) {
        console.error('Not enough tokens available for purchase');
        return res.status(400).send('Not enough tokens available for purchase');
      }

      console.log(`Buy order completed for username: ${username}`);
      res.send('Buy order completed');
    });
  });
});

router.post('/sell', (req, res) => {
  const { username, amount, price } = req.body;
  console.log(`Selling tokens from username: ${username}, amount: ${amount}, price: ${price}`);

  db.get('SELECT * FROM wallets WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Error retrieving wallet:', err);
      return res.status(500).send('Error retrieving wallet');
    }
    if (!row) {
      console.error('Wallet not found for username:', username);
      return res.status(404).send('Wallet not found');
    }
    if (row.balance < amount) {
      console.error('Insufficient balance in wallet');
      return res.status(400).send('Insufficient balance in wallet');
    }

    const newBalance = row.balance - amount;
    db.run('UPDATE wallets SET balance = ? WHERE username = ?', [newBalance, username], (err) => {
      if (err) {
        console.error('Error updating wallet balance:', err);
        return res.status(500).send('Error updating wallet balance');
      }

      const order = new Order('sell', amount, price);
      db.run(
        'INSERT INTO orders (type, amount, price) VALUES (?, ?, ?)',
        [order.type, order.amount, order.price],
        (err) => {
          if (err) {
            console.error('Error placing sell order:', err);
            return res.status(500).send('Error placing sell order');
          }

          console.log(`Sell order placed for username: ${username}`);
          res.json(order);
        }
      );
    });
  });
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
