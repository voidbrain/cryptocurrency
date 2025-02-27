const crypto = require('crypto');
const Block = require('./block');
const Transaction = require('./transaction');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block('', new Transaction(100, 'genesis', 'genesis'));
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(transaction) {
    const newBlock = new Block(this.getLatestBlock().getHash(), transaction);
    this.chain.push(newBlock);
  }

  getPreviousBlockHash() {
    if (!this.chain || this.chain.length === 0) {
      throw new Error('Chain is empty');
    }

    const lastBlock = this.chain[this.chain.length - 1];
    if (!(lastBlock instanceof Block)) {
      throw new Error('Last block is not an instance of Block');
    }

    return lastBlock.getHash();
  }

  isChainValid(chain) {
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      if (currentBlock.getHash() !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.getHash()) {
        return false;
      }
    }
    return true;
  }

  replaceChain(newChain) {
    if (newChain.length > this.chain.length && this.isChainValid(newChain)) {
      this.chain = newChain;
      return true;
    }
    return false;
  }
}

module.exports = Blockchain;
