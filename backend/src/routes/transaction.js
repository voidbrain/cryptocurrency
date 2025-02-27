const express = require('express');
const db = require('../db');
const Chain = require('../models/chain');
const Transaction = require('../models/transaction');

const router = express.Router();

router.post('/', (req, res) => {
  const { amount, senderPublicKey, receiverPublicKey } = req.body;
  const transaction = new Transaction(amount, senderPublicKey, receiverPublicKey);
  Chain.instance.insertBlock(transaction);

  const newBlock = Chain.instance.chain[Chain.instance.chain.length - 1];
  db.run(
    'INSERT INTO chain (previousHash, transaction_data, timestamp, hash) VALUES (?, ?, ?, ?)',
    [newBlock.previousHash, newBlock.transaction.toString(), newBlock.timestamp, newBlock.hash],
    (err) => {
      if (err) {
        res.status(500).send('Error adding transaction');
      } else {
        res.send('Transaction added');
      }
    }
  );
});

router.post('/send', (req, res) => {
  const { from, to, value } = req.body;
  const transaction = new Transaction(value, from, to);
  Chain.instance.insertBlock(transaction);

  const newBlock = Chain.instance.chain[Chain.instance.chain.length - 1];
  db.run(
    'INSERT INTO chain (previousHash, transaction_data, timestamp, hash) VALUES (?, ?, ?, ?)',
    [newBlock.previousHash, newBlock.transaction.toString(), newBlock.timestamp, newBlock.hash],
    (err) => {
      if (err) {
        res.status(500).send('Error sending transaction');
      } else {
        res.send('Transaction sent');
      }
    }
  );
});

module.exports = router;
