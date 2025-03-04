const axios = require('axios');
const crypto = require('crypto');

let peer = '';

class Transaction {
  constructor(amount, senderPublicKey, receiverPublicKey) {
    this.amount = amount;
    this.senderPublicKey = senderPublicKey;
    this.receiverPublicKey = receiverPublicKey;
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
    while (!this.hash.startsWith('0'.repeat(difficulty))) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    return Date.now() - this.timestamp;
  }
}

const getPeer = async () => {
  try {
    const response = await axios.get('http://central-registry:4000/peers');
    const peers = response.data.peers;
    if (peers.length === 0) {
      console.error('No peers available to mine block');
      return;
    }
  
    // Choose a random peer to mine the block
    peer = peers[Math.floor(Math.random() * peers.length)];
    return peer;
  } catch (error) {
    console.error('Failed to get peers from central registry:', error);
    return [];
  }
};

const getBlockchainParams = async () => {
  try {
    const response = await axios.get(`${peer}/blockchain-params`);
    console.log('Blockchain parameters:', response.data, " Peer:", peer);
    return response.data;
  } catch (error) {
    console.error('Failed to get blockchain parameters:', error);
    return null;
  }
};

const notifyMiningTime = async (miningTime) => {
  // Implement the function to notify the backend about the mining time
  console.log('Mining time:', miningTime);
};

const mineBlock = async (blockchainParams) => {
  try {
    const response = await axios.get(`${peer}/blockchain`);
    const blockchain = response.data;
    const previousBlock = blockchain[blockchain.length - 1];

    // Create a coinbase transaction to reward Alice
    const coinbaseTransaction = new Transaction(blockchainParams.miningReward, null, alicePublicKey);

    const newBlock = new Block(previousBlock.hash, coinbaseTransaction);

    // Set the difficulty level from blockchain parameters
    const difficulty = blockchainParams.difficulty;
    const miningTime = newBlock.mineBlock(difficulty);

    console.log("transaction:", newBlock.transaction)
    await axios.post(`${peer}/mine`, { data: newBlock.transaction });

    // Notify the backend about the mining time
    await notifyMiningTime(miningTime);
  } catch (error) {
    console.error('Failed to mine block:', error);
  }
};

// Example usage with Alice's keys
const alicePublicKey = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAztroh5/CC1u39w4xzgVMW6JNMUXshRUgQYCmBqUlx2FDiY3dtQXgWzeaoTYRXY2zTveXwDVogWgAGhDYjQRXj8oqEs1zpAUp4Xr1FqnpWjLQkdxW++MqALk4A/9MELRkqJlSjcnSKBuoomOhfDIgUyLy97X2VsWf2W+Xr1sCrPvl7lMEcFaBqYFotXfWK4IEjNMYNRtdFPbtQPJEkSCEblu6fen9iikmW+Tpu9znpNnaJa0LWbyY4xsRxFKfUjEY24eq+nTqVkyjPSLJrPuQpLfjql5luZfFbg+2qeAPj/jHWCRskTFyqwJdBIsmXqm6PBrW+CAX0JiwhynBG9Jq0QIDAQAB`;

const startMining = async () => {
  peer = await getPeer();
  const blockchainParams = await getBlockchainParams();
  if (!blockchainParams) {
    console.error('Failed to get blockchain parameters. Mining aborted.');
    return;
  }

  while (true) {
    await mineBlock(blockchainParams);
  }
};

startMining();
