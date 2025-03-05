const axios = require('axios');
const crypto = require('crypto');

let peer = '';

class Transaction {
  constructor(amount, fee, senderPublicKey, receiverPublicKey) {
    this.amount = amount;
    this.fee = fee;
    this.senderPublicKey = senderPublicKey;
    this.receiverPublicKey = receiverPublicKey;
  }

  static createCoinbaseTransaction(minerAddress, reward) {
    return new Transaction(reward, 0, null, minerAddress);
  }
}

class Block {
  constructor(previousHash, transactions, timestamp = Date.now(), nonce = 0) {
    this.previousHash = previousHash;
    this.transactions = transactions;
    this.timestamp = timestamp;
    this.nonce = nonce;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce)
      .digest('hex');
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log('Block mined:', this.hash);
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

const mineBlock = async (mempoolTransactions) => {
  try {
    if (mempoolTransactions.length === 0) {
      console.log('No transactions in mempool to mine');
      return;
    }

    // Create a coinbase transaction
    const minerAddress = 'miner_public_key'; // Replace with actual miner's public key
    const reward = 50; // Replace with actual reward
    const coinbaseTransaction = Transaction.createCoinbaseTransaction(minerAddress, reward);

    // Add the coinbase transaction to the beginning of the transactions list
    mempoolTransactions.unshift(coinbaseTransaction);

    // Create a new block with transactions from the mempool
    const previousHash = 'some_previous_hash'; // Replace with actual previous hash
    const newBlock = new Block(previousHash, mempoolTransactions);

    // Mine the new block
    newBlock.mineBlock(4); // Replace 4 with actual difficulty

    // Send the mined block to the server
    const mineResponse = await axios.post('http://localhost:3000/mine', { block: newBlock });
    console.log(mineResponse.data);
  } catch (err) {
    console.error('Failed to mine block:', err);
  }
};

const fetchMempoolTransactions = async () => {
  try {
    // Request mempool transactions from the server
    const response = await axios.get('http://localhost:3000/mempool');
    const mempoolTransactions = response.data;

    // Call the mineBlock function with the mempool transactions
    await mineBlock(mempoolTransactions);
  } catch (err) {
    console.error('Failed to fetch mempool transactions:', err);
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
    await fetchMempoolTransactions();
  }
};

startMining();
