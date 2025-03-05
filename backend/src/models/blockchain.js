const crypto = require('crypto');
const Block = require('./block');
const Transaction = require('./transaction');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.miningReward = 50;
    this.maxSupply = 21000000; // Maximum supply of NodeCoin
    this.currentSupply = 0; // Current supply of NodeCoin
    this.mempool = [];
  }

  createGenesisBlock() {
    return new Block('0', 'Genesis Block', Date.now());
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  createBlock(transactions) {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(previousBlock.hash, transactions);
    newBlock.mineBlock(this.difficulty);
    return newBlock;
  }

  async addBlock(block) {
    // Ensure the total supply does not exceed the maximum supply
    if (this.currentSupply + this.miningReward <= this.maxSupply) {
      this.chain.push(block);
      this.currentSupply += this.miningReward;

      // Update the wallet balance for the receiver of the coinbase transaction
      for (const transaction of block.transactions) {
        const receiverPublicKey = transaction.receiverPublicKey;
        const walletExists = await db.walletExists(receiverPublicKey);
        if (walletExists) {
          await db.updateWalletBalance(receiverPublicKey, this.miningReward);
        } else {
          await db.createWallet(receiverPublicKey, this.miningReward);
        }
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

  addTransaction(transaction) {
    if (!transaction.senderPublicKey || !transaction.receiverPublicKey) {
      throw new Error('Transaction must include sender and receiver public keys');
    }

    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.mempool.push(transaction);
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
    this.mempool.push(rewardTx);

    const block = new Block(this.getLatestBlock().hash, this.mempool);
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);

    this.mempool = [];
  }

  getBlockchainParams() {
    return {
      difficulty: this.difficulty,
      miningReward: this.miningReward,
      maxSupply: this.maxSupply,
      currentSupply: this.currentSupply,
    };
  }

  validateBlock(block) {
    const previousBlock = this.getLatestBlock();
    if (block.previousHash !== previousBlock.hash) {
      return false;
    }
    if (block.hash !== block.calculateHash()) {
      return false;
    }
    return true;
  }

  confirmBlock(block) {
    this.chain.push(block);
  }
}

module.exports = Blockchain;
