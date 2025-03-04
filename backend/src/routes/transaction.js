const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure the database module is correctly imported
const Chain = require('../models/blockchain'); // Assuming you have a blockchain module
const Transaction = require('../models/transaction'); // Assuming you have a transaction module
const crypto = require('crypto').webcrypto;

const verifySignature = async (publicKey, signature, data) => {
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
    new TextEncoder().encode(data)
  );

  return isValid;
};

router.post('/send', async (req, res) => {
  const { from, to, value, signature, data } = req.body;

  try {
    // Fetch the sender's public key from the database
    const senderWallet = await db.getWalletByUsername(from);
    if (!senderWallet) {
      return res.status(400).send('Sender not found');
    }
    const senderPublicKey = senderWallet.publicKey;

    // Verify the signature
    const isValidSignature = await verifySignature(senderPublicKey, signature, data);
    if (!isValidSignature) {
      return res.status(400).send('Invalid signature');
    }

    // Check sender's token availability
    if (senderWallet.balance < value) {
      return res.status(400).send('Insufficient balance');
    }

    // Check if receiver exists
    const receiverWallet = await db.getWalletByUsername(to);
    if (!receiverWallet) {
      return res.status(400).send('Receiver not found');
    }
    const receiverPublicKey = receiverWallet.publicKey;

    // Create and insert the transaction
    const transaction = new Transaction(value, senderPublicKey, receiverPublicKey);
    Chain.instance.insertBlock(transaction);

    const newBlock = Chain.instance.chain[Chain.instance.chain.length - 1];
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO chain (previousHash, transaction_data, timestamp, hash) VALUES (?, ?, ?, ?)',
        [newBlock.previousHash, JSON.stringify(newBlock.transaction), newBlock.timestamp, newBlock.hash],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    // Add the transaction to the database
    await db.addTransaction({
      senderPublicKey,
      receiverPublicKey,
      amount: value,
      timestamp: Date.now()
    });

    // Update sender's and receiver's token availability
    await db.updateWalletBalance(senderPublicKey, -value);
    await db.updateWalletBalance(receiverPublicKey, value);

    res.send('Transaction sent');
  } catch (err) {
    console.error('Error sending transaction:', err);
    res.status(500).send('Error sending transaction');
  }
});

module.exports = router;
