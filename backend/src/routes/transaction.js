const express = require('express');
const db = require('../db');
const Chain = require('../models/chain');
const Transaction = require('../models/transaction');
const crypto = require('crypto');

const router = express.Router();

router.post('/', async (req, res) => {
  const { transaction, signature, publicKey } = req.body;

  // Verify the signature
  const isValidSignature = await verifySignature(transaction, signature, publicKey);
  if (!isValidSignature) {
    return res.status(400).send('Invalid signature');
  }

  const { amount, senderPublicKey, receiverPublicKey } = transaction;

  // Check if sender and receiver wallets exist and have sufficient balance
  db.get('SELECT * FROM wallets WHERE publicKey = ?', [senderPublicKey], (err, senderRow) => {
    if (err) {
      console.error('Error retrieving sender wallet:', err);
      return res.status(500).send('Error retrieving sender wallet');
    }
    if (!senderRow) {
      console.error('Sender wallet not found');
      return res.status(404).send('Sender wallet not found');
    }
    if (senderRow.balance < amount) {
      console.error('Insufficient balance in sender wallet');
      return res.status(400).send('Insufficient balance in sender wallet');
    }

    db.get('SELECT * FROM wallets WHERE publicKey = ?', [receiverPublicKey], (err, receiverRow) => {
      if (err) {
        console.error('Error retrieving receiver wallet:', err);
        return res.status(500).send('Error retrieving receiver wallet');
      }
      if (!receiverRow) {
        console.error('Receiver wallet not found');
        return res.status(404).send('Receiver wallet not found');
      }

      // Create and insert the transaction
      const newTransaction = new Transaction(amount, senderPublicKey, receiverPublicKey);
      Chain.instance.insertBlock(newTransaction);

      const newBlock = Chain.instance.chain[Chain.instance.chain.length - 1];
      db.run(
        'INSERT INTO chain (previousHash, transaction_data, timestamp, hash) VALUES (?, ?, ?, ?)',
        [newBlock.previousHash, newBlock.transaction.toString(), newBlock.timestamp, newBlock.hash],
        (err) => {
          if (err) {
            console.error('Error adding transaction to chain:', err);
            return res.status(500).send('Error adding transaction to chain');
          }

          // Update sender and receiver balances
          const newSenderBalance = senderRow.balance - amount;
          const newReceiverBalance = receiverRow.balance + amount;

          db.run('UPDATE wallets SET balance = ? WHERE publicKey = ?', [newSenderBalance, senderPublicKey], (err) => {
            if (err) {
              console.error('Error updating sender wallet balance:', err);
              return res.status(500).send('Error updating sender wallet balance');
            }

            db.run('UPDATE wallets SET balance = ? WHERE publicKey = ?', [newReceiverBalance, receiverPublicKey], (err) => {
              if (err) {
                console.error('Error updating receiver wallet balance:', err);
                return res.status(500).send('Error updating receiver wallet balance');
              }

              res.send('Transaction added and balances updated');
            });
          });
        }
      );
    });
  });
});

const verifySignature = async (transaction, signature, publicKey) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(transaction));

  const key = await crypto.subtle.importKey(
    'spki',
    Uint8Array.from(atob(publicKey), c => c.charCodeAt(0)),
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['verify']
  );

  const isValid = await crypto.subtle.verify(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-256' },
    },
    key,
    Uint8Array.from(atob(signature), c => c.charCodeAt(0)),
    data
  );

  return isValid;
};

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
