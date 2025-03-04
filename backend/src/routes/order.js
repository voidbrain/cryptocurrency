const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure the database module is correctly imported

// Function to calculate the market price
const calculateMarketPrice = async (totalBuyAmount, totalSellAmount) => {
  let marketPrice = 0;
  const miningMultiplicator = 1.1; // Example multiplicator

  if (totalBuyAmount > totalSellAmount) {
    marketPrice = totalBuyAmount / totalSellAmount;
  } else {
    marketPrice = totalSellAmount / totalBuyAmount;
  }

  marketPrice *= miningMultiplicator;

  return marketPrice;
};

// Function to update the market price in the database
const updateMarketPrice = async () => {
  try {
    const rows = await db.getAllOrders();

    const buyOrders = rows.filter(order => order.type === 'buy');
    const sellOrders = rows.filter(order => order.type === 'sell');

    const totalBuyAmount = buyOrders.reduce((sum, order) => sum + order.amount, 0);
    const totalSellAmount = sellOrders.reduce((sum, order) => sum + order.amount, 0);

    const marketPrice = await calculateMarketPrice(totalBuyAmount, totalSellAmount);
    await db.updateMarketPrice(marketPrice);
  } catch (err) {
    console.error('Error updating market price:', err);
  }
};

// Endpoint to create an order
router.post('/create', async (req, res) => {
  const { type, item, amount, price } = req.body;

  try {
    await db.addOrder({ type, item, amount, price });
    res.send('Order created successfully');
  } catch (err) {
    console.error('Failed to create order:', err);
    res.status(500).send('Server error');
  }
});

// Endpoint to get all orders
router.get('/all', async (req, res) => {
  try {
    const orders = await db.getAllOrders();
    res.json(orders);
  } catch (err) {
    console.error('Failed to get orders:', err);
    res.status(500).send('Server error');
  }
});

// Endpoint to update market price
router.post('/update-market-price', async (req, res) => {
  try {
    await updateMarketPrice();
    res.send('Market price updated successfully');
  } catch (err) {
    console.error('Failed to update market price:', err);
    res.status(500).send('Server error');
  }
});

// Endpoint to get the current market price
router.get('/market-price', async (req, res) => {
  try {
    const marketPrice = await db.getMarketPrice();
    res.json({ marketPrice });
  } catch (err) {
    console.error('Failed to get market price:', err);
    res.status(500).send('Server error');
  }
});

// Endpoint to create a buy order
router.post('/buy', async (req, res) => {
  const { item, amount, price } = req.body;

  try {
    await db.addOrder({ type: 'buy', item, amount, price });
    res.send('Buy order created successfully');
  } catch (err) {
    console.error('Failed to create buy order:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
