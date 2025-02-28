import axios from 'axios';

export async function getPeer() {
  try {
    const response = await axios.get('http://central-registry:4000/peers');
    const peers = response.data.peers;
    if (peers.length === 0) {
      console.error('No peers available to mine block');
      return;
    }

    // Choose a random peer to mine the block
   return peers[Math.floor(Math.random() * peers.length)];

  } catch (error) {
    console.error('Failed to get peers from central registry:', error);
    return [];
  }
};

