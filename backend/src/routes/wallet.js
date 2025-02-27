const express = require('express');
const db = require('../db');
const Wallet = require('../models/wallet');

const router = express.Router();

router.post('/create', (req, res) => {
  const { username, publicKey } = req.body;

  const wallet = new Wallet(username, publicKey, null);

  db.run(
    'INSERT INTO wallets (username, publicKey, privateKey, balance) VALUES (?, ?, ?, ?)',
    [wallet.username, wallet.publicKey, wallet.privateKey, wallet.balance],
    (err) => {
      if (err) {
        res.status(500).send('Error creating wallet');
      } else {
        res.json(wallet);
      }
    }
  );
});

router.post('/add-funds', (req, res) => {
  const { username, amount } = req.body;
  db.get('SELECT * FROM wallets WHERE username = ?', [username], (err, row) => {
    if (err) {
      res.status(500).send('Error retrieving wallet');
    } else if (row) {
      const newBalance = row.balance + amount;
      db.run('UPDATE wallets SET balance = ? WHERE username = ?', [newBalance, username], (err) => {
        if (err) {
          res.status(500).send('Error adding funds');
        } else {
          res.send(`Added ${amount} to ${username}'s wallet`);
        }
      });
    } else {
      res.status(404).send('Wallet not found');
    }
  });
});

router.get('/:username', (req, res) => {
  const { username } = req.params;
  db.get('SELECT * FROM wallets WHERE username = ?', [username], (err, row) => {
    if (err) {
      res.status(500).send('Error retrieving wallet');
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).send('Wallet not found');
    }
  });
});

router.get('/:username/balance', (req, res) => {
  const { username } = req.params;
  db.get('SELECT balance FROM wallets WHERE username = ?', [username], (err, row) => {
    if (err) {
      res.status(500).send('Error retrieving balance');
    } else if (row) {
      res.json({ balance: row.balance });
    } else {
      res.status(404).send('Wallet not found');
    }
  });
});

module.exports = router;
