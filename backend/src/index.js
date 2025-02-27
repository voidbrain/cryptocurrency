const express = require('express');
const cors = require('cors');
const axios = require('axios');
const net = require('net');
const Blockchain = require('./models/blockchain');
const Block = require('./models/block');
const chainRoutes = require('./routes/chain');
const transactionRoutes = require('./routes/transaction');
const walletRoutes = require('./routes/wallet');
const orderRoutes = require('./routes/order');
const historyRoutes = require('./routes/history'); // Import the new routes

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());

const blockchain = new Blockchain();
const peers = []; // List of peer nodes

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/api/chain', chainRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/history', historyRoutes);

// Endpoint to get the blockchain
app.get('/blockchain', (req, res) => {
  res.send(blockchain.chain);
});

// Endpoint to add a new block
app.post('/mine', (req, res) => {
  const { transaction } = req.body;
  blockchain.addBlock(transaction);

  // Broadcast the new block to peers
  peers.forEach(peer => {
    axios.post(`${peer}/receive-block`, { block: blockchain.getLatestBlock() });
  });

  res.send(blockchain.getLatestBlock());
});

// Endpoint to receive new blocks from other nodes
app.post('/receive-block', (req, res) => {
  const { block } = req.body;
  const newBlock = new Block(block.previousHash, block.transaction, block.timestamp);
  newBlock.hash = block.hash;

  if (blockchain.isChainValid([...blockchain.chain, newBlock])) {
    blockchain.addBlock(block.transaction);
    res.send({ added: true });
  } else {
    res.send({ added: false });
  }
});

// Endpoint to register a new peer
app.post('/register-peer', (req, res) => {
  const { peer } = req.body;
  if (!peers.includes(peer)) {
    peers.push(peer);
  }
  res.send({ peers });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Parse the port from command-line arguments
const args = process.argv.slice(2);
const portArgIndex = args.indexOf('--port');
let PORT = portArgIndex !== -1 && args[portArgIndex + 1] ? parseInt(args[portArgIndex + 1], 10) : process.env.PORT || 3000;

const checkPort = (port) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        reject(err);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
};

const startServer = async (port) => {
  let available = await checkPort(port);
  while (!available) {
    port += 1;
    available = await checkPort(port);
  }
  app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);

    // Register with the central registry
    try {
      const response = await axios.post('http://central-registry:4000/register-peer', { peer: `http://localhost:${port}` });
      const { peers: registeredPeers } = response.data;
      registeredPeers.forEach(peer => {
        if (!peers.includes(peer)) {
          peers.push(peer);
        }
      });
    } catch (error) {
      console.error('Failed to register with the central registry:', error);
    }
  });
};

startServer(PORT);

module.exports = app; // Export the app for testing
