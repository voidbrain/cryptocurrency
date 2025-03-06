const axios = require('axios');
const net = require('net');
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

const peers = []; // List of peer nodes

// Function to connect to a peer
const connectToPeer = (peer) => {
  const client = new net.Socket();
  client.connect(peer.port, peer.host, () => {
    console.log(`Connected to peer: ${peer.host}:${peer.port}`);
    peers.push(client);
    // Notify the peer about this miner
    client.write(JSON.stringify({ type: 'new_peer', data: { host: 'localhost', port: 6000 } }));
  });

  client.on('data', (data) => {
    console.log(`Received data from peer: ${data}`);
    // Handle received data
  });

  client.on('close', () => {
    console.log(`Connection to peer closed: ${peer.host}:${peer.port}`);
    const index = peers.indexOf(client);
    if (index > -1) {
      peers.splice(index, 1);
    }
  });

  client.on('error', (err) => {
    console.error(`Error connecting to peer: ${err.message}`);
  });
};

// Function to broadcast a message to all connected peers
const broadcast = (message) => {
  peers.forEach((peer) => {
    peer.write(JSON.stringify(message));
  });
};

// Function to mine a block
const mineBlock = async (mempoolTransactions) => {
  try {
    // Create a coinbase transaction
    const minerAddress = 'miner_public_key'; // Replace with actual miner's public key
    const reward = 50; // Replace with actual reward
    const coinbaseTransaction = Transaction.createCoinbaseTransaction(minerAddress, reward);

    if (mempoolTransactions.length === 0) {
      console.log('No transactions in mempool to mine, continuing with coinbase transaction only');
      mempoolTransactions = [coinbaseTransaction];
    } else {
      // Add the coinbase transaction to the beginning of the transactions list
      mempoolTransactions.unshift(coinbaseTransaction);
    }

    // Create a new block with transactions from the mempool
    const previousHash = 'some_previous_hash'; // Replace with actual previous hash
    const newBlock = new Block(previousHash, mempoolTransactions);

    // Mine the new block
    newBlock.mineBlock(4); // Replace 4 with actual difficulty

    // Broadcast the mined block to all peers
    broadcast({ type: 'new_block', data: newBlock });

    console.log('New block mined and broadcasted:', newBlock);
  } catch (err) {
    console.error('Failed to mine block:', err);
  }
};

// Function to fetch mempool transactions from a peer
const fetchMempoolTransactions = async () => {
  try {
    // Request mempool transactions from a peer
    const response = await axios.get('http://localhost:3000/mempool');
    const mempoolTransactions = response.data;

    // Call the mineBlock function with the mempool transactions
    await mineBlock(mempoolTransactions);
  } catch (err) {
    console.error('Failed to fetch mempool transactions:', err);
  }
};

// Call the fetchMempoolTransactions function to start mining
fetchMempoolTransactions();
