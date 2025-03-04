const express = require('express');
const router = express.Router();
const Blockchain = require('../models/blockchain');
const db = require('../db');

const blockchain = new Blockchain();

// Function to calculate the market price
const calculateMarketPrice = async (totalBuyAmount, totalSellAmount) => {
  const blockchainParams = blockchain.getBlockchainParams();

  // Base market price calculation
  let marketPrice = totalBuyAmount / totalSellAmount;

  // Include mining and block production multiplicator
  const miningMultiplicator = blockchainParams.currentSupply / blockchainParams.maxSupply;
  marketPrice *= miningMultiplicator;

  return marketPrice;
};

// Function to update the market price in the database
const updateMarketPrice = async () => {
  db.all('SELECT * FROM orders', async (err, rows) => {
    if (err) {
      console.error('Error retrieving orders:', err);
      return;
    }

    const buyOrders = rows.filter(order => order.type === 'buy');
    const sellOrders = rows.filter(order => order.type === 'sell');

    const totalBuyAmount = buyOrders.reduce((sum, order) => sum + order.amount, 0);
    const totalSellAmount = sellOrders.reduce((sum, order) => sum + order.amount, 0);

    try {
      const marketPrice = await calculateMarketPrice(totalBuyAmount, totalSellAmount);
      db.run('UPDATE market SET price = ? WHERE id = 1', [marketPrice], (err) => {
        if (err) {
          console.error('Failed to update market price:', err);
        } else {
          console.log('Market price updated:', marketPrice);
        }
      });
    } catch (error) {
      console.error('Failed to calculate market price:', error);
    }
  });
};

// Endpoint to get the current market price of NodeCoin
router.get('/market-price', (req, res) => {
  db.get('SELECT price FROM market WHERE id = 1', (err, row) => {
    if (err) {
      console.error('Failed to fetch market price:', err);
      res.status(500).send('Failed to fetch market price');
    } else {
      res.json({ marketPrice: row.price });
    }
  });
});

// Example endpoint to create an order
router.post('/create-order', (req, res) => {
  const { type, amount, price } = req.body;
  db.run('INSERT INTO orders (type, amount, price) VALUES (?, ?, ?)', [type, amount, price], (err) => {
    if (err) {
      console.error('Failed to create order:', err);
      res.status(500).send('Failed to create order');
    } else {
      // Update the market price after creating a new order
      updateMarketPrice();
      res.json({ success: true, message: 'Order created successfully' });
    }
  });
});

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
  const price = 1;
  res.status(200).send({ price });

  // db.all('SELECT * FROM order', (err, rows) => {
  //   if (err) {
  //     console.log("err");
  //     res.status(500).send('Error retrieving orders');
  //   } else {
  //     const buyOrders = rows.filter(order => order.type === 'buy');
  //     const sellOrders = rows.filter(order => order.type === 'sell');

  //     const totalBuyAmount = buyOrders.reduce((sum, order) => sum + order.amount, 0);
  //     const totalSellAmount = sellOrders.reduce((sum, order) => sum + order.amount, 0);

  //     console.log(totalBuyAmount, totalSellAmount);

  //     calculateMarketPrice(totalBuyAmount, totalSellAmount)
  //       .then(marketPrice => res.json({ marketPrice }))
  //       .catch(error => {
  //         // console.error('Failed to calculate market price:', error);
  //         res.status(500).send('Failed to calculate market price');
          
  //       });
  //   }
  // });
});

module.exports = router;
