const axios = require('axios');
const crypto = require('crypto');

class Transaction {
  constructor(amount, senderPublicKey, receiverPublicKey) {
    this.amount = amount;
    this.senderPublicKey = senderPublicKey;
    this.receiverPublicKey = receiverPublicKey;
  }

  toString() {
    return JSON.stringify(this);
  }
}

class Block {
  constructor(previousHash, transaction, timestamp = Date.now(), nonce = 0) {
    this.previousHash = previousHash;
    this.transaction = transaction;
    this.timestamp = timestamp;
    this.nonce = nonce;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.previousHash + this.timestamp + JSON.stringify(this.transaction) + this.nonce)
      .digest('hex');
  }

  toString() {
    return JSON.stringify(this);
  }
}

const getPeers = async () => {
  try {
    const response = await axios.get('http://central-registry:4000/peers');
    return response.data.peers;
  } catch (error) {
    console.error('Failed to get peers from central registry:', error);
    return [];
  }
};

const mineBlock = async (transaction) => {
  const peers = await getPeers();
  if (peers.length === 0) {
    console.error('No peers available to mine block');
    return;
  }

  // Choose a random peer to mine the block
  const peer = peers[Math.floor(Math.random() * peers.length)];
  try {
    const response = await axios.post(`${peer}/mine`, { transaction });
    console.log('Block mined:', response.data);
  } catch (error) {
    console.error('Failed to mine block:', error);
  }
};

// Example usage
const transaction = new Transaction(50, 'AlicePublicKey', 'BobPublicKey');
mineBlock(transaction);
