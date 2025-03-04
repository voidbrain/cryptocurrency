const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

let peers = []; // List of peer nodes

// Endpoint to register a new peer
app.post('/register-peer', async (req, res) => {
  const { peer } = req.body;
  if (!peers.includes(peer)) {
    peers.push(peer);

    // Notify all existing peers about the new peer
    await Promise.all(peers.map(existingPeer => {
      if (existingPeer !== peer) {
        return axios.post(`${existingPeer}/register-peer`, { peer }).catch(err => console.error(`Failed to notify peer ${existingPeer}:`, err));
      }
    }));
  }
  res.send({ peers });
});

// Endpoint to get the list of peers
app.get('/peers', (req, res) => {
  res.send({ peers });
});

// Function to check if a peer is available
const checkPeerAvailability = async (peer) => {
  try {
    await axios.get(`${peer}/health-check`); // Assuming peers have a health-check endpoint
    return true;
  } catch (error) {
    console.error(`Peer ${peer} is not available:`, error);
    return false;
  }
};

// Periodically check if peers are available
setInterval(async () => {
  const availablePeers = [];
  for (const peer of peers) {
    const isAvailable = await checkPeerAvailability(peer);
    if (isAvailable) {
      availablePeers.push(peer);
    }
  }
  peers = availablePeers;
  console.log('Updated peers list:', peers);
}, 60000); // Check every minute

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Central registry server is running on port ${PORT}`);
});
