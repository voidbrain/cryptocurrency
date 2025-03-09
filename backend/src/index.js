const express = require('express');
const cors = require('cors');
const net = require('net');
const fs = require('fs');
const path = require('path');
const Blockchain = require('./models/blockchain');
const Block = require('./models/block');
const chainRoutes = require('./routes/chain');
const transactionRoutes = require('./routes/transaction');
const walletRoutes = require('./routes/wallet');
const orderRoutes = require('./routes/order');
const historyRoutes = require('./routes/history'); // Import the new routes
const db = require('./db'); // Ensure the database is initialized
const bodyParser = require('body-parser');

const webServer = express();
webServer.use(cors()); // Enable CORS
webServer.use(express.json());
webServer.use(bodyParser.json());

const webPORT = process.env.PORT || 3000;
const p2pPORT = process.env.P2PPORT || 6000;

const blockchain = new Blockchain();
const peers = []; // List of peer nodes
const mempool = []; // Mempool for transactions

// Function to start the P2P server
const startP2PServer = (port) => {
  const p2pserver = net.createServer((socket) => {
    console.log(`Peer connected: ${socket.remoteAddress}:${socket.remotePort}`);
    peers.push(socket);

    socket.on('data', (data) => {
      console.log(`Received data from peer: ${data}`);
      // Handle received data
    });

    socket.on('close', () => {
      console.log(`Peer disconnected: ${socket.remoteAddress}:${socket.remotePort}`);
      const index = peers.indexOf(socket);
      if (index > -1) {
        peers.splice(index, 1);
      }
    });

    socket.on('error', (err) => {
      console.error(`Error with peer connection: ${err.message}`);
    });
  });

  p2pserver.listen(port, () => {
    console.log(`P2P server is running on port ${port}`);
    // Notify all connected peers about this server
    broadcast({ type: 'new_peer', data: { host: process.env.DOMAIN ?? 'localhost', port } });
  });
};

// Function to broadcast a message to all connected peers
const broadcast = (message) => {
  peers.forEach((peer) => {
    console.log(peer, message);
    peer.write(JSON.stringify(message));
  });
};

// Connect to another peer
const connectToPeer = (peer) => {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.connect(peer.port, peer.host, () => {
      console.log(`Connected to peer: ${peer.host}:${peer.port}`);
      peers.push(client);
      // Notify the peer about this server
      client.write(JSON.stringify({ type: 'new_peer', data: { host: process.env.DOMAIN ?? 'localhost', port: p2pPORT } }));
      resolve();
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
      reject(err);
    });
  });
};

// Function to connect to predefined peers from JSON file
const connectToPredefinedPeers = async () => {
  try {
    const peersFilePath = path.join(__dirname, '../data/peers_list.json');
    const peersData = fs.readFileSync(peersFilePath);
    const predefinedPeers = JSON.parse(peersData);

    for (const peer of predefinedPeers) {
      try {
        await connectToPeer(peer);
      } catch (err) {
        console.error(`Failed to connect to peer ${peer.host}:${peer.port}:`, err);
      }
    }
  } catch (err) {
    console.error('Failed to read predefined peers:', err);
  }
};

connectToPredefinedPeers();

// Endpoint to update the list of peers
webServer.post('/update-peers', (req, res) => {
  const newPeers = req.body.peers;

  if (!Array.isArray(newPeers)) {
    return res.status(400).send('Invalid peers format');
  }

  const peersFilePath = path.join(__dirname, 'peers.json');
  fs.writeFileSync(peersFilePath, JSON.stringify(newPeers, null, 2));
  console.log('Updated peers list:', newPeers);

  res.send('Peers list updated');
});

// Endpoint to create and broadcast a transaction
webServer.post('/transaction', async (req, res) => {
  const { senderPublicKey, receiverPublicKey, amount, fee, signature, data } = req.body;

  try {
    const transaction = new Transaction(amount, fee, senderPublicKey, receiverPublicKey);

    // Verify the transaction
    if (!transaction.isValid()) {
      return res.status(400).send('Invalid transaction');
    }

    // Add transaction to mempool
    blockchain.addTransaction(transaction);
    await db.addTransactionToMempool(transaction);
    console.log('Transaction added to mempool:', transaction);
    res.send('Transaction added to mempool');
  } catch (err) {
    console.error('Failed to add transaction to mempool:', err);
    res.status(500).send('Server error');
  }
});

// Endpoint to get mempool transactions ordered by fee and limited to 10
webServer.get('/mempool', async (req, res) => {
  try {
    const mempoolTransactions = await db.getMempoolTransactions();
    res.json(mempoolTransactions);
  } catch (err) {
    console.error('Failed to get mempool transactions:', err);
    res.status(500).send('Server error');
  }
});

// Endpoint to receive mined blocks from clients
webServer.post('/mine', async (req, res) => {
  try {
    const { block } = req.body;

    // Validate the new block
    if (!blockchain.validateBlock(block)) {
      return res.status(400).send('Invalid block');
    }

    // Confirm the new block
    await blockchain.addBlock(block);

    // Save the new block to the database
    await db.addBlock(block);

    // Clear the mempool
    await db.clearMempool();

    console.log('New block added to the blockchain:', block);
    res.send('New block added to the blockchain');
  } catch (err) {
    console.error('Failed to add block to the blockchain:', err);
    res.status(500).send('Server error');
  }
});

// Endpoint to get the blockchain
webServer.get('/blockchain', async (req, res) => {
  try {
    const blocks = await db.getBlocks();
    res.json(blocks);
  } catch (err) {
    console.error('Failed to get blockchain:', err);
    res.status(500).send('Server error');
  }
});

// Start the server
webServer.listen(webPORT, () => {
  console.log(`Web Server is running on port ${webPORT}`);
});

// Start the P2P server on a specific port
connectToPredefinedPeers();
startP2PServer(p2pPORT);
