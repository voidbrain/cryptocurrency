const db = require('../db');
const Block = require('./block');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.miningReward = 50;
    this.maxSupply = 21000000; // Maximum supply of NodeCoin
    this.currentSupply = 0; // Current supply of NodeCoin
  }

  createGenesisBlock() {
    return new Block('0', 'Genesis Block', Date.now());
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  async addBlock(transaction) {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(previousBlock.hash, transaction);
    newBlock.mineBlock(this.difficulty);

    // Ensure the total supply does not exceed the maximum supply
    if (this.currentSupply + this.miningReward <= this.maxSupply) {
      this.chain.push(newBlock);
      this.currentSupply += this.miningReward;

      // Update the wallet balance for the receiver of the coinbase transaction
      const receiverPublicKey = transaction.receiverPublicKey;
      const walletExists = await db.walletExists(receiverPublicKey);
      if (walletExists) {
        await db.updateWalletBalance(receiverPublicKey, this.miningReward);
      } else {
        await db.createWallet(receiverPublicKey, this.miningReward);
      }
    }
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getBlockchainParams() {
    return {
      difficulty: this.difficulty,
      miningReward: this.miningReward,
      maxSupply: this.maxSupply,
      currentSupply: this.currentSupply,
    };
  }
}

module.exports = Blockchain;
