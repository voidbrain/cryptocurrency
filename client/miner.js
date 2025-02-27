const axios = require('axios');
const crypto = require('crypto');

class Transaction {
  constructor(amount, senderPublicKey, receiverPublicKey) {
    this.amount = amount;
    this.senderPublicKey = senderPublicKey;
    this.receiverPublicKey = receiverPublicKey;
  }

  toString() {
    return JSON.stringify(this);
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
      .update(this.previousHash + this.timestamp + this.transaction.toString() + this.nonce)
      .digest('hex');
  }

  mineBlock(difficulty) {
    while (!this.hash.startsWith('0'.repeat(difficulty))) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  getHash() {
    return this.hash;
  }

  toString() {
    return JSON.stringify(this);
  }
}

class Miner {
  constructor(minerAddress, privateKey, difficulty = 4) {
    this.minerAddress = minerAddress;
    this.privateKey = privateKey;
    this.difficulty = difficulty;
  }

  async mine() {
    try {
      const transaction = new Transaction(100, 'network', this.minerAddress);
      const previousBlock = await this.getLatestBlock();
      const newBlock = new Block(previousBlock.hash, transaction);

      console.log('Mining new block...');
      newBlock.mineBlock(this.difficulty);

      const signature = await this.signTransaction(transaction);

      await axios.post('http://localhost:3000/transaction', {
        transaction,
        signature: btoa(String.fromCharCode(...new Uint8Array(signature))),
        publicKey: this.minerAddress,
      });

      console.log('New block mined:', newBlock.toString());
    } catch (error) {
      console.error('Error mining block:', error);
    }
  }

  async getLatestBlock() {
    try {
      const response = await axios.get('http://localhost:3000/chain');
      if (response.status !== 200) {
        console.error('Failed to fetch chain:', response.status, response.statusText);
        throw new Error('Failed to fetch chain');
      }

      const chain = response.data.chain;
      if (!Array.isArray(chain)) {
        console.error('Invalid chain data:', chain);
        throw new Error('Invalid chain data');
      }

      if (chain.length === 0) {
        // Return a genesis block if the chain is empty
        return new Block('', new Transaction(0, 'genesis', 'genesis'));
      }

      return chain[chain.length - 1];
    } catch (error) {
      console.error('Error fetching latest block:', error);
      // Return a genesis block as a failsafe
      return new Block('', new Transaction(0, 'genesis', 'genesis'));
    }
  }

  async signTransaction(transaction) {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(transaction));

    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      Uint8Array.from(atob(this.privateKey), c => c.charCodeAt(0)),
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' },
      },
      privateKey,
      data
    );

    return signature;
  }
}

// Replace 'miner-public-key' and 'miner-private-key' with the actual public and private keys of the miner
const miner = new Miner('miner-public-key', 'miner-private-key');
miner.mine().catch(console.error);
