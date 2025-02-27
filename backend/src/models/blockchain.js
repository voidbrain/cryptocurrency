const Block = require('./block');
const db = require('../db');

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

  addBlock(transaction) {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(previousBlock.hash, transaction);
    newBlock.mineBlock(this.difficulty);
    console.log("addBlock")
    // Ensure the total supply does not exceed the maximum supply
    if (this.currentSupply + this.miningReward <= this.maxSupply) {
      this.chain.push(newBlock);
      this.currentSupply += this.miningReward;

      // Update the wallet balance for the receiver of the coinbase transaction
      const receiverPublicKey = transaction.receiverPublicKey;
      console.log( `UPDATE wallets SET balance = balance + ? WHERE publicKey = ?`,
      )
      db.run(
        `UPDATE wallets SET balance = balance + ? WHERE publicKey = ?`,
        [this.miningReward, receiverPublicKey],
        (err) => {
          if (err) {
            console.error('Failed to update wallet balance:', err);
          } else {
            console.log(`Reward added to wallet: ${receiverPublicKey}`);
          }
        }
      );
    } else {
      console.log('Maximum supply reached. No more coins can be mined.');
    }
  }

  isChainValid(chain) {
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

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
