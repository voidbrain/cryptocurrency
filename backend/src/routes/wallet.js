const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure the database module is correctly imported

// Endpoint to create a wallet
router.post('/create', async (req, res) => {
  const { publicKey, balance, username } = req.body;
  try {
    const exists = await db.walletExists(publicKey);
    if (exists) {
      console.log('Wallet already exists for publicKey:', publicKey);
      return res.status(400).send('Wallet already exists');
    }

    console.log("Wallet does not exist, proceed with creation");
    // Wallet does not exist, proceed with creation
    await db.createWallet(publicKey, balance, username);
    const wallet = { publicKey, balance, username };
    console.log('Wallet created:', wallet);
    res.json(wallet);
  } catch (err) {
    console.error('Error checking wallet existence:', err);
    res.status(500).send('Error checking wallet existence');
  }
});

// Endpoint to check if a wallet exists
router.get('/exists/:publicKey', async (req, res) => {
  console.log("Checking if wallet exists", req.params);
  const { publicKey } = req.params;
  try {
    const exists = await db.walletExists(publicKey);
    if (exists) {
      res.status(200).send({ exists: true });
    } else {
      res.status(200).send({ exists: false });
    }
  } catch (err) {
    console.error('Failed to check wallet existence:', err);
    res.status(500).send('Server error');
  }
});

// Endpoint to add funds to a wallet
router.post('/add-funds', async (req, res) => {
  const { publicKey, amount } = req.body;
  try {
    await db.updateWalletBalance(publicKey, amount);
    res.send('Funds added successfully');
  } catch (err) {
    console.error('Failed to add funds:', err);
    res.status(500).send('Server error');
  }
});

// Endpoint to get wallet information by username
router.get('/get/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const wallet = await db.getWalletByUsername(username);
    res.json(wallet);
  } catch (err) {
    console.error('Failed to get wallet:', err);
    res.status(500).send('Server error');
  }
});

// Endpoint to get wallet balance by username
router.get('/get/:username/balance', async (req, res) => {
  const { username } = req.params;
  try {
    const balance = await db.getWalletBalanceByUsername(username);
    res.json({ balance });
  } catch (err) {
    console.error('Failed to get wallet balance:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
