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
  constructor(previousHash, transaction, timestamp = Date.now()) {
    this.previousHash = previousHash;
    this.transaction = transaction;
    this.timestamp = timestamp;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.previousHash + this.timestamp + this.transaction.toString())
      .digest('hex');
  }

  toString() {
    return JSON.stringify(this);
  }
}

class Miner {
  constructor(minerAddress) {
    this.minerAddress = minerAddress;
  }

  async mine() {
    try {
      const transaction = new Transaction(100, 'network', this.minerAddress);
      const previousBlock = await this.getLatestBlock();
      const newBlock = new Block(previousBlock.hash, transaction);

      await axios.post('http://localhost:3000/transaction', {
        amount: 100,
        senderPublicKey: 'network',
        receiverPublicKey: this.minerAddress,
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
}

const miner = new Miner('miner-public-key');
miner.mine().catch(console.error);
