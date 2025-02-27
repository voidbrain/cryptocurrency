const express = require('express');
const db = require('../db');
const Wallet = require('../models/wallet');

const router = express.Router();

router.post('/create', (req, res) => {
  const { username, publicKey } = req.body;
  console.log(`Creating wallet for username: ${username}`);

  // Check if the wallet already exists
  db.get('SELECT * FROM wallets WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Error checking wallet existence:', err);
      res.status(500).send('Error checking wallet existence');
    } else if (row) {
      console.log('Wallet already exists for username:', username);
      res.status(400).send('Wallet already exists');
    } else {
      // Wallet does not exist, proceed with creation
      const wallet = new Wallet(username, publicKey, 0);

      db.run(
        'INSERT INTO wallets (username, publicKey, balance) VALUES (?, ?, ?)',
        [wallet.username, wallet.publicKey, wallet.balance],
        (err) => {
          if (err) {
            console.error('Error creating wallet:', err);
            res.status(500).send('Error creating wallet');
          } else {
            console.log('Wallet created:', wallet);
            res.json(wallet);
          }
        }
      );
    }
  });
});

router.post('/add-funds', (req, res) => {
  const { username, amount } = req.body;
  console.log(`Adding funds to wallet for username: ${username}, amount: ${amount}`);

  db.get('SELECT * FROM wallets WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Error retrieving wallet:', err);
      res.status(500).send('Error retrieving wallet');
    } else if (row) {
      const newBalance = row.balance + amount;
      db.run('UPDATE wallets SET balance = ? WHERE username = ?', [newBalance, username], (err) => {
        if (err) {
          console.error('Error adding funds:', err);
          res.status(500).send('Error adding funds');
        } else {
          console.log(`Added ${amount} to ${username}'s wallet`);
          res.send(`Added ${amount} to ${username}'s wallet`);
        }
      });
    } else {
      console.error('Wallet not found for username:', username);
      res.status(404).send('Wallet not found');
    }
  });
});

router.get('/:username', (req, res) => {
  const { username } = req.params;
  console.log(`Retrieving wallet for username: ${username}`);

  db.get('SELECT username, publicKey, balance FROM wallets WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Error retrieving wallet:', err);
      res.status(500).send('Error retrieving wallet');
    } else if (row) {
      console.log('Wallet retrieved:', row);
      res.json(row);
    } else {
      console.error('Wallet not found for username:', username);
      res.status(404).send('Wallet not found');
    }
  });
});

router.get('/:username/balance', (req, res) => {
  const { username } = req.params;
  console.log(`Retrieving balance for username: ${username}`);

  db.get('SELECT balance FROM wallets WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Error retrieving balance:', err);
      res.status(500).send('Error retrieving balance');
    } else if (row) {
      console.log('Balance retrieved:', row.balance);
      res.json({ balance: row.balance });
    } else {
      console.error('Wallet not found for username:', username);
      res.status(404).send('Wallet not found');
    }
  });
});

module.exports = router;
