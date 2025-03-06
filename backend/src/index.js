const express = require('express');
const cors = require('cors');
const net = require('net');
const Blockchain = require('./models/blockchain');
const Block = require('./models/block');
const chainRoutes = require('./routes/chain');
const transactionRoutes = require('./routes/transaction');
const walletRoutes = require('./routes/wallet');
const orderRoutes = require('./routes/order');
const historyRoutes = require('./routes/history'); // Import the new routes
const db = require('./db'); // Ensure the database is initialized
const bodyParser = require('body-parser');

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;
const p2pPort = process.env.P2PPORT || 6001; 

const blockchain = new Blockchain();
const peers = []; // List of peer nodes
const mempool = []; // Mempool for transactions

// Function to connect to a peer
const connectToPeer = (peer) => {
  const client = new net.Socket();
  client.connect(peer.port, peer.host, () => {
    console.log(`Connected to peer: ${peer.host}:${peer.port}`);
    peers.push(client);
    // Notify the peer about this server
    client.write(JSON.stringify({ type: 'new_peer', data: { host: 'localhost', port: p2pPort } }));
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

// Function to start the P2P server
const startP2PServer = (port) => {
  const server = net.createServer((socket) => {
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

  server.listen(port, () => {
    console.log(`P2P server is running on port ${port}`);
    // Notify all connected peers about this server
    broadcast({ type: 'new_peer', data: { host: 'localhost', port } });
  });
};

// Function to broadcast a message to all connected peers
const broadcast = (message) => {
  peers.forEach((peer) => {
    peer.write(JSON.stringify(message));
  });
};

// Start the P2P server on a specific port
startP2PServer(p2pPort);

// Endpoint to create and broadcast a transaction
app.post('/transaction', async (req, res) => {
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
app.get('/mempool', async (req, res) => {
  try {
    const mempoolTransactions = await db.getMempoolTransactions();
    res.json(mempoolTransactions);
  } catch (err) {
    console.error('Failed to get mempool transactions:', err);
    res.status(500).send('Server error');
  }
});

// Endpoint to receive mined blocks from clients
app.post('/mine', async (req, res) => {
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
app.get('/blockchain', async (req, res) => {
  try {
    const blocks = await db.getBlocks();
    res.json(blocks);
  } catch (err) {
    console.error('Failed to get blockchain:', err);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
