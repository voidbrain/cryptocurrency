import axios from 'axios';

export async function getPeer() {
  try {
    // TODO - Fetch peers from the backend
    const response = <any>[];
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

