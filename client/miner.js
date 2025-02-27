const axios = require('axios');
const crypto = require('crypto');

class Transaction {
  constructor(amount, senderPublicKey, receiverPublicKey) {
    this.amount = amount;
    this.senderPublicKey = senderPublicKey;
    this.receiverPublicKey = receiverPublicKey;
    this.signature = '';
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

  mineBlock(difficulty) {
    const startTime = Date.now();
    while (!this.hash.startsWith(Array(difficulty + 1).join('0'))) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    const endTime = Date.now();
    const miningTime = (endTime - startTime) / 1000;
    console.log(`Block mined: ${this.hash}`);
    console.log(`Mining took ${miningTime} seconds`);
    return miningTime;
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

const notifyMiningTime = async (miningTime) => {
  try {
    await axios.post('http://backend:3000/api/history/mining-time', { miningTime });
    console.log('Mining time notified to backend');
  } catch (error) {
    console.error('Failed to notify mining time to backend:', error);
  }
};

const mineBlock = async () => {
  const peers = await getPeers();
  if (peers.length === 0) {
    console.error('No peers available to mine block');
    return;
  }

  // Choose a random peer to mine the block
  const peer = peers[Math.floor(Math.random() * peers.length)];
  try {
    const response = await axios.get(`${peer}/blockchain`);
    const blockchain = response.data;
    const previousBlock = blockchain[blockchain.length - 1];

    // Create a coinbase transaction to reward Alice
    const coinbaseTransaction = new Transaction(50, null, alicePublicKey);

    const newBlock = new Block(previousBlock.hash, coinbaseTransaction);

    // Set the difficulty level (e.g., 4 leading zeros)
    const difficulty = 4;
    const miningTime = newBlock.mineBlock(difficulty);

    await axios.post(`${peer}/mine`, { block: newBlock });
    console.log('Block mined:', newBlock);

    // Notify the backend about the mining time
    await notifyMiningTime(miningTime);
  } catch (error) {
    console.error('Failed to mine block:', error);
  }
};

// Example usage with Alice's keys
const alicePublicKey = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAztroh5/CC1u39w4xzgVMW6JNMUXshRUgQYCmBqUlx2FDiY3dtQXgWzeaoTYRXY2zTveXwDVogWgAGhDYjQRXj8oqEs1zpAUp4Xr1FqnpWjLQkdxW++MqALk4A/9MELRkqJlSjcnSKBuoomOhfDIgUyLy97X2VsWf2W+Xr1sCrPvl7lMEcFaBqYFotXfWK4IEjNMYNRtdFPbtQPJEkSCEblu6fen9iikmW+Tpu9znpNnaJa0LWbyY4xsRxFKfUjEY24eq+nTqVkyjPSLJrPuQpLfjql5luZfFbg+2qeAPj/jHWCRskTFyqwJdBIsmXqm6PBrW+CAX0JiwhynBG9Jq0QIDAQAB`;

const startMining = async () => {
  while (true) {
    await mineBlock();
  }
};

startMining();
