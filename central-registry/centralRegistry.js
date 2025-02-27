const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const peers = []; // List of peer nodes

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Central registry server is running on port ${PORT}`);
});
